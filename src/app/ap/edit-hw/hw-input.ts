import { FormControl } from "@angular/forms";
import { Hardware } from "../../shared/model/hardware";
import { HwInputVlan } from "./hw-input-vlan";

export interface HwInput {
  apid: number;
  hw: Hardware;
  ctrlid: string;
  hwCtrl: FormControl;
  vlans: HwInputVlan[];
}
