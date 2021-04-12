import { formatCurrency, formatDate, formatNumber } from "@angular/common";
import { EventEmitter, Injectable } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { EditFilterService } from "../shared/filter/edit-filter.service";
import { RelOp } from "../shared/filter/rel-op.enum";
import { GetColumn } from "../shared/helper";
import { Hardware } from "../shared/model/hardware";
import { HwKonfig } from "../shared/model/hw-konfig";
import { NavigationService } from "../shared/navigation.service";
import { ColumnType } from "../shared/table/column-type.enum";
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
      this.hwFilterService.filterFor(dat.col, dat.search);
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
    }
  }

  public gotoAp(hw: Hardware): void {
    this.navigationService.navToAp.emit({ col: "apid", search: hw.ap.apId });
  }

  /**
   * Felder RAM + HD formatieren
   * Die Felder enthalten i.d.R. einen Integer-Wert, der die Groesse in MB angibt.
   * Da die Felder als String gespeichert werden, sind auch andere Eingaben moeglich.
   * Sofern es sich um einen reinen Zahlwert handelt wird er als Zahl mit Tausender-
   * Trennung formatiert. Alles andere wird nur durchgereicht.
   *
   * @param num
   */
  public formatMbSize(num: string): string {
    const isnumber = /^[+-]?\d+$/;
    num = num ? num.trim() : "";
    if (isnumber.test(num)) {
      return formatNumber(Number.parseFloat(num), "de", "1.0-0") + " MB";
    } else {
      return num;
    }
  }

  public test(hw: Hardware): void {
    console.dir(hw);
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
        ColumnType.STRING,
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
        ColumnType.STRING,
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
        ColumnType.STRING,
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
        ColumnType.STRING,
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
        (h: Hardware) => (h.anschDat.valueOf() ? formatDate(h.anschDat, "mediumDate", "de") : ""),
        "n",
        true,
        5,
        ColumnType.DATE,
        [RelOp.equal, RelOp.gtNum, RelOp.ltNum],
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
        (h: Hardware) => (h.anschWert ? formatCurrency(h.anschWert, "de", "€") : ""),
        "w",
        true,
        6,
        ColumnType.NUMBER,
        [RelOp.equal, RelOp.gtNum, RelOp.ltNum],
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
        ColumnType.STRING,
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
        ColumnType.STRING,
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
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "prozessor",
        () => "Prozessor",
        () => "hwKonfig.prozessor",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "ram",
        () => "RAM",
        () => "hwKonfig.ram",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "hd",
        () => "Festplatte",
        () => "hwKonfig.hd",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "video",
        () => "Grafik",
        () => "hwKonfig.video",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "sonst",
        () => "Sonstiges",
        () => "hwKonfig.sonst",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
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
        ColumnType.NUMBER,
        null, // [RelOp.equal, RelOp.gtNum, RelOp.ltNum],
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
    this.loading = true;
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
        this.loading = false;
        this.hwFilterService.dataReady = true;
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
      const col = GetColumn(id, this.columns);
      if (col) {
        return col.sortString(hw);
      } else {
        return "";
      }
    };
    this.hwFilterService.initService(this.columns, this.hwDataSource);
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
      hw.hwKonfig = this.dataService.hwKonfigList.find((h) => h.id === hw.hwKonfigId);
      let macsearch = "";
      hw.ipStr = "";
      hw.macStr = "";
      hw.vlanStr = "";
      hw.bezeichnung = hw.hwKonfig.hersteller + " - " + hw.hwKonfig.bezeichnung;
      hw.apKatBezeichnung = hw.hwKonfig.apKatBezeichnung;
      hw.hwTypBezeichnung = hw.hwKonfig.hwTypBezeichnung;
      hw.anschDat = new Date(hw.anschDat);
      if (hw.vlans && hw.vlans[0]) {
        hw.vlans.forEach((v) => {
          const dhcp = v.ip === 0 ? " (DHCP)" : "";
          v.ipStr = this.dataService.getIpString(v.vlan + v.ip) + dhcp;
          v.macStr = this.dataService.getMacString(v.mac);
          hw.ipStr += hw.ipStr ? "/ " + v.ipStr : v.ipStr;
          hw.macStr += hw.macStr ? "/ " + v.macStr : v.macStr;
          hw.vlanStr += hw.vlanStr ? "/ " + v.bezeichnung : v.bezeichnung;
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
            ap.ipStr += ap.ipStr ? "/ " + hw.ipStr : hw.ipStr;
            ap.macStr += ap.macStr ? "/ " + hw.macStr : hw.macStr;
            ap.vlanStr += ap.vlanStr ? "/ " + hw.vlanStr : hw.vlanStr;
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
