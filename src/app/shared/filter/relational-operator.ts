/**
 * Relationale Operatoren im Filter
 * z.B. groesser, beginnt mit, enthaelt
 */
import { formatCurrency, formatDate } from "@angular/common";
import { ParseDate, StringToNumber } from "../helper";
import { ColumnType } from "../table/column-type.enum";
import { RelOp } from "./rel-op.enum";

export class RelationalOperator {
  // public static LIST_ALL = "<alle>";

  public execute: (
    fieldContent: string | Array<string> | number | Date,
    compare: string | number | Date,
    type: ColumnType
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
      case RelOp.exist:
        this.execute = RelationalOperator.exist;
        break;
      case RelOp.notexist:
        this.execute = RelationalOperator.notExist;
        break;
      case RelOp.gtNum:
        this.execute = RelationalOperator.gtNum;
        break;
      case RelOp.ltNum:
        this.execute = RelationalOperator.ltNum;
        break;
      default:
        this.execute = RelationalOperator.noop;
        this.name = RelOp.nop;
        break;
    }
  }

  private static noop = (): boolean => {
    return true;
  };

  // Die folgenden Number-Vergleiche verwenden den "naiver" Ansatz, dass Fliesskommazahlen
  // auf einfache Weise vergleichbar sind (was nicht der Fall ist!). Da hier nur Integer-
  // Werte oder normale Euro-Betraege verglichen werden, sollte das aber reichen.
  //
  // Der Vergleichswert stammt aus einem Input und kommt daher immer als String an. Fuer
  // Vergleich mit number|Date muss er deshalb konvertiert werden.

  private static fieldToString(fieldContent: string | number, type: number): string {
    if (fieldContent) {
      let contentStr: string;
      if (type === ColumnType.NUMBER) {
        try {
          contentStr = formatCurrency(fieldContent as number, "de", "€");
        } catch {
          contentStr = "";
        }
      } else if (type === ColumnType.DATE) {
        try {
          contentStr = formatDate(fieldContent, "mediumDate", "de");
        } catch {
          contentStr = "";
        }
      } else {
        //alles außer number oder Date wird als string behandelt
        contentStr = fieldContent.toString();
      }
      return contentStr.toLocaleLowerCase();
    } else {
      return "";
    }
  }

  // LIKE vergleicht immer als string!
  private static like = (fieldContent: string | number, compare: string, type: number): boolean => {
    compare = compare ? compare.toLocaleLowerCase() : "";
    return RelationalOperator.fieldToString(fieldContent, type).includes(compare);
  };
  // NOTLIKE vergleicht immer als string!
  private static notlike = (
    fieldContent: string | number,
    compare: string,
    type: number
  ): boolean => {
    compare = compare ? compare.toLocaleLowerCase() : "";
    return !RelationalOperator.fieldToString(fieldContent, type).includes(compare);
  };
  // string, number, date - equal is case sensitive!
  private static equal = (
    fieldContent: string | number,
    compare: string,
    type: number
  ): boolean => {
    if (type === ColumnType.STRING || type === ColumnType.IP) {
      let fc = fieldContent as string;
      fc = fc ?? "";
      compare = compare ?? "";
      // fc = fc ? fc.toLocaleLowerCase() : "";
      // compare = compare ? compare.toLocaleLowerCase() : "";
      return fc === compare;
    } else if (type === ColumnType.DATE) {
      compare = compare ? compare : "";
      return new Date(fieldContent).valueOf() == ParseDate(compare).valueOf();
    } else if (type === ColumnType.NUMBER) {
      return fieldContent === StringToNumber(compare);
    } else {
      return false;
    }
  };
  // string, number, date - notequal is case sensitive!
  private static notequal = (
    fieldContent: string | number,
    compare: string,
    type: number
  ): boolean => {
    if (type === ColumnType.STRING || type === ColumnType.IP) {
      let fc = fieldContent as string;
      fc = fc ?? "";
      compare = compare ?? "";
      return fc !== compare;
    } else if (type === ColumnType.DATE) {
      compare = compare ? compare : "";
      return new Date(fieldContent).valueOf() != ParseDate(compare).valueOf();
    } else if (type === ColumnType.NUMBER) {
      return fieldContent !== StringToNumber(compare);
    } else {
      return false;
    }
  };
  // string
  private static startsWith = (fieldContent: string, compare: string, type: number): boolean => {
    if (type !== ColumnType.STRING && type !== ColumnType.IP) {
      return false;
    }
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent.startsWith(compare);
  };
  // string
  private static endsWith = (fieldContent: string, compare: string, type: number): boolean => {
    if (type !== ColumnType.STRING && type !== ColumnType.IP) {
      return false;
    }
    fieldContent = fieldContent ? fieldContent.toLocaleLowerCase() : "";
    compare = compare ? compare.toLocaleLowerCase() : "";
    return fieldContent.endsWith(compare);
  };
  // alle
  private static exist = (fieldContent: string | number | null): boolean => {
    return !!fieldContent;
  };
  // alle
  private static notExist = (fieldContent: string | number | null): boolean => {
    return !fieldContent;
  };
  // number, date
  private static gtNum = (
    fieldContent: number | string,
    compare: string,
    type: number
  ): boolean => {
    if (type === ColumnType.DATE) {
      return new Date(fieldContent).valueOf() > ParseDate(compare).valueOf();
    } else if (type === ColumnType.NUMBER) {
      return (fieldContent as number) > StringToNumber(compare);
    } else {
      return false;
    }
  };
  // number, date
  private static ltNum = (
    fieldContent: number | string,
    compare: string,
    type: number
  ): boolean => {
    if (type === ColumnType.DATE) {
      return new Date(fieldContent).valueOf() < ParseDate(compare).valueOf();
    } else if (type === ColumnType.NUMBER) {
      return (fieldContent as number) < StringToNumber(compare);
    } else {
      return false;
    }
  };

  public toString(): string {
    return this.name;
  }
}
