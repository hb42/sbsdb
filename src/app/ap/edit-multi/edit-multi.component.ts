import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { StringCompare } from "../../shared/helper";
import { ApTyp } from "../../shared/model/ap-typ";
import { Betrst } from "../../shared/model/betrst";
import { MultiChange } from "./multi-change";

@Component({
  selector: "sbsdb-edit-multi",
  templateUrl: "./edit-multi.component.html",
  styleUrls: ["./edit-multi.component.scss"],
})
export class EditMultiComponent implements OnInit {
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Input() public apkatid: number;
  @Output() public dataReady: EventEmitter<MultiChange>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public multiFormGroup: FormGroup;
  public newaptypCtl: FormControl;
  public newoeCtl: FormControl;
  public newvoeCtl: FormControl;
  public oeListNull: Betrst[];
  public aptypList: ApTyp[];

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.dataReady = new EventEmitter<MultiChange>();
    this.multiFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // form submit
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    this.oeListNull = this.dataService.bstList
      .filter((b) => b.ap)
      .sort((a, b) => StringCompare(a.fullname, b.fullname));
    this.oeListNull.unshift(null);
    this.aptypList = this.dataService.aptypList
      .filter((t) => t.apKategorieId === this.apkatid)
      .sort((a, b) => StringCompare(a.bezeichnung, b.bezeichnung));
    this.aptypList.unshift(null);

    this.newaptypCtl = new FormControl(null);
    this.formGroup.addControl("aptyp", this.newaptypCtl);
    this.newoeCtl = new FormControl(null);
    this.formGroup.addControl("oe", this.newoeCtl);
    this.newvoeCtl = new FormControl(null);
    this.formGroup.addControl("voe", this.newvoeCtl);
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }

  public onStandortSelectionChange(): void {
    const oeid = (this.newoeCtl.value as Betrst).bstId;
    const verid = this.newvoeCtl.value ? (this.newvoeCtl.value as Betrst).bstId : 0;
    if (oeid == verid) {
      this.newvoeCtl.setValue(null);
    }
  }

  public submit(): void {
    const change: MultiChange = { newApTypId: null, newVOeId: null, newOeId: null };
    if (this.apkatid) {
      const aptyp = this.newaptypCtl.value as ApTyp;
      change.newApTypId = aptyp ? aptyp.id : null;
    }
    const oe = this.newoeCtl.value as Betrst;
    change.newOeId = oe ? oe.bstId : null;
    const voe = this.newvoeCtl.value as Betrst;
    change.newVOeId = voe ? voe.bstId : oe ? oe.bstId : null;

    this.dataReady.emit(change);
  }
}
