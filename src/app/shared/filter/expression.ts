import { Bracket } from "./bracket";
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
  public up: Bracket | null;

  constructor(public field: Field, public operator: RelationalOperator, public compare: string) {
    // noop
  }

  public toString(): string {
    return (
      "[" + this.field.displayName + " " + this.operator.toString() + " '" + this.compare + "']"
    );
  }

  public validate(record: Record<string, string | Array<string>>): boolean {
    if (record && record.hasOwnProperty(this.field.fieldName)) {
      return this.operator.execute(record[this.field.fieldName], this.compare);
    }
    return false;
  }

  public isBracket(): boolean {
    return false;
  }
}
