import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { HwVlanChange } from "../../shared/edit/edit-vlan/hw-vlan-change";
import { VlansInput } from "../../shared/edit/edit-vlan/vlans-input";
import { Hardware } from "../../shared/model/hardware";
import { HwService } from "../hw.service";

@Component({
  selector: "sbsdb-edit-hw-mac",
  templateUrl: "./edit-hw-mac.component.html",
  styleUrls: ["./edit-hw-mac.component.scss"],
})
export class EditHwMacComponent implements OnInit {
  @Input() public hw: Hardware;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onDelAp: EventEmitter<void>;
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public macReady: EventEmitter<HwVlanChange[]>; // liefert die zu aenderenden Daten

  public vlaninp: VlansInput;
  public hwchange: EventEmitter<Hardware> = new EventEmitter<Hardware>();

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private hwService: HwService
  ) {
    console.debug("c'tor EditHwMacCompomnenmt");
    this.macReady = new EventEmitter<HwVlanChange[]>();
    // this.hwFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.vlaninp = { hw: this.hw, vlans: [], out: null, editap: false };
  }

  public vlanReady(vlans: HwVlanChange[]): void {
    this.macReady.emit(vlans);
  }
}
