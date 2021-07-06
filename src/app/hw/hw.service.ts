import { formatDate, formatNumber } from "@angular/common";
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

  public toggleFremdeHw(): void {
    this.userSettings.showFremde = !this.userSettings.showFremde;
    this.triggerFilter();
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
        null,
        false
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "kategorie",
        () => "Kategorie",
        () => "hwKonfig.apKatBezeichnung",
        () => "hwKonfig.apKatBezeichnung",
        (h: Hardware) => h.hwKonfig.apKatBezeichnung,
        "k",
        true,
        1,
        ColumnType.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.hwDataSource.data.map((h) => h.hwKonfig.apKatBezeichnung))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "typ",
        () => "Typ",
        () => "hwKonfig.hwTypBezeichnung",
        () => "hwKonfig.hwTypBezeichnung",
        (h: Hardware) => h.hwKonfig.hwTypBezeichnung,
        "t",
        true,
        2,
        ColumnType.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => {
          if (this.hwFilterService.stdFilter) {
            // Inhalt der Dropdown im Listheader:
            // Enthaelt nur die Werte, die zum Inhalt des Filterfeldes von 'kategorie' passen.
            // Zusaetzlich den Inhalt der aktuellen Auswahl anhaengen, weil bei Aenderung in
            // 'kategorie' der Wert sonst nicht mehr in der Liste vorhanden waere und deshalb
            // trotz eines vorhanden Filterwertes (in filterControl.value) nichts angezeigt
            // wuerde, d.h. der Filter wirkt, aber der Benutzer kann ihn nicht sehen.
            const a = this.hwDataSource.data
              .filter((h1) => {
                const val = GetColumn("kategorie", this.columns).filterControl.value as string;
                if (
                  !this.userSettings.showFremde &&
                  h1.hwKonfig.hwTypFlag & DataService.FREMDE_HW_FLAG
                ) {
                  return false;
                }
                return val ? h1.hwKonfig.apKatBezeichnung === val : true;
              })
              .map((h2) => h2.hwKonfig.hwTypBezeichnung);
            if (GetColumn("typ", this.columns).filterControl.value) {
              a.push(GetColumn("typ", this.columns).filterControl.value as string);
            }
            return [...new Set(a)].sort();
          } else {
            return [
              ...new Set(
                this.hwDataSource.data
                  .filter(
                    (h3) =>
                      !(
                        !this.userSettings.showFremde &&
                        h3.hwKonfig.hwTypFlag & DataService.FREMDE_HW_FLAG
                      )
                  )
                  .map((h) => h.hwKonfig.hwTypBezeichnung)
              ),
            ].sort();
          }
        },
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "konfiguration",
        () => "Konfiguration",
        () => "konfiguration",
        () => "konfiguration",
        (h: Hardware) => h.konfiguration,
        "o",
        true,
        3,
        ColumnType.STRING,
        [
          RelOp.inlist,
          RelOp.notinlist,
          RelOp.startswith,
          RelOp.endswith,
          RelOp.like,
          RelOp.notlike,
        ],
        () => {
          if (this.hwFilterService.stdFilter) {
            const a = this.hwDataSource.data
              .filter((h1) => {
                const val = GetColumn("typ", this.columns).filterControl.value as string;
                if (
                  !this.userSettings.showFremde &&
                  h1.hwKonfig.hwTypFlag & DataService.FREMDE_HW_FLAG
                ) {
                  return false;
                }
                return val ? h1.hwKonfig.hwTypBezeichnung === val : true;
              })
              .map((h2) => h2.konfiguration);
            if (GetColumn("konfiguration", this.columns).filterControl.value) {
              a.push(GetColumn("konfiguration", this.columns).filterControl.value as string);
            }
            return [...new Set(a)].sort();
          } else {
            return [
              ...new Set(
                this.hwDataSource.data
                  .filter(
                    (h3) =>
                      !(
                        !this.userSettings.showFremde &&
                        h3.hwKonfig.hwTypFlag & DataService.FREMDE_HW_FLAG
                      )
                  )
                  .map((h) => h.konfiguration)
              ),
            ].sort();
          }
        },
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "hersteller",
        () => "Hersteller",
        () => "hwKonfig.hersteller",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.hwDataSource.data.map((h) => h.hwKonfig.hersteller))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "bezeichnung",
        () => "Typ-Bezeichnung",
        () => "hwKonfig.bezeichnung",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.hwDataSource.data.map((h) => h.hwKonfig.bezeichnung))].sort(),
        true
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
        null,
        true
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
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "anschwert",
        () => "Ansch.-Wert",
        () => "anschWert",
        () => "anschWert",
        (h: Hardware) => (h.anschWert ? formatNumber(h.anschWert, "de", "1.2-2") : ""),
        "w",
        true,
        6,
        ColumnType.NUMBER,
        [RelOp.equal, RelOp.gtNum, RelOp.ltNum],
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "mac",
        () => "MAC",
        () => "macsearch",
        () => "macStr",
        () => null,
        "",
        false,
        0,
        ColumnType.IP,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null,
        true
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
        null,
        true
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
        null,
        false
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
        null,
        true
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
        null,
        true
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
        null,
        true
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
        null,
        true
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
        null,
        true
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
        null,
        true
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
        null,
        true
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
        (h: Hardware) => `${h.id}`,
        "",
        false,
        0,
        ColumnType.NUMBER,
        null, // [RelOp.equal, RelOp.gtNum, RelOp.ltNum],
        null,
        true
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
        this.dataService.hwList.forEach((hw) => {
          this.dataService.prepareHw(hw);
        });
        this.dataService.apList.forEach((ap) => {
          this.dataService.apSortHw(ap);
        });
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
    let pageSize = Number(await this.configService.getConfig(ConfigService.AP_PAGE_SIZE));
    if (pageSize < DataService.defaultpageSize) {
      pageSize = DataService.defaultpageSize;
    }
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
}
