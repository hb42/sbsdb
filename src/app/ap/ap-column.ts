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
  static LCASE = 0;
  static IP = 1;

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

  private filter_control: FormControl = null;

  public get columnName(): string {
    return this.col_name;
  }

  public get displayName(): string {
    return this.callback(this.display_name, this.apService);
  }

  public get fieldName(): string {
    return this.callback(this.field_name, this.apService);
  }

  public get sortFieldName(): string | null {
    return this.sort_field_name
      ? this.callback(this.sort_field_name, this.apService)
      : null;
  }

  public get accelerator(): string {
    return this.accel;
  }

  public get show(): boolean {
    return this.show_col;
  }

  public get filterControl(): FormControl {
    return this.filter_control;
  }

  public get operators(): RelOp[] | null {
    return this.op;
  }

  public get selectList(): string[] | null {
    return this.select_list
      ? this.callback(this.select_list, this.apService)
      : null;
  }

  constructor(
    private apService: ArbeitsplatzService,
    private col_name: string,
    private display_name: () => string,
    private field_name: () => string,
    private sort_field_name: (() => string) | null, // falls soert_field != field_name sonst null
    private accel: string, //
    private show_col: boolean,
    private type_key: number,
    private op: RelOp[] | null, // erlaubte Verknuepfungen
    private select_list: (() => string[]) | null // soweit sinnvoll: no dup list fuer das Feld
  ) {
    if (this.fieldName) {
      this.filter_control = new FormControl("");
    }
  }

  /**
   * Feldinhalt fuer die Sortierung aufbereiten
   *
   * @param ap
   */
  public sortString(ap: Arbeitsplatz) {
    const field = this.sort_field_name
      ? ap[this.sortFieldName]
      : ap[this.fieldName];
    switch (this.type_key) {
      case ApColumn.LCASE:
        const s = <string>field;
        return s.toLowerCase();
      case ApColumn.IP:
        const v = <Netzwerk>field;
        return v && v[0] ? v[0].vlan + v[0].ip : 0;
    }
  }

  /**
   * Suchstring vorbereiten
   *
   * @param text
   */
  public valueChange(text: string): ColumnFilter {
    const t = this.checkSearchString(text);
    if (this.type_key === ApColumn.IP) {
      t.text = t.text.replace(/-/g, "").replace(/:/g, "").toUpperCase();
    }
    return t;
  }

  /**
   * Expression fuer die Spalte bauen
   *
   * @param filter
   */
  //  nur fuer std-filter oder auch fuer extd??
  public getFilterExpression(filter: ColumnFilter): Expression {
    if (filter.text) {
      let op: RelationalOperator;
      if (filter.inc) {
        op = new RelationalOperator(RelOp.like);
      } else {
        op = new RelationalOperator(RelOp.notlike);
      }
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
   * @param text
   */
  private checkSearchString(text: string): ColumnFilter {
    let str = text ? text.toLowerCase() : "";
    let inc = true;
    if (str.startsWith("!")) {
      str = str.slice(1);
      inc = false;
    }
    return { text: str, inc: inc };
  }

  /**
   * Mit diesem Konstrukt kann eine fn aus z.B. ApService als Parameter
   * uebergeben werden und mit dem richtigen 'this' aufgerufen werden.
   * Dazu ist zusaetzlich die Uebergabe des jeweiligen Objekts (also z.B.
   * ApService) noetig, damit der Kontext hergestellt werdenn kann.
   * -> https://stackoverflow.com/questions/29822773/passing-class-method-as-parameter-in-typescript
   *
   * @param callbackFunction
   * @param thisarg
   */
  private callback<T>(callbackFunction: (this: T) => any, thisarg: T): any {
    return callbackFunction.call(thisarg);
  }
}
