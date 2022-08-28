import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HwChange } from "../edit-ap-hw/hw-change";
import { ApChange } from "../edit-ap/ap-change";
import { TagChange } from "../edit-tags/tag-change";
import { ApEditDialogData } from "./ap-edit-dialog-data";

@Component({
  selector: "sbsdb-ap-edit-dialog",
  templateUrl: "./ap-edit-dialog.component.html",
  styleUrls: ["./ap-edit-dialog.component.scss"],
})
export class ApEditDialogComponent {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApEditDialogData,
    public matDialogRef: MatDialogRef<ApEditDialogComponent>,
    public formBuilder: FormBuilder
  ) {
    console.debug("c'tor ApEditDialogComponent");
    this.formGroup = this.formBuilder.group({});
  }

  public onSubmit(): void {
    this.onSubmitEvent.emit();
  }

  public tagReady(evt: TagChange[]): void {
    this.data.tags = evt;
  }

  public hwReady(evt: HwChange): void {
    this.data.hw = evt;
  }

  public apReady(evt: ApChange): void {
    this.data.apData = evt;
  }
}
