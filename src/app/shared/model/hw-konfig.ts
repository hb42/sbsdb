export class HwKonfig {
  public id: number;
  public bezeichnung: string;
  public hersteller: string;
  public hd: string;
  public prozessor: string;
  public ram: string;
  public sonst: string;
  public video: string;

  public hwTypId: number;
  public hwTypBezeichnung: string;
  public hwTypFlag: number;

  public apKatId: number;
  public apKatBezeichnung: string;
  public apKatFlag: number;

  // berechnet
  public zuordnung?: string;
  public devices?: number;
  public aps?: number;
  // Darstellung
  public expanded?: boolean;
  public selected?: boolean;
}
