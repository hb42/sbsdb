import { Arbeitsplatz } from "./arbeitsplatz";
import { BaseTableRow } from "./base-table-row";
import { Netzwerk } from "./netzwerk";
import { HwKonfig } from "./hw-konfig";

export class Hardware implements BaseTableRow {
  public id: number;
  public anschDat: Date;
  public anschWert: number;
  public invNr: string;
  public smbiosgiud: string;
  public wartungFa: string;
  public bemerkung: string;
  public sernr: string;
  public pri: boolean;
  // public hwtyp: string;
  // public hwtypFlag: number;
  public hwKonfigId: number;
  public hwKonfig: HwKonfig;
  public apId: number;
  public ap: Arbeitsplatz;

  public konfiguration: string;
  // public hwTypBezeichnung: string;
  // public apKatBezeichnung: string;
  public vlans: Netzwerk[];
  public ipStr = "";
  public macStr = "";
  public vlanStr = "";
  public apStr = "";
  public macsearch = "";
  // Darstellung
  public expanded?: boolean;
  public selected?: boolean;
}
