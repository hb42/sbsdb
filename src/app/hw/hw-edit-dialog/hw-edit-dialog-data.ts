import { BaseEditDialogData } from "../../shared/edit/base-edit-dialog-data";
import { HwVlanChange } from "../../shared/edit/edit-vlan/hw-vlan-change";
import { Hardware } from "../../shared/model/hardware";
import { HwChange } from "../edit-hw-hw/hw-change";

export interface HwEditDialogData extends BaseEditDialogData {
  hw: Hardware;
  // was wird angezeigt
  editAp: boolean;
  editHw: boolean;
  editMac: boolean;
  // Rueckgabe
  removeAp: boolean;
  delHw: boolean;
  hwChange: HwChange;
  macs: HwVlanChange[];
}
