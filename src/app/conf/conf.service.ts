import { EventEmitter, Injectable } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { environment } from "../../environments/environment";
import { KEY_SORT_BEZ, KEY_SORT_HERST, KEY_SORT_KAT_IP, KEY_SORT_TYP } from "../const";
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

  public stdFilter = true;

  public newConfEvent: EventEmitter<void> = new EventEmitter<void>();

  // wird getriggert, wenn die Daten an MatTableDataSource gehaengt werden koennen
  // (sollte erst passieren, nachdem auch der Paginator mit MatTableDataSource
  //  verkuepft wurde, sonst wuerden alle Datensaetze gerendert)
  private setDataToTable: EventEmitter<void> = new EventEmitter<void>();
  private defaultsort = "typ";

  constructor(
    public dataService: DataService,
    public navigationService: NavigationService,
    public editFilterService: EditFilterService,
    public confFilterService: ConfFilterService,
    public editService: ConfEditService,
    private configService: ConfigService
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.userSettings = configService.getUser();
    this.buildColumns();
    setTimeout(() => {
      this.init();
    }, 0);

    this.navigationService.navToKonf.subscribe((dat) => {
      this.confFilterService.filterFor([dat.col], dat.search);
    });

    this.newConfEvent.subscribe(() => this.editService.newConf());
  }

  public confEdit(conf: HwKonfig): void {
    this.editService.editConf(conf);
  }

  public setViewParams(sort: MatSort, paginator: MatPaginator): void {
    this.confDataSource.sort = sort;
    this.confDataSource.paginator = paginator;
    this.setDataToTable.emit();
    this.confDataSource.paginator.pageSize = this.userSettings.confPageSize;
    const sortcolumn = this.userSettings.confSortColumn
      ? this.userSettings.confSortColumn
      : this.defaultsort;
    const sortdir = this.userSettings.confSortDirection
      ? this.userSettings.confSortDirection === "asc"
        ? ""
        : "asc"
      : "";
    this.confDataSource.sort.active = sortcolumn;
    this.confDataSource.sort.direction = sortdir;
    const sortheader = this.confDataSource.sort.sortables.get(sortcolumn) as MatSortHeader;
    this.confDataSource.sort.sort(sortheader);
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

  public gotoHw(conf: HwKonfig): void {
    this.navigationService.navToHw.emit({ col: "konfiguration", search: conf.konfiguration });
  }

  public gotoAp(conf: HwKonfig): void {
    this.navigationService.navToAp.emit({
      col: "konfiguration",
      search: conf.konfiguration,
    });
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
        KEY_SORT_KAT_IP,
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
        KEY_SORT_TYP,
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
        KEY_SORT_HERST,
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
        KEY_SORT_BEZ,
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
        () => null,
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
        () => "deviceCount",
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
        () => "apCount",
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
        "konfiguration",
        () => "Konfiguration",
        () => "konfiguration",
        () => null,
        (h: HwKonfig) => h.konfiguration,
        "",
        false,
        0,
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
          return [
            ...new Set(
              this.confDataSource.data
                .filter((h3) => this.userSettings.showEmptyConfig || h3.deviceCount > 0)
                .map((h) => h.konfiguration)
            ),
          ].sort();
        },
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ConfService, HwKonfig>(
        this,
        "id",
        () => "ID",
        () => "id",
        () => "id",
        (c: HwKonfig) => c.id.toString(10),
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

    // warten bis alle Daten geladen sind
    this.dataService.dataReady.subscribe(() => {
      this.setDataToTable.emit();
      this.confFilterService.dataReady = true;
      this.loading = false;
    });
    this.setDataToTable.subscribe(() => {
      if (this.confDataSource.paginator) {
        this.confDataSource.data = this.dataService.hwKonfigList;
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
    this.dataService.hwKonfigListChanged.subscribe(() =>
      this.confFilterService.triggerColumnFilter()
    );
    this.confFilterService.initService(this.columns, this.confDataSource);
  }
}
