import { GetFieldContent } from "../helper";
import { ColumnType } from "../table/column-type.enum";
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
  private compareString = "";

  constructor(
    public field: Field,
    public operator: RelationalOperator,
    private comp: string | number | Date // public type: number
  ) {
    this.compare = comp;
  }

  public toString(): string {
    return (
      "[" + this.field.displayName + " " + this.operator.toString() + " " + this.compareString + "]"
    );
  }

  public validate(record: Record<string, string | Array<string> | number | Date>): boolean {
    let compare = this.compare;
    let compValue: string | number | Date | Array<unknown>;
    if (this.field.type === ColumnType.STRING || this.field.type === ColumnType.IP) {
      // mehrere Felder vergleichen ist nur bei String-Vergleich sinnvoll
      const fields: string[] = Array.isArray(this.field.fieldName)
        ? this.field.fieldName
        : [this.field.fieldName];
      if (record) {
        compValue = fields.reduce(
          (prev, curr) => (prev += GetFieldContent(record, curr) ?? ""),
          ""
        );
      }
    } else if (this.field.type === ColumnType.ARRAY) {
      const fields = (this.field.fieldName as string).split("$");
      if (fields.length != 2) {
        return false;
      }
      compValue = GetFieldContent(record, fields[0]) as Array<unknown>;
      compare = fields[1] + "=" + compare.toString();
    } else {
      // number | date
      const field = this.field.fieldName as string;
      const val = GetFieldContent(record, field);
      if (val) {
        compValue = val as number | Date;
      } else {
        compValue = this.field.type === ColumnType.NUMBER ? 0 : new Date(0);
      }
    }
    return this.operator.execute(compValue, compare, this.field.type);
  }

  public isBracket(): boolean {
    return false;
  }
}
