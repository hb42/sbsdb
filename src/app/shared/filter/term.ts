/**
 * Interface fuer die Ausdruecke im Filter
 */
export interface Term {
  // Ausdruck fuer einen  Datensatz auswerten
  validate(record: Object): boolean;

  // fuer die schnelle Unterscheidung
  isBracket(): boolean;
  
  // Textausgabe des Ausdrucks
  toString(): string;
}
