import { Component, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { BaseEditDialogComponent } from "../../shared/edit/base-edit-dialog-component";
import { EditConfigData } from "./edit-config-data";

@Component({
  selector: "sbsdb-edit-config-dialog",
  templateUrl: "./edit-config-dialog.component.html",
  styleUrls: ["./edit-config-dialog.component.scss"],
})
export class EditConfigDialogComponent extends BaseEditDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditConfigData,
    public matDialogRef: MatDialogRef<BaseEditDialogComponent>,
    public formBuilder: FormBuilder,
    protected dialog: MatDialog
  ) {
    super(data, matDialogRef, formBuilder, dialog);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
