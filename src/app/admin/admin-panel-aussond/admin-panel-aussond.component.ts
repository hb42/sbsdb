import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { environment } from "../../../environments/environment";
import { ConfigService } from "../../shared/config/config.service";
import { BaseFilterService } from "../../shared/filter/base-filter-service";
import { OutputToCsv } from "../../shared/helper";
import { Aussonderung } from "../../shared/model/aussonderung";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";

@Component({
  selector: "sbsdb-admin-panel-aussond",
  templateUrl: "./admin-panel-aussond.component.html",
  styleUrls: ["./admin-panel-aussond.component.scss"],
})
export class AdminPanelAussondComponent implements OnInit {
  /* TODO
       Liste der Aussonderungen neu bauen, 3 Spalten: Datum, Anzahl, Buttons CSV+Show
       Liste der Ausgesonderten als StdTableComponent, Header mit Aussond-Button, CSV?
        -> Spalte "menu" als noshow, noexport (s.a. BaseSvzPanelComponent)
       CSV-Button im Header nur fuer Detailliste?
       Alle Listen bei Bedarf vom Server holen (ggf. Uebersicht festhalten)
   */

  public dataSource: MatTableDataSource<Aussonderung> = new MatTableDataSource<Aussonderung>();
  public columns: SbsdbColumn<AdminPanelAussondComponent, Aussonderung>[] = [];

  public showDetail = false;

  constructor(
    public adminService: AdminService,
    private configService: ConfigService,
    private dialog: MatDialog
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  ngOnInit(): void {
    // noop
    // setTimeout(() => {
    //   this.adminService.disableMainMenuNewButton = false;
    //   this.adminService.disableMainMenuCsvButton = false;
    // }, 0);
  }

  public loadDetails(per: Date): void {}

  public buildColumns(): void {
    // StdTable haengt sonst eigene Spalte "menu" an, auch wenn sie hier nicht
    // gebraucht wird, also anhaengen und ausblenden
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
  }

  private async csvOutput(): Promise<void> {
    const separator: string =
      ((await this.configService.getConfig(ConfigService.CSV_SEPARATOR)) as string) ??
      BaseFilterService.DEFAULT_CSV_SEPARATOR;

    OutputToCsv(this.columns, this.dataSource, separator, this.dialog);
  }
}
