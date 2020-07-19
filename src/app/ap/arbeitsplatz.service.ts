import { NestedTreeControl } from "@angular/cdk/tree";
import { EventEmitter, Injectable } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { RelOp } from "../shared/filter/rel-op.enum";
import { KeyboardService } from "../shared/keyboard.service";
import { ApColumn } from "./ap-column";
import { ApDataService } from "./ap-data.service";
import { ApFilterService } from "./ap-filter.service";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { OeTreeItem } from "./model/oe.tree.item";

@Injectable({ providedIn: "root" })
export class ArbeitsplatzService {
  public treeControl = new NestedTreeControl<OeTreeItem>((node) => node.children);
  public dataSource = new MatTreeNestedDataSource<OeTreeItem>();

  private oeTree: OeTreeItem[];
  public selected: OeTreeItem;
  public urlParams: any;

  private filterChange: EventEmitter<any> = new EventEmitter();
  private filterChanged = 1;

  public expandedRow: Arbeitsplatz;

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

  /* fuer select list: Liste ohne Duplikate fuer ein Feld (nicht bei allen sinnvoll -> aptyp, oe, voe, tags, hwtyp, vlan(?))
    new Set() -> nur eindeutige - ... -> zu Array
    -> https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array#9229932
    die beiden folgenden Arrays brauchen ca. 0.005 - 0.008 Sekunden => Listen bei Bedarf erzeugen
 const uniq1 = [ ...new Set(this.apDataService.apDataSource.data.filter((a) => !!a.hwTypStr).map((a2) => a2.hwTypStr)) ].sort();
 const uniq2 = [ ...new Set(this.apDataService.apDataSource.data.map((a) => a.oesearch)) ].sort();
  */

  public columns: ApColumn[] = [];
  public displayedColumns: string[];
  public extFilterColumns: ApColumn[];

  // case insensitive alpha sort
  // deutlich schneller als String.localeCompare()
  //  -> result = this.collator.compare(a, b)
  private collator = new Intl.Collator("de", {
    numeric: true,
    sensitivity: "base",
  });

  private buildColumns() {
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
    this.columns.push(
      new ApColumn(
        this,
        "subtype",
        () => "Subtyp",
        () => "subTypes",
        null,
        "",
        false,
        ApColumn.LCASE,
        [RelOp.inlistA, RelOp.notinlistA],
        () =>
          [
            // @ts-ignore (flatmap ist ES10, wird aber von FF, Chrome, Edge schon unterstuetzt)
            ...new Set(this.apDataService.apDataSource.data.flatMap((ap) => ap.subTypes)),
          ].sort() as Array<string>
      )
    );
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
        () => "ipsearch",
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
        null,
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
        () => "macStr",
        null,
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
        null,
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
        () => (this.userSettings.searchSonstHw ? "sonstHwStr" : "hwStr"),
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
        "menu",
        () => null,
        () => null,
        null,
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
        null,
        "",
        false,
        ApColumn.LCASE,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.displayedColumns = this.columns.filter((c) => c.show).map((col) => col.columnName);
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

  constructor(
    private configService: ConfigService,
    public apDataService: ApDataService,
    public filterService: ApFilterService,
    private keyboardService: KeyboardService
  ) {
    console.debug("c'tor ArbeitsplatzService");
    this.userSettings = configService.getUser();
    this.buildColumns();
    setTimeout(() => {
      this.initTable();
    }, 0);
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
  public tooltipOnEllipsis(evt) {
    // fkt. nicht mit span
    if (evt.target.offsetWidth < evt.target.scrollWidth && !evt.target.title) {
      evt.target.title = evt.target.innerText;
    }
  }

  // APs aus der DB holen
  private initTable() {
    this.loading = true;
    console.debug("### getAps()");
    // Daten aus der DB holen und aufbereiten
    const dataReady: EventEmitter<any> = new EventEmitter();
    dataReady.subscribe(() => {
      this.onDataReady();
    });
    this.apDataService.getAPs(() => {
      this.loading = false;
    }, dataReady);

    /*
     * Filter in MatTable anstossen
     *
     * Der Filter reagiert auf Aenderungen in DataSource.filter. Da der Inhalt von filter
     * hier nicht genutzt wird (-> DataSource.filterPredicate) kann hier ein beliebiger Wert
     * verwendet werden.
     */
    this.filterChange.subscribe(() => {
      this.apDataService.apDataSource.filter = "" + this.filterChanged++;
    });
    this.filterService.initService(this.columns, this.filterChange);
    // eigener Filter
    this.apDataService.apDataSource.filterPredicate = (ap: Arbeitsplatz, filter: string) => {
      return this.filterService.filterExpression.validate(ap);
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
    const tags = [
      ...new Set(
        // @ts-ignore (flatmap ist ES10, wird aber von FF, Chrome, Edge schon unterstuetzt)
        this.apDataService.apDataSource.data.flatMap((ap) =>
          ap.tags.filter((t1) => t1.flag !== 1).map((t2) => t2.bezeichnung)
        )
      ),
    ].sort() as Array<string>;
    tags.forEach((tag) => {
      this.columns.push(
        new ApColumn(
          this,
          "TAG" + tag,
          () => "TAG: " + tag,
          () => "TAG: " + tag,
          null,
          "",
          false,
          ApColumn.LCASE,
          [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
          null
        )
      );
    });
  }

  public setViewParams(sort: MatSort, paginator: MatPaginator) {
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

  public onSort(event) {
    this.userSettings.apSortColumn = event.active;
    this.userSettings.apSortDirection = event.direction;
  }

  public onPage(event) {
    if (event.pageSize !== this.userSettings.apPageSize) {
      this.userSettings.apPageSize = event.pageSize;
    }
  }

  public async expandApRow(ap: Arbeitsplatz, event: Event) {
    this.expandedRow = this.expandedRow === ap ? null : ap;
    event.stopPropagation();
  }

  public bstTooltip(ap: Arbeitsplatz): string {
    return (
      "OE: " +
      ap.oe.bstNr +
      "\n\n" +
      (ap.oe.strasse ? ap.oe.strasse + " " + (ap.oe.hausnr ? ap.oe.hausnr : "") + "\n" : "") +
      (ap.oe.plz ? ap.oe.plz + " " + (ap.oe.ort ? ap.oe.ort : "") + "\n" : "") +
      (ap.oe.oeff ? "\n" + ap.oe.oeff : "")
    );
  }

  public testApMenu(ap: Arbeitsplatz) {
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

  public filterByAptyp(ap: Arbeitsplatz, event: Event) {
    const col = this.getColumn("aptyp");
    col.filterControl.setValue(ap.aptyp);
    col.filterControl.markAsDirty();
    event.stopPropagation();
  }

  public filterByBetrst(ap: Arbeitsplatz, event: Event) {
    const col = this.getColumn("betrst");
    col.filterControl.setValue(ap[col.sortFieldName]);
    col.filterControl.markAsDirty();
    event.stopPropagation();
  }

  private sortAP(ap: Arbeitsplatz) {
    ap.tags.sort((a, b) => {
      if (a.flag === b.flag) {
        return this.collator.compare(a.bezeichnung, b.bezeichnung);
      } else {
        return a.flag === 1 ? -1 : 1;
      }
    });
    ap.hw.sort((a, b) => {
      if (a.pri) {
        return -1;
      } else if (b.pri) {
        return 1;
      } else {
        return this.collator.compare(
          a.hwtyp + a.hersteller + a.bezeichnung + a.sernr,
          b.hwtyp + b.hersteller + b.bezeichnung + b.sernr
        );
      }
    });
  }
}
