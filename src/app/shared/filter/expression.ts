import { Field } from "./field";
import { RelationalOperator } from "./relational-operator";
import { Term } from "./term";

/**
 * Einzelner relationaler Ausdruck in einem Filter
 *
 *   Feld-Inhalt RO Text
 *
 * RO := Relationaler Operator (enthaelt, groesser, beginnt mit, ...)
 *
 */
export class Expression implements Term {

  constructor(private field: Field,
              private operator: RelationalOperator,
              private compare: string) {
    // noop
  }

  toString(): string {
    return "[" + this.field.displayName + " " + this.operator.toString() + " \"" + this.compare + "\"]";
  }

  validate(record: Object): boolean {
    if (record && record.hasOwnProperty(this.field.fieldName)) {
      return this.operator.execute(record[this.field.fieldName], this.compare);
    }
    return false;
  }

  isBracket(): boolean {
    return false;
  }
}
