/**
 * Interface fuer die Ausdruecke im Filter
 */
import { Bracket } from "./bracket";

export interface Term {
  // umgebende Klammer | null (== top)
  up: Bracket | null;

  // Ausdruck fuer einen  Datensatz auswerten
  validate(record: object): boolean;

  // fuer die schnelle Unterscheidung
  isBracket(): boolean;

  // Textausgabe des Ausdrucks
  toString(): string;
}
