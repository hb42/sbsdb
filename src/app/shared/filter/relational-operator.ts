/**
 * Relationale Operatoren im Filter
 * z.B. groesser, beginnt mit, enthaelt
 */
import { formatCurrency, formatDate, formatNumber } from "@angular/common";
import { GetFieldContent, ParseDate, StringToNumber } from "../helper";
import { ColumnType } from "../table/column-type.enum";
import { RelOp } from "./rel-op.enum";

export class RelationalOperator {
  public execute: (
    fieldContent: string | Array<unknown> | number | Date,
    compare: string | number | Date,
    type: ColumnType
  ) => boolean;
  private readonly name: string;

  constructor(public readonly op: RelOp) {
    this.name = op;
    switch (op) {
      case RelOp.like:
      case RelOp.inlistlike:
        this.execute = RelationalOperator.like;
        break;
      case RelOp.notlike:
      case RelOp.notinlistlike:
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

  // Die folgenden Number-Vergleiche verwenden den "naiven" Ansatz, dass Fliesskommazahlen
  // auf einfache Weise vergleichbar sind (was nicht der Fall ist!). Da hier nur Integer-
  // Werte oder normale Euro-Betraege verglichen werden, sollte das aber reichen.
  //
  // Der Vergleichswert stammt aus einem HTML-Input und kommt daher immer als String an. Fuer
  // Vergleich mit number|Date muss er deshalb konvertiert werden.

  private static fieldToString(fieldContent: string | number, type: number): string {
    if (fieldContent) {
      let contentStr = fieldContent.toString();
      if (
        type === ColumnType.NUMBER &&
        typeof fieldContent === "number" &&
        isFinite(fieldContent)
      ) {
        contentStr = formatNumber(fieldContent, "de");
      } else if (
        type === ColumnType.DATE &&
        Object.prototype.toString.call(fieldContent) === "[object Date]"
      ) {
        contentStr = formatDate(fieldContent, "mediumDate", "de");
      }
      return contentStr.toLocaleLowerCase();
    } else {
      return "";
    }
  }

  // LIKE vergleicht immer als regulaerer Ausdruck
  // Vergleichsstring ohne RegEx-Sonderzeichen gibt das gleiche Ergebnis wie String.includes()
  private static like = (fieldContent: string | number, compare: string, type: number): boolean => {
    try {
      const regex = new RegExp(compare ? compare : "", "i");
      return regex.test(RelationalOperator.fieldToString(fieldContent, type));
    } catch (e) {
      // wahrscheinlich Fehler beim Konvertieren zu RegExp
      return false;
    }
  };
  // NOTLIKE vergleicht immer als regulaerer Ausdruck
  private static notlike = (
    fieldContent: string | number,
    compare: string,
    type: number
  ): boolean => {
    const regex = new RegExp(compare ? compare : "", "i");
    return !regex.test(RelationalOperator.fieldToString(fieldContent, type));
  };
  // string, number, date - equal is case sensitive!
  private static equal = (
    fieldContent: string | number | Array<unknown>,
    compare: string,
    type: number
  ): boolean => {
    if (type === ColumnType.STRING || type === ColumnType.IP) {
      let fc = fieldContent as string;
      fc = fc ?? "";
      compare = compare ?? "";
      return fc === compare;
    } else if (type === ColumnType.DATE) {
      compare = compare ? compare : "";
      return new Date(fieldContent as number | string).valueOf() == ParseDate(compare).valueOf();
    } else if (type === ColumnType.NUMBER) {
      return fieldContent === StringToNumber(compare);
    } else if (type === ColumnType.ARRAY) {
      // in einem Array suchen
      // compare enthaelt den Namen des Feldes im Array
      const comp = compare.split("=");
      if (comp.length != 2) {
        return false;
      }
      const field = comp[0];
      compare = comp[1];
      if (Array.isArray(fieldContent)) {
        return fieldContent.findIndex((a) => compare === GetFieldContent(a, field)) >= 0;
      } else {
        return false;
      }
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
    } else if (type === ColumnType.ARRAY) {
      // in einem Array suchen
      // compare enthaelt den Namen des Feldes im Array
      const comp = compare.split("=");
      if (comp.length != 2) {
        return false;
      }
      const field = comp[0];
      compare = comp[1];
      if (Array.isArray(fieldContent)) {
        return fieldContent.findIndex((a) => compare === GetFieldContent(a, field)) === -1;
      } else {
        return true;
      }
    }
  };
  // verwendet LIKE -> RegEx
  private static startsWith = (fieldContent: string, compare: string, type: number): boolean => {
    return this.like(fieldContent, "^" + compare, type);
  };
  // verwendet LIKE -> RegEx
  private static endsWith = (fieldContent: string, compare: string, type: number): boolean => {
    return this.like(fieldContent, compare + "$", type);
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
