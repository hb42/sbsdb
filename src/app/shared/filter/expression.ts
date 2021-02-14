import { Bracket } from "./bracket";
import { Field } from "./field";
import { RelOp } from "./rel-op.enum";
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
  public get compare(): string {
    return this.comp ? this.comp : "";
  }
  public set compare(c: string) {
    if (this.operator.op === RelOp.exist || this.operator.op === RelOp.notexist) {
      this.comp = "";
      this.compareString = "";
    } else {
      this.comp = c;
      this.comp ? (this.compareString = " '" + this.comp + "'") : (this.compareString = "");
    }
  }
  private compareString = "";

  constructor(public field: Field, public operator: RelationalOperator, private comp: string) {
    this.compare = comp;
  }

  public toString(): string {
    return "[" + this.field.displayName + " " + this.operator.toString() + this.compareString + "]";
  }

  public validate(record: Record<string, string | Array<string>>): boolean {
    const fields: string[] = Array.isArray(this.field.fieldName)
      ? this.field.fieldName
      : [this.field.fieldName];
    if (record) {
      const compStr = fields.reduce(
        // eslint-disable-next-line no-prototype-builtins
        (prev, curr) => (prev += record.hasOwnProperty(curr) ? record[curr] : ""),
        ""
      );
      // if (compStr) {
      return this.operator.execute(compStr, this.compare);
      // }
    }
    return false;
  }

  public isBracket(): boolean {
    return false;
  }
}
