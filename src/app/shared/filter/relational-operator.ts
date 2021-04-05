/**
 * Relationale Operatoren im Filter
 * z.B. groesser, beginnt mit, enthaelt
 */
import { RelOp } from "./rel-op.enum";

export class RelationalOperator {
  public execute: (
    fieldContent: string | Array<string> | number | Date,
    compare: string | number | Date
  ) => boolean;
  private readonly name: string;

  constructor(public readonly op: RelOp) {
    this.name = op;
    switch (op) {
      case RelOp.like:
        this.execute = RelationalOperator.like;
        break;
      case RelOp.notlike:
        this.execute = RelationalOperator.notlike;
        break;
      case RelOp.equal:
      case RelOp.inlist:
        this.execute = RelationalOperator.equal;
        break;
      case RelOp.notequal:
      case RelOp.notinlist:
        this.execute = RelationalOperator.notequal;
        break;
      case RelOp.startswith:
        this.execute = RelationalOperator.startsWith;
        break;
      case RelOp.endswith:
        this.execute = RelationalOperator.endsWith;
        break;
      case RelOp.inlistA:
        this.execute = RelationalOperator.inList;
        break;
      case RelOp.notinlistA:
        this.execute = RelationalOperator.notInList;
        break;
      case RelOp.exist:
        this.execute = RelationalOperator.exist;
        break;
      case RelOp.notexist:
        this.execute = RelationalOperator.notExist;
        break;
      case RelOp.equalNum:
        this.execute = RelationalOperator.equalNum;
        break;
      case RelOp.notequalNum:
        this.execute = RelationalOperator.notequalNum;
        break;
      case RelOp.gtNum:
        this.execute = RelationalOperator.gtNum;
        break;
      case RelOp.ltNum:
        this.execute = RelationalOperator.ltNum;
        break;
      case RelOp.equalDat:
        this.execute = RelationalOperator.equalDat;
        break;
      case RelOp.notequalDat:
        this.execute = RelationalOperator.notequalDat;
        break;
      case RelOp.gtDat:
        this.execute = RelationalOperator.gtDat;
        break;
      case RelOp.ltDat:
        this.execute = RelationalOperator.ltDat;
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

  // Die folgenden Number-Vergleiche verwenden den "naiver" Ansatz, dass Fliesskommazahlen
  // auf einfache Weise vergleichbar sind (was nicht der Fall ist!). Da hier nur Integer-
  // Werte oder normale Euro-Betraege verglichen werden, sollte das aber reichen.
  private static equalNum = (fieldContent: number, compare: number): boolean => {
    return fieldContent === compare;
  };

  private static notequalNum = (fieldContent: number, compare: number): boolean => {
    return fieldContent != compare;
  };

  private static gtNum = (fieldContent: number, compare: number): boolean => {
    return fieldContent > compare;
  };

  private static ltNum = (fieldContent: number, compare: number): boolean => {
    return fieldContent < compare;
  };

  private static equalDat = (fieldContent: Date, compare: Date): boolean => {
    return fieldContent.valueOf() === compare.valueOf();
  };

  private static notequalDat = (fieldContent: Date, compare: Date): boolean => {
    return fieldContent.valueOf() != compare.valueOf();
  };

  private static gtDat = (fieldContent: Date, compare: Date): boolean => {
    return fieldContent.valueOf() > compare.valueOf();
  };

  private static ltDat = (fieldContent: Date, compare: Date): boolean => {
    return fieldContent.valueOf() < compare.valueOf();
  };

  public toString(): string {
    return this.name;
  }
}
