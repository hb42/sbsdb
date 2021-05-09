import { FormControl } from "@angular/forms";
import { Hardware } from "../../shared/model/hardware";
import { Vlan } from "../../shared/model/vlan";

export interface HwInput {
  apid: number;
  hw: Hardware;
  hwCtrl: FormControl;
  vlans: {
    mac: string;
    vlan: Vlan;
    ip: number;
    macCtrl: FormControl;
    vlanCtrl: FormControl;
    ipCtrl: FormControl;
  }[];
}
