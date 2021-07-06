import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { HwChange } from "../edit-ap-hw/hw-change";
import { ApChange } from "../edit-ap/ap-change";
import { TagChange } from "../edit-tags/tag-change";

export interface ApEditDialogData {
  ap: Arbeitsplatz;
  // was wird angezeigt?
  editAp: boolean;
  editHw: boolean;
  editTags: boolean;
  // Rueckgabewerte
  tags: TagChange[];
  hw: HwChange;
  apData: ApChange;
}
