import { NewHwDetail } from "./new-hw-detail";

export interface NewHwTransport {
  konfigId: number;

  anschDat: Date;
  anschWert: number;
  invNr: string;
  wartungFa: string;
  bemerkung: string;

  devices: NewHwDetail[];
}
