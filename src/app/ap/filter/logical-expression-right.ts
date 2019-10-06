import { Expression } from "./expression";
import { LogicalOperator } from "./logical-operator";

export class LogicalExpressionRight<T> {
  op: LogicalOperator;
  expr: Expression<T>;
}
