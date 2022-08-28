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
  public onDelAp: EventEmitter<void> = new EventEmitter<void>();
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HwEditDialogData,
    public matDialogRef: MatDialogRef<HwEditDialogComponent>,
    public formBuilder: FormBuilder
  ) {
    console.debug("c'tor HwEditDialogComponent");
    this.formGroup = this.formBuilder.group({});
  }

  public onSubmit(): void {
    this.onSubmitEvent.emit();
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
