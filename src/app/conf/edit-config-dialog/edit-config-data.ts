import { HwKonfig } from "../../shared/model/hw-konfig";
import { KonfigChange } from "../edit-config/konfig-change";

export interface EditConfigData {
  konfig: HwKonfig;
  chg: KonfigChange;
}
