import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { ADM_HWTYP_PATH } from "../../const";
import { DataService } from "../../shared/data.service";
import { HwTyp } from "../../shared/model/hw-typ";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { BaseSvzPanelComponent } from "../base-svz-panel.component";
import { EditHwtypDialogComponent } from "../edit-hwtyp-dialog/edit-hwtyp-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-hwtyp",
  templateUrl: "./admin-panel-hwtyp.component.html",
  styleUrls: ["./admin-panel-hwtyp.component.scss"],
})
export class AdminPanelHwtypComponent extends BaseSvzPanelComponent<
  AdminPanelHwtypComponent,
  HwTyp
> {
  public pagename = ADM_HWTYP_PATH;

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    super(dataService, adminService, dialog);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);

    this.notificationHandler = this.dataService.hwtypListChanged.subscribe(() => {
      this.changeDebug();
    });
    this.dataService.apkatList.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
  }

  protected getTableData(): HwTyp[] {
    this.dataService.hwtypDeps();
    return this.dataService.hwtypList;
  }

  protected handleChangeOrNew(hwtyp: HwTyp) {
    if (!hwtyp) {
      hwtyp = {
        id: 0,
        bezeichnung: "",
        flag: 0,
        apKategorieId: null,
        apkategorie: "",
      };
    }
    const dialogRef = this.dialog.open(EditHwtypDialogComponent, { data: hwtyp });
    dialogRef.afterClosed().subscribe((result: HwTyp) => {
      if (result) {
        this.adminService.saveHwtyp({ hwtyp: result, del: false });
      }
    });
  }

  protected handleDelete(hwtyp: HwTyp) {
    void this.askDelete(
      "HW-Typ löschen",
      `Soll der Hardware-Typ "${hwtyp.bezeichnung}" gelöscht werden?`
    ).then((result) => {
      if (result) {
        this.adminService.saveHwtyp({ hwtyp: hwtyp, del: true });
      }
    });
  }

  protected buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelHwtypComponent, HwTyp>(
        this,
        "id",
        () => "ID",
        () => "id",
        () => "id",
        (a: HwTyp) => a.id.toString(10),
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
      new SbsdbColumn<AdminPanelHwtypComponent, HwTyp>(
        this,
        "hwtyp",
        () => "HW-Typ",
        () => "bezeichnung",
        () => "bezeichnung",
        (a: HwTyp) => a.bezeichnung,
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
      new SbsdbColumn<AdminPanelHwtypComponent, HwTyp>(
        this,
        "flag",
        () => "Flag",
        () => "flag",
        () => "flag",
        (a: HwTyp) => a.flag.toString(10),
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
      new SbsdbColumn<AdminPanelHwtypComponent, HwTyp>(
        this,
        "apkategorie",
        () => "AP-Kategorie",
        () => "apkategorie",
        () => "apkategorie",
        (a: HwTyp) => a.apkategorie,
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
      new SbsdbColumn<AdminPanelHwtypComponent, HwTyp>(
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
