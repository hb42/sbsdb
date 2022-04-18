import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { HwVlanChange } from "../../shared/edit/edit-vlan/hw-vlan-change";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { Hardware } from "../../shared/model/hardware";
import { HwInput } from "./hw-input";

@Component({
  selector: "sbsdb-edit-hw",
  templateUrl: "./edit-hw.component.html",
  styleUrls: ["./edit-hw.component.scss"],
})
export class EditHwComponent implements OnInit {
  public static count = 0;
  @HostBinding("attr.style") public hostStyle = "display: inline-grid; width: 100%;";

  @Input() public ap: Arbeitsplatz;
  @Input() public pri: boolean;
  @Input() public hw: HwInput;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>;
  @Output() public delete: EventEmitter<HwInput>; // diesen Eintrag entfernen
  @Output() public editHwReady: EventEmitter<void>;

  public matcher = new FormFieldErrorStateMatcher();
  public hwFormGroup: FormGroup;
  // Signal an edit-vlan
  public hwchange: EventEmitter<Hardware> = new EventEmitter<Hardware>();

  constructor(public dataService: DataService, private formBuilder: FormBuilder) {
    console.debug("c'tor EditHwComponent");
    this.delete = new EventEmitter<HwInput>();
    this.editHwReady = new EventEmitter<void>();
    this.hwFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // Hier nur auf onSubmit reagieren, wenn keine Vlans,
    // ansonsten wird vlanReady() aus edit-vlans angestossen.
    this.onSubmit.subscribe(() => {
      const h = this.hw.hwCtrl.value as Hardware;
      if (!h || this.dataService.isPeripherie(h)) {
        this.vlanReady([]);
      }
    });

    this.hw.hwCtrl = new FormControl(this.hw.hw, [this.hwCheck]);
    const groupId = `hwgroup${EditHwComponent.count++}`;
    this.hw.ctrlid = groupId;
    this.hwFormGroup.addControl(`hw${EditHwComponent.count++}`, this.hw.hwCtrl);

    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl(groupId, this.hwFormGroup);

    if (this.hw.hw == null && !this.pri) {
      this.hw.hwCtrl.markAsTouched();
    }
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }

  /**
   * HW-Selectlist
   */
  public hwSelectList(): Hardware[] {
    const sel = this.dataService.hwList
      .filter((h) => {
        // aktuelle HW muss auf jeden Fall rein
        if (this.hw.hw && h.id == this.hw.hw.id) {
          return true;
        }
        // zugeordnete HW und fremde HW nicht anzeigen
        if (h.ap || this.dataService.isFremdeHardware(h)) {
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
        this.dataService.collator.compare(
          a.hwKonfig.konfiguration + a.sernr,
          b.hwKonfig.konfiguration + b.sernr
        )
      );
    sel.unshift(null);
    return sel;
  }

  public hwSelectionChange(hw: Hardware): void {
    console.debug("##### hwselectionchange");
    console.dir(hw);
    console.dir(this.hw.hwCtrl.value);
    this.hw.vlans.hw = hw;
    this.hwchange.emit(hw);
  }

  // --- Validators ---

  public hwCheck = (control: FormControl): ValidationErrors => {
    // '==' beruecksichtigt null + undefined
    if (control.value == null && !this.pri) {
      return { required: true };
    }
    return null;
  };

  public delHw(): void {
    if (this.pri) {
      this.hw.hwCtrl.setValue(null);
    } else {
      this.delete.emit(this.hw);
    }
    this.hwSelectionChange(null);
  }

  public vlanReady(vlans: HwVlanChange[]): void {
    console.debug("**** edit-hw submit");
    this.hw.vlans.out = vlans;
    this.editHwReady.emit();
  }
}
