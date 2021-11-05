import { Hardware } from "../../shared/model/hardware";
import { HwHistory } from "../../shared/model/hw-history";

export interface ShowHistoryData {
  hw: Hardware;
  list: HwHistory[];
}
