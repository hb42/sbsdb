import { Component, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { BaseEditDialogComponent } from "../../shared/edit/base-edit-dialog-component";
import { HwChange } from "../edit-ap-hw/hw-change";
import { ApChange } from "../edit-ap/ap-change";
import { TagChange } from "../edit-tags/tag-change";
import { ApEditDialogData } from "./ap-edit-dialog-data";

@Component({
  selector: "sbsdb-ap-edit-dialog",
  templateUrl: "./ap-edit-dialog.component.html",
  styleUrls: ["./ap-edit-dialog.component.scss"],
})
export class ApEditDialogComponent extends BaseEditDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApEditDialogData,
    public matDialogRef: MatDialogRef<BaseEditDialogComponent>,
    public formBuilder: FormBuilder,
    protected dialog: MatDialog
  ) {
    super(data, matDialogRef, formBuilder, dialog);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
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
