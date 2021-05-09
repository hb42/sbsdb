import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { Hardware } from "../../shared/model/hardware";
import { Vlan } from "../../shared/model/vlan";
import { HwInput } from "./hw-input";

@Component({
  selector: "sbsdb-edit-hw",
  templateUrl: "./edit-hw.component.html",
  styleUrls: ["./edit-hw.component.scss"],
})
export class EditHwComponent implements OnInit {
  public static count = 0;

  @Input() public ap: Arbeitsplatz;
  @Input() public pri: boolean;
  @Input() public hw: Hardware;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public ready: EventEmitter<Hardware>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public fremdeHwFlag = DataService.FREMDE_HW_FLAG;
  public periphFlag = DataService.PERIPHERIE_FLAG;
  public hwFormGroup: FormGroup;
  public macFormGroup: FormGroup;

  public vlans: Vlan[];
  public hwInput: HwInput;

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    console.debug("c'tor EditHwComponent");
    this.ready = new EventEmitter<Hardware>();
    this.hwFormGroup = this.formBuilder.group({});
    this.macFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    this.vlans = this.dataService.vlanList
      .map((v) => v)
      .sort((a, b) => this.dataService.collator.compare(a.bezeichnung, b.bezeichnung));
    this.vlans.unshift(null);

    this.hwInput = { apid: this.ap.apId, hw: this.hw, hwCtrl: new FormControl(this.hw), vlans: [] };

    this.hwFormGroup.addControl(`hw${EditHwComponent.count++}`, this.hwInput.hwCtrl);

    if (this.hw && this.hw.hwKonfig.apKatFlag !== this.periphFlag) {
      console.debug("adding vlan");
      this.hw.vlans.forEach((v) => {
        const vl = this.getVlan(v.vlanId);
        const vi = {
          mac: v.mac,
          vlan: vl,
          ip: v.ip,
          macCtrl: new FormControl(v.mac), // required, macCheck
          vlanCtrl: new FormControl(vl), // required
          ipCtrl: new FormControl(v.ip), // required, ipCheck
        };
        this.hwInput.vlans.push(vi);
        this.macFormGroup.addControl(`hw${EditHwComponent.count++}`, vi.macCtrl);
        this.macFormGroup.addControl(`hw${EditHwComponent.count++}`, vi.vlanCtrl);
        this.macFormGroup.addControl(`hw${EditHwComponent.count++}`, vi.ipCtrl);
      });
    }
    this.hwFormGroup.addControl(`mac${EditHwComponent.count}`, this.macFormGroup);

    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl(`hwgroup${EditHwComponent.count++}`, this.hwFormGroup);
  }

  public submit(): void {
    // TODO Eingabe aufbereiten (extra class?)
    console.debug("hw input submit");
    this.ready.emit();
  }

  public getErrorMessage(control: FormControl): string {
    return null;
  }

  /**
   * HW-Selectlist
   */
  public hwSelectList(): Hardware[] {
    const sel = this.dataService.hwList
      .filter((h) => {
        // aktuell HW muss auf jeden Fall rein
        if (this.hw && h.id == this.hw.id) {
          return true;
        }
        // zugeordnete HW und fremde HW nicht anzeigen
        if (h.ap || h.hwKonfig.hwTypFlag === this.fremdeHwFlag) {
          return false;
        }
        if (this.pri) {
          // fuer pri nur gleiche Kategorie
          return h.hwKonfig.apKatId === this.ap.apKatId;
        } else {
          // f. Peripherie alle HW-Typen
          return true;
        }
      })
      .sort((a, b) =>
        this.dataService.collator.compare(a.konfiguration + a.sernr, b.konfiguration + b.sernr)
      );
    sel.unshift(null);
    return sel;
  }

  public hwSelectionChange(): void {
    console.debug("HW selection changed");
    // FIXME MAC entsprechend setzen
    // console.dir(this.inputHw.value);
  }

  public vlanSelectionChange(): void {
    // FIXME IP auf 0 setzen
  }

  private getVlan(id: number): Vlan {
    return this.vlans.find((v) => (v ? v.id === id : false));
  }
}
