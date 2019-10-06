import { Expression } from "./expression";
import { LogicalExpressionRight } from "./logical-expression-right";

export interface LogicalExpression<T> extends Expression<T> {
  left: Expression<T>;
  right: Array<LogicalExpressionRight<T>> | null;
  up: LogicalExpression<T>;
}
