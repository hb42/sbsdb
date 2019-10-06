import { LogicalOperator } from "./logical-operator";

export class LogicalAnd implements LogicalOperator {
  display = "AND";

  run(left: boolean, right: boolean): boolean {
    return left && right;
  }
}
