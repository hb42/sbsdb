import { AfterViewInit, Component, EventEmitter, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { DataService } from "../../shared/data.service";
import { TagTyp } from "../../shared/model/tagTyp";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { YesNoDialogComponent } from "../../shared/yes-no-dialog/yes-no-dialog.component";
import { AdminService } from "../admin.service";
import { EditTagtypDialogComponent } from "../edit-tagtyp-dialog/edit-tagtyp-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-tagtyp",
  templateUrl: "./admin-panel-tagtyp.component.html",
  styleUrls: ["./admin-panel-tagtyp.component.scss"],
})
export class AdminPanelTagtypComponent implements OnDestroy, AfterViewInit {
  public dataSource: MatTableDataSource<TagTyp> = new MatTableDataSource<TagTyp>();
  public columns: SbsdbColumn<AdminPanelTagtypComponent, TagTyp>[] = [];
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
    this.dataService.tagTypDeps();
    this.dataSource.data = this.dataService.tagTypList;

    this.buildColumns();

    this.dataService.tagtypListChanged.subscribe(() => {
      this.changeDebug();
    });

    // TODO x deps -> AP_TAG
    //      - new
    //      - chg
    //      - del

    // new
    this.newRecordHandler = this.adminService.newRecordEvent.subscribe(() => {
      this.handleChangeOrNew({
        id: 0,
        bezeichnung: "",
        param: "",
        flag: 0,
        apKategorieId: null,
        apkategorie: "",
      });
    });

    this.exportHandler = this.adminService.exportEvent.subscribe(() => {
      console.debug("output to csv called - TAG-Typ");
      this.csvEvent.emit();
    });

    this.debugHandler = this.adminService.debugEvent.subscribe(() => {
      this.changeDebug();
    });

    // chg
    this.changeEvent.subscribe((tt: TagTyp) => {
      this.handleChangeOrNew(tt);
    });

    // del
    this.delEvent.subscribe((tt: TagTyp) => {
      const dialogRef = this.dialog.open(YesNoDialogComponent, {
        data: {
          title: "TAG-Typ löschen",
          text: `Soll der TAG-Typ "${tt.bezeichnung}" gelöscht werden?`,
        },
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          console.debug("del TAG-Typ");
          this.adminService.saveTagtyp({ tagtyp: tt, del: true });
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

  private handleChangeOrNew(tagtyp: TagTyp) {
    const dialogRef = this.dialog.open(EditTagtypDialogComponent, { data: tagtyp });
    dialogRef.afterClosed().subscribe((result: TagTyp) => {
      console.debug("dlg closed");
      console.dir(result);
      if (result) {
        this.adminService.saveTagtyp({ tagtyp: result, del: false });
      }
    });
  }

  private buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelTagtypComponent, TagTyp>(
        this,
        "id",
        () => "ID",
        () => "id",
        () => "id",
        (a: TagTyp) => a.id.toString(10),
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
      new SbsdbColumn<AdminPanelTagtypComponent, TagTyp>(
        this,
        "tagtyp",
        () => "TAG-Typ",
        () => "bezeichnung",
        () => "bezeichnung",
        (a: TagTyp) => a.bezeichnung,
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
      new SbsdbColumn<AdminPanelTagtypComponent, TagTyp>(
        this,
        "param",
        () => "Parameter",
        () => "param",
        () => "param",
        (a: TagTyp) => a.param,
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
      new SbsdbColumn<AdminPanelTagtypComponent, TagTyp>(
        this,
        "flag",
        () => "Flag",
        () => "flag",
        () => "flag",
        (a: TagTyp) => a.flag.toString(10),
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
      new SbsdbColumn<AdminPanelTagtypComponent, TagTyp>(
        this,
        "apkategorie",
        () => "AP-Kategorie",
        () => "apkategorie",
        () => "apkategorie",
        (a: TagTyp) => a.apkategorie,
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
      new SbsdbColumn<AdminPanelTagtypComponent, TagTyp>(
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
    this.refreshTableEvent.emit(this.adminService.userSettings.debug);
  }
}
