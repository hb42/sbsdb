import { HwKonfig } from "../../shared/model/hw-konfig";
import { NewHwDetail } from "./new-hw-detail";

export interface NewHwData {
  konfig: HwKonfig;

  anschDat: Date;
  anschWert: number;
  invNr: string;
  wartungFa?: string;
  bemerkung?: string;

  devices: NewHwDetail[];
}
