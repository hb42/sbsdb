import { formatCurrency, formatDate } from "@angular/common";
import { EventEmitter, Injectable } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { EditFilterService } from "../shared/filter/edit-filter.service";
import { RelOp } from "../shared/filter/rel-op.enum";
import { Hardware } from "../shared/model/hardware";
import { HwKonfig } from "../shared/model/hw-konfig";
import { NavigationService } from "../shared/navigation.service";
import { SbsdbColumn } from "../shared/table/sbsdb-column";
import { HwFilterService } from "./hw-filter.service";

@Injectable({
  providedIn: "root",
})
export class HwService {
  public hwDataSource: MatTableDataSource<Hardware> = new MatTableDataSource<Hardware>();
  public loading = false;
  public userSettings: UserSession;

  public columns: SbsdbColumn<HwService, Hardware>[] = [];
  public displayedColumns: string[] = [];

  public stdFilter = true; // TODO evtl. in FilterService auslagern

  // Zeilenumbruch in der Zelle umschalten
  public tableWrapCell = false;

  private filterChanged = 1;
  // wird getriggert, wenn die Daten an MatTableDataSource gehaengt werden koennen
  // (sollte erst passieren, nachdem auch der Paginator mit MatTableDataSource
  //  verkuepft wurde, sonst wuerden alle Datensaetze gerendert)
  private setDataToTable: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    public dataService: DataService,
    public navigationService: NavigationService,
    public editFilterService: EditFilterService,
    public hwFilterService: HwFilterService,
    private configService: ConfigService
  ) {
    console.debug("c'tor HwService ");
    this.userSettings = configService.getUser();
    this.buildColumns();
    setTimeout(() => {
      this.init();
    }, 0);

    this.navigationService.navToHw.subscribe((dat) => {
      this.filterFor(dat.col, dat.search);
    });
  }

  public onSort(event: Sort): void {
    this.userSettings.hwSortColumn = event.active;
    this.userSettings.hwSortDirection = event.direction;
  }

  public onPage(event: PageEvent): void {
    if (event.pageSize !== this.userSettings.apPageSize) {
      this.userSettings.apPageSize = event.pageSize;
    }
  }

  public expandHwRow(hw: Hardware, event: Event): void {
    hw.expanded = !hw.expanded;
    event.stopPropagation();
  }

  public getColumnIndex(name: string): number {
    return this.columns.findIndex((c) => c.columnName === name);
  }
  public getColumn(name: string): SbsdbColumn<HwService, Hardware> {
    const idx = this.getColumnIndex(name);
    if (idx >= 0 && idx < this.columns.length) {
      return this.columns[idx];
    } else {
      return null;
    }
  }

  public setViewParams(sort: MatSort, paginator: MatPaginator): void {
    this.hwDataSource.sort = sort;
    this.hwDataSource.paginator = paginator;
    this.setDataToTable.emit();
    this.hwDataSource.paginator.pageSize = this.userSettings.hwPageSize;
    if (this.userSettings.hwSortColumn && this.userSettings.hwSortDirection) {
      this.hwDataSource.sort.active = this.userSettings.hwSortColumn;
      this.hwDataSource.sort.direction = this.userSettings.hwSortDirection === "asc" ? "" : "asc";
      const sortheader = this.hwDataSource.sort.sortables.get(
        this.userSettings.hwSortColumn
      ) as MatSortHeader;
      this.hwDataSource.sort.sort(sortheader);
      // FIXME Hack -> ApComponent#handleSort
      // eslint-disable-next-line no-underscore-dangle
      // sortheader._handleClick();
    }
  }

  public gotoAp(hw: Hardware): void {
    this.navigationService.navToAp.emit({ col: "apname", search: hw.ap.apname });
  }

  public filterFor(column: string, search: string | number): void {
    const col = this.getColumn(column);
    if (col.typeKey === SbsdbColumn.STRING) {
      search = ((search as string) ?? "").toLowerCase();
    }
    if (col) {
      // this.filterService.filterFor(col, search, RelOp.like);
    } else {
      // this.filterService.filterExpression.reset();
      // this.filterService.stdFilter = true;
      // this.filterService.triggerFilter();
    }
  }

  private buildColumns() {
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "select",
        () => null,
        () => null,
        () => null,
        () => null,
        "",
        true,
        0,
        -1,
        null,
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "kategorie",
        () => "Kategorie",
        () => "apKatBezeichnung",
        () => "apKatBezeichnung",
        (h: Hardware) => h.apKatBezeichnung,
        "k",
        true,
        1,
        SbsdbColumn.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.hwDataSource.data.map((h) => h.apKatBezeichnung))].sort()
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "typ",
        () => "Typ",
        () => "hwTypBezeichnung",
        () => "hwTypBezeichnung",
        (h: Hardware) => h.hwTypBezeichnung,
        "t",
        true,
        2,
        SbsdbColumn.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.hwDataSource.data.map((h) => h.hwTypBezeichnung))].sort()
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "bezeichnung",
        () => "Bezeichnung",
        () => "bezeichnung",
        () => "bezeichnung",
        (h: Hardware) => h.bezeichnung,
        "b",
        true,
        3,
        SbsdbColumn.STRING,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "sernr",
        () => "Serien-Nr.",
        () => "sernr",
        () => "sernr",
        (h: Hardware) => h.sernr,
        "s",
        true,
        4,
        SbsdbColumn.STRING,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "anschdat",
        () => "Ansch.-Datum",
        () => "anschDat",
        () => "anschDat",
        (h: Hardware) => formatDate(h.anschDat, "mediumDate", "de"),
        "n",
        true,
        5,
        SbsdbColumn.DATE,
        [RelOp.equalDat, RelOp.gtDat, RelOp.ltDat],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "anschwert",
        () => "Ansch.-Wert",
        () => "anschWert",
        () => "anschWert",
        (h: Hardware) => formatCurrency(h.anschWert, "de", "€"),
        "w",
        true,
        6,
        SbsdbColumn.NUMBER,
        [RelOp.equalNum, RelOp.gtNum, RelOp.ltNum],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "ap",
        () => "Arbeitsplatz",
        () => "apStr",
        () => "apStr",
        (h: Hardware) => h.apStr,
        "p",
        true,
        7,
        SbsdbColumn.STRING,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "menu",
        () => null,
        () => null,
        () => null,
        () => null,
        "",
        true,
        10,
        -1,
        null,
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "invnr",
        () => "Inventar-Nr.",
        () => "invNr",
        () => null,
        () => null,
        "",
        false,
        0,
        SbsdbColumn.STRING,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "bemerkung",
        () => "Bemerkung",
        () => "bemerkung",
        () => null,
        () => null,
        "",
        false,
        0,
        SbsdbColumn.STRING,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    // fuer Suche nach Index
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "hwid",
        () => "HW-Index",
        () => "id",
        () => null,
        () => null,
        "",
        false,
        0,
        SbsdbColumn.NUMBER,
        [RelOp.equalNum, RelOp.gtNum, RelOp.ltNum],
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
    this.hwDataSource.filter = `${this.filterChanged++}`;
  }

  private init(): void {
    // event handling

    const readyCheck = () => {
      if (
        this.dataService.isApListFetched() &&
        this.dataService.isBstListReady() &&
        this.dataService.isHwKonfigListReady() &&
        this.dataService.isHwListReady()
      ) {
        // alle relevanten Listen sind da: HwKonfig in HW eintragen
        // und HW in AP eintragen
        this.prepareData();
        this.setDataToTable.emit();
        // apList ist damit komplett (stoesst dataService.dataReady an)
        this.dataService.apListReady.emit();
      }
    };
    this.dataService.bstListReady.subscribe(readyCheck);
    this.dataService.hwKonfigListReady.subscribe(readyCheck);
    this.dataService.hwListReady.subscribe(readyCheck);
    this.dataService.apListFetched.subscribe(readyCheck);

    // alle Daten muessen geladen sein und die HwComponent muss
    // fertig initialisiert sein (-> fn setViewParams)
    this.setDataToTable.subscribe(() => {
      if (this.hwDataSource.paginator) {
        this.hwDataSource.data = this.dataService.hwList;
        this.triggerFilter();
      }
    });

    // fetch KW-Konfig-Table + HW-Table
    void this.fetchData();

    // liefert Daten fuer internen sort in mat-table -> z.B. immer lowercase vergleichen
    this.hwDataSource.sortingDataAccessor = (hw: Hardware, id: string) => {
      const col = this.getColumn(id);
      if (col) {
        return col.sortString(hw);
      } else {
        return "";
      }
    };
  }

  // --- fetch data ---

  private async fetchData(): Promise<void> {
    this.dataService.get(this.dataService.allHwKonfig).subscribe(
      (hwk: HwKonfig[]) => {
        console.debug("fetch HwKonfig size=", hwk.length);
        this.dataService.hwKonfigList = hwk;
      },
      (err) => {
        console.error("ERROR loading HwKonfig-Data ", err);
      },
      () => {
        this.dataService.hwKonfigListReady.emit();
      }
    );
    const pageSize =
      Number(await this.configService.getConfig(ConfigService.AP_PAGE_SIZE)) ??
      DataService.defaultpageSize;
    // Anzahl der Datensaetze
    const recs = (await this.dataService.get(this.dataService.countHwUrl).toPromise()) as number;
    // zu holende Seiten
    const count = Math.ceil(recs / pageSize);
    let fetched = 0;
    for (let page = 0; page < count; page++) {
      this.dataService.get(`${this.dataService.pageHwUrl}${page}/${pageSize}`).subscribe(
        (hw: Hardware[]) => {
          console.debug("fetch HW page #", page, " size=", hw.length);
          this.dataService.hwList = [...this.dataService.hwList, ...hw];
        },
        (err) => {
          console.error("ERROR loading HW-Data ", err);
        },
        () => {
          fetched++;
          if (fetched === count) {
            console.debug("fetch HW READY");
            this.dataService.hwListReady.emit();
          }
        }
      );
    }
  }

  private prepareData(): void {
    this.dataService.hwList.forEach((hw) => {
      let macsearch = "";
      hw.hwKonfig = this.dataService.hwKonfigList.find((h) => h.id === hw.hwKonfigId);
      hw.ipStr = "";
      hw.macStr = "";
      hw.vlanStr = "";
      hw.bezeichnung = hw.hwKonfig.hersteller + " - " + hw.hwKonfig.bezeichnung;
      hw.apKatBezeichnung = hw.hwKonfig.apKatBezeichnung;
      hw.hwTypBezeichnung = hw.hwKonfig.hwTypBezeichnung;
      if (hw.vlans && hw.vlans[0]) {
        hw.vlans.forEach((v) => {
          const dhcp = v.ip === 0 ? " (DHCP)" : "";
          if (hw.ipStr) {
            hw.ipStr += "/ " + this.dataService.getIpString(v.vlan + v.ip) + dhcp;
          } else {
            hw.ipStr = this.dataService.getIpString(v.vlan + v.ip) + dhcp;
          }
          if (hw.macStr) {
            hw.macStr += "/ " + this.dataService.getMacString(v.mac);
          } else {
            hw.macStr = this.dataService.getMacString(v.mac);
          }
          if (hw.vlanStr) {
            hw.vlanStr += "/ " + v.bezeichnung;
          } else {
            hw.vlanStr = v.bezeichnung;
          }
          macsearch += v.mac;
        });
      }

      if (hw.apId) {
        const ap = this.dataService.apList.find((a) => a.apId === hw.apId);
        if (ap) {
          hw.ap = ap;
          hw.apStr = ap.apname + " | " + ap.oe.betriebsstelle + " | " + ap.bezeichnung;
          ap.hw.push(hw);
          ap.macsearch = macsearch;
          if (hw.pri) {
            if (hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG) {
              ap.hwTypStr = hw.bezeichnung;
            }
            ap.hwStr =
              hw.hwKonfig.hersteller +
              " - " +
              hw.hwKonfig.bezeichnung +
              (hw.sernr && hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG
                ? " [" + hw.sernr + "]"
                : "");
            ap.ipStr = hw.ipStr;
            ap.macStr = hw.macStr;
            ap.vlanStr = hw.vlanStr;
          } else {
            // fuer die Suche in sonstiger HW
            ap.sonstHwStr +=
              " " +
              hw.hwKonfig.hersteller +
              " " +
              hw.hwKonfig.bezeichnung +
              (hw.sernr && hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG
                ? " " + hw.sernr
                : "");
          }
        }
      }
    });
    this.dataService.apList.forEach((ap) => {
      ap.hw.sort((a, b) => {
        if (a.pri) {
          return -1;
        } else if (b.pri) {
          return 1;
        } else {
          return this.dataService.collator.compare(
            a.hwKonfig.hwTypBezeichnung + a.hwKonfig.hersteller + a.hwKonfig.bezeichnung + a.sernr,
            b.hwKonfig.hwTypBezeichnung + b.hwKonfig.hersteller + b.hwKonfig.bezeichnung + b.sernr
          );
        }
      });
    });
  }
}
