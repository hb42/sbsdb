export interface KonfigChange {
  id: number;
  bezeichnung: string;
  hersteller: string;
  hd: string;
  prozessor: string;
  ram: string;
  sonst: string;
  video: string;

  hwTypId: number; // new konfig only
}
