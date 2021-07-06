import { HwPeriChange } from "./hw-peri-change";
import { HwVlanChange } from "./hw-vlan-change";

export interface HwChange {
  apid: number;
  newpriId?: number; // exist -> 0 == no HW, >0 == new HW
  priVlans: HwVlanChange[]; // new/del/chg
  periph: HwPeriChange[]; // new/del/chg
}
