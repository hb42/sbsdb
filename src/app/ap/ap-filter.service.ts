import { EventEmitter, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { Base64 } from "js-base64";
import { debounceTime } from "rxjs/operators";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { Bracket } from "../shared/filter/bracket";
import { Element } from "../shared/filter/element";
import { Expression } from "../shared/filter/expression";
import { Field } from "../shared/filter/field";
import { LogicalAnd } from "../shared/filter/logical-and";
import { LogicalOperator } from "../shared/filter/logical-operator";
import { LogicalOr } from "../shared/filter/logical-or";
import { RelationalOperator } from "../shared/filter/relational-operator";
import { TransportElement } from "../shared/filter/transport-element";
import { TransportElements } from "../shared/filter/transport-elements";
import { TransportExpression } from "../shared/filter/transport-expression";
import { TransportFilter } from "../shared/filter/transport-filter";
import { ApColumn } from "./ap-column";
import { ApFilterEditListData } from "./ap-filter-edit-list/ap-filter-edit-list-data";
import { ApFilterEditListComponent } from "./ap-filter-edit-list/ap-filter-edit-list.component";
import { ApFilterEditData } from "./ap-filter-edit/ap-filter-edit-data";
import { ApFilterEditComponent } from "./ap-filter-edit/ap-filter-edit.component";

@Injectable({ providedIn: "root" })
export class ApFilterService {
  public static STDFILTER = -1;
  public static USERFILTER = 0;
  public static GLOBALFILTER = 1;

  public userSettings: UserSession;

  public filterExpression = new Bracket();
  public filterElement = new Element(null, this.filterExpression);
  public stdFilter = true;

  public selectedFilter: TransportFilter = null;

  // nur ausgewaehlte anzeigen
  public showSelected = false;

  private nextKey = ApFilterService.STDFILTER + 1;

  private globalFilters: TransportFilter[] = [];
  private globNextKey = ApFilterService.STDFILTER + 1;

  // wird in initService() von apService geliefert
  private columns: ApColumn[];
  private filterChange: EventEmitter<void>;

  // Filtereingaben bremsen
  private readonly keyDebounce = 500;

  // case insensitive alpha sort
  // deutlich schneller als String.localeCompare()
  //  -> result = this.collator.compare(a, b)
  private collator = new Intl.Collator("de", {
    numeric: true,
    sensitivity: "base",
  });

  constructor(private configService: ConfigService, public dialog: MatDialog) {
    console.debug("c'tor ApFilterService");
    this.userSettings = configService.getUser();
  }

  /**
   * Startparameter setzen (-> ArbeitsplatzService)
   *
   * @param col - Array der Tabellen-Spalten
   * @param evt - Eventhandler fuer Aenderungen am Filter
   */
  public initService(col: ApColumn[], evt: EventEmitter<void>): void {
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
            this.saveFilterExpression();
            this.triggerFilter();
          });
      }
    });
  }

  /**
   * Filter aus den Benutzereinstellungen erstellen
   */
  public initializeFilters(): void {
    // TODO *nav_filt*
    // this.stdFilter = this.userSettings.apStdFilter;
    // this.filterExpression.reset();
    // this.setFilterExpression(ApFilterService.STDFILTER, ApFilterService.USERFILTER);

    // letzten gespeicherten Filter setzen (kommt ggf. nochmal via URL)
    this.decodeFilter(this.userSettings.latestApFilter);

    const maxkey: number = this.userSettings.apFilter.filters.reduce(
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
    this.filterChange.emit();
  }

  /**
   * aktuelle filterExpression in den Benutzereinstellungen speichern
   */
  public saveFilterExpression(): void {
    // this.setFilter(ApFilterService.STDFILTER, "", this.convBracket(this.filterExpression));
    // this.saveFilters();
    // TODO *nav_filt* hier sollte nichts zu tun sein
  }

  // TODO *nav_filt*
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
    console.debug("## ApFilterService#decodeFilter()");
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
    console.debug("## ApFilterService#decodeFilter()  filterExpression.reset()");
    this.filterExpression.reset();
    console.debug("## ApFilterService#decodeFilter()  makeElements()");
    this.makeElements(this.filterExpression, filter);
    this.stdFilter = std;
    this.setColumnFilters();
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
    this.userSettings.apStdFilter = this.stdFilter;
    this.triggerFilter();
  }

  public extFilterList(): TransportFilter[] {
    const filters = this.userSettings.apFilter.filters.filter(
      (tf) => tf.key !== ApFilterService.STDFILTER
    );
    filters.sort((a, b) => this.collator.compare(a.name, b.name));
    return filters;
  }

  public extGlobalFilterList(): TransportFilter[] {
    this.globalFilters.sort((a, b) => this.collator.compare(a.name, b.name));
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
      if (this.selectedFilter.type === ApFilterService.USERFILTER) {
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
    const dialogRef = this.dialog.open(ApFilterEditListComponent, {
      disableClose: true,
      autoFocus: true,
      minWidth: 450,
      data: { list: lst } as ApFilterEditListData,
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
    this.saveFilterExpression();
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
    const comp = ex ? "" + ex.compare : null;

    // Dialog oeffnen
    const dialogRef = this.dialog.open(ApFilterEditComponent, {
      disableClose: true,
      data: { f: field, o: oper, c: comp, columns: this.columns } as ApFilterEditData,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: ApFilterEditData) => {
      if (result) {
        if (ex) {
          // edit
          ex.field = result.f;
          ex.operator = new RelationalOperator(result.o);
          ex.compare = result.c;
        } else {
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
        this.saveFilterExpression();
        this.triggerFilter();
      }
    });
  }

  private async readGlobalFilters() {
    const blob: unknown = await this.configService.getConfig(ConfigService.AP_FILTERS);
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
    if (type === ApFilterService.USERFILTER) {
      tf = this.getUserFilter(key);
    } else {
      tf = this.getGlobalFilter(key);
    }
    if (tf) {
      this.filterExpression.reset();
      this.makeElements(this.filterExpression, tf.filter);
      if (ApFilterService.STDFILTER !== key) {
        // TODO muss der Filter hier gespeichert werden?
        this.setUserFilter(ApFilterService.STDFILTER, "", tf.filter);
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
    console.debug("## ApFilterService#setColumnFilter()");
    if (this.stdFilter && this.columns) {
      console.debug("## ApFilterService#setColumnFilter()  forEach");
      this.filterExpression.elements.forEach((el) => {
        if (!el.term.isBracket()) {
          const exp = el.term as Expression;
          const feld = exp.field.fieldName; // string | string[] !!
          const col = this.columns.find((c) => {
            // string[]-Vergleich
            if (feld instanceof Array) {
              if (c.fieldName instanceof Array) {
                if (feld.length === c.fieldName.length) {
                  let io = true;
                  for (let i = 0; i < c.fieldName.length; i++) {
                    if (c.fieldName[i] !== feld[i]) {
                      io = false;
                    }
                  }
                  return io;
                } else {
                  return false;
                }
              } else {
                return false;
              }
            } else {
              // string-Vergleich
              return c.fieldName === feld;
            }
          });
          if (col) {
            console.debug(
              "## ApFilterService#setColumnFilter()  column.setValue for " + col.displayName
            );
            col.filterControl.setValue(exp.compare);
          }
        }
      });
      // FIXME ist hier unnoetig??
      // this.buildStdFilterExpression();
    } else {
      // nur fuer ext. filter noetig (f. std filter implizit)
      // this.triggerFilter();
    }
  }

  /**
   * Filter aus den Benutzereinstellungen holen
   *
   * @param key - Filtername
   */
  private getUserFilter(key: number): TransportFilter {
    return this.userSettings.apFilter.filters.find((tf) => tf.key === key);
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
      this.userSettings.apFilter.filters.push(
        new TransportFilter(key, name, filt, ApFilterService.USERFILTER)
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
      this.globalFilters.push(new TransportFilter(key, name, filt, ApFilterService.GLOBALFILTER));
    }
  }

  /**
   * Filter aus den Benutzereinstellungen entfernen
   *
   * @param key - Filtername
   */
  private removeFilter(key: number) {
    const idx = this.userSettings.apFilter.filters.findIndex((tf) => tf.key === key);
    if (idx >= 0) {
      this.userSettings.apFilter.filters.splice(idx, 1);
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
    this.userSettings.apStdFilter = this.stdFilter; // trigger save
  }

  /**
   * Globale Filter speichern
   */
  private saveGlobalFilters() {
    void this.configService.saveConfig(ConfigService.AP_FILTERS, this.globalFilters);
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
}
