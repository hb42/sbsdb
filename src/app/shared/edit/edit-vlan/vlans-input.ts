import { Hardware } from "../../model/hardware";
import { HwInputVlan } from "./hw-input-vlan";
import { HwVlanChange } from "./hw-vlan-change";

export interface VlansInput {
  hw: Hardware;
  vlans: HwInputVlan[];
  out: HwVlanChange[];
  editap: boolean; // AP-Edit oder HW-Edit?
}
