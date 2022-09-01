import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { MultiChange } from "../edit-multi/multi-change";
import { TagChange } from "../edit-tags/tag-change";

export interface EditApMultiData {
  selectlist: Arbeitsplatz[];
  apkatid: number;
  change: MultiChange;
  tags: TagChange[];
}
