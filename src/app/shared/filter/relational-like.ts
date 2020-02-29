export class RelationalLike /*implements RelationalOperator*/ {

  public toString(): string {
    return "ENTHÄLT";
  }

  public execute(fieldContent: string, compare: string): boolean {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent.includes(compare);
  }
}
