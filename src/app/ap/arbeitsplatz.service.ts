import { EventEmitter, Injectable } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { AP_PATH } from "../app-routing-const";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { RelOp } from "../shared/filter/rel-op.enum";
import { KeyboardService } from "../shared/keyboard.service";
import { ApColumn } from "./ap-column";
import { ApDataService } from "./ap-data.service";
import { ApFilterService } from "./ap-filter.service";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { Tag } from "./model/tag";

@Injectable({ providedIn: "root" })
export class ArbeitsplatzService {
  // public treeControl = new NestedTreeControl<OeTreeItem>((node) => node.children);
  // public dataSource = new MatTreeNestedDataSource<OeTreeItem>();

  // public expandedRow: Arbeitsplatz;
  // public selection: SelectionModel<Arbeitsplatz>;

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
 const uniq1 = [ ...new Set(this.apDataService.apDataSource.data.filter((a) => !!a.hwTypStr).map((a2) => a2.hwTypStr)) ].sort();
 const uniq2 = [ ...new Set(this.apDataService.apDataSource.data.map((a) => a.oesearch)) ].sort();
  */

  private filterChange: EventEmitter<void> = new EventEmitter() as EventEmitter<void>;
  private filterChanged = 1;
  private apDataReady = false;

  constructor(
    private configService: ConfigService,
    public apDataService: ApDataService,
    public filterService: ApFilterService,
    private keyboardService: KeyboardService,
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
    this.apDataService.apDataSource.sort = sort;
    this.apDataService.apDataSource.paginator = paginator;

    this.apDataService.apDataSource.paginator.pageSize = this.userSettings.apPageSize;
    if (this.userSettings.apSortColumn && this.userSettings.apSortDirection) {
      this.apDataService.apDataSource.sort.active = this.userSettings.apSortColumn;
      this.apDataService.apDataSource.sort.direction =
        this.userSettings.apSortDirection === "asc" ? "" : "asc";
      const sortheader = this.apDataService.apDataSource.sort.sortables.get(
        this.userSettings.apSortColumn
      ) as MatSortHeader;
      // this.sort.sort(sortheader);
      // FIXME Hack -> ApComponent#handleSort
      // eslint-disable-next-line no-underscore-dangle
      sortheader._handleClick();
    }
  }

  // public applyUserSettings() {
  //   // Nur ausfuehren, wenn AP-Daten schon geladen (= nur AP-Component wurde neu erstellt)
  //   // Beim Start des Service wird diese fn in getAps() aufgerufen, weil die Component evtl.
  //   // schon fertig ist bevor alle Daten geladen wurden, dann wird der Aufruf aus der Component
  //   // ignoriert. .paginator wird in der Component gesetzt => falls paginator noch nicht exxistiert
  //   // muss die Component das hier erledigen.
  //   if (this.apDataService.apDataSource.data && this.apDataService.apDataSource.paginator) {
  //     this.apDataService.apDataSource.paginator.pageSize = this.userSettings.apPageSize;
  //     if (this.userSettings.apSortColumn && this.userSettings.apSortDirection) {
  //       this.apDataService.apDataSource.sort.active = this.userSettings.apSortColumn;
  //       this.apDataService.apDataSource.sort.direction =
  //         this.userSettings.apSortDirection === "asc" ? "" : "asc";
  //       const sortheader = this.apDataService.apDataSource.sort.sortables.get(
  //         this.userSettings.apSortColumn
  //       ) as MatSortHeader;
  //       // this.sort.sort(sortheader);
  //       // FIXME Hack -> ApComponent#handleSort
  //       sortheader._handleClick();
  //     }
  //     this.filterService.initializeFilters();
  //   }
  // }

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

  // public bstTooltip(ap: Arbeitsplatz): string {
  //   return (
  //     "OE: " +
  //     ap.oe.bstNr +
  //     "\n\n" +
  //     (ap.oe.strasse ? ap.oe.strasse + " " + (ap.oe.hausnr ? ap.oe.hausnr : "") + "\n" : "") +
  //     (ap.oe.plz ? ap.oe.plz + " " + (ap.oe.ort ? ap.oe.ort : "") + "\n" : "") +
  //     (ap.oe.oeff ? "\n" + ap.oe.oeff : "")
  //   );
  // }

  public testApMenu(): void {
    // console.debug("DEBUG AP-Menue fuer " + ap.apname);
    // const uniq1 = [...new Set(this.apDataService.apDataSource.data.filter((a) => !!a.hwTypStr).map((a2) => a2.hwTypStr))].sort();
    // const uniq2 = [...new Set(this.apDataService.apDataSource.data.map((a) => a.oesearch))].sort();
    // console.debug("DEBUG end uniq hw+oe");
    // console.dir(uniq1);
    // console.dir(uniq2);
    console.debug("### DEBUG filter columns");
    this.extFilterColumns.forEach((col) => {
      console.debug("Filter-Column: " + col.displayName);
      console.dir(col.selectList);
    });
  }

  public filterByAptyp(ap: Arbeitsplatz, event: Event): void {
    const col = this.getColumn("aptyp");
    col.filterControl.setValue(ap.aptyp);
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
    return this.apDataService.apDataSource.filteredData.every((ap) => ap.selected);
    // const numSelected = this.selection.selected.length;
    // const numRows = this.apDataService.apDataSource.filteredData.length;
    // return numSelected == numRows;
  }

  public isSelected(): boolean {
    return this.apDataService.apDataSource.filteredData.some((ap) => ap.selected);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle(): void {
    const toggle = !this.isAllSelected();
    this.apDataService.apDataSource.filteredData.forEach((row) => (row.selected = toggle));
    this.filterService.triggerFilter();
    // this.isAllSelected()
    //   ? this.selection.clear()
    //   : this.apDataService.apDataSource.filteredData.forEach((row) => this.selection.select(row));
  }

  public rowToggle(row: Arbeitsplatz): void {
    row.selected = !row.selected;
    this.filterService.triggerFilter();
  }

  public selectCount(): number {
    let count = 0;
    this.apDataService.apDataSource.filteredData.forEach((row) => (row.selected ? count++ : 0));
    return count;
  }

  public expandAllRows(): void {
    this.apDataService.apDataSource.filteredData.forEach((row) => (row.expanded = true));
  }

  public collapseAllRows(): void {
    this.apDataService.apDataSource.filteredData.forEach((row) => (row.expanded = false));
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
    console.debug("## ApService#filterFromNavigation()");
    console.dir(params);
    // TODO *nav_filt*
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
        () => "aptyp",
        () => "aptyp",
        "t",
        true,
        ApColumn.LCASE,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.apDataService.apDataSource.data.map((a) => a.aptyp))].sort()
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
    //         ...new Set(this.apDataService.apDataSource.data.flatMap((ap) => ap.subTypes)),
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
              this.apDataService.apDataSource.data.map((a) =>
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
        () => [...new Set(this.apDataService.apDataSource.data.map((a) => a.vlanStr))].sort()
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
    console.debug("## ApService#triggerFilter()");
    this.apDataService.apDataSource.filter = `${this.filterChanged++}`;
  }

  // APs aus der DB holen
  private initTable() {
    this.loading = true;
    console.debug("### getAps()");
    // Daten aus der DB holen und aufbereiten
    const dataReady: EventEmitter<void> = new EventEmitter() as EventEmitter<void>;
    dataReady.subscribe(() => {
      this.onDataReady();
      // TODO *filt_nav*
      this.apDataReady = true;
      // Filter erst ausloesen nachdem sie Tabelle vollstaendig geladen ist
      this.triggerFilter();
    });
    void this.apDataService.getAPs(() => {
      this.loading = false;
    }, dataReady);

    /*
     * Filter in MatTable anstossen
     * Neuen Filter in URL eintragen, die Navigation loest dann den Filter aus.
     *
     */
    this.filterChange.subscribe(() => {
      // DEBUG -vv-
      if (this.apDataReady) {
        // const filtStr = base64url.encode(
        //   JSON.stringify(this.filterService.convBracket(this.filterService.filterExpression))
        // );
        const filtStr = this.filterService.encodeFilter();
        // const filtStr = JSON.stringify(
        //   this.filterService.convBracket(this.filterService.filterExpression)
        // );
        console.debug("## ApService#filterChange.subscribe()");
        console.debug(filtStr);
        this.nav2filter(filtStr);
        // this.router
        //   // .navigate(["/ap", { std: this.filterService.stdFilter, filt: filtStr }])
        //   .navigate(["/ap", { filt: filtStr }])
        //   .then(() => console.debug("### test routing OK ###"))
        //   .catch((reason) => {
        //     console.debug("*** test routing ERROR:");
        //     console.dir(reason);
        //   });

        // DEBUG -^^-
        // console.debug("### trigger filter");
        // this.apDataService.apDataSource.filter = "" + this.filterChanged++;
      }
    });
    this.filterService.initService(this.columns, this.filterChange);

    // eigener Filter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.apDataService.apDataSource.filterPredicate = (ap: Arbeitsplatz, filter: string) => {
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
    this.apDataService.apDataSource.sortingDataAccessor = (ap: Arbeitsplatz, id: string) => {
      const col = this.getColumn(id);
      if (col) {
        return col.sortString(ap);
      } else {
        return "";
      }
    };
    // const pagesize: number = await this.configService.getConfig(ConfigService.AP_PAGE_SIZE);
    // const defaultpagesize = 100;
    // let page = 0;

    // const data = await this.http.get<Arbeitsplatz[]>(this.pageApsUrl + page).toPromise(); // 1. Teil, vollstaendiger record

    // const count = 15;
    // for (let page = 0; page < count; page++) {
    //   this.apDataService.getAPs(page).subscribe(
    //     (aps) => {
    //       aps.forEach((ap) => this.prepAP(ap));
    //       this.apDataService.apDataSource.data = [...this.apDataService.apDataSource.data, ...aps];
    //     },
    //     (err) => {
    //       console.error("ERROR loading AP-Data " + err);
    //     },
    //     () => {
    //       this.loading = false;
    //       if (page === count - 1) {
    //         this.onDataReady();
    //       }
    //     }
    //   );
    // }

    // for (let page = 0; page < 20; page++) {
    //   this.apDataService.getAPs(page).subscribe(
    //     (next) => {
    //       next.forEach((ap) => {
    //         this.prepAP(ap);
    //       });
    //       this.apDataService.apDataSource.data = [...this.apDataService.apDataSource.data, ...next];
    //       this.loading = false; // nach erstem Teil immer false
    //     },
    //     (err) => {
    //       console.error("ERROR loading AP-Data " + err);
    //     },
    //     () => {
    //       this.onDataReady();
    //     }
    //   );
    // }

    // setTimeout(() => {
    //   data.forEach((ap) => {
    //     this.prepAP(ap);
    //   });
    //   this.apDataService.apDataSource.data = data;
    //   this.loading = false;
    // }, 0);

    // TODO klappt?
    // this.applyUserSettings();

    // this.fetchPage(++page, pagesize || defaultpagesize); // Rest holen
  }

  public nav2filter(filtStr: string): void {
    console.debug("## ApService.nav2filter()");
    this.router
      // .navigate(["/ap", { std: this.filterService.stdFilter, filt: filtStr }])
      .navigate(["/" + AP_PATH, { filt: filtStr }])
      .then(() => console.debug("## ApService.nav2filter()  routing OK ###"))
      .catch((reason) => {
        console.debug("## ApService.nav2filter()  routing ERROR:");
        console.dir(reason);
      });
  }

  // private fetchPage(page: number, size: number) {
  //   console.debug("load page " + page + ", size " + size);
  //   this.http
  //     .get<Arbeitsplatz[]>(this.pageApsUrl + page)
  //     .toPromise()
  //     .then((dat) => {
  //       // setTimeout(() => {
  //       dat.forEach((ap) => {
  //         this.prepAP(ap);
  //       });
  //       this.apDataService.apDataSource.data = [...this.apDataService.apDataSource.data, ...dat];
  //       // }, 0);
  //       if (dat.length === size) {
  //         this.fetchPage(++page, size); // recursion!
  //       } else {
  //         // alle Seiten geladen
  //         this.onDataReady();
  //       }
  //     });
  // }

  private onDataReady() {
    // alle vorhandenen tags
    const tags = [
      ...new Set(
        //  (flatmap ist ES10, wird aber von FF, Chrome, Edge schon unterstuetzt)
        this.apDataService.apDataSource.data.flatMap((ap: Arbeitsplatz) =>
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
          ApDataService.TAG_DISPLAY_NAME + tag[0],
          () => ApDataService.TAG_DISPLAY_NAME + ": " + tag[0],
          () => ApDataService.TAG_DISPLAY_NAME + ": " + tag[0],
          () => ApDataService.TAG_DISPLAY_NAME + ": " + tag[0],
          "",
          false,
          ApColumn.LCASE,
          Number(tag[1]) === ApDataService.BOOL_TAG_FLAG
            ? [RelOp.exist, RelOp.notexist]
            : [
                RelOp.startswith,
                RelOp.endswith,
                RelOp.like,
                RelOp.notlike,
                RelOp.exist,
                RelOp.notexist,
              ],
          null
        )
      );
    });
  }

  // private sortAP(ap: Arbeitsplatz) {
  //   ap.tags.sort((a, b) => {
  //     if (a.flag === b.flag) {
  //       return this.collator.compare(a.bezeichnung, b.bezeichnung);
  //     } else {
  //       return a.flag === ArbeitsplatzService.TAG_FLAG ? -1 : 1;
  //     }
  //   });
  //   ap.hw.sort((a, b) => {
  //     if (a.pri) {
  //       return -1;
  //     } else if (b.pri) {
  //       return 1;
  //     } else {
  //       return this.collator.compare(
  //         a.hwtyp + a.hersteller + a.bezeichnung + a.sernr,
  //         b.hwtyp + b.hersteller + b.bezeichnung + b.sernr
  //       );
  //     }
  //   });
  // }
}
