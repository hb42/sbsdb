import { Component, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormFieldErrorStateMatcher } from "../../form-field-error-state-matcher";
import { EditDialogData } from "./edit-dialog-data";

@Component({
  selector: "sbsdb-edit-dialog",
  templateUrl: "./edit-dialog.component.html",
  styleUrls: ["./edit-dialog.component.scss"],
})
export class EditDialogComponent {
  public formGroup: FormGroup;
  public nameControl: FormControl;

  public matcher = new FormFieldErrorStateMatcher();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditDialogData,
    public matDialogRef: MatDialogRef<EditDialogComponent>,
    public formBuilder: FormBuilder
  ) {
    /** params:
     * label - col.displayname
     * placeholder (?)
     * Validators[]
     * fieldname - col.fieldname
     */
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.formGroup = this.formBuilder.group({ name: [this.data.name, [Validators.required]] });

    this.nameControl = this.formGroup.controls.name as FormControl;
  }

  onSubmit(value: unknown): void {
    console.log("you submitted value: ");
    console.dir(value);
  }

  public getErrorMessage(): string {
    if (this.nameControl.hasError("required")) {
      return "Bitte einen Wert eingeben.";
    }
    // Validierung
    return "";
  }
}
