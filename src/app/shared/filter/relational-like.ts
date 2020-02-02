import { RelationalOperator } from "./relational-operator";

export class RelationalLike implements RelationalOperator {

  public display(): string {
    return "ENTHÄLT";
  }

  public execute(fieldContent: string, compare: string): boolean {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent.includes(compare);
  }
}
