import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { Hardware } from "../../shared/model/hardware";
import { HwService } from "../hw.service";
import { HwChange } from "./hw-change";

@Component({
  selector: "sbsdb-edit-hw-hw",
  templateUrl: "./edit-hw-hw.component.html",
  styleUrls: ["./edit-hw-hw.component.scss"],
})
export class EditHwHwComponent {
  @Input() public hw: Hardware;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public hwReady: EventEmitter<HwChange>; // liefert die zu aenderenden Daten

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private hwService: HwService
  ) {
    console.debug("c'tor EditHwHwCompomnenmt");
    this.hwReady = new EventEmitter<HwChange>();
    // this.hwFormGroup = this.formBuilder.group({});
  }
}
