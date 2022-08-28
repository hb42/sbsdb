import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ADM_APKAT_PATH } from "../../const";
import { DataService } from "../../shared/data.service";
import { ApKategorie } from "../../shared/model/ap-kategorie";
import { ApTyp } from "../../shared/model/ap-typ";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { BaseSvzPanelComponent } from "../base-svz-panel.component";
import { EditApkategorieDialogComponent } from "../edit-apkategorie-dialog/edit-apkategorie-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-apkategorie",
  templateUrl: "./admin-panel-apkategorie.component.html",
  styleUrls: ["./admin-panel-apkategorie.component.scss"],
})
export class AdminPanelApkategorieComponent extends BaseSvzPanelComponent<
  AdminPanelApkategorieComponent,
  ApKategorie
> {
  public pagename = ADM_APKAT_PATH;

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor AdminPanelApkategorieComponent");
    super(dataService, adminService, dialog);

    this.notificationHandler = this.dataService.apkategorieListChanged.subscribe(() => {
      this.changeDebug();
    });
  }

  protected getTableData(): ApKategorie[] {
    this.dataService.apKategorieDeps();
    return this.dataService.apkatList;
  }

  protected handleChangeOrNew(apkategorie: ApKategorie) {
    if (!apkategorie) {
      apkategorie = {
        id: 0,
        bezeichnung: "",
        flag: 0,
      };
    }
    const dialogRef = this.dialog.open(EditApkategorieDialogComponent, { data: apkategorie });
    dialogRef.afterClosed().subscribe((result: ApKategorie) => {
      if (result) {
        this.adminService.saveApkategorie({ apkategorie: result, del: false });
      }
    });
  }

  protected handleDelete(apkategorie: ApKategorie) {
    void this.askDelete(
      "AP-Kategorie löschen",
      `Soll die AP-Kategorie "${apkategorie.bezeichnung}" gelöscht werden?`
    ).then((result) => {
      if (result) {
        this.adminService.saveApkategorie({ apkategorie: apkategorie, del: true });
      }
    });
  }

  protected buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelApkategorieComponent, ApKategorie>(
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
      new SbsdbColumn<AdminPanelApkategorieComponent, ApKategorie>(
        this,
        "apkat",
        () => "AP-Kategorie",
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
      new SbsdbColumn<AdminPanelApkategorieComponent, ApKategorie>(
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
  }
}
