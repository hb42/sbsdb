import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { MatTableDataSource } from "@angular/material/table";
import { Base64 } from "js-base64";
import { debounceTime } from "rxjs/operators";
import { ConfigService } from "../config/config.service";
import { UserSession } from "../config/user.session";
import { CsvDialogData } from "../csv-dialog/csv-dialog-data";
import { CsvDialogComponent } from "../csv-dialog/csv-dialog.component";
import { DataService } from "../data.service";
import { EditDialogData } from "../edit/edit-dialog/edit-dialog-data";
import { EditDialogComponent } from "../edit/edit-dialog/edit-dialog.component";
import { BOM, Download, GetColumn, GetFieldContent } from "../helper";
import { BaseTableRow } from "../model/base-table-row";
import { NavigationService } from "../navigation.service";
import { ColumnType } from "../table/column-type.enum";
import { SbsdbColumn } from "../table/sbsdb-column";
import { Bracket } from "./bracket";
import { Element } from "./element";
import { Expression } from "./expression";
import { Field } from "./field";
import { FilterEditListData } from "./filter-edit-list/filter-edit-list-data";
import { FilterEditListComponent } from "./filter-edit-list/filter-edit-list.component";
import { FilterEditData } from "./filter-edit/filter-edit-data";
import { FilterEditComponent } from "./filter-edit/filter-edit.component";
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

export abstract class BaseFilterService {
  public static STDFILTER = -1;
  public static USERFILTER = 0;
  public static GLOBALFILTER = 1;
  public static DEFAULT_CSV_SEPARATOR = ";";
  public static DEFAULT_CSV_SEPARATOR_TAB = "TAB";

  public filterExpression = new Bracket();
  public filterElement = new Element(null, this.filterExpression);
  public stdFilter = true;

  public selectedFilter: TransportFilter = null;

  // nur ausgewaehlte anzeigen
  public showSelected = false;

  public userSettings: UserSession;

  public dataReady = false; // muss vom jew. tableService gesetzt werden

  private nextKey = BaseFilterService.STDFILTER + 1;

  private globalFilters: TransportFilter[] = [];
  private globNextKey = BaseFilterService.STDFILTER + 1;

  // wird in initService() von apService geliefert
  private columns: SbsdbColumn<unknown, unknown>[];
  private filterChanged = 1;
  protected dataTable: MatTableDataSource<unknown>;

  // Filtereingaben bremsen
  private readonly keyDebounce = 500;

  protected constructor(
    protected configService: ConfigService,
    protected dataService: DataService,
    protected navigationService: NavigationService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor BaseFilterService");
    this.userSettings = configService.getUser();
  }

  public testEdit(): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      disableClose: true,
      data: { name: "noch'n Test" } as EditDialogData,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: EditDialogData) => {
      console.debug("dialog closed");
      if (result) {
        console.dir(result);
      }
    });
  }

  /**
   * Allgemeiner Filter fuer die Tabelle
   *
   * Genereller Filter, der nicht ueber die Filterfelder im Header oder in der
   * erweiterten Suche gesetzt wird, sondern z.B. durch eine Menueauswahl.
   *
   * @param row
   */
  public abstract tableFilter(row: unknown): boolean;

  /**
   * Startparameter setzen (-> Ap/HwService)
   *
   * @param col - Array der Tabellen-Spalten
   * @param dataTable - MatTableDataSource
   */
  public initService(
    col: SbsdbColumn<unknown, unknown>[],
    dataTable: MatTableDataSource<unknown>
  ): void {
    this.columns = col;
    this.dataTable = dataTable;
    // this.filterChange = evt;

    void this.readGlobalFilters();

    this.dataTable.filterPredicate = (row: unknown): boolean => {
      let valid = this.tableFilter(row);
      if (valid) {
        valid = this.filterExpression.validate(
          row as Record<string, string | Array<string> | number | Date>
        );
      }
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

    /*
     * Filter aus den Benutzereinstellungen erstellen
     */
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
   * Alle Filter loeschen
   */
  public resetFilters(): void {
    if (this.stdFilter) {
      this.resetStdFilters();
    } else {
      this.toggleExtendedFilter();
    }
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
    // if (this.filterChange) {
    //   this.filterChange.emit();
    // }
    if (this.dataReady) {
      // Keine Navigation (und kein History-Eintrag) beim Start des
      // erweiterten Filters (und bei leerem extd Filter).
      if (this.stdFilter || (!this.stdFilter && !this.filterExpression.isEmpty())) {
        const filtStr = this.encodeFilter();
        this.nav2filter(filtStr);
      } else {
        this.triggerColumnFilter();
      }
    }
  }

  /**
   * Filter ausloesen
   *
   * DataTable reagiert auf Aenderungen an DataSource.filter, hier wird nur ein Wert
   * hochgezaehlt, der eigentliche Filter kommt per URl. Das Filtern passiert in
   * DataSource.filterPredicate().
   */
  public triggerColumnFilter(): void {
    this.dataTable.filter = `${this.filterChanged++}`;
  }

  public nav2filter(filtStr: string): void {
    this.navigationService.navigateByCmd([this.getUrl(), { filt: filtStr }]);
  }

  /**
   * Parameter aus der URL als Filter setzen.
   * @param params ParamMap
   */
  public filterFromNavigation(params: string): void {
    this.decodeFilter(params);
    // Falls die Tabelle noch nicht geladen ist, wird der Filter nach dem Laden
    // angestossen (-> initTable()).
    if (this.dataReady) {
      this.triggerColumnFilter();
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

  public filterFor(colName: string, search: string | number): void {
    const col = GetColumn(colName, this.columns);
    let op = RelOp.like;
    if (col) {
      if (col.typeKey === ColumnType.STRING || col.typeKey === ColumnType.IP) {
        search = (search as string) ?? "";
      } else if (col.typeKey === ColumnType.NUMBER || col.typeKey === ColumnType.DATE) {
        op = RelOp.equal;
      }
      this.filterExpression.reset();
      this.stdFilter = false;
      const expr: Expression = new Expression(
        new Field(col.fieldName, col.displayName, col.typeKey),
        new RelationalOperator(op),
        search.toString()
      );
      this.filterExpression.addElement(new LogicalAnd(), expr);
      this.triggerFilter();
    } else {
      this.filterExpression.reset();
      this.stdFilter = true;
      this.triggerFilter();
    }
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
    const field = ex ? new Field(ex.field.fieldName, ex.field.displayName, ex.field.type) : null;
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
          // const type = GetColumn(result.f.columnName, this.columns).typeKey;
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

  // --- select checkbox ---

  /**
   * toggle "nur Ausgewaehlte anzeigen"
   */
  public toggleSelection(): void {
    this.showSelected = !this.showSelected;
    this.triggerColumnFilter();
  }
  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected(): boolean {
    // TODO leerer Filter? / empty array -> true
    if (this.dataReady) {
      return this.dataTable.filteredData.every((row: BaseTableRow) => row.selected);
    } else {
      return false;
    }
  }

  public isSelected(): boolean {
    if (this.dataReady) {
      return this.dataTable.filteredData.some((row: BaseTableRow) => row.selected);
    } else {
      return false;
    }
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle(): void {
    const toggle = !this.isAllSelected();
    this.dataTable.filteredData.forEach((row: BaseTableRow) => (row.selected = toggle));
    this.triggerFilter();
  }

  public rowToggle(row: BaseTableRow): void {
    row.selected = !row.selected;
    this.triggerFilter();
  }

  public filterCount(): string {
    let all = 0;
    let flt = 0;
    let sel = 0;
    if (this.dataReady) {
      this.dataTable.filteredData.forEach((row: BaseTableRow) => (row.selected ? sel++ : 0));
      all = this.dataTable.data.length;
      flt = this.dataTable.filteredData.length;
    }
    return `${flt} gefiltert aus ${all} (${sel} ausgewählt)`;
  }

  // --- expand/colpase all ---

  public expandAllRows(): void {
    this.dataTable.filteredData.forEach((row: BaseTableRow) => (row.expanded = true));
  }

  public collapseAllRows(): void {
    this.dataTable.filteredData.forEach((row: BaseTableRow) => (row.expanded = false));
  }

  // --- output ---

  /**
   * CSV ausgeben
   *
   * Mal sehen ...
   * das duerfte Overkill sein:
   * https://www.npmjs.com/package/mat-table-exporter
   * einfacherer Ansatz:
   * https://www.npmjs.com/package/mat-table-exporter
   */
  public async toCsv(): Promise<void> {
    // csv-separator als Parameter in DB (wenn sich's M$ mal wieder anders ueberlegt)
    let separator: string =
      ((await this.configService.getConfig(ConfigService.CSV_SEPARATOR)) as string) ??
      BaseFilterService.DEFAULT_CSV_SEPARATOR;
    // separator \t wird in der DB als "TAB" gespeichert
    separator = separator === BaseFilterService.DEFAULT_CSV_SEPARATOR_TAB ? "\t" : separator;
    const replacer = (key, value: unknown) => (value === null ? "" : value); // specify how you want to handle null values here
    let csvCols = this.columns.filter((co) => co.outputToCsv);

    // Dialog oeffnen
    const dialogRef = this.dialog.open(CsvDialogComponent, {
      disableClose: true,
      data: { all: true, fields: csvCols, resultList: [] } as CsvDialogData,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: CsvDialogData) => {
      if (result) {
        if (!result.all) {
          // nur eine Teilmengwe der Felder ausgeben
          csvCols = result.resultList;
        }
        // header
        const header: string[] = csvCols.map((c) => c.displayName);
        // data
        const csv: string[] = [
          header.join(separator),
          ...this.dataTable.filteredData.map((row) =>
            csvCols
              .map((col) => {
                let content;
                // fuer Number/Date muss die jew. Foramtierung in column.displayName definiert werden
                if (col.typeKey === ColumnType.NUMBER || col.typeKey === ColumnType.DATE) {
                  content = col.displayText(row);
                } else {
                  // fuer alle anderen den Feldinhalt holen (ggf. aus mehreren Feldern)
                  if (Array.isArray(col.fieldName)) {
                    content = col.fieldName.reduce(
                      (prev, curr) =>
                        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                        (prev += (prev ? " / " : "") + GetFieldContent(row, curr) ?? ""),
                      ""
                    );
                  } else {
                    content = GetFieldContent(row, col.fieldName);
                  }
                }
                const line = content ? JSON.stringify(content, replacer) : "";
                // JSON.stringify escaped " als \", das versteht Excel nicht -> ersetzen mit ""
                return line.replace(/\\"/g, '""');
              })
              .join(separator)
          ),
        ];
        const csvblob: string = csv.join("\n");
        // Excel versteht UTF-8 nur mit BOM (Microsoft halt);
        const blob: Blob = new Blob([BOM, csvblob], {
          type: "text/csv;charset=utf-8",
        });
        Download(blob, "sbsdb.csv");
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
                // FIXME das fliegt bei einer Teileingabe auf die Nase
                //       Unterscheidung zw. Col-Field und ExtFilter
                // if (c.col.typeKey === SbsdbColumn.DATE) {
                //   c.val = formatDate(exp.compare as Date, "mediumDate", "de");
                // } else if (c.col.typeKey === SbsdbColumn.NUMBER) {
                //   c.val = formatNumber(exp.compare as number, "de");
                // } else {
                c.val = exp.compare as string;
                // }
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
          new Field(tr.elem.fName, tr.elem.dName, tr.elem.type),
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
          exp.field.type,
          exp.operator.op,
          exp.compare
        )
      : null;

  abstract getLatestUserFilter(): string;
  abstract getUserFilterList(): TransportFilters;
  abstract setLatestUserStdFilter(std: boolean): void;
  abstract getGlobalFiltersName(): string;
  abstract getUrl(): string;
}
