import { FormControl } from "@angular/forms";
import { ColumnFilter } from "../config/column-filter";
import { Expression } from "../filter/expression";
import { Field } from "../filter/field";
import { RelOp } from "../filter/rel-op.enum";
import { RelationalOperator } from "../filter/relational-operator";
import { Netzwerk } from "../model/netzwerk";

export class SbsdbColumn<C, E> {
  public static STRING = 0;
  public static IP = 1;
  public static DATE = 2;
  public static NUMBER = 3;

  private readonly filtercontrol: FormControl = null;

  /*
   * Filter-String
   *
   * Fuehrendes ! negiert den Filter (-> enthaelt nicht).
   * Filtertext wird als lowerCase geliefert.
   *
   * @param text - Filtertext
   */
  private static checkSearchString(text: string): ColumnFilter {
    let str = text ? text.toLowerCase() : "";
    let incl = true;
    if (str.startsWith("!")) {
      str = str.slice(1);
      incl = false;
    }
    return { text: str, inc: incl };
  }

  /**
   * Mit diesem Konstrukt kann eine fn aus z.B. ApService als Parameter
   * uebergeben werden und mit dem richtigen 'this' aufgerufen werden.
   * Dazu ist zusaetzlich die Uebergabe des jeweiligen Objekts (also z.B.
   * ApService) noetig, damit der Kontext hergestellt werdenn kann.
   * -> https://stackoverflow.com/questions/29822773/passing-class-method-as-parameter-in-typescript
   *
   * @param callbackFunction - externe function
   * @param thisarg - this-object der function
   * @param row - Datensatz (optional)
   */
  private static callback<T, R>(
    callbackFunction: (this: T, row?: R) => unknown,
    thisarg: T,
    row?: R
  ): unknown {
    return callbackFunction.call(thisarg, row);
  }

  public get columnName(): string {
    return this.colname;
  }

  public get displayName(): string {
    return SbsdbColumn.callback(this.displayname, this.context) as string;
  }

  public get fieldName(): string | string[] {
    return SbsdbColumn.callback(this.fieldname, this.context) as string | string[];
  }

  public get sortFieldName(): string | null {
    return SbsdbColumn.callback(this.sortfieldname, this.context) as string;
  }

  public get accelerator(): string {
    return this.accel;
  }

  public get show(): boolean {
    return this.showcolumn;
  }

  public get tabIndex(): number {
    return this.tabindex;
  }

  public get typeKey(): number {
    return this.typekey;
  }

  public get filterControl(): FormControl {
    return this.filtercontrol;
  }

  public get operators(): RelOp[] | null {
    return this.op;
  }

  public get selectList(): string[] | null {
    return (this.selectlist
      ? SbsdbColumn.callback(this.selectlist, this.context)
      : null) as string[];
  }

  constructor(
    private context: C,
    private colname: string,
    private displayname: () => string,
    private fieldname: () => string | string[],
    private sortfieldname: () => string,
    private displaytext: (elem: E) => string | null,
    private accel: string, //
    private showcolumn: boolean,
    private tabindex: number, // fuer Filterfelder und Reihenfolge
    private typekey: number,
    private op: RelOp[] | null, // erlaubte Verknuepfungen
    private selectlist: (() => string[]) | null // soweit sinnvoll: no dup list fuer das Feld
  ) {
    if (this.fieldName && this.show) {
      this.filtercontrol = new FormControl("");
    }
  }

  /**
   * Feldinhalt fuer die Sortierung aufbereiten
   *
   * @param obj - Datensatz
   */
  public sortString(obj: unknown): string | number {
    const field: unknown = obj[this.sortFieldName];
    let s: string;
    let v: Netzwerk[];
    let d: Date;
    switch (this.typekey) {
      case SbsdbColumn.STRING:
        s = (field as string) ?? "";
        return s.toLowerCase();
      case SbsdbColumn.IP:
        v = field as Netzwerk[];
        return v && v[0] ? v[0].vlan + v[0].ip : 0;
      case SbsdbColumn.DATE:
        d = (field as Date) ?? new Date(0);
        return d.valueOf();
      case SbsdbColumn.NUMBER:
        return field as number;
    }
  }

  /**
   * Feldinhalt anzeigen
   *
   * Kann wegen Parameter nicht, wie die restlichen callbacks,
   * als "get" deklariert werden.
   *
   * @param row - Datensatz
   */
  public displayText(row: E): string | null {
    return SbsdbColumn.callback(this.displaytext, this.context, row) as string;
  }

  /**
   * Expression fuer die Spalte bauen (std filter)
   *
   */
  public getFilterExpression(): Expression {
    const filter: ColumnFilter = this.valueChange();
    if (filter) {
      const op: RelationalOperator = filter.inc
        ? new RelationalOperator(RelOp.like)
        : new RelationalOperator(RelOp.notlike);
      const f: Field = new Field(this.fieldName, this.displayName);
      return new Expression(f, op, filter.text);
    } else {
      return null;
    }
  }

  /**
   * Suchstring vorbereiten
   */
  private valueChange(): ColumnFilter {
    const text = this.filterControl.value as string;
    if (text) {
      const t = SbsdbColumn.checkSearchString(text);
      if (this.typekey === SbsdbColumn.IP) {
        t.text = t.text.replace(/-/g, "").replace(/:/g, "").toUpperCase();
      }
      return t;
    } else {
      return null;
    }
  }
}
