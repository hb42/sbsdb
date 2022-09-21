import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { Hardware } from "../../shared/model/hardware";
import { HwChange } from "../edit-hw-hw/hw-change";
import { EditHwMultiData } from "./edit-hw-multi-data";

@Component({
  selector: "sbsdb-hw-edit-multi-dialog",
  templateUrl: "./hw-edit-multi-dialog.component.html",
  styleUrls: ["./hw-edit-multi-dialog.component.scss"],
})
export class HwEditMultiDialogComponent {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  public pseudoHw: Hardware;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditHwMultiData,
    public matDialogRef: MatDialogRef<HwEditMultiDialogComponent>,
    public formBuilder: FormBuilder
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.formGroup = this.formBuilder.group({});

    this.pseudoHw = {
      anschDat: undefined,
      anschWert: 0,
      ap: undefined,
      apId: 0,
      apStr: "",
      bemerkung: "",
      hwKonfig: undefined,
      hwKonfigId: 0,
      hwStr: "",
      id: 0, // steuert multiEdit in EditHwHwComponent
      invNr: "",
      ipStr: "",
      macStr: "",
      macsearch: "",
      pri: false,
      sernr: "dummy", // nicht leer, damit's in EditHwHwCompnent keinen required-Fehler gibt
      smbiosgiud: "",
      vlanStr: "",
      vlans: [],
      wartungFa: "",
    };
  }

  public onSubmit() {
    console.debug("hw multi edit submit");
    this.onSubmitEvent.emit();
  }

  public hwReady(evt: HwChange): void {
    this.data.change = evt;
  }
  public multiReady(evt: boolean): void {
    this.data.removeAp = evt;
  }
}
