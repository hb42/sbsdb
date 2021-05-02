import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { HwChange } from "../edit-ap-hw/hw-change";
import { TagChange } from "../edit-tags/tag-change";

export interface ApEditDialogData {
  ap: Arbeitsplatz;
  // was wird angezeigt?
  editHw: boolean;
  editTags: boolean;
  // Rueckgabewerte
  tags: TagChange[];
  hw: HwChange;
}
