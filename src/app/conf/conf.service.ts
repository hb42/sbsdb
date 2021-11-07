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
import { HwKonfig } from "../shared/model/hw-konfig";
import { NavigationService } from "../shared/navigation.service";
import { ColumnType } from "../shared/table/column-type.enum";
import { SbsdbColumn } from "../shared/table/sbsdb-column";
import { ConfEditService } from "./conf-edit.service";
import { ConfFilterService } from "./conf-filter.service";

@Injectable({
  providedIn: "root",
})
export class ConfService {
  public confDataSource: MatTableDataSource<HwKonfig> = new MatTableDataSource<HwKonfig>();
  public loading = false;
  public userSettings: UserSession;

  public columns: SbsdbColumn<ConfService, HwKonfig>[] = [];
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
    public confFilterService: ConfFilterService,
    public editService: ConfEditService,
    private configService: ConfigService
  ) {
    console.debug("c'tor ConfService ");
    this.userSettings = configService.getUser();
    this.buildColumns();
    setTimeout(() => {
      this.init();
    }, 0);

    // this.navigationService.navToHw.subscribe((dat) => {
    //   this.confFilterService.filterFor(dat.col, dat.search);
    // });
  }

  public newConf(): void {
    console.debug("** new conf button");
  }
  public confEdit(conf: HwKonfig): void {
    console.debug("** edit conf button");
  }

  public setViewParams(sort: MatSort, paginator: MatPaginator): void {
    this.confDataSource.sort = sort;
    this.confDataSource.paginator = paginator;
    this.setDataToTable.emit();
    this.confDataSource.paginator.pageSize = this.userSettings.confPageSize;
    if (this.userSettings.hwSortColumn && this.userSettings.confSortDirection) {
      this.confDataSource.sort.active = this.userSettings.confSortColumn;
      this.confDataSource.sort.direction =
        this.userSettings.confSortDirection === "asc" ? "" : "asc";
      const sortheader = this.confDataSource.sort.sortables.get(
        this.userSettings.confSortColumn
      ) as MatSortHeader;
      this.confDataSource.sort.sort(sortheader);
    }
  }

  public onSort(event: Sort): void {
    this.userSettings.confSortColumn = event.active;
    this.userSettings.confSortDirection = event.direction;
  }

  public onPage(event: PageEvent): void {
    if (event.pageSize !== this.userSettings.confPageSize) {
      this.userSettings.confPageSize = event.pageSize;
    }
  }

  public expandConfRow(conf: HwKonfig, event: Event): void {
    conf.expanded = !conf.expanded;
    event.stopPropagation();
  }

  public toggleEmpty(): void {
    this.userSettings.showEmptyConfig = !this.userSettings.showEmptyConfig;
    this.confFilterService.triggerColumnFilter();
  }

  private buildColumns() {
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
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
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "kategorie",
        () => "Kategorie",
        () => "apKatBezeichnung",
        () => "apKatBezeichnung",
        (h: HwKonfig) => h.apKatBezeichnung,
        "k",
        true,
        1,
        ColumnType.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.confDataSource.data.map((h) => h.apKatBezeichnung))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "typ",
        () => "Typ",
        () => "hwTypBezeichnung",
        () => "hwTypBezeichnung",
        (h: HwKonfig) => h.hwTypBezeichnung,
        "t",
        true,
        2,
        ColumnType.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => {
          if (this.confFilterService.stdFilter) {
            // Inhalt der Dropdown im Listheader:
            // Enthaelt nur die Werte, die zum Inhalt des Filterfeldes von 'kategorie' passen.
            // Zusaetzlich den Inhalt der aktuellen Auswahl anhaengen, weil bei Aenderung in
            // 'kategorie' der Wert sonst nicht mehr in der Liste vorhanden waere und deshalb
            // trotz eines vorhanden Filterwertes (in filterControl.value) nichts angezeigt
            // wuerde, d.h. der Filter wirkt, aber der Benutzer kann ihn nicht sehen.
            const a = this.confDataSource.data
              .filter((h1) => {
                const val = GetColumn("kategorie", this.columns).filterControl.value as string;
                return val ? h1.apKatBezeichnung === val : true;
              })
              .map((h2) => h2.hwTypBezeichnung);
            if (GetColumn("typ", this.columns).filterControl.value) {
              a.push(GetColumn("typ", this.columns).filterControl.value as string);
            }
            return [...new Set(a)].sort();
          } else {
            return [...new Set(this.confDataSource.data.map((h) => h.hwTypBezeichnung))].sort();
          }
        },
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "hersteller",
        () => "Hersteller",
        () => "hersteller",
        () => "hersteller",
        (h: HwKonfig) => h.hersteller,
        "o",
        true,
        3,
        ColumnType.STRING,
        [
          RelOp.startswith,
          RelOp.endswith,
          RelOp.like,
          RelOp.notlike,
          RelOp.inlist,
          RelOp.notinlist,
        ],
        () => [...new Set(this.confDataSource.data.map((h) => h.hersteller))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "bezeichnung",
        () => "Typ-Bezeichnung",
        () => "bezeichnung",
        () => "bezeichnung",
        (h: HwKonfig) => h.bezeichnung,
        "",
        true,
        4,
        ColumnType.STRING,
        [
          RelOp.startswith,
          RelOp.endswith,
          RelOp.like,
          RelOp.notlike,
          RelOp.inlist,
          RelOp.notinlist,
        ],
        () => [...new Set(this.confDataSource.data.map((h) => h.bezeichnung))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "zuordnung",
        () => "Geräte",
        () => "zuordnung",
        () => "zuordnung",
        (h: HwKonfig) => h.zuordnung,
        "",
        true,
        5,
        ColumnType.STRING,
        null,
        null,
        false
      )
    );
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
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
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "prozessor",
        () => "Prozessor",
        () => "prozessor",
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
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "ram",
        () => "RAM",
        () => "ram",
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
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "hd",
        () => "Festplatte",
        () => "hd",
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
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "video",
        () => "Grafik",
        () => "video",
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
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "sonst",
        () => "Sonstiges",
        () => "sonst",
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
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "devices",
        () => "Geräte",
        () => "devices",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.NUMBER,
        null,
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "aps",
        () => "Zugeordnet",
        () => "aps",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.NUMBER,
        null,
        null,
        true
      )
    );
    // fuer Suche nach Index
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "hwid",
        () => "HwKonfig-Index",
        () => "id",
        () => null,
        (h: HwKonfig) => `${h.id}`,
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

  private init(): void {
    // event handling
    this.loading = true;

    // warten bis alle Daten geladen sind
    this.dataService.dataReady.subscribe(() => {
      this.setDataToTable.emit();
      this.loading = false;
    });
    this.setDataToTable.subscribe(() => {
      if (this.confDataSource.paginator) {
        this.confDataSource.data = this.dataService.hwKonfigList;
        this.confFilterService.dataReady = true;
        this.confFilterService.triggerFilter();
      }
    });
    // liefert Daten fuer internen sort in mat-table -> z.B. immer lowercase vergleichen
    this.confDataSource.sortingDataAccessor = (hw: HwKonfig, id: string) => {
      const col = GetColumn(id, this.columns);
      if (col) {
        return col.sortString(hw);
      } else {
        return "";
      }
    };
    this.confFilterService.initService(this.columns, this.confDataSource);
  }
}
