/**
 * Interface fuer relationale Operatoren im Filter
 * z.B. groesser, beginnt mit, enthaelt
 */
import { RelOp } from "./rel-op.enum";

// export interface RelationalOperator {
//   // Operator fuer Feldinhalt und Vergleichstext ausfuehren
//   execute(fieldContent: string, compare: string): boolean;
//
//   // Textausgabe
//   toString(): string;
// }

export class RelationalOperator {

  public execute: (fieldContent: string, compare: string) => boolean;
  private name: string;

  constructor(public readonly op: RelOp) {
    switch (op) {
      case RelOp.like :
        this.execute = RelationalOperator.like;
        this.name = op;
        break;
      case RelOp.notlike :
        this.execute = RelationalOperator.notlike;
        this.name = op;
        break;
      default :
        this.execute = RelationalOperator.noop;
        this.name = RelOp.nop;
        break;
    }

  }

  public toString(): string {
    return this.name;
  }

  private static noop(fieldContent: string, compare: string): boolean {
    return true;
  }

  private static like(fieldContent: string, compare: string): boolean {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent.includes(compare);
  }

  private static notlike(fieldContent: string, compare: string): boolean {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return !fieldContent.includes(compare);
  }
}
