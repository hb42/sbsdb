import { FormControl } from "@angular/forms";
import { Vlan } from "../../shared/model/vlan";

export interface HwInputVlan {
  hwMacId: number;
  mac: string;
  vlan: Vlan;
  ip: number;
  macCtrl: FormControl;
  vlanCtrl: FormControl;
  ipCtrl: FormControl;
}
