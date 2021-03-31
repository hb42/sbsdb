import { Netzwerk } from "./netzwerk";
import { HwKonfig } from "./hw-konfig";

export class Hardware {
  public id: number;
  // public hersteller: string;
  // public bezeichnung: string;
  public anschDat: Date; // TODO Datentyp ist noch zu testen!
  public anschWert: number;
  public invNr: string;
  public smbiosgiud: string;
  public wartungBem: string;
  public wartungFa: string;
  public bemerkung: string;
  public sernr: string;
  public pri: boolean;
  // public hwtyp: string;
  // public hwtypFlag: number;
  public hwKonfigId: number;
  public hwKonfig: HwKonfig;
  public apId: number;
  public vlans: Netzwerk[];
  public ipStr = "";
  public macStr = "";
  public vlanStr = "";

  // Darstellung
  public expanded?: boolean;
  public selected?: boolean;
}
