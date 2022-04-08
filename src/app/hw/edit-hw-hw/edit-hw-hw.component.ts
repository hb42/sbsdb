import { formatNumber } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { MatDatepicker } from "@angular/material/datepicker";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { StringToNumber } from "../../shared/helper";
import { Hardware } from "../../shared/model/hardware";
import { HwService } from "../hw.service";
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

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private hwService: HwService
  ) {
    console.debug("c'tor EditHwHwCompomnenmt");
    this.hwReady = new EventEmitter<HwChange>();
    this.hwFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // form submit
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.serCtrl = new FormControl(this.hw.sernr, [Validators.required]);
    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("sernr", this.serCtrl);
    // eslint-disable-next-line @typescript-eslint/unbound-method
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
      console.dir(control.errors);
      return "undef error";
    }
    return null;
  }

  public submit(): void {
    // NaN -> null
    const newAnschW: number = StringToNumber(this.anschwCtrl.value as string) || null;
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
    console.debug("#######");
    console.dir(neu);
    this.hwReady.emit(neu);
  }

  public currencyCheck = (control: FormControl): ValidationErrors => {
    const check = /^[1-9]\d{0,2}(\.?\d{3})*(,\d{1,2})?$/;
    if (control.value && !check.test(control.value as string)) {
      return { invalidCurrency: true };
    }
    return null;
  };
}
