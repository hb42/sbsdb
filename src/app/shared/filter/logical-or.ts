import { LogicalOperator } from "./logical-operator";

export class LogicalOr implements LogicalOperator {

  public toString(): string {
    return "ODER";
  }

  public execute(left: boolean, right: boolean): boolean {
    return left || right;
  }
}
