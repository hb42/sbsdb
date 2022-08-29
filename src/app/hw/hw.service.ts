import { formatDate, formatNumber } from "@angular/common";
import { EventEmitter, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { lastValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { ConfService } from "../conf/conf.service";
import {
  KEY_SORT_ADAT,
  KEY_SORT_AP,
  KEY_SORT_HW_WERT,
  KEY_SORT_KAT_IP,
  KEY_SORT_OE_KONF,
  KEY_SORT_SER,
  KEY_SORT_TYP,
} from "../const";
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
import { YesNoDialogComponent } from "../shared/yes-no-dialog/yes-no-dialog.component";
import { HwEditService } from "./hw-edit.service";
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

  public stdFilter = true;

  public newHwEvent: EventEmitter<void> = new EventEmitter<void>();

  // wird getriggert, wenn die Daten an MatTableDataSource gehaengt werden koennen
  // (sollte erst passieren, nachdem auch der Paginator mit MatTableDataSource
  //  verkuepft wurde, sonst wuerden alle Datensaetze gerendert)
  private setDataToTable: EventEmitter<void> = new EventEmitter<void>();
  private defaultsort = "konfiguration";

  constructor(
    public dataService: DataService,
    public navigationService: NavigationService,
    public editFilterService: EditFilterService,
    public hwFilterService: HwFilterService,
    public editService: HwEditService,
    public confService: ConfService,
    public dialog: MatDialog,
    private configService: ConfigService
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.userSettings = configService.getUser();
    this.buildColumns();
    setTimeout(() => {
      this.init();
    }, 0);

    this.navigationService.navToHw.subscribe((dat) => {
      this.hwFilterService.filterFor([dat.col], dat.search);
    });

    this.newHwEvent.subscribe(() => this.editService.newHw(null));
  }

  public onSort(event: Sort): void {
    this.userSettings.hwSortColumn = event.active;
    this.userSettings.hwSortDirection = event.direction;
  }

  public onPage(event: PageEvent): void {
    if (event.pageSize !== this.userSettings.hwPageSize) {
      this.userSettings.hwPageSize = event.pageSize;
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
    const sortcolumn = this.userSettings.hwSortColumn
      ? this.userSettings.hwSortColumn
      : this.defaultsort;
    const sortdir = this.userSettings.hwSortDirection
      ? this.userSettings.hwSortDirection === "asc"
        ? ""
        : "asc"
      : "";
    this.hwDataSource.sort.active = sortcolumn;
    this.hwDataSource.sort.direction = sortdir;
    const sortheader = this.hwDataSource.sort.sortables.get(sortcolumn) as MatSortHeader;
    this.hwDataSource.sort.sort(sortheader);
  }

  public gotoAp(hw: Hardware): void {
    this.navigationService.navToAp.emit({ col: "id", search: hw.ap.apId });
  }

  public gotoKonf(hw: Hardware): void {
    this.navigationService.navToKonf.emit({
      col: "id",
      search: hw.hwKonfig.id,
    });
  }

  public toggleFremdeHw(): void {
    this.userSettings.showFremde = !this.userSettings.showFremde;
    this.hwFilterService.triggerColumnFilter();
  }

  public hwEdit(hw: Hardware): void {
    this.editService.hwEdit(hw);
  }
  public hwhwEdit(hw: Hardware): void {
    this.editService.hwhwEdit(hw);
  }
  public hwmacEdit(hw: Hardware): void {
    this.editService.hwmacEdit(hw);
  }

  public showHistory(hw: Hardware): void {
    void this.editService.showHistory(hw);
  }

  public deleteHw(hw: Hardware): void {
    this.editService.deleteHw(hw);
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
        KEY_SORT_KAT_IP,
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
        KEY_SORT_TYP,
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
                if (!this.userSettings.showFremde && this.dataService.isFremdeHardware(h1)) {
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
                      !(!this.userSettings.showFremde && this.dataService.isFremdeHardware(h3))
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
        () => "hwKonfig.konfiguration",
        () => "hwKonfig.konfiguration",
        (h: Hardware) => h.hwKonfig.konfiguration,
        KEY_SORT_OE_KONF,
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
        null,
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
        KEY_SORT_SER,
        true,
        4,
        ColumnType.STRING,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike, RelOp.equal, RelOp.notequal],
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
        KEY_SORT_ADAT,
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
        KEY_SORT_HW_WERT,
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
        KEY_SORT_AP,
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
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "hier1",
        () => "OE-Hierarchie",
        () => "ap.oe.hierarchy",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.inlistlike, RelOp.notinlistlike],
        () => [...new Set(this.dataService.bstList.map((b) => b.fullname))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "hier2",
        () => "Verantw.OE-Hierarchie",
        () => "ap.verantwOe.hierarchy",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.inlistlike, RelOp.notinlistlike],
        () => [...new Set(this.dataService.bstList.map((b) => b.fullname))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<HwService, Hardware>(
        this,
        "id",
        () => "ID",
        () => "id",
        () => "id",
        (h: Hardware) => h.id.toString(10),
        "",
        false,
        0,
        ColumnType.NUMBER,
        [RelOp.equal],
        null,
        true
      )
    );

    this.displayedColumns = this.columns.filter((c) => c.show).map((col) => col.columnName);
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
        this.dataService.prepareHwList();
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
        this.hwFilterService.triggerFilter();
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

    // Aenderungen in der AP-Liste muessen, wg. HW zu AP, auch hier beruecksichtigt werden
    this.dataService.apListChanged.subscribe(() => this.hwFilterService.triggerColumnFilter());

    // Neue HW wurde eingetragen
    this.dataService.hwListChanged.subscribe(() => this.hwFilterService.triggerColumnFilter());

    // falls neue Konfig angelegt wurde koennten auch gleich die neuen Geraete angelegt werden
    this.dataService.hwKonfigListChanged.subscribe((konf) => {
      // nur bei neuer Konfig ist 'konf' nicht null
      if (konf) {
        const dialogRef = this.dialog.open(YesNoDialogComponent, {
          data: {
            title: "Hardware eingeben?",
            text: `Neue Konfiguration "${konf.konfiguration}" angelegt. Soll auch neue Hardware eingegeben werden?`,
          },
        });
        dialogRef.afterClosed().subscribe((result: boolean) => {
          if (result) {
            this.editService.newHw(konf);
          }
        });
      }
    });
  }

  // --- fetch data ---

  private async fetchData(): Promise<void> {
    this.dataService.get(this.dataService.allHwKonfig).subscribe({
      next: (hwk: HwKonfig[]) => {
        this.dataService.hwKonfigList = hwk;
      },
      error: (err) => {
        console.error("ERROR loading HwKonfig-Data ", err);
      },
      complete: () => {
        this.dataService.hwKonfigListReady.emit();
      },
    });
    let pageSize = Number(await this.configService.getConfig(ConfigService.AP_PAGE_SIZE));
    if (pageSize < DataService.defaultpageSize) {
      pageSize = DataService.defaultpageSize;
    }
    // Anzahl der Datensaetze
    const recs = (await lastValueFrom(this.dataService.get(this.dataService.countHwUrl))) as number;
    // zu holende Seiten
    const count = Math.ceil(recs / pageSize);
    let fetched = 0;
    for (let page = 0; page < count; page++) {
      this.dataService.get(`${this.dataService.pageHwUrl}${page}/${pageSize}`).subscribe({
        next: (hw: Hardware[]) => {
          if (!environment.production) console.debug("fetch HW page #", page, " size=", hw.length);
          this.dataService.hwList = [...this.dataService.hwList, ...hw];
        },
        error: (err) => {
          console.error("ERROR loading HW-Data ", err);
        },
        complete: () => {
          fetched++;
          if (fetched === count) {
            this.dataService.hwListReady.emit();
          }
        },
      });
    }
  }
}
