import { HwChange } from "../edit-ap-hw/hw-change";
import { ApChange } from "../edit-ap/ap-change";
import { TagChange } from "../edit-tags/tag-change";

export interface EditApTransport {
  id: number; // 0 -> NEW
  ap: ApChange;
  hw: HwChange;
  tags: TagChange[] | null;
  delAp: boolean;
}
