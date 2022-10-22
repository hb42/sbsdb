import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { ADM_EXTPROG_PATH } from "../../const";
import { DataService } from "../../shared/data.service";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { BaseSvzPanelComponent } from "../base-svz-panel.component";
import { EditExtprogDialogComponent } from "../edit-extprog-dialog/edit-extprog-dialog.component";
import { EditExtprogTransport } from "../edit-extprog-dialog/edit-extprog-transport";
import { ExtProgList } from "./ext-prog-list";

@Component({
  selector: "sbsdb-admin-panel-extprog",
  templateUrl: "./admin-panel-extprog.component.html",
  styleUrls: ["./admin-panel-extprog.component.scss"],
})
export class AdminPanelExtprogComponent extends BaseSvzPanelComponent<
  AdminPanelExtprogComponent,
  ExtProgList
> {
  public pagename = ADM_EXTPROG_PATH;
  private extProgList: ExtProgList[];

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    super(dataService, adminService, dialog);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);

    this.notificationHandler = this.dataService.extprogListChanged.subscribe(() =>
      this.buildList()
    );
    this.dataService.aptypList.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
  }

  protected handleChangeOrNew(ex?: ExtProgList) {
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

  protected handleDelete(ex: ExtProgList) {
    void this.askDelete(
      "Externes Programm löschen",
      `Soll das externe Programm "${ex.program}" gelöscht werden?`
    ).then((result) => {
      if (result) {
        const rc: EditExtprogTransport = { outDel: ex };
        this.adminService.saveExtprog(rc);
      }
    });
  }

  protected getTableData(): ExtProgList[] {
    this.buildList();
    return this.extProgList;
  }

  protected changeDebug() {
    this.buildList(false);
    super.changeDebug();
  }

  protected buildColumns() {
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
        () => "typesStr",
        () => "typesStr",
        (a: ExtProgList) => a.typesStr,
        "",
        true,
        4,
        ColumnType.STRING,
        null,
        null,
        true,
        "M"
      )
    );
  }

  private buildList(refresh = true) {
    if (this.extProgList) {
      this.extProgList.splice(0);
    } else {
      this.extProgList = [];
    }
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
    this.extProgList.forEach(
      (e) =>
        (e.typesStr = e.types.reduce((prev, curr) => {
          const txt = this.adminService.userSettings.debug
            ? `${curr.aptyp.bezeichnung} (#${curr.id})`
            : curr.aptyp.bezeichnung;
          return prev ? prev + ", " + txt : txt;
        }, ""))
    );
    if (refresh) {
      this.refreshTableEvent.emit();
    }
  }
}
