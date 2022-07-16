import { BaseTableRow } from "./base-table-row";

export class ApTyp implements BaseTableRow {
  public id: number;
  public bezeichnung: string;
  public flag: number;
  public apKategorieId: number;
  public apkategorie: string;
  // berechnet
  public inUse?: number;
  public expanded?: boolean;
  public selected?: boolean;
}
