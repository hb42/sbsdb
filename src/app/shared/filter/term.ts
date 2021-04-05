/**
 * Interface fuer die Ausdruecke im Filter
 */
import { Bracket } from "./bracket";

export interface Term {
  // umgebende Klammer | null (== top)
  up: Bracket | null;

  // Ausdruck fuer einen  Datensatz auswerten
  validate(record: Record<string, string | Array<string> | number | Date>): boolean;

  // fuer die schnelle Unterscheidung
  isBracket(): boolean;

  // Textausgabe des Ausdrucks
  toString(): string;
}
