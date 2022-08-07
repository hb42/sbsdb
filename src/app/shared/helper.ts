import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { CsvDialogData } from "./csv-dialog/csv-dialog-data";
import { CsvDialogComponent } from "./csv-dialog/csv-dialog.component";
import { BaseFilterService } from "./filter/base-filter-service";
import { Bracket } from "./filter/bracket";
import { Expression } from "./filter/expression";
import { Field } from "./filter/field";
import { LogicalAnd } from "./filter/logical-and";
import { LogicalOperator } from "./filter/logical-operator";
import { LogicalOr } from "./filter/logical-or";
import { RelationalOperator } from "./filter/relational-operator";
import { TransportElement } from "./filter/transport-element";
import { TransportExpression } from "./filter/transport-expression";
import { ColumnType } from "./table/column-type.enum";
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
 * Die Daten der dataSource als CSV ausgeben
 *
 * Die Felder werden ueber columns gesteuert, die auszugebenden Zeilen
 * sind von ggf. gesetzten Filtern in der dataSource abhaengig.
 *
 * @param columns - SbsdbColumns
 * @param dataSource - MatTableDataSource
 * @param separator - CSV-Trennzeichen (als Param aus der DB)
 * @param dialog - fuer den Ausgabedialog
 * @constructor
 */
export function OutputToCsv(
  columns: SbsdbColumn<unknown, unknown>[],
  dataSource: MatTableDataSource<unknown>,
  separator: string,
  dialog: MatDialog
): void {
  // csv-separator als Parameter in DB (wenn sich's M$ mal wieder anders ueberlegt)
  separator = separator ?? BaseFilterService.DEFAULT_CSV_SEPARATOR;
  // separator \t wird in der DB als "TAB" gespeichert
  separator = separator === BaseFilterService.DEFAULT_CSV_SEPARATOR_TAB ? "\t" : separator;
  const replacer = (key, value: unknown) => (value === null ? "" : value); // specify how you want to handle null values here
  let csvCols = columns.filter((co) => co.outputToCsv);

  // Dialog oeffnen
  const dialogRef = dialog.open(CsvDialogComponent, {
    disableClose: true,
    data: { all: true, fields: csvCols, resultList: [] } as CsvDialogData,
  });

  // Dialog-Ergebnis
  dialogRef.afterClosed().subscribe((result: CsvDialogData) => {
    if (result) {
      if (!result.all) {
        // nur eine Teilmengwe der Felder ausgeben
        csvCols = result.resultList;
      }
      // header
      const header: string[] = csvCols.map((c) => c.displayName);
      // data
      const csv: string[] = [
        header.join(separator),
        ...dataSource.filteredData.map((row) =>
          csvCols
            .map((col) => {
              let content;
              // fuer Number/Date muss die jew. Foramtierung in column.displayName definiert werden
              if (col.typeKey === ColumnType.NUMBER || col.typeKey === ColumnType.DATE) {
                content = col.displayText(row);
              } else {
                // fuer alle anderen den Feldinhalt holen (ggf. aus mehreren Feldern)
                if (Array.isArray(col.fieldName)) {
                  content = col.fieldName.reduce(
                    (prev, curr) =>
                      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                      (prev += (prev ? " / " : "") + (GetFieldContent(row, curr) ?? "")),
                    ""
                  );
                } else {
                  content = GetFieldContent(row, col.fieldName);
                }
              }
              const line = content ? JSON.stringify(content, replacer) : "";
              // JSON.stringify escaped " als \", das versteht Excel nicht -> ersetzen mit ""
              return line.replace(/\\"/g, '""');
            })
            .join(separator)
        ),
      ];
      const csvblob: string = csv.join("\n");
      // Excel versteht UTF-8 nur mit BOM (Microsoft halt);
      const blob: Blob = new Blob([BOM, csvblob], {
        type: "text/csv;charset=utf-8",
      });
      Download(blob, "sbsdb.csv");
    }
  });
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
      .reduce((prev, curr) => (prev && prev.hasOwnProperty(curr) ? prev[curr] : undefined), record)
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

/**
 * case-insensitive alpha sort
 *
 * deutlich schneller als String.localeCompare()
 *
 * @param a
 * @param b
 * @constructor
 */
export function StringCompare(a: string, b: string): number {
  return new Intl.Collator("de", {
    numeric: true,
    sensitivity: "base",
  }).compare(a, b);
}

const convExpression = (exp: Expression): TransportExpression | null =>
  exp
    ? new TransportExpression(
        exp.field.fieldName,
        exp.field.displayName,
        exp.field.type,
        exp.operator.op,
        exp.compare
      )
    : null;

/**
 * Bracket-Objekt in eine JSON-konforme Darstellung umwandeln
 *
 * @param b - startende Klammer
 */
export function StringifyBracket(b: Bracket): TransportElement[] {
  return b.elements.map(
    (el) =>
      new TransportElement(
        el.operator ? (el.operator.toString() === "UND" ? 1 : 0) : -1,
        el.term.isBracket()
          ? StringifyBracket(el.term as Bracket) // recurse
          : convExpression(el.term as Expression)
      )
  );
}

/**
 * Bracket-Objekt aus der JSON-kompatiblen Darstellung wiederherstellen
 *
 * @param b - uebergeordnete Klammer
 * @param t - Array der TransportElemente
 */
export function ParseBracket(b: Bracket, t: TransportElement[]) {
  let op: LogicalOperator = null;
  const and = new LogicalAnd();
  const or = new LogicalOr();
  t.forEach((tr) => {
    if (tr.op === 0) {
      op = or;
    } else if (tr.op === 1) {
      op = and;
    }
    if (Array.isArray(tr.elem)) {
      const br = new Bracket();
      br.up = b;
      b.addElement(op, br);
      ParseBracket(br, tr.elem);
    } else {
      const ex = new Expression(
        new Field(tr.elem.fName, tr.elem.dName, tr.elem.type),
        new RelationalOperator(tr.elem.op),
        tr.elem.comp
      );
      b.addElement(op, ex);
    }
  });
}
