import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { ApTyp } from "../../shared/model/ap-typ";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { BaseSvzPanel } from "../base-svz-panel";
import { EditAptypDialogComponent } from "../edit-aptyp-dialog/edit-aptyp-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-aptyp",
  templateUrl: "./admin-panel-aptyp.component.html",
  styleUrls: ["./admin-panel-aptyp.component.scss"],
})
export class AdminPanelAptypComponent extends BaseSvzPanel<AdminPanelAptypComponent, ApTyp> {
  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor AdminPanelAptypComponent");
    super(dataService, adminService, dialog);

    this.notificationHandler = this.dataService.aptypListChanged.subscribe(() => {
      this.changeDebug();
    });
    this.dataService.apkatList.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
  }

  protected handleChangeOrNew(aptyp: ApTyp) {
    if (!aptyp) {
      aptyp = {
        id: 0,
        bezeichnung: "",
        flag: 0,
        apKategorieId: null,
        apkategorie: "",
      };
    }
    const dialogRef = this.dialog.open(EditAptypDialogComponent, { data: aptyp });
    dialogRef.afterClosed().subscribe((result: ApTyp) => {
      console.debug("dlg closed");
      console.dir(result);
      if (result) {
        this.adminService.saveAptyp({ aptyp: result, del: false });
      }
    });
  }

  protected handleDelete(aptyp: ApTyp) {
    void this.askDelete(
      "AP-Typ löschen",
      `Soll der Arbeitsplatz-Typ "${aptyp.bezeichnung}" gelöscht werden?`
    ).then((result) => {
      if (result) {
        console.debug("del AP-Typ");
        this.adminService.saveAptyp({ aptyp: aptyp, del: true });
      }
    });
  }

  protected getTableData(): ApTyp[] {
    this.dataService.apTypDeps();
    return this.dataService.aptypList;
  }

  protected buildColumns() {
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
}
