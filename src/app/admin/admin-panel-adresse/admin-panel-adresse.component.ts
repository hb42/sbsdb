import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ADM_ADR_PATH } from "../../const";
import { DataService } from "../../shared/data.service";
import { Adresse } from "../../shared/model/adresse";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { BaseSvzPanelComponent } from "../base-svz-panel.component";
import { EditAdresseDialogComponent } from "../edit-adresse-dialog/edit-adresse-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-adresse",
  templateUrl: "./admin-panel-adresse.component.html",
  styleUrls: ["./admin-panel-adresse.component.scss"],
})
export class AdminPanelAdresseComponent extends BaseSvzPanelComponent<
  AdminPanelAdresseComponent,
  Adresse
> {
  public pagename = ADM_ADR_PATH;

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor AdminPanelAdresseComponent");
    super(dataService, adminService, dialog);

    this.notificationHandler = this.dataService.adresseListChanged.subscribe(() => {
      this.changeDebug();
    });
  }

  protected getTableData(): Adresse[] {
    this.dataService.adresseDeps();
    return this.dataService.adresseList;
  }

  protected handleChangeOrNew(adresse: Adresse) {
    if (!adresse) {
      adresse = {
        id: 0,
        plz: "",
        ort: "",
        strasse: "",
        hausnr: "",
      };
    }
    const dialogRef = this.dialog.open(EditAdresseDialogComponent, { data: adresse });
    dialogRef.afterClosed().subscribe((result: Adresse) => {
      console.debug("dlg closed");
      console.dir(result);
      if (result) {
        this.adminService.saveAdresse({ adresse: result, del: false });
      }
    });
  }

  protected handleDelete(adresse: Adresse) {
    void this.askDelete(
      "Adresse löschen",
      `Soll die Adresse "${adresse.ort}, ${adresse.strasse} ${adresse.hausnr}" gelöscht werden?`
    ).then((result) => {
      if (result) {
        console.debug("del Adresse");
        this.adminService.saveAdresse({ adresse: adresse, del: true });
      }
    });
  }

  protected buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelAdresseComponent, Adresse>(
        this,
        "id",
        () => "ID",
        () => "id",
        () => "id",
        (a: Adresse) => a.id.toString(10),
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
      new SbsdbColumn<AdminPanelAdresseComponent, Adresse>(
        this,
        "plz",
        () => "PLZ",
        () => "plz",
        () => "plz",
        (a: Adresse) => a.plz,
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
      new SbsdbColumn<AdminPanelAdresseComponent, Adresse>(
        this,
        "ort",
        () => "Ort",
        () => "ort",
        () => "ort",
        (a: Adresse) => a.ort,
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
      new SbsdbColumn<AdminPanelAdresseComponent, Adresse>(
        this,
        "strasse",
        () => "Straße",
        () => "strasse",
        () => "strasse",
        (a: Adresse) => a.strasse,
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
      new SbsdbColumn<AdminPanelAdresseComponent, Adresse>(
        this,
        "hausnr",
        () => "Haus-Nr.",
        () => "hausnr",
        () => "hausnr",
        (a: Adresse) => a.hausnr,
        "",
        true,
        3,
        ColumnType.STRING,
        null,
        null,
        true,
        "S"
      )
    );
  }
}
