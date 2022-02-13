import { Hardware } from "./hardware";

export interface HwTransport {
  hw: Hardware;
  delHwId: number; // >0 -> DEL HW
}
