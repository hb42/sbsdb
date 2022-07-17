import { BaseTableRow } from "../../shared/model/base-table-row";
import { ExtprogAptyp } from "./extprog-aptyp";

export class ExtProgList implements BaseTableRow {
  public program: string;
  public bezeichnung: string;
  public param: string;
  public flag: number;
  public types: ExtprogAptyp[];

  public expanded?: boolean;
  public selected?: boolean;
}
