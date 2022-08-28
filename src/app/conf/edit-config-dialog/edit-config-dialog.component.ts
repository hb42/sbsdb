import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { EditConfigData } from "./edit-config-data";

@Component({
  selector: "sbsdb-edit-config-dialog",
  templateUrl: "./edit-config-dialog.component.html",
  styleUrls: ["./edit-config-dialog.component.scss"],
})
export class EditConfigDialogComponent {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditConfigData,
    public matDialogRef: MatDialogRef<EditConfigDialogComponent>,
    public formBuilder: FormBuilder
  ) {
    console.debug("c'tor EditConfigDialogComponent");
    this.formGroup = this.formBuilder.group({});
  }

  public onSubmit(): void {
    this.onSubmitEvent.emit();
  }
}
