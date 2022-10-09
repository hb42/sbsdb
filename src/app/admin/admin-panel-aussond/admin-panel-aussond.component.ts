import { formatDate, formatNumber } from "@angular/common";
import { Component, HostBinding, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { lastValueFrom } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { KEY_SORT_HW_WERT } from "../../const";
import { ConfigService } from "../../shared/config/config.service";
import { UserSession } from "../../shared/config/user.session";
import { DataService } from "../../shared/data.service";
import { BaseFilterService } from "../../shared/filter/base-filter-service";
import { Bracket } from "../../shared/filter/bracket";
import { LogicalAnd } from "../../shared/filter/logical-and";
import { RelOp } from "../../shared/filter/rel-op.enum";
import { GetColumn, OutputToCsv } from "../../shared/helper";
import { AussondMeldung } from "../../shared/model/aussond-meldung";
import { Aussonderung } from "../../shared/model/aussonderung";
import { StatusService } from "../../shared/status.service";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { NewAussondMeldData } from "../new-aussond-meld/new-aussond-meld-data";
import { NewAussondMeldComponent } from "../new-aussond-meld/new-aussond-meld.component";

@Component({
  selector: "sbsdb-admin-panel-aussond",
  templateUrl: "./admin-panel-aussond.component.html",
  styleUrls: ["./admin-panel-aussond.component.scss"],
})
export class AdminPanelAussondComponent {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  @ViewChild(MatSort, { static: true }) public sort: MatSort;

  public showDetail = false;
  public detailsDate: Date = null;
  public details: Aussonderung[] = [];
  public dataSource: MatTableDataSource<Aussonderung> = new MatTableDataSource<Aussonderung>();
  public columns: SbsdbColumn<AdminPanelAussondComponent, Aussonderung>[] = [];
  public displayedColumns: string[] = [];
  public filterExpression = new Bracket();
  public sortColumn = "invnr";
  private filterChanged = 1;

  public meldungen: AussondMeldung[] = [];
  public meldColumns = ["date", "count", "menu"];
  public userSettings: UserSession;

  constructor(
    public adminService: AdminService,
    private dataService: DataService,
    private configService: ConfigService,
    private statusService: StatusService,
    private dialog: MatDialog
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.userSettings = configService.getUser();
    this.fechMeldungen();
    this.buildColumns();
  }

  public loadDetails(per: Date): void {
    void this.fetchDetails(per).then(() => {
      this.showDetail = true;
      this.showDetails();
    });
  }

  public aussonderungsMeldung() {
    // letzte Aussonderungs-Meldung
    const last = this.meldungen.reduce(
      (prev: Date, curr) =>
        curr.datum && curr.datum.valueOf() > prev.valueOf() ? curr.datum : prev,
      new Date(0)
    );
    const min = new Date(last);
    min.setDate(min.getDate() + 1);
    const dialogRef = this.dialog.open(NewAussondMeldComponent, {
      data: { meldung: new Date(), minDate: min },
    });
    dialogRef.afterClosed().subscribe((result: NewAussondMeldData) => {
      if (result) {
        const aussDate = `/${result.meldung.toLocaleDateString("de-DE")}`;
        this.dataService.get(this.dataService.aussondUrl + aussDate).subscribe((rc) => {
          if (rc > 0) {
            this.statusService.info("Änderungen erfolgreich gespeichert.");
            this.showDetail = false;
            this.fechMeldungen();
          } else {
            this.statusService.warn("Keine Daten geändert.");
          }
        });
      }
    });
  }

  public getColumn(name: string): SbsdbColumn<unknown, unknown> {
    return GetColumn(name, this.columns);
  }

  public onSort(event: Sort): void {
    // noop
  }

  public buildColumns(): void {
    // StdTable haengt sonst eigene Spalte "menu" an, auch wenn sie hier nicht
    // gebraucht wird, also anhaengen und ausblenden

    this.columns.push(
      new SbsdbColumn<AdminPanelAussondComponent, Aussonderung>(
        this,
        "invnr",
        () => "Inventar-Nr.",
        () => "invNr",
        () => "invNr",
        (a) => a.invNr,
        "",
        true,
        0,
        ColumnType.STRING,
        null,
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelAussondComponent, Aussonderung>(
        this,
        "anschdat",
        () => "Ansch.-Datum",
        () => "anschDat",
        () => "anschDat",
        (a) => (a.anschDat.valueOf() ? formatDate(a.anschDat, "mediumDate", "de") : ""),
        "",
        true,
        1,
        ColumnType.DATE,
        null,
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelAussondComponent, Aussonderung>(
        this,
        "anschwert",
        () => "Ansch.-Wert",
        () => "anschWert",
        () => "anschWert",
        (a) => (a.anschWert ? formatNumber(a.anschWert, "de", "1.2-2") : ""),
        KEY_SORT_HW_WERT,
        true,
        2,
        ColumnType.NUMBER,
        null,
        null,
        true
      )
    );

    this.columns.push(
      new SbsdbColumn<AdminPanelAussondComponent, Aussonderung>(
        this,
        "bezeichnung",
        () => "Bezeichnung",
        () => "bezeichnung",
        () => "bezeichnung",
        (a) => a.bezeichnung,
        "",
        true,
        3,
        ColumnType.STRING,
        null,
        null,
        true
      )
    );

    this.columns.push(
      new SbsdbColumn<AdminPanelAussondComponent, Aussonderung>(
        this,
        "sernr",
        () => "Serien-Nr.",
        () => "serNr",
        () => "serNr",
        (a) => a.serNr,
        "",
        true,
        4,
        ColumnType.STRING,
        null,
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelAussondComponent, Aussonderung>(
        this,
        "aussdat",
        () => "Aussond.-Datum",
        () => "aussDat",
        () => "aussDat",
        (a) => (a.aussDat.valueOf() ? formatDate(a.aussDat, "mediumDate", "de") : ""),
        "",
        true,
        5,
        ColumnType.DATE,
        null,
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelAussondComponent, Aussonderung>(
        this,
        "aussgrund",
        () => "Aussond.-Grund",
        () => "aussGrund",
        () => "aussGrund",
        (a) => a.aussGrund,
        "",
        true,
        4,
        ColumnType.STRING,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike, RelOp.equal, RelOp.notequal],
        null,
        true
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelAussondComponent, Aussonderung>(
        this,
        "menu",
        () => null,
        () => null,
        () => null,
        () => null,
        "",
        false,
        0,
        -1,
        null,
        null,
        false
      )
    );
    this.displayedColumns = this.columns.filter((c) => c.show).map((col) => col.columnName);
  }

  public async csvOutput(per: Date): Promise<void> {
    const separator: string =
      ((await this.configService.getConfig(ConfigService.CSV_SEPARATOR)) as string) ??
      BaseFilterService.DEFAULT_CSV_SEPARATOR;

    void this.fetchDetails(per).then(() => {
      console.dir(per);
      OutputToCsv(this.columns, this.dataSource, separator, this.dialog);
    });
  }

  private fechMeldungen() {
    this.dataService.get(this.dataService.aussListUrl).subscribe((au) => {
      const meld = au as AussondMeldung[];
      meld.forEach((m) => (m.datum = m.datum ? new Date(m.datum) : null));
      this.meldungen = meld;
    });
  }

  private fetchDetails(per: Date): Promise<unknown> {
    this.detailsDate = per;
    const aussDate = per ? `/${per.toLocaleDateString("de-DE")}` : "/null";

    return lastValueFrom(this.dataService.get(this.dataService.aussDetailsUrl + aussDate)).then(
      (au) => {
        this.details = au as Aussonderung[];
        this.details.forEach((a) => {
          // die JSON-Konvertierung liefert immer string statt Date
          a.anschDat = new Date(a.anschDat);
          a.rewe = a.rewe ? new Date(a.rewe) : null;
        });
        this.dataSource.data = this.details;
      }
    );
  }

  private showDetails(): void {
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (row: unknown, id: string) => {
        const col = GetColumn(id, this.columns);
        if (col) {
          return col.sortString(row);
        } else {
          return "";
        }
      };
      this.dataSource.sort.active = this.sortColumn;
      this.dataSource.sort.direction = "";
      const sortheader = this.dataSource.sort.sortables.get(this.sortColumn) as MatSortHeader;
      this.dataSource.sort.sort(sortheader);
      this.dataSource.filterPredicate = (row: unknown): boolean => {
        const valid = this.filterExpression.validate(
          row as Record<string, string | Array<string> | number | Date>
        );
        row["selected"] = valid;
        return valid;
      };
      this.triggerFilter();

      // Filter triggern
      this.columns.forEach((c) => {
        if (c.filterControl) {
          c.filterControl.valueChanges.pipe(debounceTime(500)).subscribe(() => {
            this.buildStdFilterExpression();
            this.triggerFilter();
          });
        }
      });
    }, 0);
  }

  private buildStdFilterExpression() {
    this.filterExpression.reset();
    const and = new LogicalAnd();
    this.columns.forEach((col) => {
      if (col.filterControl) {
        const colExpr = col.getFilterExpression();
        if (colExpr) {
          this.filterExpression.addElement(and, colExpr);
        }
      }
    });
  }

  private triggerFilter(): void {
    this.dataSource.filter = `${this.filterChanged++}`;
  }
}
