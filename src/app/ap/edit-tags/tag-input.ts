import { FormControl } from "@angular/forms";
import { Tag } from "../../shared/model/tag";

export interface TagInput {
  apid: number;
  tag: Tag;
  id: number;
  tagCtrl: FormControl;
  textCtrl: FormControl;
}
