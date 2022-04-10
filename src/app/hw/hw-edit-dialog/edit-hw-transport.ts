import { HwVlanChange } from "../../shared/edit/edit-vlan/hw-vlan-change";

export interface EditHwTransport {
  id: number;
  delHw: boolean;
  removeAp: boolean;
  vlans: HwVlanChange[]; // MAC == null|"" -> del

  sernr: string;
  hwKonfigId?: number; // nur f. new HW
  anschDat?: Date;
  anschWert?: number;
  invNr?: string;
  smbiosgiud?: string;
  wartungFa?: string;
  bemerkung?: string;

  aussonderung?: string; // Aussonderungs-Grund, wenn delHw == true
}
