import { EventEmitter, Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs/operators";
import { ColumnFilter } from "../shared/config/column-filter";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { Bracket } from "../shared/filter/bracket";
import { Expression } from "../shared/filter/expression";
import { Field } from "../shared/filter/field";
import { LogicalAnd } from "../shared/filter/logical-and";
import { RelationalLike } from "../shared/filter/relational-like";
import { RelationalNotLike } from "../shared/filter/relational-not-like";
import { RelationalOperator } from "../shared/filter/relational-operator";
import { ApColumn } from "./ap-column";
import { Arbeitsplatz } from "./model/arbeitsplatz";

@Injectable({
              providedIn: "root"
            })
export class ApFilterService {
  public userSettings: UserSession;
  public filterExpression = new Bracket(null);
  public filterChange: EventEmitter<string> = new EventEmitter();

  public columns: ApColumn[] = [
    {
      name  : "aptyp",
      sort  : {
        text      : "&Typ",
        key       : "t",
        sortString: (ap: Arbeitsplatz) => ap.aptyp.toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(0);
          return this.getFilterExpression(
              "Typ",
              "aptyp",
              filter);
        },
      },
    },
    {
      name  : "apname",
      sort  : {
        text      : "AP-&Name",
        key       : "n",
        sortString: (ap: Arbeitsplatz) => ap.apname.toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(1);
          return this.getFilterExpression(
              "AP-Name",
              "apname",
              filter);
        },
      },
    },
    {
      name  : "betrst",
      sort  : {
        text      : "Stand&ort",
        key       : "o",
        sortString: (ap: Arbeitsplatz) => this.getBetrst(ap).toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(2);
          return this.getFilterExpression(
              this.userSettings.showStandort ? "Standort" : "Verantw. OE",
              this.userSettings.showStandort ? "oesearch" : "voesearch",
              filter);
        },
      },
    },
    {
      name  : "bezeichnung",
      sort  : {
        text      : "&Bezeichnung",
        key       : "b",
        sortString: (ap: Arbeitsplatz) => ap.bezeichnung.toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(3);
          return this.getFilterExpression(
              "Bezeichnung",
              "bezeichnung",
              filter);
        },
      },
    },
    {
      name  : "ip",
      sort  : {
        text      : "&IP",
        key       : "i",
        sortString: (ap: Arbeitsplatz) => (ap.vlan && ap.vlan[0]) ? ap.vlan[0].vlan + ap.vlan[0].ip : 0,
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => {
          const t = this.checkSearchString(text);
          t.text = t.text.replace(/-/g, "").replace(/:/g, "").toUpperCase();
          return t;
        },
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(4);
          return this.getFilterExpression(
              "IP/MAC",
              "ipsearch",
              filter);
        },
      },
    },
    {
      name  : "hardware",
      sort  : {
        text      : "Hard&ware",
        key       : "w",
        sortString: (ap: Arbeitsplatz) => ap.hwStr.toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(5);
          return this.getFilterExpression(
              "Hardware",
              this.userSettings.searchSonstHw ? "sonstHwStr" : "hwStr",
              filter);
        },
      },
    },
    {name: "menu"}
  ];

  public displayedColumns: string[] = this.columns.map((c) => c.name);

  constructor(private configService: ConfigService) {
    this.userSettings = configService.getUser();

    // Filtereingaben bremsen
    const keyDebounce = 500;

    // Aenderung an Filter-Feldern in den Benutzereinstellungen speichern
    // und Filter triggern
    this.columns.forEach((c, idx) => {
      if (c.filter) {
        c.filter.filter.valueChanges  // FormControl
            .pipe(debounceTime(keyDebounce))
            .subscribe((text) => {
              this.userSettings.setApFilter(idx, c.filter.valueChange(text));
              this.filterExpression.reset();
              const and = new LogicalAnd();
              this.columns.forEach((col) => {
                if (col.filter) {
                  const colExpr = col.filter.predicate(null);
                  if (colExpr) {
                    this.filterExpression.addElement(and, colExpr);
                  }
                }
              });
              console.debug(this.filterExpression.toString());
              // .filter muass geandert werden, damit MatTable den Filter ausfuehrt
              // this.apDataSource.filter = JSON.stringify(this.userSettings);
              this.filterChange.emit(this.getFilterString());
            });
      }
    });

  }

  public initializeFilters() {
    this.columns.forEach((c, idx) => {
      if (c.filter) {
        const filt = this.userSettings.getApFilter(idx);
        if (filt.text) {
          c.filter.filter.setValue((filt.inc ? "" : "!") + filt.text);
          c.filter.filter.markAsDirty();
        }
      }
    });
  }

  public resetFilters() {
    this.columns.forEach((c, idx) => {
      if (c.filter) {
        c.filter.filter.reset();
      }
    });
  }

  // private getFilterExpression(display: string, field: string, filter: ColumnFilter): Expression { // FIXME Bracket nur fuer Tests
  private getFilterExpression(display: string, field: string, filter: ColumnFilter): Bracket {
    if (filter.text) {
      let op: RelationalOperator;
      if (filter.inc) {
        op = new RelationalLike();
      } else {
        op = new RelationalNotLike();
      }
      const f: Field = new Field(field, display);
      const expr = new Expression(f, op, filter.text);
      // return expr;  // FIXME nach Test wieder Expressin + folgende drei Zeilen raus
      const br = new Bracket(this.filterExpression);
      br.addElement(null, expr);
      return br;
    } else {
      return null;
    }
  }

  public filterByAptyp(ap: Arbeitsplatz, event: Event) {
    const col = this.getColumn("aptyp");
    col.filter.filter.setValue(ap.aptyp);
    col.filter.filter.markAsDirty();
    event.stopPropagation();
  }

  public filterByBetrst(ap: Arbeitsplatz, event: Event) {
    const col = this.getColumn("betrst");
    this.resetFilters();
    col.filter.filter.setValue(this.getBetrst(ap));
    col.filter.filter.markAsDirty();
    event.stopPropagation();
  }

  public getColumnIndex(name: string): number {
    return this.columns.findIndex((c) => c.name && c.name === name);
  }

  public getColumn(name: string): ApColumn {
    const idx = this.getColumnIndex(name);
    if (idx >= 0) {
      return this.columns[idx];
    } else {
      return null;
    }
  }

  // OE-Name abhaengig von gewaehlter Anzeige
  // (Standort || verantwortliche OE)
  public getBetrst(ap: Arbeitsplatz): string {
    if (this.userSettings.showStandort) {
      return ap.oe.betriebsstelle;
    } else {
      if (ap.verantwOe) {
        return ap.verantwOe.betriebsstelle;
      } else {
        return ap.oe.betriebsstelle;
      }
    }
  }

  /**
   * Filter-String
   *
   * Fuehrendes ! negiert den Filter (=enthaelt nicht).
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
    return {text: str, inc: inc};
  }

  // eindeutiger String fuer alle Filter -> apDataSource.filter
  private getFilterString(): string {
    let s;
    for (let i = 0; i < this.userSettings.apFiltersCount(); i++) {
      const filt = this.userSettings.getApFilter(i);
      s += filt.text + filt.inc;
    }
    return s;
  }

}
