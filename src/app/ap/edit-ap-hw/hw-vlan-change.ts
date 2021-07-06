export interface HwVlanChange {
  hwMacId: number; // null/0 -> new
  mac: string; // null/"" -> del
  vlanId: number;
  ip: number;
}
