/**
 * Interface fuer relationale Operatoren im Filter
 * z.B. groesser, beginnt mit, enthaelt
 */
export interface RelationalOperator {
  // Operator fuer Feldinhalt und Vergleichstext ausfuehren
  execute(fieldContent: string, compare: string): boolean;

  // Textausgabe
  toString(): string;
}
