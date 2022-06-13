import { Component, EventEmitter, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { DataService } from "../../shared/data.service";
import { ApTyp } from "../../shared/model/ap-typ";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { EditAptypDialogComponent } from "../edit-aptyp-dialog/edit-aptyp-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-aptyp",
  templateUrl: "./admin-panel-aptyp.component.html",
  styleUrls: ["./admin-panel-aptyp.component.scss"],
})
export class AdminPanelAptypComponent implements OnDestroy {
  public dataSource: MatTableDataSource<ApTyp> = new MatTableDataSource<ApTyp>();
  public columns: SbsdbColumn<AdminPanelAptypComponent, ApTyp>[] = [];
  public csvEvent: EventEmitter<void> = new EventEmitter<void>();

  public changeEvent: EventEmitter<unknown> = new EventEmitter<unknown>();
  public delEvent: EventEmitter<unknown> = new EventEmitter<unknown>();

  private newRecordHandler: Subscription;
  private exportHandler: Subscription;

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor AdminPanelAptypComponent");
    setTimeout(() => (this.adminService.disableMainMenuButtons = false), 0);
    this.dataSource.data = this.dataService.aptypList;

    // FIXME: das muss beim Laden der Tabellen bzw. beim Update beruecksichtigt werden
    const apcount = this.dataService.apList.reduce(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      (prev, curr) => ((prev[curr.apTypId] = ((prev[curr.apTypId] as number) || 0) + 1), prev),
      {}
    );
    Object.keys(apcount).forEach(
      (k) => (this.dataService.aptypList.find((at) => at.id.toString(10) == k).inUse = apcount[k])
    );
    // ---

    this.buildColumns();
    this.newRecordHandler = this.adminService.newRecordEvent.subscribe(() => {
      console.debug("new AP-Typ called");
      // TODO
      const dialogRef = this.dialog.open(EditAptypDialogComponent, {
        data: { id: 0, bezeichnung: "", flag: 0, apKategorieId: null, apkategorie: "" },
      });
      dialogRef.afterClosed().subscribe((result: ApTyp) => {
        console.debug("dlg closed");
        console.dir(result);
      });
    });
    this.exportHandler = this.adminService.exportEvent.subscribe(() => {
      console.debug("output to csv called - AP-Typ");
      this.csvEvent.emit();
      // TODO
    });
    this.changeEvent.subscribe((at: ApTyp) => {
      console.debug("change AP-Typ");
      // TODO
      const dialogRef = this.dialog.open(EditAptypDialogComponent, { data: at });
      dialogRef.afterClosed().subscribe((result: ApTyp) => {
        console.debug("dlg closed");
        console.dir(result);
      });
    });
    this.delEvent.subscribe((at: ApTyp) => {
      console.debug("del AP-Typ");
      // TODO
    });
  }

  public ngOnDestroy(): void {
    console.debug("onDestroy AdminPanelAptypComponent");
    this.adminService.disableMainMenuButtons = true;
    this.newRecordHandler.unsubscribe();
    this.exportHandler.unsubscribe();
  }

  private buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelAptypComponent, ApTyp>(
        this,
        "id",
        () => "ID",
        () => "id",
        () => null,
        (a) => a.id.toString(10),
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
      new SbsdbColumn<AdminPanelAptypComponent, ApTyp>(
        this,
        "aptyp",
        () => "AP-Typ",
        () => "bezeichnung",
        () => "bezeichnung",
        (a: ApTyp) => a.bezeichnung,
        "",
        true,
        0,
        ColumnType.STRING,
        null,
        null,
        true,
        "M"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelAptypComponent, ApTyp>(
        this,
        "flag",
        () => "Flag",
        () => "flag",
        () => "flag",
        (a: ApTyp) => a.flag.toString(10),
        "",
        true,
        1,
        ColumnType.NUMBER,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelAptypComponent, ApTyp>(
        this,
        "apkategorie",
        () => "AP-Kategorie",
        () => "apkategorie",
        () => "apkategorie",
        (a: ApTyp) => a.apkategorie,
        "",
        true,
        2,
        ColumnType.STRING,
        null,
        null,
        true,
        "M"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelAptypComponent, ApTyp>(
        this,
        "apketegorieid",
        () => "AP-Kategorie-ID",
        () => "apkategorieID",
        () => null,
        (a) => a.apKategorieId.toString(10),
        "",
        false,
        0,
        ColumnType.NUMBER,
        null,
        null,
        true
      )
    );
  }
}
