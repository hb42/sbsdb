/**
 * Feld im Datensatz
 */
import { ColumnType } from "../table/column-type.enum";

export class Field {
  constructor(
    public fieldName: string | string[],
    public displayName: string,
    public type: ColumnType // -> SbsdbColumn // public columnName: string
  ) {
    // noop
  }
}
