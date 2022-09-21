import { Hardware } from "../../shared/model/hardware";
import { HwChange } from "../edit-hw-hw/hw-change";

export interface EditHwMultiData {
  selectList: Hardware[];
  change: HwChange;
  removeAp: boolean;
}
