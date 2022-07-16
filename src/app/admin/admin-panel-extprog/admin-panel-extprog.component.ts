import { Component, EventEmitter, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { DataService } from "../../shared/data.service";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { EditExtprogData } from "../edit-extprog-dialog/edit-extprog-data";
import { EditExtprogDialogComponent } from "../edit-extprog-dialog/edit-extprog-dialog.component";
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

  private newRecordHandler: Subscription;
  private exportHandler: Subscription;
  private extProgList: ExtProgList[];

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
    this.newRecordHandler = adminService.newRecordEvent.subscribe(() => {
      console.debug("new ExtProg called");
      const dialogRef = this.dialog.open(EditExtprogDialogComponent, {
        data: {},
        panelClass: "extProgDialogPosition", // class muss global definiert werden
      });
      dialogRef.afterClosed().subscribe((result: EditExtprogData) => {
        console.debug("dlg closed");
        console.dir(result);
        // TODO
      });
    });
    this.exportHandler = adminService.exportEvent.subscribe(() => {
      console.debug("output to csv called - ExtProg");
      this.csvEvent.emit();
    });
    this.changeEvent.subscribe((ex: ExtProgList) => {
      console.debug("change ExtProg");
      const dialogRef = this.dialog.open(EditExtprogDialogComponent, {
        data: { in: ex },
        panelClass: "extProgDialogPosition",
      });
      dialogRef.afterClosed().subscribe((result: EditExtprogData) => {
        console.debug("dlg closed");
        console.dir(result);
        // TODO
      });
    });
    this.delEvent.subscribe((ex: ExtProgList) => {
      console.debug("del ExtProg");
      // TODO
    });
  }

  public ngOnDestroy(): void {
    this.adminService.disableMainMenuButtons = true;
    this.newRecordHandler.unsubscribe();
    this.exportHandler.unsubscribe();
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
    this.extProgList = [];
    this.dataService.extProgList.forEach((ex) => {
      const aptyp = this.dataService.aptypList.find((at) => at.id === ex.aptypId);
      const neu = this.extProgList.find((ep) => ep.program === ex.program);
      if (neu) {
        neu.types.push({ id: ex.id, aptyp: aptyp });
      } else {
        this.extProgList.push({
          id: ex.id,
          program: ex.program,
          bezeichnung: ex.bezeichnung,
          param: ex.param,
          flag: ex.flag,
          types: [{ id: ex.id, aptyp: aptyp }],
        });
      }
    });
  }
}
