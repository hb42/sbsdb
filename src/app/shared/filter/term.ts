/**
 * Interface fuer die Ausdruecke im Filter
 */
export interface Term {
  // Ausdruck fuer einen  Datensatz auswerten
  validate(record: Object): boolean;

  // Textausgabe des Ausdrucks
  display(): string;
}