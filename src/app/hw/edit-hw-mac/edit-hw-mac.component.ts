import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { Hardware } from "../../shared/model/hardware";
import { HwService } from "../hw.service";
import { MacChange } from "./mac-change";

@Component({
  selector: "sbsdb-edit-hw-mac",
  templateUrl: "./edit-hw-mac.component.html",
  styleUrls: ["./edit-hw-mac.component.scss"],
})
export class EditHwMacComponent {
  @Input() public hw: Hardware;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public macReady: EventEmitter<MacChange[]>; // liefert die zu aenderenden Daten

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private hwService: HwService
  ) {
    console.debug("c'tor EditHwMacCompomnenmt");
    this.macReady = new EventEmitter<MacChange[]>();
    // this.hwFormGroup = this.formBuilder.group({});
  }
}
