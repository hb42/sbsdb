import { LogicalOperator } from "./logical-operator";

export class LogicalAnd implements LogicalOperator {

  public display(): string {
    return "UND";
  }

  public execute(left: boolean, right: boolean): boolean {
    return left && right;
  }

}
