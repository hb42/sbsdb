import { SbsdbColumn } from "./table/sbsdb-column";

export const BOM = String.fromCharCode(0xfeff);

/**
 * Blob als Datei herunterladen
 *
 * blob wird konstuiert als:
 *   const blob: Blob = new Blob([string, string .. ], {
 *     type: "text/plain;charset=utf-8", // alt.: "application/octet-stream;charset=UTF-8"
 *   }
 *
 * @param content - Dateiinhalt als Blob
 * @param fileName - Dateiname fuer Download
 * @constructor
 */
export function Download(content: Blob, fileName: string): void {
  const a = document.createElement("a");
  const url = window.URL.createObjectURL(content);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}
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
  input = input ? input.replace(/\./g, "").replace(/,/, ".").trim() : "";
  const isnumber = /^[+-]?\d*\.?\d+$/;
  return isnumber.test(input) ? Number.parseFloat(input) : NaN;
}

/**
 * String auf gueltige Zahl mit max. zwei Nachkommastellen ueberpruefen.
 *
 * Gueltig ist ein leerer String oder eine Zahl mit Tausenderpunkten (optional) und
 * Komma (optional). Fuehrende Nullen werden ignoriert.
 *
 * @param input
 * @constructor
 */
export function CurrencyCheck(input: string): boolean {
  const check = /^\d\d{0,2}(\.?\d{3})*(,\d{1,2})?$/;
  return !(input && !check.test(input));
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

/**
 * Date fuer die Uebertragung zum Server vorbereiten
 *
 * Die Daten werden per JSON an den Server uebergeben. Date wird dabei in einen ISO-String
 * umgewandelt (==UTC). .NET beruecksichtigt aber keine Timezone, daher geht die
 * Timezone-Differenz verloren (1 oder 2 Stunden).
 *
 * Beispiel:
 * - Datum: 25.06.1999
 *   JavaScript Date = Fri Jun 25 1999 00:00:00 GMT+0200 (Mitteleuropäische Sommerzeit)
 *   Date.toISOString() = Date.toJSON() = "1999-06-24T22:00:00.000Z" (Timezone-Diff!)
 * - Serverseitig wird der JSON-String unveraendert uebernommen
 *   .NET DateTime = 06/24/1999 22:00:00
 *   Damit fehlen dann 2 Stunden (Winterzeit 1)
 *
 * Die, nicht sehr elegante, Loesung ist, vor der Umwandlung in JSON die GMT-Differenz
 * zu addieren, dann kommt beim Server der Originale Timestamp an.
 *
 * @param date
 * @constructor
 */
export function PrepDateForDB(date: Date): Date {
  const rc = new Date(date);
  rc.setMinutes(-1 * rc.getTimezoneOffset());
  return rc;
}
