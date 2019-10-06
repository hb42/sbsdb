import { Arbeitsplatz } from "../model/arbeitsplatz";
import { Expression } from "./expression";
import { LogicalExpression } from "./logical-expression";
import { LogicalExpressionRight } from "./logical-expression-right";

export class ApLogicalExpression implements LogicalExpression<Arbeitsplatz> {
  left: Expression<Arbeitsplatz>;
  right: Array<LogicalExpressionRight<Arbeitsplatz>> | null;
  up: LogicalExpression<Arbeitsplatz>;

  runExpression(record: Arbeitsplatz): boolean {
    const le = this.left ? this.left.runExpression(record) : true;
    if (this.right && this.right.length > 0) {
      return this.right.reduce((prev, curr) => {
        return curr.op.run(prev, curr.expr.runExpression(record));
      }, le);
    } else {
      return le;
    }
  }
}
