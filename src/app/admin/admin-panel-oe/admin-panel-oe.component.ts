import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ADM_OE_PATH } from "../../const";
import { DataService } from "../../shared/data.service";
import { StringCompare } from "../../shared/helper";
import { Betrst } from "../../shared/model/betrst";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { BaseSvzPanelComponent } from "../base-svz-panel.component";
import { EditOeDialogComponent } from "../edit-oe-dialog/edit-oe-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-oe",
  templateUrl: "./admin-panel-oe.component.html",
  styleUrls: ["./admin-panel-oe.component.scss"],
})
export class AdminPanelOeComponent extends BaseSvzPanelComponent<AdminPanelOeComponent, Betrst> {
  public pagename = ADM_OE_PATH;

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor AdminPanelOeComponent");
    super(dataService, adminService, dialog);

    this.notificationHandler = this.dataService.oeListChanged.subscribe(() => {
      this.changeDebug();
    });
    this.dataService.adresseList.sort((a, b) =>
      StringCompare(a.ort + a.strasse, b.ort + b.strasse)
    );
    this.dataService.bstList.sort((a, b) => StringCompare(a.fullname, b.fullname));
  }

  protected getTableData(): Betrst[] {
    this.dataService.oeDeps();
    return this.dataService.bstList;
  }

  protected handleChangeOrNew(oe: Betrst) {
    if (!oe) {
      oe = {
        bstId: 0,
        betriebsstelle: "",
        bstNr: 0,
        tel: "",
        oeff: "",
        ap: false,
        parentId: null,
        adresseId: null,
        adresse: undefined,
        children: [],
        fullname: "",
        hierarchy: "",
      };
    }
    const dialogRef = this.dialog.open(EditOeDialogComponent, { data: oe });
    dialogRef.afterClosed().subscribe((result: Betrst) => {
      if (result) {
        this.save(result, false);
      }
    });
  }

  protected handleDelete(oe: Betrst) {
    void this.askDelete("OE löschen", `Soll die OE "${oe.fullname}" gelöscht werden?`).then(
      (result) => {
        if (result) {
          this.save(oe, true);
        }
      }
    );
  }

  private save(oe: Betrst, del: boolean) {
    // notwendig, weil das originale Object Aerger beim Uebertragen zum Server macht
    const trans = new Betrst();
    trans.bstId = oe.bstId;
    trans.bstNr = oe.bstNr;
    trans.betriebsstelle = oe.betriebsstelle;
    trans.tel = oe.tel;
    trans.oeff = oe.oeff;
    trans.ap = oe.ap;
    trans.parentId = oe.parentId;
    trans.adresseId = oe.adresseId;
    this.adminService.saveOe({ oe: trans, del: del });
  }

  protected buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "id",
        () => "ID",
        () => "bstId",
        () => "bstId",
        (b: Betrst) => b.bstId.toString(10),
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
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "oenr",
        () => "OE-Nr.",
        () => "bstNr",
        () => "bstNr",
        (b: Betrst) => `000${b.bstNr}`.slice(-3),
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
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "oe",
        () => "OE",
        () => "betriebsstelle",
        () => "betriebsstelle",
        (b: Betrst) => b.betriebsstelle,
        "",
        true,
        2,
        ColumnType.STRING,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "oeff",
        () => "Öffnungszeiten",
        () => "oeff",
        () => "oeff",
        (b: Betrst) => b.oeff,
        "",
        true,
        5,
        ColumnType.STRING,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "ap",
        () => "AP",
        () => "ap",
        () => "ap",
        (b: Betrst) => (b.ap ? "ja" : "nein"),
        "",
        true,
        6,
        ColumnType.NUMBER,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "adresse",
        () => "Adresse",
        () => ["adresse.plz", "adresse.ort", "adresse.strasse", "adresse.hausnr"],
        () => "adresse.ort",
        (b: Betrst) =>
          b.adresse.plz && b.adresse.ort
            ? b.adresse.plz +
              " " +
              b.adresse.ort +
              ", " +
              b.adresse.strasse +
              " " +
              b.adresse.hausnr
            : "---",
        "",
        true,
        7,
        ColumnType.STRING,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "ueber",
        () => "Übergeordnete OE",
        () => "parent.fullname",
        () => "parent.fullname",
        // (b: Betrst) => this.dataService.hierachyDisplay(b.hierarchy),
        (b: Betrst) => (b.parent.fullname ? b.parent.fullname : "---"),
        "",
        true,
        8,
        ColumnType.STRING,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "hier",
        () => "Hierarchie",
        () => "hierarchy",
        () => "hierarchy",
        (b: Betrst) => b.hierarchy,
        "",
        false,
        0,
        ColumnType.STRING,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "adrid",
        () => "Adresse-ID",
        () => "adresseId",
        () => "adresseId",
        (b: Betrst) => b.adresseId.toString(10),
        "",
        false,
        0,
        ColumnType.NUMBER,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelOeComponent, Betrst>(
        this,
        "parentid",
        () => "Parent-ID",
        () => "bezeichnung",
        () => "bezeichnung",
        (b: Betrst) => (b.parentId ? b.parentId.toString(10) : "0"),
        "",
        false,
        0,
        ColumnType.NUMBER,
        null,
        null,
        true,
        "S"
      )
    );
  }
}
