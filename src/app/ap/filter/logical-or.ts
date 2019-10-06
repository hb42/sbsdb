import { LogicalOperator } from "./logical-operator";

export class LogicalOr implements LogicalOperator {
  display = "ODER";

  run(left: boolean, right: boolean): boolean {
    return left || right;
  }

}
