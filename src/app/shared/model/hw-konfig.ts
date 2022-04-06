export class HwKonfig {
  public static FREMDE_HW_FLAG = 0b0000_0001;

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
  public konfiguration: string;
  public deviceCount?: number;
  public apCount?: number;
  public get fremdeHw(): boolean {
    return (this.hwTypFlag & HwKonfig.FREMDE_HW_FLAG) > 0;
  }
  // Darstellung
  public expanded?: boolean;
  public selected?: boolean;
}
