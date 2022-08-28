import { FormControl } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { ColumnFilter } from "../config/column-filter";
import { Expression } from "../filter/expression";
import { Field } from "../filter/field";
import { RelOp } from "../filter/rel-op.enum";
import { RelationalOperator } from "../filter/relational-operator";
import { GetFieldContent } from "../helper";
import { Netzwerk } from "../model/netzwerk";
import { ColumnType } from "./column-type.enum";

export class SbsdbColumn<C, E> {
  // fuer selects
  public static EMPTY_OPTION = String.fromCharCode(187) + "alle" + String.fromCharCode(171);

  private filtercontrol: FormControl = null;

  /*
   * Filter-String
   *
   * Fuehrendes ! negiert den Filter (-> enthaelt nicht).
   *
   * @param text - Filtertext
   */
  private static checkSearchString(text: string): ColumnFilter {
    let str = text ?? "";
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

  public get sortFieldName(): string | string[] | null {
    return SbsdbColumn.callback(this.sortfieldname, this.context) as string;
  }

  public get accelerator(): string {
    return this.accel;
  }

  public get show(): boolean {
    return this.showcolumn;
  }
  public set show(s: boolean) {
    if (s && this.fieldName && !this.filtercontrol) {
      this.filtercontrol = new FormControl("");
    }
    this.showcolumn = s;
  }

  public get tabIndex(): number {
    return this.tabindex;
  }

  public get typeKey(): ColumnType {
    return this.typekey;
  }

  public get filterControl(): FormControl {
    return this.filtercontrol;
  }

  public get operators(): RelOp[] | null {
    return this.op;
  }

  public get selectList(): string[] | null {
    return (
      this.selectlist ? SbsdbColumn.callback(this.selectlist, this.context) : null
    ) as string[];
  }

  public get outputToCsv(): boolean {
    return this.outputtocsv;
  }

  public get size(): string {
    return this._size ?? "";
  }

  constructor(
    private context: C,
    private colname: string,
    private displayname: () => string,
    private fieldname: () => string | string[],
    private sortfieldname: () => string | string[] | null,
    private displaytext: (elem: E) => string | null,
    private accel: string, //
    private showcolumn: boolean,
    private tabindex: number, // fuer Filterfelder und Reihenfolge
    private typekey: ColumnType,
    private op: RelOp[] | null, // erlaubte Verknuepfungen
    private selectlist: (() => string[]) | null, // soweit sinnvoll: no dup list fuer das Feld
    private outputtocsv: boolean,
    private _size?: string // param size f. sbsdb-header-cell
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.show = showcolumn;
  }

  /**
   * Feldinhalt fuer die Sortierung aufbereiten
   *
   * @param obj - Datensatz
   */
  public sortString(obj: unknown): string | number {
    let field: unknown;
    const fields: string[] = [];
    if (Array.isArray(this.sortFieldName)) {
      if (this.typekey !== ColumnType.STRING) {
        // mehrere Felder funktionieren nur mit String-Sort
        return 0;
      }
      this.sortFieldName.forEach((f) => fields.push(GetFieldContent(obj, f) as string));
      field = fields.join("");
    } else {
      field = GetFieldContent(obj, this.sortFieldName);
    }
    let s: string;
    let v: Netzwerk[];
    let d: Date;
    switch (this.typekey) {
      case ColumnType.STRING:
        s = (field as string) ?? "";
        return s.toLowerCase();
      case ColumnType.IP:
        v = field as Netzwerk[];
        return v && v[0] ? v[0].vlan + v[0].ip : 0;
      case ColumnType.DATE:
        d = (field as Date) ?? new Date(0);
        return d.valueOf();
      case ColumnType.NUMBER:
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
    let op: RelationalOperator;
    if (filter) {
      if (this.isDropdown()) {
        op = new RelationalOperator(RelOp.inlist);
      } else {
        op = filter.inc
          ? new RelationalOperator(RelOp.like)
          : new RelationalOperator(RelOp.notlike);
      }
      const f: Field = new Field(this.fieldName, this.displayName, this.typekey);
      return new Expression(f, op, filter.text);
    } else {
      return null;
    }
  }

  /**
   * Test, ob Input oder Dropdown im StdFilter angezeigt werden soll.
   *
   * Bedingung fuer Dropdown: column.selectlist ist vorhanden und der erste
   * Operatar ist RelOp.inList.
   */
  public isDropdown(): boolean {
    return this.selectList && this.operators && this.operators[0] === RelOp.inlist;
  }

  /**
   * Suchstring vorbereiten
   */
  private valueChange(): ColumnFilter {
    const text = this.filterControl.value as string;
    if (text && text !== SbsdbColumn.EMPTY_OPTION) {
      const t = SbsdbColumn.checkSearchString(text);
      if (this.typekey === ColumnType.IP) {
        t.text = t.text.replace(/-/g, "").replace(/:/g, "");
      }
      return t;
    } else {
      return null;
    }
  }
}
