import { EventEmitter, Injectable } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { AP_PATH } from "../app-routing-const";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { RelOp } from "../shared/filter/rel-op.enum";
import { TransportElement } from "../shared/filter/transport-element";
import { TransportElements } from "../shared/filter/transport-elements";
import { KeyboardService } from "../shared/keyboard.service";
import { NavigationService } from "../shared/navigation.service";
import { ApColumn } from "./ap-column";
import { ApFilterService } from "./ap-filter.service";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { Tag } from "./model/tag";
import { DataService } from "../shared/data.service";
import { Betrst } from "./model/betrst";
import { MatTableDataSource } from "@angular/material/table";

@Injectable({ providedIn: "root" })
export class ArbeitsplatzService {
  public apDataSource: MatTableDataSource<Arbeitsplatz> = new MatTableDataSource<Arbeitsplatz>();

  // DEBUG Zeilenumbruch in den Tabellenzellen (drin lassen??)
  public tableWrapCell = false;

  // DEBUG Klick auf Zeile zeigt Details (nach Entscheidung festnageln und var raus)
  public clickForDetails = true;
  // DEBUG Linkfarben (nach Entscheidung festnageln und vars raus)
  public linkcolor = "primary";
  public linkcolor2 = true;
  // DEBUG keine Links in den Zeilen
  public sortLinks = false;
  // Text fuer Statuszeile
  public statusText = "";

  public userSettings: UserSession;

  public loading = false;
  // public typtagSelect: TypTag[];

  public columns: ApColumn[] = [];

  public displayedColumns: string[];
  public extFilterColumns: ApColumn[];
  /* fuer select list: Liste ohne Duplikate fuer ein Feld (nicht bei allen sinnvoll -> aptyp, oe, voe, tags, hwtyp, vlan(?))
    new Set() -> nur eindeutige - ... -> zu Array
    -> https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array#9229932
    die beiden folgenden Arrays brauchen ca. 0.005 - 0.008 Sekunden => Listen bei Bedarf erzeugen
 const uniq1 = [ ...new Set(this.apDataSource.data.filter((a) => !!a.hwTypStr).map((a2) => a2.hwTypStr)) ].sort();
 const uniq2 = [ ...new Set(this.apDataSource.data.map((a) => a.oesearch)) ].sort();
  */

  private filterChange: EventEmitter<void> = new EventEmitter<void>();
  private filterChanged = 1;
  private apDataReady = false;

  constructor(
    private configService: ConfigService,
    public filterService: ApFilterService,
    private keyboardService: KeyboardService,
    private navigationService: NavigationService,
    private dataService: DataService,
    private router: Router
  ) {
    console.debug("c'tor ArbeitsplatzService");
    this.userSettings = configService.getUser();
    this.buildColumns();
    // const initialSelection = [];
    // const allowMultiSelect = true;
    // this.selection = new SelectionModel<Arbeitsplatz>(allowMultiSelect, initialSelection);
    setTimeout(() => {
      this.initTable();
    }, 0);
  }

  public getColumnIndex(name: string): number {
    return this.columns.findIndex((c) => c.columnName === name);
  }
  public getColumn(name: string): ApColumn {
    const idx = this.getColumnIndex(name);
    if (idx >= 0 && idx < this.columns.length) {
      return this.columns[idx];
    } else {
      return null;
    }
  }

  /**
   * Tooltip mit dem vollstaendigen Text anzeigen, wenn der Text
   * mittels ellipsis abgeschnitten ist.
   * (scheint mit <span> nicht zu funktionieren)
   * ->
   * https://stackoverflow.com/questions/5474871/html-how-can-i-show-tooltip-only-when-ellipsis-is-activated
   *
   * @param evt - Mouseevent
   */
  public tooltipOnEllipsis(evt: MouseEvent): void {
    // fkt. nicht mit span
    const elem: HTMLElement = evt.target as HTMLElement;
    if (elem.offsetWidth < elem.scrollWidth && !elem.title) {
      elem.title = elem.innerText;
    }
  }

  public setViewParams(sort: MatSort, paginator: MatPaginator): void {
    this.apDataSource.sort = sort;
    this.apDataSource.paginator = paginator;

    this.apDataSource.paginator.pageSize = this.userSettings.apPageSize;
    if (this.userSettings.apSortColumn && this.userSettings.apSortDirection) {
      this.apDataSource.sort.active = this.userSettings.apSortColumn;
      this.apDataSource.sort.direction = this.userSettings.apSortDirection === "asc" ? "" : "asc";
      const sortheader = this.apDataSource.sort.sortables.get(
        this.userSettings.apSortColumn
      ) as MatSortHeader;
      // this.sort.sort(sortheader);
      // FIXME Hack -> ApComponent#handleSort
      // eslint-disable-next-line no-underscore-dangle
      sortheader._handleClick();
    }
  }

  public onSort(event: Sort): void {
    this.userSettings.apSortColumn = event.active;
    this.userSettings.apSortDirection = event.direction;
  }

  public onPage(event: PageEvent): void {
    if (event.pageSize !== this.userSettings.apPageSize) {
      this.userSettings.apPageSize = event.pageSize;
    }
  }

  public expandApRow(ap: Arbeitsplatz, event: Event): void {
    // this.expandedRow = this.expandedRow === ap ? null : ap;
    ap.expanded = !ap.expanded;
    event.stopPropagation();
  }

  public test(): void {
    const te: TransportElement[] = this.filterService.convBracket(
      this.filterService.filterExpression
    );
    const trans: TransportElements = { stdFilter: this.filterService.stdFilter, filter: te };
    const fStr = JSON.stringify(trans);
    console.debug("------  TEST  " + fStr);
  }

  public filterByAptyp(ap: Arbeitsplatz, event: Event): void {
    const col = this.getColumn("aptyp");
    col.filterControl.setValue(ap.apTypBezeichnung);
    col.filterControl.markAsDirty();
    event.stopPropagation();
  }

  public filterByBetrst(ap: Arbeitsplatz, event: Event): void {
    const col = this.getColumn("betrst");
    col.filterControl.setValue(ap[col.sortFieldName]);
    col.filterControl.markAsDirty();
    event.stopPropagation();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected(): boolean {
    // TODO leerer Filter? / empty array -> true
    return this.apDataSource.filteredData.every((ap) => ap.selected);
    // const numSelected = this.selection.selected.length;
    // const numRows = this.apDataSource.filteredData.length;
    // return numSelected == numRows;
  }

  public isSelected(): boolean {
    return this.apDataSource.filteredData.some((ap) => ap.selected);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle(): void {
    const toggle = !this.isAllSelected();
    this.apDataSource.filteredData.forEach((row) => (row.selected = toggle));
    this.filterService.triggerFilter();
    // this.isAllSelected()
    //   ? this.selection.clear()
    //   : this.apDataSource.filteredData.forEach((row) => this.selection.select(row));
  }

  public rowToggle(row: Arbeitsplatz): void {
    row.selected = !row.selected;
    this.filterService.triggerFilter();
  }

  public selectCount(): number {
    let count = 0;
    this.apDataSource.filteredData.forEach((row) => (row.selected ? count++ : 0));
    return count;
  }

  public expandAllRows(): void {
    this.apDataSource.filteredData.forEach((row) => (row.expanded = true));
  }

  public collapseAllRows(): void {
    this.apDataSource.filteredData.forEach((row) => (row.expanded = false));
  }

  /**
   * toggle "nur Ausgewaehlte anzeigen"
   */
  public toggleSelection(): void {
    this.filterService.showSelected = !this.filterService.showSelected;
    this.triggerFilter();
  }

  /**
   * Parameter aus der URL als Filter setzen.
   * @param params ParamMap
   */
  public filterFromNavigation(params: string): void {
    this.filterService.decodeFilter(params);
    // Falls die Tabelle noch nicht geladen ist, wird der Filter nach dem Laden
    // angestossen (-> initTable()).
    if (this.apDataReady) {
      this.triggerFilter();
    }
  }

  private buildColumns() {
    this.columns.push(
      new ApColumn(
        this,
        "select",
        () => null,
        () => null,
        () => null,
        "",
        true,
        -1,
        null,
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // hat typ [dropdown], hat typ nicht [dropdown]
        "aptyp",
        () => "Typ",
        () => "apTypBezeichnung",
        () => "apTypBezeichnung",
        "t",
        true,
        ApColumn.LCASE,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.apDataSource.data.map((a) => a.apTypBezeichnung))].sort()
      )
    );
    // this.columns.push(
    //   new ApColumn(
    //     this,
    //     "subtype",
    //     () => "Subtyp",
    //     () => "subTypes",
    //     () => "subTypes",
    //     "",
    //     false,
    //     ApColumn.LCASE,
    //     [RelOp.inlistA, RelOp.notinlistA],
    //     () =>
    //       [
    //         // @ts-ignore (flatmap ist ES10, wird aber von FF, Chrome, Edge schon unterstuetzt)
    //         ...new Set(this.apDataSource.data.flatMap((ap) => ap.subTypes)),
    //       ].sort() as Array<string>
    //   )
    // );
    this.columns.push(
      new ApColumn(
        this, // beginnt, endet, enthaelt, enthaelt nicht
        "apname",
        () => "AP-Name",
        () => "apname",
        () => "apname",
        "n",
        true,
        ApColumn.LCASE,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // BST extra? / string beginnt, endet, enthaelt, enthaelt nicht / dropdown?
        "betrst",
        () => (this.userSettings.showStandort ? "Standort" : "Verantw. OE"),
        () => (this.userSettings.showStandort ? "oesearch" : "voesearch"),
        () => (this.userSettings.showStandort ? "oesort" : "voesort"),
        "o",
        true,
        ApColumn.LCASE,
        [RelOp.inlist, RelOp.notinlist, RelOp.like, RelOp.notlike],
        () =>
          [
            ...new Set(
              this.apDataSource.data.map((a) =>
                                           this.userSettings.showStandort ? a.verantwOe.betriebsstelle : a.oe.betriebsstelle
              )
            ),
          ].sort()
      )
    );
    this.columns.push(
      new ApColumn(
        this, // enthaelt, enthaelt nicht
        "bezeichnung",
        () => "Bezeichnung",
        () => "bezeichnung",
        () => "bezeichnung",
        "b",
        true,
        ApColumn.LCASE,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // IP/MAC enthaelt, enthaelt nicht, IP beginnt mit, IP endet mit, IP enthaelt, dto. MAC
        // dropdown VLAN? -> eigene Spalte
        "ip",
        () => "IP/MAC",
        () => ["ipStr", "macsearch"],
        () => "vlan",
        "i",
        true,
        ApColumn.IP,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // IP/MAC enthaelt, enthaelt nicht, IP beginnt mit, IP endet mit, IP enthaelt, dto. MAC
        // dropdown VLAN? -> eigene Spalte
        "ipfilt",
        () => "IP",
        () => "ipStr",
        () => "ipStr",
        "",
        false,
        ApColumn.LCASE,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // IP/MAC enthaelt, enthaelt nicht, IP beginnt mit, IP endet mit, IP enthaelt, dto. MAC
        // dropdown VLAN? -> eigene Spalte
        "mac",
        () => "MAC",
        () => "macsearch",
        () => "macStr",
        "",
        false,
        ApColumn.IP,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // IP/MAC enthaelt, enthaelt nicht, IP beginnt mit, IP endet mit, IP enthaelt, dto. MAC
        // dropdown VLAN? -> eigene Spalte
        "vlan",
        () => "VLAN",
        () => "vlanStr",
        () => "vlanStr",
        "",
        false,
        ApColumn.LCASE,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.apDataSource.data.map((a) => a.vlanStr))].sort()
      )
    );
    this.columns.push(
      new ApColumn(
        this, // enthaelt, enthaelt nicht/ Hersteller|Typenbezeichnung|SerNr enthaelt, enthaelt nicht, start,end
        // (hersteller + bezeichnung) -> eigene Spalte
        "hardware",
        () => "Hardware",
        () =>
          this.userSettings.searchSonstHw && this.filterService.stdFilter
            ? ["hwStr", "sonstHwStr"]
            : "hwStr",
        // () => (this.userSettings.searchSonstHw ? "sonstHwStr" : "hwStr"),
        () => "hwStr",
        "w",
        true,
        ApColumn.LCASE,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this,
        "sonsthw",
        () => "Sonstige Hardware",
        () => "sonstHwStr",
        () => "hwStr",
        "",
        false,
        ApColumn.LCASE,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this,
        "menu",
        () => null,
        () => null,
        () => null,
        "",
        true,
        -1,
        null,
        null
      )
    );

    this.columns.push(
      new ApColumn(
        this, // bemerkung -> enthaelt
        "bemerkung",
        () => "Bemerkung",
        () => "bemerkung",
        () => null,
        "",
        false,
        ApColumn.LCASE,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.displayedColumns = this.columns.filter((c) => c.show).map((col) => col.columnName);
  }

  /**
   * Filter ausloesen
   *
   * DataTable reagiert auf Aenderungen an DataSource.filter, hier wird nur ein Wert
   * hochgezaehlt, der eigentliche Filter kommt per URl. Das Filtern passiert in
   * DataSource.filterPredicate().
   */
  private triggerFilter() {
    this.apDataSource.filter = `${this.filterChanged++}`;
  }

  // APs aus der DB holen
  private initTable() {
    this.loading = true;
    // Daten aus der DB holen und aufbereiten
    // const dataReady: EventEmitter<void> = new EventEmitter<void>();
    this.dataService.dataReady.subscribe(() => {
      this.loading = false;
      this.apDataSource.data = this.dataService.apList;
      this.onDataReady();
      this.apDataReady = true;
      // Filter erst ausloesen nachdem sie Tabelle vollstaendig geladen ist
      this.triggerFilter();
    });
    void this.getAPs(() => {
      this.loading = true;
    });

    /*
     * Geänderten Filter in die URL eintragen
     * Die Navigation loest dann den Filter aus.
     *
     */
    this.filterChange.subscribe(() => {
      if (this.apDataReady) {
        // Keine Navigation (und kein History-Eintrag) beim Start des
        // erweiterten Filters (und bei leerem extd Filter).
        if (
          this.filterService.stdFilter ||
          (!this.filterService.stdFilter && !this.filterService.filterExpression.isEmpty())
        ) {
          const filtStr = this.filterService.encodeFilter();
          this.nav2filter(filtStr);
        } else {
          this.triggerFilter();
        }
      }
    });
    this.filterService.initService(this.columns, this.filterChange);

    // eigener Filter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.apDataSource.filterPredicate = (ap: Arbeitsplatz, filter: string) => {
      2;
      let valid = this.filterService.filterExpression.validate(
        (ap as unknown) as Record<string, string | Array<string>>
      );
      if (!valid) {
        ap.selected = false;
        // console.debug("## ausgefiltert ##");
      }
      // nur ausgewählte anzeigen
      if (valid && this.filterService.showSelected) {
        valid = ap.selected;
      }
      return valid;
    };

    this.filterService.initializeFilters();

    // liefert Daten fuer internen sort in mat-table -> z.B. immer lowercase vergleichen
    this.apDataSource.sortingDataAccessor = (ap: Arbeitsplatz, id: string) => {
      const col = this.getColumn(id);
      if (col) {
        return col.sortString(ap);
      } else {
        return "";
      }
    };
  }

  public nav2filter(filtStr: string): void {
    this.navigationService.navigateByCmd(["/" + AP_PATH, { filt: filtStr }]);
  }

  private onDataReady() {
    // alle vorhandenen tags
    const tags = [
      ...new Set(
        //  (flatmap ist ES10, wird aber von FF, Chrome, Edge schon unterstuetzt)
        this.apDataSource.data.flatMap((ap: Arbeitsplatz) =>
                                         ap.tags.map((t1: Tag) => `${t1.bezeichnung};${t1.flag}`)
        )
      ),
    ].sort();
    // je tag eine Spalte anhaengen -> fuer Filter + Ausgabe in csv
    tags.forEach((t) => {
      const tag = t.split(";");
      this.columns.push(
        new ApColumn(
          this,
          DataService.TAG_DISPLAY_NAME + tag[0],
          () => DataService.TAG_DISPLAY_NAME + ": " + tag[0],
          () => DataService.TAG_DISPLAY_NAME + ": " + tag[0],
          () => DataService.TAG_DISPLAY_NAME + ": " + tag[0],
          "",
          false,
          ApColumn.LCASE,
          Number(tag[1]) === DataService.BOOL_TAG_FLAG
            ? [RelOp.exist, RelOp.notexist]
            : [
              RelOp.startswith,
              RelOp.endswith,
              RelOp.like,
              RelOp.notlike,
              RelOp.exist,
              RelOp.notexist
            ],
          null
        )
      );
    });
  }

  /**`
   * Arbeitsplaetze parallel, in Bloecken von ConfigService.AP_PAGE_SIZE holen.
   *
   * @param each - callback wenn alle Bloecke fertig ist
   * @param ready - event nach dem letzten Block
   */
  public async getAPs(each: () => void): Promise<void> {
    // zunaechst die OEs holen
    await this.getBst();
    // Groesse der einzelnen Bloecke
    const pageSize =
            Number(await this.configService.getConfig(ConfigService.AP_PAGE_SIZE)) ??
            DataService.defaultpageSize;
    // Anzahl der Datensaetze
    const recs = (await this.dataService.get(this.dataService.countApUrl).toPromise()) as number;
    // zu holende Seiten
    const count = Math.ceil(recs / pageSize);
    let fetched = 0;
    for (let page = 0; page < count; page++) {
      this.dataService.get(`${this.dataService.pageApsUrl}${page}/${pageSize}`).subscribe(
        (aps: Arbeitsplatz[]) => {
          console.debug("fetch AP page #", page, " size=", aps.length);
          aps.forEach((ap) => this.prepAP(ap));
          this.dataService.apList = [...this.dataService.apList, ...aps];
          // this.apDataSource.data = [...this.apDataSource.data, ...aps];
        },
        (err) => {
          console.error("ERROR loading AP-Data ", err);
        },
        () => {
          each();
          fetched++;
          if (fetched === count) {
            this.apDataSource.data = this.dataService.apList;
            console.debug("fetch page READY");
            this.dataService.apListFetched.emit();
            // ready.emit();
            // this.onDataReady();
          }
        }
      );
    }
  }

  public getBst(): Promise<void> {
    return this.dataService
      .get(this.dataService.allBstUrl)
      .toPromise()
      .then(
        (bst: Betrst[]) => {
          console.debug("fetch Betrst size=", bst.length);
          this.dataService.bstList = bst;
          this.dataService.bstListReady.emit();
        },
        (err) => {
          console.error("ERROR loading OE-Data ", err);
        }
      );
  }

  private prepAP(ap: Arbeitsplatz) {
    ap.hwStr = ""; // keine undef Felder!
    ap.sonstHwStr = ""; // keine undef Felder!
    ap.hw = [];

    ap.ipStr = ""; // aus priHW
    ap.macStr = ""; // aus priHW
    ap.vlanStr = ""; // aus priHW
    ap.macsearch = ""; // alle MACs

    const oe = this.dataService.bstList.find((bst) => ap.oeId === bst.bstId);
    if (oe) {
      ap.oe = oe;
    } else {
      // TODO leere OE anhaengen
    }
    if (ap.verantwOeId) {
      const voe = this.dataService.bstList.find((bst) => ap.verantwOeId === bst.bstId);
      if (voe) {
        ap.verantwOe = voe;
      } else {
        // TODO leere OE anhaengen
      }
    } else {
      ap.verantwOe = ap.oe;
    }

    ap.oesearch = `00${ap.oe.bstNr}`.slice(-3) + " " + ap.oe.betriebsstelle; // .toLowerCase();
    ap.oesort = ap.oe.betriebsstelle; // .toLowerCase();
    ap.voesearch = `00${ap.verantwOe.bstNr}`.slice(-3) + " " + ap.verantwOe.betriebsstelle; // .toLowerCase();
    ap.voesort = ap.verantwOe.betriebsstelle; // .toLowerCase();

    // ap.subTypes = [];
    ap.tags.forEach((tag) => {
      // if (tag.flag === ApDataService.BOOL_TAG_FLAG) {
      //   ap.subTypes.push(tag.bezeichnung);
      // } else {
      //   ap[ApDataService.TAG_DISPLAY_NAME + ": " + tag.bezeichnung] = tag.text;
      // }
      ap[DataService.TAG_DISPLAY_NAME + ": " + tag.bezeichnung] =
        tag.flag === DataService.BOOL_TAG_FLAG ? tag.flag : tag.text;
    });
    this.sortAP(ap);
  }

  private sortAP(ap: Arbeitsplatz) {
    ap.tags.sort((a, b) => {
      if (a.flag === b.flag) {
        return this.dataService.collator.compare(a.bezeichnung, b.bezeichnung);
      } else {
        return a.flag === DataService.BOOL_TAG_FLAG ? -1 : 1;
      }
    });
  }
}
