import { RelationalOperator } from "./relational-operator";

export class RelationalNotLike implements RelationalOperator {
  display = "ENTHÄLT_NICHT";

  run(left: string, right: string): boolean {
    return left.toLowerCase().includes(right) === false;
  }
}
