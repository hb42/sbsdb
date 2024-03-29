import { formatNumber } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { MatDatepicker } from "@angular/material/datepicker";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { CurrencyCheck, StringToNumber } from "../../shared/helper";
import { Hardware } from "../../shared/model/hardware";
import { HwChange } from "./hw-change";

@Component({
  selector: "sbsdb-edit-hw-hw",
  templateUrl: "./edit-hw-hw.component.html",
  styleUrls: ["./edit-hw-hw.component.scss"],
})
export class EditHwHwComponent implements OnInit {
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @Input() public hw: Hardware;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public hwReady: EventEmitter<HwChange>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public hwFormGroup: FormGroup;
  public serCtrl: FormControl;
  public invCtrl: FormControl;
  public anschwCtrl: FormControl;
  public anschdCtrl: FormControl;
  public guidCtrl: FormControl;
  public wfaCtrl: FormControl;
  public bemCtrl: FormControl;

  public multiedit: boolean;

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.hwReady = new EventEmitter<HwChange>();
    this.hwFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.multiedit = !this.hw.id;

    // form submit
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.serCtrl = new FormControl(this.hw.sernr, [Validators.required]);
    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("sernr", this.serCtrl);
    this.invCtrl = new FormControl(this.hw.invNr);
    this.formGroup.addControl("invnr", this.invCtrl);
    this.anschwCtrl = new FormControl(
      this.hw.anschWert ? formatNumber(this.hw.anschWert, "de", "1.2-2") : "",
      [this.currencyCheck]
    );
    this.anschwCtrl.markAsTouched();
    this.formGroup.addControl("anschw", this.anschwCtrl);
    this.anschdCtrl = new FormControl(this.hw.anschDat);
    this.anschdCtrl.markAsTouched();
    this.formGroup.addControl("anschd", this.anschdCtrl);
    this.guidCtrl = new FormControl(this.hw.smbiosgiud);
    this.formGroup.addControl("guid", this.guidCtrl);
    this.wfaCtrl = new FormControl(this.hw.wartungFa);
    this.formGroup.addControl("wfa", this.wfaCtrl);
    this.bemCtrl = new FormControl(this.hw.bemerkung, []);
    this.formGroup.addControl("bemerkung", this.bemCtrl);
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
    if (control.errors) {
      return "undef error";
    }
    return null;
  }

  public submit(): void {
    const newAnschW: number = StringToNumber(this.anschwCtrl.value as string) || null; // NaN -> null
    const newAnschD: Date = this.anschdCtrl.value as Date;
    const neu: HwChange = {
      hwid: this.hw.id,
      anschDat: newAnschD,
      anschWert: newAnschW,
      bemerkung: this.bemCtrl.value as string,
      invNr: this.invCtrl.value as string,
      sernr: this.serCtrl.value as string,
      smbiosgiud: this.guidCtrl.value as string,
      wartungFa: this.wfaCtrl.value as string,
    };
    this.hwReady.emit(neu);
  }

  public currencyCheck = (control: FormControl): ValidationErrors => {
    if (!CurrencyCheck(control.value as string)) {
      return { invalidCurrency: true };
    }
    return null;
  };
}
