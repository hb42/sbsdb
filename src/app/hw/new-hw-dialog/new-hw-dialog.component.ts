import { formatNumber } from "@angular/common";
import { Component, EventEmitter, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { CurrencyCheck, StringToNumber } from "../../shared/helper";
import { IpHelper } from "../../shared/ip-helper";
import { HwKonfig } from "../../shared/model/hw-konfig";
import { NewHwData } from "./new-hw-data";
import { NewHwDetail } from "./new-hw-detail";

@Component({
  selector: "sbsdb-new-hw-dialog",
  templateUrl: "./new-hw-dialog.component.html",
  styleUrls: ["./new-hw-dialog.component.scss"],
})
export class NewHwDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  public newhw: NewHwData;
  public konfigList: HwKonfig[];

  public matcher = new FormFieldErrorStateMatcher();
  public konfCtrl: FormControl;
  public invCtrl: FormControl;
  public anschwCtrl: FormControl;
  public anschdCtrl: FormControl;
  public wfaCtrl: FormControl;
  public bemCtrl: FormControl;
  public serCtrl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HwKonfig,
    public matDialogRef: MatDialogRef<NewHwDialogComponent>,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    this.formGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    this.newhw = {
      konfig: this.data,
      anschDat: now,
      anschWert: 0,
      invNr: "",
      wartungFa: "",
      bemerkung: "",
      devices: [],
    };
    // konfig select list
    this.konfigList = this.dataService.hwKonfigList
      .filter((k) => !this.dataService.isFremdeKonfig(k))
      .sort((a, b) => this.dataService.collator.compare(a.konfiguration, b.konfiguration));
    this.konfigList.unshift(null);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.konfCtrl = new FormControl(this.newhw.konfig, [Validators.required]);
    this.konfCtrl.markAsTouched();
    this.formGroup.addControl("konf", this.konfCtrl);
    this.invCtrl = new FormControl(this.newhw.invNr);
    this.formGroup.addControl("invnr", this.invCtrl);
    this.anschwCtrl = new FormControl(
      this.newhw.anschWert ? formatNumber(this.newhw.anschWert, "de", "1.2-2") : "",
      [this.currencyCheck]
    );
    this.anschwCtrl.markAsTouched();
    this.formGroup.addControl("anschw", this.anschwCtrl);
    this.anschdCtrl = new FormControl(this.newhw.anschDat);
    this.anschdCtrl.markAsTouched();
    this.formGroup.addControl("anschd", this.anschdCtrl);
    this.wfaCtrl = new FormControl(this.newhw.wartungFa);
    this.formGroup.addControl("wfa", this.wfaCtrl);
    this.bemCtrl = new FormControl(this.newhw.bemerkung, []);
    this.formGroup.addControl("bemerkung", this.bemCtrl);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.serCtrl = new FormControl("", [Validators.required, this.sernrCheck]);
    this.serCtrl.markAsTouched();
    this.formGroup.addControl("sernr", this.serCtrl);
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    if (control.hasError("matDatepickerParse")) {
      return "Ungültiges Datum.";
    }
    if (control.hasError("invalidCurrency")) {
      return "Ungültiger Wert.";
    }
    if (control.hasError("invalidSerMac")) {
      return "Ungültige MAC-Adresse.";
    }
    if (control.errors) {
      console.dir(control.errors);
      return "undefinded error";
    }
    return null;
  }

  public sernrCheck = (control: FormControl): ValidationErrors => {
    if (control && control.value) {
      try {
        this.getSerMac(control.value as string);
      } catch (e) {
        return { invalidSerMac: true };
      }
    }
    return null;
  };

  public currencyCheck = (control: FormControl): ValidationErrors => {
    if (!CurrencyCheck(control.value as string)) {
      return { invalidCurrency: true };
    }
    return null;
  };

  public onSubmit(form: unknown): void {
    this.prepareData();
    // this.onSubmitEvent.emit();
    console.log("NewHwDialog onSubmit");
    console.dir(form);
  }

  private prepareData() {
    this.newhw.konfig = this.konfCtrl.value as HwKonfig;
    this.newhw.invNr = this.invCtrl.value as string;
    this.newhw.anschWert = StringToNumber(this.anschwCtrl.value as string);
    this.newhw.anschDat = this.anschdCtrl.value as Date;
    this.newhw.wartungFa = this.wfaCtrl.value as string;
    this.newhw.bemerkung = this.bemCtrl.value as string;
    this.newhw.devices = this.getSerMac(this.serCtrl.value as string);
  }

  private getSerMac(val: string): NewHwDetail[] {
    const lines = val.split(/[\r\n]+/);
    const rc: NewHwDetail[] = [];
    lines.forEach((l) => {
      if (l) {
        const item = l.split(/\s*;\s*/);
        if (item.length === 1) {
          rc.push({ sernr: item[0].trim(), mac: null });
        } else if (item.length === 2) {
          const mac = IpHelper.checkMacString(item[1]);
          if (mac) {
            rc.push({ sernr: item[0].trim(), mac: mac });
          } else {
            throw new Error("invalid MAC");
          }
        }
      }
    });
    if (rc) {
      return rc;
    } else {
      throw new Error("no SerNr");
    }
  }
}
