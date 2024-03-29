import { BaseTableRow } from "./base-table-row";
import { Betrst } from "./betrst";
import { Hardware } from "./hardware";
import { Tag } from "./tag";

export class Arbeitsplatz implements BaseTableRow {
  public apId: number;
  public apname: string;
  public bezeichnung: string;
  public oeId: number;
  public verantwOeId: number;
  public bemerkung: string;

  public apTypId: number;
  public apTypBezeichnung: string;
  public apTypFlag: number;
  public apKatId: number;
  public apKatBezeichnung: string;
  public apKatFlag: number;

  public tags: Tag[];

  public oe: Betrst;
  public verantwOe: Betrst;
  public hw: Hardware[] = [];

  // interne Felder fuer die Darstellung/Suche
  public hwStr = ""; //        mit SerNr
  public sonstHwStr = ""; // ges. HW fuer die Suche
  public ipStr = ""; // alle IPs
  public macStr = ""; //  dto.
  public vlanStr = ""; // dto.
  public macsearch = ""; // Suche in allen MACs

  // Darstellung
  public expanded?: boolean;
  public selected?: boolean;
}
