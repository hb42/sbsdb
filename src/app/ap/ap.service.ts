import { EventEmitter, Injectable } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { firstValueFrom } from "rxjs";
import {
  KEY_SORT_AP,
  KEY_SORT_BEZ,
  KEY_SORT_HW_WERT,
  KEY_SORT_KAT_IP,
  KEY_SORT_OE_KONF,
  KEY_SORT_TYP,
} from "../const";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { ElectronService } from "../shared/electron.service";
import { EditFilterService } from "../shared/filter/edit-filter.service";
import { RelOp } from "../shared/filter/rel-op.enum";
import { Download, GetColumn } from "../shared/helper";
import { KeyboardService } from "../shared/keyboard.service";
import { Arbeitsplatz } from "../shared/model/arbeitsplatz";
import { ExtProg } from "../shared/model/ext-prog";
import { Hardware } from "../shared/model/hardware";
import { Tag } from "../shared/model/tag";
import { TagTyp } from "../shared/model/tagTyp";
import { NavigationService } from "../shared/navigation.service";
import { StatusService } from "../shared/status.service";
import { ColumnType } from "../shared/table/column-type.enum";
import { SbsdbColumn } from "../shared/table/sbsdb-column";
import { ApEditService } from "./ap-edit-service";
import { ApFilterService } from "./ap-filter.service";

@Injectable({ providedIn: "root" })
export class ApService {
  public apDataSource: MatTableDataSource<Arbeitsplatz> = new MatTableDataSource<Arbeitsplatz>();

  // Text fuer Statuszeile
  public statusText = "";

  public userSettings: UserSession;

  public loading = false;

  public columns: SbsdbColumn<ApService, Arbeitsplatz>[] = [];

  public displayedColumns: string[];

  public newApEvent: EventEmitter<void> = new EventEmitter<void>();

  /* fuer select list: Liste ohne Duplikate fuer ein Feld (nicht bei allen sinnvoll -> aptyp, oe, voe, tags, hwtyp, vlan(?))
    new Set() -> nur eindeutige - ... -> zu Array
    -> https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array#9229932
    die beiden folgenden Arrays brauchen ca. 0.005 - 0.008 Sekunden => Listen bei Bedarf erzeugen
 const uniq1 = [ ...new Set(this.apDataSource.data.filter((a) => !!a.hwTypStr).map((a2) => a2.hwTypStr)) ].sort();
 const uniq2 = [ ...new Set(this.apDataSource.data.map((a) => a.oesearch)) ].sort();
  */

  // wird getriggert, wenn die Daten an MatTableDataSource gehaengt werden koennen
  // (sollte erst passieren, nachdem auch der Paginator mit MatTableDataSource
  //  verkuepft wurde, sonst wuerden alle Datensaetze gerendert)
  private setDataToTable: EventEmitter<void> = new EventEmitter<void>();
  private apDataReady = false;
  private readonly defaultsort = "apname";

  constructor(
    public filterService: ApFilterService,
    public editFilterService: EditFilterService,
    public editService: ApEditService,
    public electronService: ElectronService,
    public dataService: DataService,
    private configService: ConfigService,
    private keyboardService: KeyboardService,
    private navigationService: NavigationService,
    public statusService: StatusService
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

    this.navigationService.navToAp.subscribe((dat) => {
      this.filterService.filterFor([dat.col], dat.search);
    });

    this.newApEvent.subscribe(() => this.editService.newAp());
  }

  // public getColumnIndex(name: string): number {
  //   return this.columns.findIndex((c) => c.columnName === name);
  // }
  // public getColumn(name: string): SbsdbColumn<ApService, Arbeitsplatz> {
  //   const idx = this.getColumnIndex(name);
  //   if (idx >= 0 && idx < this.columns.length) {
  //     return this.columns[idx];
  //   } else {
  //     return null;
  //   }
  // }

  public setViewParams(sort: MatSort, paginator: MatPaginator): void {
    this.apDataSource.sort = sort;
    this.apDataSource.paginator = paginator;
    this.setDataToTable.emit();

    this.apDataSource.paginator.pageSize = this.userSettings.apPageSize;
    const sortcolumn = this.userSettings.apSortColumn
      ? this.userSettings.apSortColumn
      : this.defaultsort;
    const sortdir = this.userSettings.apSortDirection
      ? this.userSettings.apSortDirection === "asc"
        ? ""
        : "asc"
      : "";
    this.apDataSource.sort.active = sortcolumn;
    this.apDataSource.sort.direction = sortdir;
    const sortheader = this.apDataSource.sort.sortables.get(sortcolumn) as MatSortHeader;
    this.apDataSource.sort.sort(sortheader);
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
    // this.filterService.testEdit();
    const csvblob: string = ["echo here we go", "pause"].join("\n");
    const blob: Blob = new Blob([csvblob], {
      type: "text/plain;charset=utf-8",
      // type: "application/octet-stream;charset=UTF-8",
    });

    Download(blob, "sbsdb.cmd");
  }

  public apEdit(ap: Arbeitsplatz): void {
    this.editService.apEdit(ap);
  }

  public deleteAp(ap: Arbeitsplatz): void {
    this.editService.deleteAp(ap);
  }

  public tagsEdit(ap: Arbeitsplatz): void {
    this.editService.tagsEdit(ap);
  }

  public hwEdit(ap: Arbeitsplatz): void {
    this.editService.hwEdit(ap);
  }

  public gotoPriHw(ap: Arbeitsplatz): void {
    const hw = ap.hw.find((h) => h.pri);
    if (hw) {
      this.gotoHw(hw);
    }
  }
  public gotoHw(hw: Hardware): void {
    this.navigationService.navToHw.emit({ col: "id", search: hw.id });
  }

  public gotoKonf(hw: Hardware): void {
    this.navigationService.navToKonf.emit({
      col: "id",
      search: hw.hwKonfig.id,
    });
  }

  public toggleStandort(): void {
    this.userSettings.showStandort = !this.userSettings.showStandort;
    this.filterService.triggerFilter();
  }

  public toggleSonstHw(): void {
    this.userSettings.searchSonstHw = !this.userSettings.searchSonstHw;
    // falls ein Filter auf Spalte "Hardware" aktiv ist, so muss dieser erneut ausgefuehrt werden
    const hwcol = GetColumn("hardware", this.columns);
    if (hwcol && hwcol.filterControl.value) {
      // setValue() triggert valueChanges-Event (s. BaseFilter#initService())
      hwcol.filterControl.setValue(hwcol.filterControl.value);
    }
  }

  public extProgListFor(ap: Arbeitsplatz): ExtProg[] {
    if (!this.electronService.isElectron) {
      return [];
    }
    let allProgs = this.dataService.extProgList.filter((ex) => ex.aptypId === ap.apTypId);
    // fuer Nichtadmin nur Programme, bei denen in flag das Bit 0 gesetzt ist
    if (!this.userSettings.isAdmin && this.userSettings.isHotline) {
      allProgs = allProgs.filter((ex) => (ex.flag & DataService.EXTPROG_ALL_USERS_FLAG) > 0);
    }
    return allProgs.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
  }

  public runProgram(job: ExtProg, ap: Arbeitsplatz) {
    if (this.electronService.isElectron) {
      this.statusService.loadingIndicator = true;
      void this.electronService.exec(job, ap).then((result) => {
        if (result) {
          // fuer rc = 0 sollte das externe Programm das Feedback uebernehmen
          switch (result.rc) {
            case 1: // runtime error
              this.statusService.error(result.info);
              break;
            case 2: // Hinweis aus dem Script
              this.statusService.info(result.info);
              break;
            case 3: // Warnung aus dem Script
              this.statusService.warn(result.info);
              break;
            case 4: // Fehler, den das Script erkannt hat
              this.statusService.error(result.info);
              break;
          }
        }
        this.statusService.loadingIndicator = false;
      });
    }
  }

  // public filterByAptyp(ap: Arbeitsplatz, event: Event): void {
  //   const col = GetColumn("aptyp", this.columns);
  //   col.filterControl.setValue(ap.apTypBezeichnung);
  //   col.filterControl.markAsDirty();
  //   event.stopPropagation();
  // }
  //
  // public filterByBetrst(ap: Arbeitsplatz, event: Event): void {
  //   const col = GetColumn("betrst", this.columns);
  //   col.filterControl.setValue(ap[col.sortFieldName]);
  //   col.filterControl.markAsDirty();
  //   event.stopPropagation();
  // }

  private buildColumns() {
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
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
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "aptyp",
        () => "Typ",
        () => "apTypBezeichnung",
        () => "apTypBezeichnung",
        (a: Arbeitsplatz) => a.apTypBezeichnung,
        KEY_SORT_TYP,
        true,
        1,
        ColumnType.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.dataService.apList.map((a) => a.apTypBezeichnung))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "apname",
        () => "AP-Name",
        () => "apname",
        () => "apname",
        (a: Arbeitsplatz) => a.apname,
        KEY_SORT_AP,
        true,
        2,
        ColumnType.STRING,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike, RelOp.equal, RelOp.notequal],
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "betrst",
        () => (this.userSettings.showStandort ? "Standort" : "Verantw. OE"),
        () => (this.userSettings.showStandort ? "oe.fullname" : "verantwOe.fullname"),
        () => (this.userSettings.showStandort ? "oe.betriebsstelle" : "verantwOe.betriebsstelle"),
        (a: Arbeitsplatz) =>
          this.userSettings.showStandort ? a.oe.betriebsstelle : a.verantwOe.betriebsstelle,
        KEY_SORT_OE_KONF,
        true,
        3,
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike, RelOp.inlist, RelOp.notinlist],
        () =>
          [
            ...new Set(
              this.apDataSource.data.map((a) =>
                this.userSettings.showStandort ? a.oe.fullname : a.verantwOe.fullname
              )
            ),
          ].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "betrstExt",
        () => (this.userSettings.showStandort ? "Verantw. OE" : "Standort"),
        () => (this.userSettings.showStandort ? "verantwOe.fullname" : "oe.fullname"),
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike, RelOp.inlist, RelOp.notinlist],
        () =>
          [
            ...new Set(
              this.apDataSource.data.map((a) =>
                this.userSettings.showStandort ? a.verantwOe.fullname : a.oe.fullname
              )
            ),
          ].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "hierstandort",
        () => (this.userSettings.showStandort ? "OE-Hierarchie" : "Verantw.OE-Hierarchie"),
        () => (this.userSettings.showStandort ? "oe.hierarchy" : "verantwOe.hierarchy"),
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
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "hierverantwoe",
        () => (this.userSettings.showStandort ? "Verantw.OE-Hierarchie" : "OE-Hierarchie"),
        () => (this.userSettings.showStandort ? "verantwOe.hierarchy" : "oe.hierarchy"),
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
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "bezeichnung",
        () => "Bezeichnung",
        () => "bezeichnung",
        () => "bezeichnung",
        (a: Arbeitsplatz) => a.bezeichnung,
        KEY_SORT_BEZ,
        true,
        4,
        ColumnType.STRING,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "ip",
        () => "IP/MAC",
        () => ["ipStr", "macsearch"],
        () => ["ipStr", "macStr"],
        (a: Arbeitsplatz) => (a.ipStr ? a.ipStr + (a.macStr ? " –– " + a.macStr : "") : a.macStr),
        KEY_SORT_KAT_IP,
        true,
        5,
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike],
        null,
        false
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "ipfilt",
        () => "IP",
        () => "ipStr",
        () => "ipStr",
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
      new SbsdbColumn<ApService, Arbeitsplatz>(
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
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "vlan",
        () => "VLAN",
        () => "vlanStr",
        () => "vlanStr",
        () => null,
        "",
        false,
        0,
        ColumnType.STRING,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.apDataSource.data.map((a) => a.vlanStr))].sort(),
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "hardware",
        () => "Hardware",
        () =>
          this.userSettings.searchSonstHw && this.filterService.stdFilter
            ? ["hwStr", "sonstHwStr"]
            : "hwStr",
        // () => (this.userSettings.searchSonstHw ? "sonstHwStr" : "hwStr"),
        () => "hwStr",
        (a: Arbeitsplatz) => a.hwStr,
        KEY_SORT_HW_WERT,
        true,
        6,
        ColumnType.STRING,
        [RelOp.like, RelOp.notlike],
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "sonsthw",
        () => "Sonstige Hardware",
        () => "sonstHwStr",
        () => "hwStr",
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
      new SbsdbColumn<ApService, Arbeitsplatz>(
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
      new SbsdbColumn<ApService, Arbeitsplatz>(
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
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "konfiguration",
        () => "Konfiguration",
        () => "hw$hwKonfig.konfiguration",
        () => null,
        () => null,
        "",
        false,
        0,
        ColumnType.ARRAY,
        [RelOp.inlist, RelOp.notinlist],
        () => {
          return [
            ...new Set(
              this.dataService.hwKonfigList
                .filter((h3) => h3.deviceCount > 0)
                .map((h) => h.konfiguration)
            ),
          ].sort();
        },
        false
      )
    );
    this.columns.push(
      new SbsdbColumn<ApService, Arbeitsplatz>(
        this,
        "id",
        () => "ID",
        () => "apId",
        () => "apId",
        (a: Arbeitsplatz) => a.apId.toString(10),
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

  // APs aus der DB holen
  private initTable() {
    this.loading = true;
    // alle Daten muessen geladen sein und die ApComponent muss
    // fertig initialisiert sein (-> fn setViewParams)
    this.setDataToTable.subscribe(() => {
      if (this.apDataSource.paginator) {
        this.apDataSource.data = this.dataService.apList;
        // this.filterService.initService(this.columns, this.apDataSource);
        // this.filterService.dataReady = true;
        this.filterService.triggerColumnFilter();
      }
    });
    // Daten aus der DB holen und aufbereiten
    // const dataReady: EventEmitter<void> = new EventEmitter<void>();
    this.dataService.dataReady.subscribe(() => {
      this.loading = false;
      this.onDataReady();
      this.setDataToTable.emit(); // s.o.
      this.apDataReady = this.filterService.dataReady = true;
    });
    void this.getAPs(() => {
      this.loading = true;
    });

    this.filterService.initService(this.columns, this.apDataSource);

    // liefert Daten fuer internen sort in mat-table -> z.B. immer lowercase vergleichen
    this.apDataSource.sortingDataAccessor = (ap: Arbeitsplatz, id: string) => {
      const col = GetColumn(id, this.columns);
      if (col) {
        return col.sortString(ap);
      } else {
        return "";
      }
    };

    // Server liefert Aenderungen an APs
    this.dataService.apListChanged.subscribe(() => this.filterService.triggerColumnFilter());
    // TODO filterChange ueberall entfernen
    // this.filterChange.subscribe(() => this.filterService.triggerColumnFilter());
  }

  private onDataReady() {
    // alle vorhandenen tags
    const tags = [
      ...new Set(
        //  (flatmap ist ES10, wird aber von FF, Chrome, Edge schon unterstuetzt)
        this.dataService.apList.flatMap((ap: Arbeitsplatz) =>
          ap.tags.map((t1: Tag) => `${t1.bezeichnung};${t1.flag}`)
        )
      ),
    ].sort();
    // je tag eine Spalte anhaengen -> fuer Filter + Ausgabe in csv
    tags.forEach((t) => {
      const tag = t.split(";");
      this.columns.push(
        new SbsdbColumn(
          this,
          this.dataService.tagFieldName(tag[0]),
          () => DataService.TAG_DISPLAY_NAME + ": " + tag[0],
          () => this.dataService.tagFieldName(tag[0]),
          () => null,
          () => null,
          "",
          false,
          0,
          ColumnType.STRING,
          Number(tag[1]) & DataService.BOOL_TAG_FLAG
            ? [RelOp.exist, RelOp.notexist]
            : [
                RelOp.startswith,
                RelOp.endswith,
                RelOp.like,
                RelOp.notlike,
                RelOp.exist,
                RelOp.notexist,
              ],
          null,
          true
        )
      );
    });
  }

  /**`
   * Arbeitsplaetze parallel, in Bloecken von ConfigService.AP_PAGE_SIZE holen.
   *
   * @param each - callback wenn alle Bloecke fertig sind
   */
  public async getAPs(each: () => void): Promise<void> {
    // zunaechst die OEs holen
    await this.dataService.fetchBstList();
    // Groesse der einzelnen Bloecke
    let pageSize = Number(await this.configService.getConfig(ConfigService.AP_PAGE_SIZE));
    if (pageSize < DataService.defaultpageSize) {
      pageSize = DataService.defaultpageSize;
    }
    // Anzahl der Datensaetze
    const recs = (await firstValueFrom(this.dataService.get(this.dataService.countApUrl), {
      defaultValue: 0,
    })) as number;
    // zu holende Seiten
    const count = Math.ceil(recs / pageSize);
    let fetched = 0;
    for (let page = 0; page < count; page++) {
      this.dataService.get(`${this.dataService.pageApsUrl}${page}/${pageSize}`).subscribe({
        next: (aps: Arbeitsplatz[]) => {
          console.debug("fetch AP page #", page, " size=", aps.length);
          //      aps.forEach((ap) => this.dataService.prepareAP(ap));
          this.dataService.apList = [...this.dataService.apList, ...aps];
        },
        error: (err) => {
          console.error("ERROR loading AP-Data ", err);
        },
        complete: () => {
          each();
          fetched++;
          if (fetched === count) {
            this.dataService.prepareApList();
            console.debug("fetch page READY");
            this.dataService.apListFetched.emit();
            // ready.emit();
            // this.onDataReady();
          }
        },
      });
    }
  }

  public async getTagTypes(): Promise<TagTyp[]> {
    const rc = await firstValueFrom(this.dataService.get(this.dataService.allTagTypesUrl));
    console.debug("got tagtypes");
    return rc as TagTyp[];
  }

  public vlanDebugStr(hw: Hardware): string {
    if (hw && hw.vlans && hw.vlans[0]) {
      let dbg = "";
      hw.vlans.forEach((v) => {
        dbg += dbg ? `/ #${v.vlanId}` : `#${v.vlanId}`;
      });
      return dbg;
    } else {
      return "";
    }
  }
  public macDebugStr(hw: Hardware): string {
    if (hw && hw.vlans && hw.vlans[0]) {
      let dbg = "";
      hw.vlans.forEach((v) => {
        dbg += dbg ? `/ #${v.hwMacId}` : `#${v.hwMacId}`;
      });
      return dbg;
    } else {
      return "";
    }
  }
}
