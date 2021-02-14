/**
 * Relationale Operatoren im Filter
 * z.B. groesser, beginnt mit, enthaelt
 */
import { RelOp } from "./rel-op.enum";

export class RelationalOperator {
  public execute: (fieldContent: string | Array<string>, compare: string) => boolean;
  private readonly name: string;

  constructor(public readonly op: RelOp) {
    switch (op) {
      case RelOp.like:
        this.execute = RelationalOperator.like;
        this.name = op;
        break;
      case RelOp.notlike:
        this.execute = RelationalOperator.notlike;
        this.name = op;
        break;
      case RelOp.equal:
      case RelOp.inlist:
        this.execute = RelationalOperator.equal;
        this.name = op;
        break;
      case RelOp.notequal:
      case RelOp.notinlist:
        this.execute = RelationalOperator.notequal;
        this.name = op;
        break;
      case RelOp.startswith:
        this.execute = RelationalOperator.startsWith;
        this.name = op;
        break;
      case RelOp.endswith:
        this.execute = RelationalOperator.endsWith;
        this.name = op;
        break;
      case RelOp.inlistA:
        this.execute = RelationalOperator.inList;
        this.name = op;
        break;
      case RelOp.notinlistA:
        this.execute = RelationalOperator.notInList;
        this.name = op;
        break;
      case RelOp.exist:
        this.execute = RelationalOperator.exist;
        this.name = op;
        break;
      case RelOp.notexist:
        this.execute = RelationalOperator.notExist;
        this.name = op;
        break;
      default:
        this.execute = RelationalOperator.noop;
        this.name = RelOp.nop;
        break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static noop = (fieldContent: string, compare: string): boolean => {
    return true;
  };

  private static like = (fieldContent: string, compare: string): boolean => {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent.includes(compare);
  };

  private static notlike = (fieldContent: string, compare: string): boolean => {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return !fieldContent.includes(compare);
  };

  private static equal = (fieldContent: string, compare: string): boolean => {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent === compare;
  };

  private static notequal = (fieldContent: string, compare: string): boolean => {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent !== compare;
  };

  private static startsWith = (fieldContent: string, compare: string): boolean => {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent.startsWith(compare);
  };

  private static endsWith = (fieldContent: string, compare: string): boolean => {
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent.endsWith(compare);
  };

  private static inList = (fieldContent: Array<string>, compare: string): boolean => {
    return fieldContent.indexOf(compare) >= 0;
  };

  private static notInList = (fieldContent: Array<string>, compare: string): boolean => {
    return fieldContent.indexOf(compare) === -1;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static exist = (fieldContent: string, compare: string): boolean => {
    return !!fieldContent;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static notExist = (fieldContent: string, compare: string): boolean => {
    return !fieldContent;
  };

  public toString(): string {
    return this.name;
  }
}
