import { Betrst } from "./betrst";
import { Hardware } from "./hardware";
import { Netzwerk } from "./netzwerk";
import { Tag } from "./tag";

export class Arbeitsplatz {
  public apId: number;
  public apname: string;
  public bezeichnung: string;
  public aptyp: string;
  public oe: Betrst;
  public verantwOe: Betrst;
  public tags: Tag[];
  public hw: Hardware[];
  public vlan: Netzwerk[];
}
