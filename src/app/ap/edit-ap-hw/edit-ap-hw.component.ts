import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { HwInput } from "../edit-hw/hw-input";
import { HwApInput } from "./hw-ap-input";
import { HwChange } from "./hw-change";

@Component({
  selector: "sbsdb-edit-ap-hw",
  templateUrl: "./edit-ap-hw.component.html",
  styleUrls: ["./edit-ap-hw.component.scss"],
})
export class EditApHwComponent implements OnInit {
  @Input() public ap: Arbeitsplatz;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public hwReady: EventEmitter<HwChange>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public hwFormGroup: FormGroup;
  public data: HwApInput;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    console.debug("c'tor EditApHwCompomnenmt");
    this.hwReady = new EventEmitter<HwChange>();
    this.hwFormGroup = this.formBuilder.group({});
  }

  public ngOnInit(): void {
    this.onSubmit.subscribe(() => {
      // resultHW = [] -> hwId, mac, vlanId, ip
      this.submit();
    });
    this.data = { apid: this.ap.apId, priHw: this.priHw(), periph: this.periHw() };
    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("tag", this.hwFormGroup);
  }

  public submit(): void {
    console.debug("edit hw submit");
    const changes: HwChange = {
      apid: this.ap.apId,
      // TODO Datenstruktur fuer die Rueckmeldung
      // hw: this.resultHw
    };
    /*
      pri hw
        this.data.priHw.hw.id -> this.data.priHw.hwCtrl.value.id (+ null check)
        this.data.priHw.hw.vlans -> this.data.priHw.vlans
           v.mac, .ip, .vlanId   ->   v.macCtrl.value, .ipCtrl.value, .vlanCtrl.value.vlanId

       array vgl
         map .priHw/.periph[x] .hw === null -> neue hw
             .priHw/.periph[x] .vlans[y].hwMacId === 0 -> neue addr

         work.forEach( if isNew indexes.push(idx) )
         newItems = indexes.map( work.splice(i, 0)[0] )
         old.foreach( if (!work.find(old)) delItems.push(id) else if(work != old) chgItems.push(work) )

          vlans:
            old -> priHw.hw.vlans : Vlan[]
                   periph[x].vlans : Vlan[]
            work -> priHw.vlans : HwInputVlan[]
                    periph[x].vlans : HwInputVlan[]
          periphHw
            old -> periph: HwInput[] -> .hw
            work -.> periph: HwInput[] -> hwCtrl.value
     */
    // // ueber form iterieren
    // Object.keys(this.hwFormGroup.controls).forEach((key) => {
    //   console.debug("formgroup.key = " + key);
    //   // -> key: formGroup -> formGroup.controls key: formControl/formGroup
    //   console.dir(this.hwFormGroup.get(key));
    // });
    this.hwReady.emit(changes);
  }

  public priHw(): HwInput {
    const hw = this.ap.hw.find((h) => h.pri);
    // vlans[] und hwCtrl werden in EditHwComponent eingetragen
    return { hw: hw, apid: this.ap.apId, vlans: [], hwCtrl: null, ctrlid: "" };
  }

  public periHw(): HwInput[] {
    const hws = this.ap.hw.filter((h) => !h.pri);
    return hws.map((h) => ({ apid: this.ap.apId, hw: h, vlans: [], hwCtrl: null, ctrlid: "" }));
  }

  public addPeripherie(): void {
    this.data.periph.push({ apid: this.ap.apId, hw: null, vlans: [], hwCtrl: null, ctrlid: "" });
    // Das Anhaengen eines leeren Feldes fuer Peripherie aendert den Status der form auf invalid
    // (hw == null ist Fehler) und das triggert *ExpressionChangedAfterItHasBeenCheckedError*.
    // Das folgende verhindert diesen Fehler.
    this.cdRef.detectChanges();
  }

  public delPeripherie(peri: HwInput): void {
    const idx = this.data.periph.findIndex((hi) => hi.ctrlid === peri.ctrlid);
    const remove = this.data.periph.splice(idx, 1);
    if (remove && remove.length === 1) {
      this.hwFormGroup.removeControl(remove[0].ctrlid);
      // remove[0].hwCtrl = null;
    }
  }
}
