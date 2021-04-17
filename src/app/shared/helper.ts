import { SbsdbColumn } from "./table/sbsdb-column";

export const BOM = String.fromCharCode(0xfeff);

/**
 * Index der Spalte 'name' aus dem Array 'columns' holen.
 *
 * @param name
 * @param columns
 * @constructor
 */
export function GetColumnIndex(name: string, columns: SbsdbColumn<unknown, unknown>[]): number {
  return columns.findIndex((c) => c.columnName === name);
}

/**
 * Spalte mit dem Namen 'name' aus dem Array 'columns' holen.
 *
 * @param name
 * @param columns
 * @constructor
 */
export function GetColumn(
  name: string,
  columns: SbsdbColumn<unknown, unknown>[]
): SbsdbColumn<unknown, unknown> {
  const idx = GetColumnIndex(name, columns);
  if (idx >= 0 && idx < columns.length) {
    return columns[idx];
  } else {
    return null;
  }
}

/**
 * String der Form "DD.MM.YYYY" | "D.M.YY" in ein Date-Objekt umwandeln.
 *
 * Evtl. vorhandener Text nach dem Datum wird ignoriert.
 *
 * Liefert das Date oder Date(0)
 *
 * @param date
 */
export function ParseDate(date: string): Date {
  const datePattern = /^\s*(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})\s*$/;
  try {
    const [, day = 1, month = 1, year = 1] = datePattern.exec(date);
    return new Date(`${month}, ${day} ${year}`);
  } catch {
    return new Date(0);
  }
}

/**
 * String aus einem Eingabefeld in eine Zahl umwandeln.
 *
 * Geht von der Annahme aus, dass der Zahlenwert immer in deutscher Notation
 * eingegeben wird (12.345,67). Die wissenschaftliche Notation wird ignoriert.
 *
 * Liefert number oder NaN
 *
 * @param input
 * @constructor
 */
export function StringToNumber(input: string): number {
  const isnumber = /^[+-]?\d+\.?\d*$/;
  input = input ? input.replace(".", "").replace(",", ".").trim() : "";
  return isnumber.test(input) ? Number.parseFloat(input) : NaN;
}

/**
 * Feldinhalt holen
 *
 * Der Feldname kann in der Form "feld1.feld2 ..." fuer den Zugriff auf "Unterobjekte"
 * angegeben werden.
 *
 * @param record - Datensatz
 * @param fieldname - Feldname(en)
 * @private
 */
export function GetFieldContent(record: unknown, fieldname: string): unknown {
  return (
    fieldname
      .split(".")
      // eslint-disable-next-line no-prototype-builtins
      .reduce((prev, curr) => (prev.hasOwnProperty(curr) ? prev[curr] : undefined), record)
  );
}
