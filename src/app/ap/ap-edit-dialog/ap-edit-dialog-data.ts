import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { TagChange } from "../edit-tags/tag-change";

export interface ApEditDialogData {
  ap: Arbeitsplatz;
  // was wird angezeigt?
  editTags: boolean;
  // Rueckgabewerte
  tags: TagChange[];
}
