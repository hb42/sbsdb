import { HwVlanChange } from "./hw-vlan-change";

export interface HwPeriChange {
  hwId: number;
  del: boolean; // true: del hwId, false: hwId exist -> chg vlans else new hwId/vlans
  vlans: HwVlanChange[]; // new/chg/del
}
