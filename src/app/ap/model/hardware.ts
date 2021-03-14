import { Netzwerk } from "./netzwerk";

export class Hardware {
  public id: number;
  public hersteller: string;
  public bezeichnung: string;
  public sernr: string;
  public pri: boolean;
  public hwtyp: string;
  public hwtypFlag: number;
  public vlan: Netzwerk[];
  public ipStr = "";
  public macStr = "";
  public vlanStr = "";
}
