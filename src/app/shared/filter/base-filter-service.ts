import { formatDate, formatNumber } from "@angular/common";
import { EventEmitter, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { Base64 } from "js-base64";
import { debounceTime } from "rxjs/operators";
import { ConfigService } from "../config/config.service";
import { UserSession } from "../config/user.session";
import { Bracket } from "./bracket";
import { Element } from "./element";
import { Expression } from "./expression";
import { Field } from "./field";
import { LogicalAnd } from "./logical-and";
import { LogicalOperator } from "./logical-operator";
import { LogicalOr } from "./logical-or";
import { RelOp } from "./rel-op.enum";
import { RelationalOperator } from "./relational-operator";
import { TransportElement } from "./transport-element";
import { TransportElements } from "./transport-elements";
import { TransportExpression } from "./transport-expression";
import { TransportFilter } from "./transport-filter";
import { TransportFilters } from "./transport-filters";
import { SbsdbColumn } from "../table/sbsdb-column";
import { FilterEditListData } from "./filter-edit-list/filter-edit-list-data";
import { FilterEditListComponent } from "./filter-edit-list/filter-edit-list.component";
import { FilterEditData } from "./filter-edit/filter-edit-data";
import { FilterEditComponent } from "./filter-edit/filter-edit.component";
import { DataService } from "../data.service";

export abstract class BaseFilterService {
  public static STDFILTER = -1;
  public static USERFILTER = 0;
  public static GLOBALFILTER = 1;

  public filterExpression = new Bracket();
  public filterElement = new Element(null, this.filterExpression);
  public stdFilter = true;

  public selectedFilter: TransportFilter = null;

  // nur ausgewaehlte anzeigen
  public showSelected = false;

  public userSettings: UserSession;

  private nextKey = BaseFilterService.STDFILTER + 1;

  private globalFilters: TransportFilter[] = [];
  private globNextKey = BaseFilterService.STDFILTER + 1;

  // wird in initService() von apService geliefert
  private columns: SbsdbColumn<unknown, unknown>[];
  private filterChange: EventEmitter<void>;

  // Filtereingaben bremsen
  private readonly keyDebounce = 500;

  public filterPredicate = (row: unknown, filter: string): boolean => {
    let valid = this.filterExpression.validate(
      row as Record<string, string | Array<string> | number | Date>
    );
    if (!valid) {
      row["selected"] = false;
      // console.debug("## ausgefiltert ##");
    }
    // nur ausgewählte anzeigen
    if (valid && this.showSelected) {
      valid = row["selected"] as boolean;
    }
    return valid;
  };

  protected constructor(
    protected configService: ConfigService,
    protected dataService: DataService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor BaseFilterService");
    this.userSettings = configService.getUser();
  }

  /**
   * Startparameter setzen (-> Ap/HwService)
   *
   * @param col - Array der Tabellen-Spalten
   * @param evt - Eventhandler fuer Aenderungen am Filter
   */
  public initService(col: SbsdbColumn<unknown, unknown>[], evt: EventEmitter<void>): void {
    this.columns = col;
    this.filterChange = evt;

    void this.readGlobalFilters();

    // Aenderung an Filter-Feldern in den Benutzereinstellungen speichern
    // und Filter triggern
    this.columns.forEach((c) => {
      if (c.filterControl) {
        c.filterControl.valueChanges // FormControl
          .pipe(debounceTime(this.keyDebounce))
          .subscribe(() => {
            // this.stdFilterChange();
            this.buildStdFilterExpression();
            this.triggerFilter();
          });
      }
    });
  }

  /**
   * Filter aus den Benutzereinstellungen erstellen
   */
  public initializeFilters(): void {
    // letzten gespeicherten Filter setzen (kommt ggf. nochmal via URL)
    this.decodeFilter(this.getLatestUserFilter());
    // this.decodeFilter(this.userSettings.latestApFilter);

    // const maxkey: number = this.userSettings.apFilter.filters.reduce(
    const maxkey: number = this.getUserFilterList().filters.reduce(
      (prev, curr) => (curr.key > prev ? curr.key : prev),
      0
    );
    this.nextKey = maxkey + 1;
    // this.makeElements(this.filterExpression, this.userSettings.apFilter);
  }

  /**
   * Filter loeschen (triggert valueChange)
   */
  public resetStdFilters(): void {
    this.columns.forEach((c) => {
      if (c.filterControl && c.filterControl.value) {
        c.filterControl.reset();
      }
    });
  }

  /**
   * Der Filter muss in der MatTable angestossen werden. Deshalb wird
   * ein event an ArbeitsplatzService gesendet.
   */
  public triggerFilter(): void {
    if (this.filterChange) {
      this.filterChange.emit();
    }
  }

  /**
   * Aktuellen Filter fuer die Uebergabe via URL codieren
   *
   * Das Filter-Object wird zu einem TransportElement[] umgesetzt, weil
   * JSON.stringify() mit Bracket nicht klarkommt. Dann werden .stdFilter
   * und das TransportElement[] per JSON.stringify in einen String umgwandelt,
   * der sodann Base64-codiert wird.
   */
  public encodeFilter(): string {
    const te: TransportElement[] = this.convBracket(this.filterExpression);
    const trans: TransportElements = { stdFilter: this.stdFilter, filter: te };
    const fStr = JSON.stringify(trans);
    return Base64.encodeURI(fStr);
  }

  /**
   * Aktuellen Filter aus der URL setzen
   *
   * @param f - String aus der URL
   * @private
   */
  public decodeFilter(f: string): void {
    let filter: TransportElement[];
    let std: boolean;
    try {
      const json = Base64.decode(f);
      const filt: TransportElements = JSON.parse(json) as TransportElements;
      std = filt.stdFilter ?? true;
      filter = filt.filter ?? [];
    } catch (e) {
      // Malformed URI || JSON Syntax || Base64 error
      // hier ist nichts zu retten, also params verwerfen
      filter = [];
      std = true;
    }
    this.filterExpression.reset();
    this.makeElements(this.filterExpression, filter);
    this.stdFilter = std;
    this.setColumnFilters();
  }

  public filterFor(col: SbsdbColumn<unknown, unknown>, search: string | number, op: RelOp): void {
    this.filterExpression.reset();
    this.stdFilter = false;
    const expr: Expression = new Expression(
      new Field(col.fieldName, col.displayName),
      new RelationalOperator(op),
      search.toString()
    );
    this.filterExpression.addElement(new LogicalAnd(), expr);
    this.triggerFilter();
  }

  // --- Edit Exxtended Filter ---

  /**
   * Erweiterte Suche ab-/abschalten
   */
  public toggleExtendedFilter(): void {
    this.stdFilter = !this.stdFilter;
    this.selectedFilter = null;
    this.filterExpression.reset();
    this.resetStdFilters();
    this.setLatestUserStdFilter(this.stdFilter);
    // this.userSettings.apStdFilter = this.stdFilter;
    // nur fuer Zurueckschalten auf std noetig
    if (this.stdFilter) {
      this.triggerFilter();
    }
  }

  public extFilterList(): TransportFilter[] {
    // const filters = this.userSettings.apFilter.filters.filter(
    const filters = this.getUserFilterList().filters.filter(
      (tf) => tf.key !== BaseFilterService.STDFILTER
    );
    filters.sort((a, b) => this.dataService.collator.compare(a.name, b.name));
    return filters;
  }

  public extGlobalFilterList(): TransportFilter[] {
    this.globalFilters.sort((a, b) => this.dataService.collator.compare(a.name, b.name));
    return this.globalFilters;
  }
  public selectFilter(evt: MatSelectChange): void {
    console.debug("list select change");
    console.dir(evt);
    const tf: TransportFilter = evt.value as TransportFilter;
    this.setFilterExpression(tf.key, tf.type);
  }

  public addFilter(): void {
    this.editListName();
  }

  public deleteFilter(): void {
    console.debug("delete filter");
    if (this.selectedFilter) {
      this.removeFilter(this.selectedFilter.key);
      this.selectedFilter = null;
    }
    this.saveFilters();
  }

  public moveFilter(): void {
    if (this.selectedFilter) {
      if (this.selectedFilter.type === BaseFilterService.USERFILTER) {
        this.moveFilterToGlobal(this.selectedFilter.key);
      } else {
        this.moveFilterToUser(this.selectedFilter.key);
      }
      this.selectedFilter = null;
    }
  }

  // TODO -> admin
  public moveFilterToGlobal(key: number): void {
    const filter: TransportFilter = this.getUserFilter(key);
    if (filter) {
      const gkey = this.globNextKey++;
      this.removeFilter(key);
      this.setGlobalFilter(gkey, filter.name, filter.filter);
      this.saveFilters();
      this.saveGlobalFilters();
    }
  }

  // TODO -> admin
  public moveFilterToUser(key: number): void {
    const filter: TransportFilter = this.getGlobalFilter(key);
    if (filter) {
      const ukey = this.nextKey++;
      this.removeGlobalFilter(key);
      this.setUserFilter(ukey, filter.name, filter.filter);
      this.saveFilters();
      this.saveGlobalFilters();
    }
  }

  public editListName(): void {
    const lst: TransportFilter[] = this.extFilterList();

    // Dialog oeffnen
    const dialogRef = this.dialog.open(FilterEditListComponent, {
      disableClose: true,
      autoFocus: true,
      minWidth: 450,
      data: { list: lst } as FilterEditListData,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: TransportFilter | string) => {
      if (result) {
        let key: number;
        if (typeof result === "string") {
          key = this.nextKey++;
          this.setUserFilter(key, result, this.convBracket(this.filterExpression));
        } else {
          result.filter = this.convBracket(this.filterExpression);
          key = result.key;
        }
        // dropdown in apfilterComp auf den neuen/alten  Wert setzen
        this.selectedFilter = this.getUserFilter(key);
        this.saveFilters();
      }
    });
  }

  /**
   * Einzelnen Ausdruck bearbeiten
   *
   * @param el - Element
   */
  public edit(el: Element): void {
    console.debug("EDIT " + el.term.toString());
    if (!el.term.isBracket()) {
      this.editExpression(null, null, null, el.term as Expression);
    }
  }

  /**
   * Ausdruck oder Klammer einfuegen
   *
   * @param el - Element
   * @param what - was wird eingefuegt?
   */
  public insert(el: Element, what: string): void {
    console.debug("INSERT " + what);
    let log: LogicalOperator = new LogicalOr();
    switch (what) {
      case "and_brack":
        log = new LogicalAnd();
      // eslint-disable-next-line no-fallthrough
      case "or_brack":
        el.term.up.addElementAt(el, log, new Bracket());
        this.selectedFilter = null;
        break;
      case "and_exp":
        log = new LogicalAnd();
      // eslint-disable-next-line no-fallthrough
      case "or_exp":
        this.editExpression(null, el, log, null);
        break;
    }
  }

  /**
   * Erstes Element in eine leere Klammer einfuegen
   *
   * @param br - uebergeordnete Klammer
   * @param what - was wird eingefuegt?
   */
  public insertFirst(br: Bracket, what: string): void {
    switch (what) {
      case "brack":
        br.addElement(null, new Bracket());
        this.selectedFilter = null;
        break;
      case "exp":
        this.editExpression(br, null, null, null);
        break;
    }
  }

  /**
   * Element entfernen
   *
   * @param el - Element
   */
  public remove(el: Element): void {
    el.term.up.removeElement(el);
    this.selectedFilter = null;
    this.triggerFilter();
  }

  /**
   * Neuer Ausdruck/ Ausdruck bearbeiten
   *
   * @param up - neuer Ausdruck in Klammer | null
   * @param el - neuen Ausdruck mit op nach el einsetzen | null
   * @param op - neuen Ausdruck mit op nach el einsetzen | null
   * @param ex - Ausdruck ex bearbeiten
   */
  public editExpression(
    up: Bracket | null,
    el: Element | null,
    op: LogicalOperator | null,
    ex: Expression | null
  ): void {
    const field = ex ? new Field(ex.field.fieldName, ex.field.displayName) : null;
    const oper = ex ? ex.operator.op : null;
    const comp = ex ? ex.compare : null;

    // Dialog oeffnen
    const dialogRef = this.dialog.open(FilterEditComponent, {
      disableClose: true,
      data: { f: field, o: oper, c: comp, columns: this.columns } as FilterEditData,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: FilterEditData) => {
      if (result) {
        if (ex) {
          // edit
          ex.field = result.f;
          ex.operator = new RelationalOperator(result.o);
          ex.compare = result.c;
        } else {
          // new
          ex = new Expression(result.f, new RelationalOperator(result.o), result.c);
          if (up) {
            // einziger Ausdruck f. Klammer
            up.addElement(null, ex);
          } else if (el) {
            // nach el einsetzen
            el.term.up.addElementAt(el, op, ex);
          }
        }
        this.selectedFilter = null;
        this.triggerFilter();
      }
    });
  }

  private async readGlobalFilters() {
    const blob: unknown = await this.configService.getConfig(this.getGlobalFiltersName());
    if (blob && blob instanceof Array) {
      this.globalFilters = blob as TransportFilter[];
      const maxkey: number = this.globalFilters.reduce(
        (prev, curr) => (curr.key > prev ? curr.key : prev),
        0
      );
      this.globNextKey = maxkey + 1;
    }
  }
  /**
   * Filter-Ausdruck fuer std filter
   */
  private buildStdFilterExpression() {
    this.filterExpression.reset();
    const and = new LogicalAnd();
    this.columns.forEach((col) => {
      if (col.filterControl) {
        const colExpr = col.getFilterExpression();
        if (colExpr) {
          this.filterExpression.addElement(and, colExpr);
        }
      }
    });
  }

  /**
   * Aktiven Filter aus den Benutzereinstellungen setzen
   *
   * @param key - Filtername
   * @param type - User/Global
   */
  private setFilterExpression(key: number, type: number) {
    // TODO +type -> lookup global
    let tf: TransportFilter;
    if (type === BaseFilterService.USERFILTER) {
      tf = this.getUserFilter(key);
    } else {
      tf = this.getGlobalFilter(key);
    }
    if (tf) {
      this.filterExpression.reset();
      this.makeElements(this.filterExpression, tf.filter);
      if (BaseFilterService.STDFILTER !== key) {
        this.setUserFilter(BaseFilterService.STDFILTER, "", tf.filter);
        this.saveFilters();
        this.triggerFilter();
      }
    }
  }

  /**
   * Werte aus dem aktuellen Filter in die Spalten-Suchfelder eintragen.
   *
   * @private
   */
  private setColumnFilters() {
    if (this.stdFilter && this.columns) {
      // this.resetStdFilters();
      const cols: Array<{
        col: SbsdbColumn<unknown, unknown>;
        val: string | null;
      }> = this.columns
        .filter((c) => {
          return !!c.filterControl;
        })
        .map((cc) => {
          return { col: cc, val: null };
        });
      this.filterExpression.elements.forEach((el) => {
        if (!el.term.isBracket()) {
          const exp = el.term as Expression;
          const feld = exp.field.fieldName; // string | string[] !!
          // const col = this.columns.find((c) => {
          cols.forEach((c) => {
            // string[]-Vergleich
            if (feld instanceof Array) {
              if (c.col.fieldName instanceof Array) {
                if (feld.length === c.col.fieldName.length) {
                  let io = true;
                  for (let i = 0; i < c.col.fieldName.length; i++) {
                    if (c.col.fieldName[i] !== feld[i]) {
                      io = false;
                    }
                  }
                  if (io) {
                    c.val = exp.compare as string; // mehre Felder: immer string
                  }
                }
              }
            } else {
              // string-Vergleich fuer Feld-Namen
              if (c.col.fieldName === feld) {
                if (c.col.typeKey === SbsdbColumn.DATE) {
                  c.val = formatDate(exp.compare as Date, "mediumDate", "de");
                } else if (c.col.typeKey === SbsdbColumn.NUMBER) {
                  c.val = formatNumber(exp.compare as number, "de");
                } else {
                  c.val = exp.compare as string;
                }
              }
            }
          });
        }
      });
      cols.forEach((c) => {
        if (c.col.filterControl.value != c.val) {
          c.col.filterControl.setValue(c.val, { emitEvent: false });
        }
      });
    }
  }

  /**
   * Filter aus den Benutzereinstellungen holen
   *
   * @param key - Filtername
   */
  private getUserFilter(key: number): TransportFilter {
    return this.getUserFilterList().filters.find((tf) => tf.key === key);
    // return this.userSettings.apFilter.filters.find((tf) => tf.key === key);
  }

  /**
   * Globalen Filter suchen
   *
   * @param key - Schluessel
   */
  private getGlobalFilter(key: number): TransportFilter {
    return this.globalFilters.find((tf) => tf.key === key);
  }

  /**
   * Filter in die Benutzereinstellungen schreiben
   *
   * @param key - Filtername
   * @param name - display name
   * @param filt - Filter als TransportElement-Array
   */
  private setUserFilter(key: number, name: string, filt: TransportElement[]) {
    const tf: TransportFilter = this.getUserFilter(key);
    if (tf) {
      tf.filter = filt;
    } else {
      // this.userSettings.apFilter.filters.push(
      this.getUserFilterList().filters.push(
        new TransportFilter(key, name, filt, BaseFilterService.USERFILTER)
      );
    }
  }

  /**
   * Globalen Filter hinzufuegen
   *
   * @param key - Schluessel
   * @param name - Bezeichnung
   * @param filt - Filter
   */
  private setGlobalFilter(key: number, name: string, filt: TransportElement[]) {
    const tf: TransportFilter = this.getGlobalFilter(key);
    if (tf) {
      tf.filter = filt;
    } else {
      this.globalFilters.push(new TransportFilter(key, name, filt, BaseFilterService.GLOBALFILTER));
    }
  }

  /**
   * Filter aus den Benutzereinstellungen entfernen
   *
   * @param key - Filtername
   */
  private removeFilter(key: number) {
    // const idx = this.userSettings.apFilter.filters.findIndex((tf) => tf.key === key);
    const idx = this.getUserFilterList().filters.findIndex((tf) => tf.key === key);
    if (idx >= 0) {
      this.getUserFilterList().filters.splice(idx, 1);
      // this.userSettings.apFilter.filters.splice(idx, 1);
    }
  }

  /**
   * Filter aus der globalen Liste entfernen
   *
   * @param key - Schluessel
   */
  private removeGlobalFilter(key: number) {
    const idx = this.globalFilters.findIndex((tf) => tf.key === key);
    if (idx >= 0) {
      this.globalFilters.splice(idx, 1);
    }
  }
  /**
   * filterExpression aus den Benutzereinstellungen wiederherstellen
   *
   * @param b - uebergeordnete Klammer oder null
   * @param t - Array der TransportElemente
   */
  private makeElements(b: Bracket, t: TransportElement[]) {
    let op: LogicalOperator = null;
    const and = new LogicalAnd();
    const or = new LogicalOr();
    t.forEach((tr) => {
      if (tr.op === 0) {
        op = or;
      } else if (tr.op === 1) {
        op = and;
      }
      if (Array.isArray(tr.elem)) {
        const br = new Bracket();
        br.up = b;
        b.addElement(op, br);
        this.makeElements(br, tr.elem);
      } else {
        const ex = new Expression(
          new Field(tr.elem.fName, tr.elem.dName),
          new RelationalOperator(tr.elem.op),
          tr.elem.comp
        );
        b.addElement(op, ex);
      }
    });
  }

  /**
   * Benutzereinstellungen speichern
   */
  private saveFilters() {
    this.setLatestUserStdFilter(this.stdFilter); // trigger save
    // this.userSettings.apStdFilter = this.stdFilter; // trigger save
  }

  /**
   * Globale Filter speichern
   */
  private saveGlobalFilters() {
    void this.configService.saveConfig(ConfigService.AP_FILTERS, this.getGlobalFiltersName());
  }

  /**
   * filterExpression fuer die Benutzereinstellungen umwandeln
   *
   * @param b - startende Klammer
   */
  public convBracket(b: Bracket): TransportElement[] {
    return b.elements.map(
      (el) =>
        new TransportElement(
          el.operator ? (el.operator.toString() === "UND" ? 1 : 0) : -1,
          el.term.isBracket()
            ? this.convBracket(el.term as Bracket) // recurse
            : this.convExpression(el.term as Expression)
        )
    );
  }

  private convExpression = (exp: Expression): TransportExpression | null =>
    exp
      ? new TransportExpression(
          exp.field.fieldName,
          exp.field.displayName,
          exp.operator.op,
          exp.compare
        )
      : null;

  abstract getLatestUserFilter(): string;
  abstract getUserFilterList(): TransportFilters;
  abstract setLatestUserStdFilter(std: boolean): void;
  abstract getGlobalFiltersName(): string;
}
