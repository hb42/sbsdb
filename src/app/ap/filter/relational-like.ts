import { RelationalOperator } from "./relational-operator";

export class RelationalLike implements RelationalOperator {
  display = "ENTHÄLT";

  run(left: string, right: string): boolean {
    return left.toLowerCase().includes(right);
  }

}
