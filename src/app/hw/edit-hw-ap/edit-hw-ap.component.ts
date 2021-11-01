import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { Hardware } from "../../shared/model/hardware";
import { HwService } from "../hw.service";

@Component({
  selector: "sbsdb-edit-hw-ap",
  templateUrl: "./edit-hw-ap.component.html",
  styleUrls: ["./edit-hw-ap.component.scss"],
})
export class EditHwApComponent {
  @Input() public hw: Hardware;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public apReady: EventEmitter<boolean>; // liefert die zu aenderenden Daten

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private hwService: HwService
  ) {
    console.debug("c'tor EditHwApCompomnenmt");
    this.apReady = new EventEmitter<boolean>();
    // this.hwFormGroup = this.formBuilder.group({});
  }
}
