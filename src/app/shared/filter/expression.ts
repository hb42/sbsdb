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
  public get compare(): string | number | Date {
    return this.comp ? this.comp : "";
  }
  public set compare(c: string | number | Date) {
    if (this.operator.op === RelOp.exist || this.operator.op === RelOp.notexist) {
      this.comp = "";
      this.compareString = "";
    } else {
      this.comp = c;
      this.comp
        ? (this.compareString = " '" + this.comp.toString() + "'")
        : (this.compareString = "");
    }
  }
  public readonly type; // Datentyp des Vergleichs: string, number, date

  private compareString = "";

  constructor(
    public field: Field,
    public operator: RelationalOperator,
    private comp: string | number | Date
  ) {
    this.compare = comp;
    this.type = typeof comp;
    if (this.type === "object") {
      if (comp instanceof Date) {
        this.type = "date";
      }
    }
    if (this.type !== "string" && this.type !== "number" && this.type !== "date") {
      console.error("Fehler in Expression: Vergleich mit undefiniertem Datentyp:");
      console.dir(comp);
      this.compare = comp.toString(); // Fallback: Wert wird wie String behandelt
      this.type = "string";
    }
  }

  public toString(): string {
    return "[" + this.field.displayName + " " + this.operator.toString() + this.compareString + "]";
  }

  public validate(record: Record<string, string | Array<string> | number | Date>): boolean {
    let compValue: string | number | Date;
    if (this.type === "string") {
      // mehrere Felder vergleichen ist nur bei String-Vergleich sinnvoll
      const fields: string[] = Array.isArray(this.field.fieldName)
        ? this.field.fieldName
        : [this.field.fieldName];
      if (record) {
        compValue = fields.reduce(
          // eslint-disable-next-line no-prototype-builtins
          (prev, curr) => (prev += record.hasOwnProperty(curr) ? record[curr] : ""),
          ""
        );
      }
    } else if (this.type === "number" || this.type === "date") {
      const field = this.field.fieldName as string;
      // eslint-disable-next-line no-prototype-builtins
      if (record.hasOwnProperty(field)) {
        compValue = record[field] as number | Date;
      } else {
        compValue = this.type === "number" ? 0 : new Date(0);
      }
    } else {
      return false;
    }
    return this.operator.execute(compValue, this.compare);
  }

  public isBracket(): boolean {
    return false;
  }
}
