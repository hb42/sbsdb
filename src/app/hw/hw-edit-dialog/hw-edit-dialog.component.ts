import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { BaseEditDialogComponent } from "../../shared/edit/base-edit-dialog-component";
import { HwVlanChange } from "../../shared/edit/edit-vlan/hw-vlan-change";
import { HwChange } from "../edit-hw-hw/hw-change";
import { HwEditDialogData } from "./hw-edit-dialog-data";

@Component({
  selector: "sbsdb-hw-edit-dialog",
  templateUrl: "./hw-edit-dialog.component.html",
  styleUrls: ["./hw-edit-dialog.component.scss"],
})
export class HwEditDialogComponent extends BaseEditDialogComponent {
  public onDelAp: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HwEditDialogData,
    public matDialogRef: MatDialogRef<BaseEditDialogComponent>,
    public formBuilder: FormBuilder,
    protected dialog: MatDialog
  ) {
    super(data, matDialogRef, formBuilder, dialog);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public macReady(evt: HwVlanChange[]): void {
    this.data.macs = evt;
  }

  public hwReady(evt: HwChange): void {
    this.data.hwChange = evt;
  }

  public apReady(evt: boolean): void {
    this.data.removeAp = evt;
  }
}
