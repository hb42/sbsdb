import { Component, EventEmitter, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { DataService } from "../../shared/data.service";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { YesNoDialogComponent } from "../../shared/yes-no-dialog/yes-no-dialog.component";
import { AdminService } from "../admin.service";
import { EditExtprogDialogComponent } from "../edit-extprog-dialog/edit-extprog-dialog.component";
import { EditExtprogTransport } from "../edit-extprog-dialog/edit-extprog-transport";
import { ExtProgList } from "./ext-prog-list";

@Component({
  selector: "sbsdb-admin-panel-extprog",
  templateUrl: "./admin-panel-extprog.component.html",
  styleUrls: ["./admin-panel-extprog.component.scss"],
})
export class AdminPanelExtprogComponent implements OnDestroy {
  public dataSource: MatTableDataSource<ExtProgList> = new MatTableDataSource<ExtProgList>();
  public columns: SbsdbColumn<AdminPanelExtprogComponent, ExtProgList>[] = [];
  public csvEvent: EventEmitter<void> = new EventEmitter<void>();

  public changeEvent: EventEmitter<unknown> = new EventEmitter<unknown>();
  public delEvent: EventEmitter<unknown> = new EventEmitter<unknown>();

  public refreshTableEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  private newRecordHandler: Subscription;
  private exportHandler: Subscription;
  private notificationHandler: Subscription;
  private extProgList: ExtProgList[] = [];

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor AdminPanelExtprogComponent");
    setTimeout(() => (this.adminService.disableMainMenuButtons = false), 0);
    this.buildList();
    this.dataSource.data = this.extProgList;
    this.buildColumns();
    this.notificationHandler = this.dataService.extprogListChanged.subscribe(() =>
      this.buildList()
    );

    // new
    this.newRecordHandler = adminService.newRecordEvent.subscribe(() => {
      this.handleChangeOrNew();
    });
    // csv export
    this.exportHandler = adminService.exportEvent.subscribe(() => {
      this.csvEvent.emit();
    });
    // change
    this.changeEvent.subscribe((ex: ExtProgList) => {
      this.handleChangeOrNew(ex);
    });
    // del
    this.delEvent.subscribe((ex: ExtProgList) => {
      const dialogRef = this.dialog.open(YesNoDialogComponent, {
        data: {
          title: "Externes Programm löschen",
          text: `Soll das externe Programm "${ex.program}" gelöscht werden?`,
        },
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          const rc: EditExtprogTransport = { outDel: ex };
          this.adminService.saveExtprog(rc);
        }
      });
    });
  }

  public ngOnDestroy(): void {
    this.adminService.disableMainMenuButtons = true;
    this.newRecordHandler.unsubscribe();
    this.exportHandler.unsubscribe();
    this.notificationHandler.unsubscribe();
  }

  private handleChangeOrNew(ex?: ExtProgList) {
    const dialogRef = this.dialog.open(EditExtprogDialogComponent, {
      data: ex ? { in: ex } : {},
      panelClass: "extProgDialogPosition",
    });
    dialogRef.afterClosed().subscribe((result: EditExtprogTransport) => {
      if (result) {
        this.adminService.saveExtprog(result);
      }
    });
  }

  private buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelExtprogComponent, ExtProgList>(
        this,
        "program",
        () => "Schlüssel",
        () => "program",
        () => "program",
        (a: ExtProgList) => a.program,
        "",
        true,
        0,
        ColumnType.STRING,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelExtprogComponent, ExtProgList>(
        this,
        "bezeichnung",
        () => "Bezeichnung",
        () => "bezeichnung",
        () => "bezeichnung",
        (a: ExtProgList) => a.bezeichnung,
        "",
        true,
        1,
        ColumnType.STRING,
        null,
        null,
        true,
        "M"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelExtprogComponent, ExtProgList>(
        this,
        "param",
        () => "Parameter",
        () => "param",
        () => "param",
        (a: ExtProgList) => a.param,
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
      new SbsdbColumn<AdminPanelExtprogComponent, ExtProgList>(
        this,
        "flag",
        () => "Flag",
        () => "flag",
        () => "flag",
        (a: ExtProgList) => a.flag.toString(10),
        "",
        true,
        3,
        ColumnType.NUMBER,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelExtprogComponent, ExtProgList>(
        this,
        "types",
        () => "AP-Typen",
        () => "types",
        () => "types",
        (a: ExtProgList) =>
          a.types.reduce((prev, curr) => {
            const txt = this.adminService.userSettings.debug
              ? `${curr.aptyp.bezeichnung} (#${curr.id})`
              : curr.aptyp.bezeichnung;
            return (prev += prev ? ", " + txt : txt);
          }, ""),
        "",
        true,
        4,
        ColumnType.ARRAY,
        null,
        null,
        true,
        "M"
      )
    );
  }

  private buildList() {
    this.extProgList.splice(0);
    this.dataService.extProgList.forEach((ex) => {
      const aptyp = this.dataService.aptypList.find((at) => at.id === ex.aptypId);
      const neu = this.extProgList.find((ep) => ep.program === ex.program);
      if (neu) {
        neu.types.push({ id: ex.id, aptyp: aptyp });
      } else {
        this.extProgList.push({
          program: ex.program,
          bezeichnung: ex.bezeichnung,
          param: ex.param,
          flag: ex.flag,
          types: [{ id: ex.id, aptyp: aptyp }],
        });
      }
    });
    this.refreshTableEvent.emit();
  }
}
