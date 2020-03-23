import { LogicalOperator } from "./logical-operator";

export class LogicalAnd implements LogicalOperator {
  public toString(): string {
    return "UND";
  }

  public execute(left: boolean, right: boolean): boolean {
    return left && right;
  }
}
