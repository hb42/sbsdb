import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HwVlanChange } from "../../shared/edit/edit-vlan/hw-vlan-change";
import { HwChange } from "../edit-hw-hw/hw-change";
import { HwEditDialogData } from "./hw-edit-dialog-data";

@Component({
  selector: "sbsdb-hw-edit-dialog",
  templateUrl: "./hw-edit-dialog.component.html",
  styleUrls: ["./hw-edit-dialog.component.scss"],
})
export class HwEditDialogComponent {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HwEditDialogData,
    public matDialogRef: MatDialogRef<HwEditDialogComponent>,
    public formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({});
  }

  public onSubmit(form: unknown): void {
    this.onSubmitEvent.emit();
    console.log("HwEditDialog onSubmit");
    console.dir(form);
  }

  public macReady(evt: HwVlanChange[]): void {
    console.debug("HwMacEditDialog macReady");
    console.dir(evt);
    this.data.macs = evt;
  }

  public hwReady(evt: HwChange): void {
    console.debug("HwHwEditDialog hwReady");
    console.dir(evt);
    this.data.hwChange = evt;
  }

  public apReady(evt: boolean): void {
    console.debug("HwApEditDialog apReady");
    console.dir(evt);
    this.data.removeAp = evt;
  }
}
