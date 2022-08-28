import { Arbeitsplatz } from "./arbeitsplatz";
import { BaseTableRow } from "./base-table-row";
import { HwKonfig } from "./hw-konfig";
import { Netzwerk } from "./netzwerk";

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
  public hwKonfigId: number;
  public hwKonfig: HwKonfig;
  public apId: number;
  public ap: Arbeitsplatz;

  public hwStr = ""; // konfig [serNr]
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
