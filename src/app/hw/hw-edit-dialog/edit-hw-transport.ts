import { HwVlanChange } from "../../ap/edit-ap-hw/hw-vlan-change";

export interface EditHwTransport {
  id: number;
  removeAp: boolean;
  vlans: HwVlanChange[]; // MAC == null|"" -> del

  anschDat?: Date;
  anschWert?: number;
  invNr?: string;
  smbiosgiud?: string;
  wartungFa?: string;
  bemerkung?: string;
  sernr?: string;
  apId?: number;
}
