import { BaseTableRow } from "../../shared/model/base-table-row";

export class ExtProgList implements BaseTableRow {
  public program: string;
  public bezeichnung: string;
  public param: string;
  public flag: number;
  public types: { id: number; aptypid: number; aptyp: string }[];

  public expanded?: boolean;
  public selected?: boolean;
}
