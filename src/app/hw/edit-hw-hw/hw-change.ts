export interface HwChange {
  hwid: number;
  anschDat: Date;
  anschWert: number;
  bemerkung: string;
  invNr: string;
  sernr: string;
  smbiosgiud: string;
  wartungFa: string;
  hwKonfigId?: number; // nur f. new HW
}
