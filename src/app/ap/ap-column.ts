import { FormControl } from "@angular/forms";
import { ColumnFilter } from "../shared/config/column-filter";
import { Expression } from "../shared/filter/expression";
import { Field } from "../shared/filter/field";
import { RelOp } from "../shared/filter/rel-op.enum";
import { RelationalOperator } from "../shared/filter/relational-operator";
import { ArbeitsplatzService } from "./arbeitsplatz.service";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { Netzwerk } from "./model/netzwerk";

/*
export interface ApColumn {
  name: string;
  show: boolean;  // Spalte in der Liste anzeigen?
  sort?: {
    text: string;  // Sort-Heading
    key: string;   // Accelerator (alt-key)
    sortString(ap: Arbeitsplatz): string | number;  // String fuer den Vergleich
  };
  filter?: {
    filter: FormControl;  // Filter-Feld
    valueChange(text: string): ColumnFilter;  // Filter in UserSession speichern
    // predicate(ap: Arbeitsplatz): boolean;  // Vergleich-Funktion fuer den Filter
    predicate(ap: Arbeitsplatz): Expression;  // Vergleich-Funktion fuer den Filter
  };
}
*/

export class ApColumn {
  public static LCASE = 0;
  public static IP = 1;

  /**
   * Sammlung der Spalten
   */
  // public static columns: ApColumn[] = [];
  //
  // public static add(col: ApColumn) {
  //   this.columns.push(col);
  // }
  // public static getColumnIndex(name: string): number {
  //   return this.columns.findIndex((c) => c.columnName === name);
  // }
  // public static getColumn(name: string): ApColumn {
  //   const idx = this.getColumnIndex(name);
  //   if (idx >= 0 && idx < this.columns.length) {
  //     return this.columns[idx];
  //   } else {
  //     return null;
  //   }
  // }

  private filtercontrol: FormControl = null;

  public get columnName(): string {
    return this.colname;
  }

  public get displayName(): string {
    return this.callback(this.displayname, this.apService);
  }

  public get fieldName(): string {
    return this.callback(this.fieldname, this.apService);
  }

  public get sortFieldName(): string | null {
    return this.sortfieldname ? this.callback(this.sortfieldname, this.apService) : null;
  }

  public get accelerator(): string {
    return this.accel;
  }

  public get show(): boolean {
    return this.showcol;
  }

  public get filterControl(): FormControl {
    return this.filtercontrol;
  }

  public get operators(): RelOp[] | null {
    return this.op;
  }

  public get selectList(): string[] | null {
    return this.selectlist ? this.callback(this.selectlist, this.apService) : null;
  }

  constructor(
    private apService: ArbeitsplatzService,
    private colname: string,
    private displayname: () => string,
    private fieldname: () => string,
    private sortfieldname: (() => string) | null, // falls soert_field != field_name sonst null
    private accel: string, //
    private showcol: boolean,
    private typekey: number,
    private op: RelOp[] | null, // erlaubte Verknuepfungen
    private selectlist: (() => string[]) | null // soweit sinnvoll: no dup list fuer das Feld
  ) {
    if (this.fieldName) {
      this.filtercontrol = new FormControl("");
    }
  }

  /**
   * Feldinhalt fuer die Sortierung aufbereiten
   *
   * @param ap - Arbeitsplatz-Record
   */
  public sortString(ap: Arbeitsplatz) {
    const field = this.sortfieldname ? ap[this.sortFieldName] : ap[this.fieldName];
    switch (this.typekey) {
      case ApColumn.LCASE:
        const s = field as string;
        return s.toLowerCase();
      case ApColumn.IP:
        const v = field as Netzwerk;
        return v && v[0] ? v[0].vlan + v[0].ip : 0;
    }
  }

  /**
   * Suchstring vorbereiten
   *
   * @param text - Eingabetext
   */
  public valueChange(): ColumnFilter {
    const text = this.filterControl.value;
    const t = this.checkSearchString(text);
    if (this.typekey === ApColumn.IP) {
      t.text = t.text.replace(/-/g, "").replace(/:/g, "").toUpperCase();
    }
    return t;
  }

  /**
   * Expression fuer die Spalte bauen
   *
   * @param filter - Filter-Ausdruck der Spalte
   */
  //  nur fuer std-filter oder auch fuer extd??
  public getFilterExpression(filter: ColumnFilter): Expression {
    if (filter.text) {
      let op: RelationalOperator;
      op = filter.inc ? new RelationalOperator(RelOp.like) : new RelationalOperator(RelOp.notlike);
      const f: Field = new Field(this.fieldName, this.displayName);
      return new Expression(f, op, filter.text);
    } else {
      return null;
    }
  }

  /*
   * Filter-String
   *
   * Fuehrendes ! negiert den Filter (-> enthaelt nicht).
   * Filtertext wird als lowerCase geliefert.
   *
   * @param text - Filtertext
   */
  private checkSearchString(text: string): ColumnFilter {
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
   * @param thisarg - object der function
   */
  private callback<T>(callbackFunction: (this: T) => any, thisarg: T): any {
    return callbackFunction.call(thisarg);
  }
}
