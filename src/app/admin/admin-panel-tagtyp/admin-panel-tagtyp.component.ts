import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ADM_TAGTYP_PATH } from "../../const";
import { DataService } from "../../shared/data.service";
import { TagTyp } from "../../shared/model/tagTyp";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { BaseSvzPanelComponent } from "../base-svz-panel.component";
import { EditTagtypDialogComponent } from "../edit-tagtyp-dialog/edit-tagtyp-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-tagtyp",
  templateUrl: "./admin-panel-tagtyp.component.html",
  styleUrls: ["./admin-panel-tagtyp.component.scss"],
})
export class AdminPanelTagtypComponent extends BaseSvzPanelComponent<
  AdminPanelTagtypComponent,
  TagTyp
> {
  public pagename = ADM_TAGTYP_PATH;

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    super(dataService, adminService, dialog);
    console.debug("c'tor AdminPanelAptypComponent");

    this.notificationHandler = this.dataService.tagtypListChanged.subscribe(() => {
      this.changeDebug();
    });
    this.dataService.apkatList.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
  }

  protected handleChangeOrNew(tagtyp: TagTyp) {
    if (!tagtyp) {
      tagtyp = {
        id: 0,
        bezeichnung: "",
        param: "",
        flag: 0,
        apKategorieId: null,
        apkategorie: "",
      };
    }
    const dialogRef = this.dialog.open(EditTagtypDialogComponent, { data: tagtyp });
    dialogRef.afterClosed().subscribe((result: TagTyp) => {
      if (result) {
        this.adminService.saveTagtyp({ tagtyp: result, del: false });
      }
    });
  }

  protected handleDelete(tagtyp: TagTyp) {
    void this.askDelete(
      "TAG-Typ löschen",
      `Soll der TAG-Typ "${tagtyp.bezeichnung}" gelöscht werden?`
    ).then((result) => {
      if (result) {
        this.adminService.saveTagtyp({ tagtyp: tagtyp, del: true });
      }
    });
  }

  protected getTableData(): TagTyp[] {
    this.dataService.tagTypDeps();
    return this.dataService.tagTypList;
  }

  protected buildColumns() {
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
}
