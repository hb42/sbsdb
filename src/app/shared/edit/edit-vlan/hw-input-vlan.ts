import { FormControl } from "@angular/forms";
import { Vlan } from "../../model/vlan";

export interface HwInputVlan {
  hwMacId: number;
  mac: string;
  vlan: Vlan;
  ip: number;
  macCtrl: FormControl;
  vlanCtrl: FormControl;
  ipCtrl: FormControl;
  groupId: string;
}
