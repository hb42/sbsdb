export class RelationalNotLike /*implements RelationalOperator*/ {

  public toString(): string {
    return "ENTHÄLT_NICHT";
  }

  public execute(fieldContent: string, compare: string): boolean {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return !fieldContent.includes(compare);
  }

}
