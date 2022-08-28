/**
 * Feld im Datensatz
 */
import { environment } from "../../../environments/environment";
import { ColumnType } from "../table/column-type.enum";

export class Field {
  constructor(
    public fieldName: string | string[],
    public displayName: string,
    public type: ColumnType
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
