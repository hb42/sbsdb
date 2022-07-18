import { AfterViewInit, Component, EventEmitter, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { DataService } from "../../shared/data.service";
import { ApTyp } from "../../shared/model/ap-typ";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { YesNoDialogComponent } from "../../shared/yes-no-dialog/yes-no-dialog.component";
import { AdminService } from "../admin.service";
import { EditAptypDialogComponent } from "../edit-aptyp-dialog/edit-aptyp-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-aptyp",
  templateUrl: "./admin-panel-aptyp.component.html",
  styleUrls: ["./admin-panel-aptyp.component.scss"],
})
export class AdminPanelAptypComponent implements OnDestroy, AfterViewInit {
  public dataSource: MatTableDataSource<ApTyp> = new MatTableDataSource<ApTyp>();
  public columns: SbsdbColumn<AdminPanelAptypComponent, ApTyp>[] = [];
  public csvEvent: EventEmitter<void> = new EventEmitter<void>();

  public changeEvent: EventEmitter<unknown> = new EventEmitter<unknown>();
  public delEvent: EventEmitter<unknown> = new EventEmitter<unknown>();

  public refreshTableEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  private newRecordHandler: Subscription;
  private exportHandler: Subscription;
  private debugHandler: Subscription;

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor AdminPanelAptypComponent");
    setTimeout(() => (this.adminService.disableMainMenuButtons = false), 0);
    this.dataSource.data = this.dataService.aptypList;

    this.buildColumns();

    // new
    this.newRecordHandler = this.adminService.newRecordEvent.subscribe(() => {
      this.handleChangeOrNew({
        id: 0,
        bezeichnung: "",
        flag: 0,
        apKategorieId: null,
        apkategorie: "",
      });
    });

    this.exportHandler = this.adminService.exportEvent.subscribe(() => {
      console.debug("output to csv called - AP-Typ");
      this.csvEvent.emit();
    });

    this.debugHandler = this.adminService.debugEvent.subscribe(() => {
      this.changeDebug();
    });

    // chg
    this.changeEvent.subscribe((at: ApTyp) => {
      this.handleChangeOrNew(at);
    });

    // del
    this.delEvent.subscribe((at: ApTyp) => {
      const dialogRef = this.dialog.open(YesNoDialogComponent, {
        data: {
          title: "AP-Typ löschen",
          text: `Soll der Arbeitsplatz-Typ "${at.bezeichnung}" gelöscht werden?`,
        },
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          console.debug("del AP-Typ");
          this.adminService.saveAptyp({ aptyp: at, del: true });
        }
      });
    });
  }

  public ngAfterViewInit(): void {
    // ID-Spalte gemaess config.DEBUG ein- oder ausblenden
    setTimeout(() => this.changeDebug(), 0);
  }

  public ngOnDestroy(): void {
    console.debug("onDestroy AdminPanelAptypComponent");
    this.adminService.disableMainMenuButtons = true;
    this.newRecordHandler.unsubscribe();
    this.exportHandler.unsubscribe();
    this.debugHandler.unsubscribe();
  }

  private handleChangeOrNew(aptyp: ApTyp) {
    const dialogRef = this.dialog.open(EditAptypDialogComponent, { data: aptyp });
    dialogRef.afterClosed().subscribe((result: ApTyp) => {
      console.debug("dlg closed");
      console.dir(result);
      if (result) {
        this.adminService.saveAptyp({ aptyp: result, del: false });
      }
    });
  }

  private buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelAptypComponent, ApTyp>(
        this,
        "id",
        () => "ID",
        () => "id",
        () => "id",
        (a: ApTyp) => a.id.toString(10),
        "",
        true,
        0,
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

  private changeDebug() {
    // const idCol = this.columns.find((c) => c.columnName === "id");
    // if (idCol) {
    //   idCol.show = this.adminService.userSettings.debug;
    // }
    this.refreshTableEvent.emit(this.adminService.userSettings.debug);
  }
}
