import { BaseEditDialogData } from "../../shared/edit/base-edit-dialog-data";
import { HwKonfig } from "../../shared/model/hw-konfig";
import { KonfigChange } from "../edit-config/konfig-change";

export interface EditConfigData extends BaseEditDialogData {
  konfig: HwKonfig;
  chg: KonfigChange;
}
