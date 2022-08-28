import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { StringCompare } from "../../shared/helper";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { Betrst } from "../../shared/model/betrst";
import { ApChange } from "./ap-change";

@Component({
  selector: "sbsdb-edit-ap",
  templateUrl: "./edit-ap.component.html",
  styleUrls: ["./edit-ap.component.scss"],
})
export class EditApComponent implements OnInit {
  @Input() public ap: Arbeitsplatz;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public apReady: EventEmitter<ApChange>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public apFormGroup: FormGroup;
  public nameCtrl: FormControl;
  public bezCtrl: FormControl;
  public standCtrl: FormControl;
  public verantwCtrl: FormControl;
  public bemCtrl: FormControl;
  public oeList: Betrst[];
  public oeListNull: Betrst[];

  constructor(public dataService: DataService, private formBuilder: FormBuilder) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.apReady = new EventEmitter<ApChange>();
    this.apFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // form submit
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    this.oeList = this.dataService.bstList
      .filter((b) => b.ap)
      .sort((a, b) => StringCompare(a.fullname, b.fullname));
    this.oeListNull = this.dataService.bstList
      .filter((b) => b.ap)
      .sort((a, b) => StringCompare(a.fullname, b.fullname));
    this.oeListNull.unshift(null);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.nameCtrl = new FormControl(this.ap.apname, [Validators.required]);
    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("apname", this.nameCtrl);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.bezCtrl = new FormControl(this.ap.bezeichnung, [Validators.required]);
    this.formGroup.addControl("apbezeichnung", this.bezCtrl);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.standCtrl = new FormControl(this.ap.oe, [Validators.required]);
    this.formGroup.addControl("apstand", this.standCtrl);
    this.verantwCtrl = new FormControl(
      this.ap.verantwOeId === this.ap.oeId ? null : this.ap.verantwOe,
      []
    );
    this.formGroup.addControl("apverantw", this.verantwCtrl);
    this.bemCtrl = new FormControl(this.ap.bemerkung, []);
    this.formGroup.addControl("apbemerkung", this.bemCtrl);
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }

  public onStandortSelectionChange(): void {
    const oeid = (this.standCtrl.value as Betrst).bstId;
    const verid = this.verantwCtrl.value ? (this.verantwCtrl.value as Betrst).bstId : 0;
    if (oeid == verid) {
      this.verantwCtrl.setValue(null);
    }
  }

  public submit(): void {
    const apchange: ApChange = { apid: this.ap.apId, apTypId: this.ap.apTypId };
    const newname = this.nameCtrl.value as string;
    const newbezeichnung = this.bezCtrl.value as string;
    const newbemerkung = this.bemCtrl.value as string;
    const newstandid = (this.standCtrl.value as Betrst).bstId;
    const newverantwid = this.verantwCtrl.value
      ? (this.verantwCtrl.value as Betrst).bstId
      : newstandid;
    const oldstandid = this.ap.oe?.bstId ?? -1;
    const oldverantwid = this.ap.verantwOe ? this.ap.verantwOe.bstId : oldstandid;
    if (this.ap.apname.localeCompare(newname)) {
      apchange.apname = newname;
    }
    if (oldstandid != newstandid || oldverantwid != newverantwid) {
      if (oldstandid != newstandid) {
        apchange.standortId = newstandid;
      }
      if (oldverantwid != newverantwid) {
        apchange.verantwId = newverantwid;
      }
    }
    if (this.ap.bezeichnung.localeCompare(newbezeichnung)) {
      apchange.bezeichnung = newbezeichnung;
    }
    if (this.ap.bemerkung.localeCompare(newbemerkung)) {
      apchange.bemnerkung = newbemerkung;
    }
    this.apReady.emit(apchange);
  }
}
