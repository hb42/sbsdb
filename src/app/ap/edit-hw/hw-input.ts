import { FormControl } from "@angular/forms";
import { VlansInput } from "../../shared/edit/edit-vlan/vlans-input";
import { Hardware } from "../../shared/model/hardware";

export interface HwInput {
  apid: number;
  hw: Hardware;
  ctrlid: string;
  hwCtrl: FormControl;
  vlans: VlansInput;
}
