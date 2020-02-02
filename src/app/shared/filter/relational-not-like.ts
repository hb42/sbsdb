import { RelationalOperator } from "./relational-operator";

export class RelationalNotLike implements RelationalOperator {

  public display(): string {
    return "ENTHÄLT_NICHT";
  }

  public execute(fieldContent: string, compare: string): boolean {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return !fieldContent.includes(compare);
  }

}
