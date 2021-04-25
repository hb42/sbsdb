import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
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
    this.formGroup = this.formBuilder.group({});
  }

  public onSubmit(form: unknown): void {
    this.onSubmitEvent.emit();
    console.log("ApEditDialog onSubmit");
    console.dir(form);
  }

  public tagReady(evt: TagChange[]): void {
    console.debug("ApEditDialog tagReady");
    console.dir(evt);
    this.data.tags = evt;
  }
}
