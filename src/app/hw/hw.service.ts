import { formatCurrency, formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { RelOp } from "../shared/filter/rel-op.enum";
import { Arbeitsplatz } from "../shared/model/arbeitsplatz";
import { HwKonfig } from "../shared/model/hw-konfig";
import { Hardware } from "../shared/model/hardware";
import { ConfigService } from "../shared/config/config.service";
import { NavigationService } from "../shared/navigation.service";
import { SbsdbColumn } from "../shared/table/sbsdb-column";

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

  // DEBUG Zeilenumbruch in der Zelle umschalten
  public tableWrapCell = false;

  constructor(
    public dataService: DataService,
    public navigationService: NavigationService,
    private configService: ConfigService
  ) {
    console.debug("c'tor HwService ");
    this.userSettings = configService.getUser();
    this.buildColumns();
    setTimeout(() => {
      this.init();
    }, 0);
  }

  public onSort(event: Sort): void {
    // TODO Felder anlegen
    // this.userSettings.hwSortColumn = event.active;
    // this.userSettings.hwSortDirection = event.direction;
  }

  public onPage(event: PageEvent): void {
    // TODO Felder anlegen
    // if (event.pageSize !== this.userSettings.apPageSize) {
    //   this.userSettings.apPageSize = event.pageSize;
    // }
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
    // TODO an HW anpassen || "sbsdbTable" ?
    // this.apDataSource.paginator.pageSize = this.userSettings.apPageSize;
    // if (this.userSettings.apSortColumn && this.userSettings.apSortDirection) {
    //   this.apDataSource.sort.active = this.userSettings.apSortColumn;
    //   this.apDataSource.sort.direction = this.userSettings.apSortDirection === "asc" ? "" : "asc";
    //   const sortheader = this.apDataSource.sort.sortables.get(
    //     this.userSettings.apSortColumn
    //   ) as MatSortHeader;
    //   // this.sort.sort(sortheader);
    //   // FIXME Hack -> ApComponent#handleSort
    //   // eslint-disable-next-line no-underscore-dangle
    //   sortheader._handleClick();
    // }
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
        SbsdbColumn.LCASE,
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
        SbsdbColumn.LCASE,
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
        SbsdbColumn.LCASE,
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
        SbsdbColumn.LCASE,
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
        SbsdbColumn.LCASE, // vermutlich eigener key f. DatumSort
        [RelOp.equal], // gleichDat, groesserDat, kleinerDat
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
        SbsdbColumn.LCASE, // vermutlich eigener key f. NumSort
        [RelOp.equal], // gleichNum, groesserNum, kleinerNum
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
        SbsdbColumn.LCASE,
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
        SbsdbColumn.LCASE,
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
        SbsdbColumn.LCASE,
        [RelOp.like, RelOp.notlike],
        null
      )
    );
    this.displayedColumns = this.columns.filter((c) => c.show).map((col) => col.columnName);
  }

  // --- fetch data ---

  private init(): void {
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
        this.hwDataSource.data = this.dataService.hwList;
        // apList ist damit komplett (stoesst dataService.dataReady an)
        this.dataService.apListReady.emit();
      }
    };
    this.dataService.bstListReady.subscribe(readyCheck);
    this.dataService.hwKonfigListReady.subscribe(readyCheck);
    this.dataService.hwListReady.subscribe(readyCheck);
    this.dataService.apListFetched.subscribe(readyCheck);
    // fetch KW-Konfig-Table + HW-Table
    void this.fetchData();
  }

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
          hw.apStr = ap.apname + " / " + ap.oe.betriebsstelle + " / " + ap.bezeichnung;
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
