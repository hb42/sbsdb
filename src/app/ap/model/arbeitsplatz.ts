import { Betrst } from "./betrst";
import { Hardware } from "./hardware";
import { Tag } from "./tag";

export class Arbeitsplatz {
  public apId: number;
  public apname: string;
  public bezeichnung: string;
  public aptyp: string;
  public oeId: number;
  public verantwOeId: number;
  public bemerkung: string;
  public tags: Tag[];

  public oe: Betrst;
  public verantwOe: Betrst;
  public hw: Hardware[];
  // public vlan: Netzwerk[];

  // interne Felder fuer die Darstellung/Suche
  // public typTagsStr: string;
  // public tagsStr: string;  // wird das gebraucht??
  public hwTypStr = ""; // pri HW ohne SerNr
  public hwStr = ""; //        mit SerNr
  public sonstHwStr = ""; // ges. HW fuer die Suche
  public ipStr = ""; // aus pri HW
  public macStr = ""; //  dto.
  public vlanStr = ""; // dto.
  public macsearch = ""; // Suche in allen MACs
  public oesearch = "";
  public oesort = "";
  public voesearch = "";
  public voesort = "";
  // public subTypes: string[] = [];

  // Darstellung
  public expanded?: boolean;
  public selected?: boolean;
}
