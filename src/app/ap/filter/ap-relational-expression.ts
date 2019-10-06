import { Arbeitsplatz } from "../model/arbeitsplatz";
import { RelationalExpression } from "./relational-expression";
import { RelationalOperator } from "./relational-operator";

export class ApRelationalExpression implements RelationalExpression<Arbeitsplatz> {
  display: string;
  left: string;
  op: RelationalOperator;
  right: string;

  runExpression(record: Arbeitsplatz): boolean {
    return this.op.run(record[this.left], this.right);
  }

}
