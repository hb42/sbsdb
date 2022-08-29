import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { ADM_VLAN_PATH } from "../../const";
import { DataService } from "../../shared/data.service";
import { IpHelper } from "../../shared/ip-helper";
import { Vlan } from "../../shared/model/vlan";
import { ColumnType } from "../../shared/table/column-type.enum";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { AdminService } from "../admin.service";
import { BaseSvzPanelComponent } from "../base-svz-panel.component";
import { EditVlanDialogComponent } from "../edit-vlan-dialog/edit-vlan-dialog.component";

@Component({
  selector: "sbsdb-admin-panel-vlan",
  templateUrl: "./admin-panel-vlan.component.html",
  styleUrls: ["./admin-panel-vlan.component.scss"],
})
export class AdminPanelVlanComponent extends BaseSvzPanelComponent<AdminPanelVlanComponent, Vlan> {
  public pagename = ADM_VLAN_PATH;

  constructor(
    public dataService: DataService,
    public adminService: AdminService,
    protected dialog: MatDialog
  ) {
    super(dataService, adminService, dialog);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);

    this.notificationHandler = this.dataService.vlanListChanged.subscribe(() => {
      this.changeDebug();
    });
  }

  protected getTableData(): Vlan[] {
    this.dataService.vlanDeps();
    return this.dataService.vlanList;
  }

  protected handleChangeOrNew(vl: Vlan) {
    if (!vl) {
      vl = {
        id: 0,
        bezeichnung: "",
        ip: 0,
        netmask: 0,
      };
    }
    const dialogRef = this.dialog.open(EditVlanDialogComponent, { data: vl });
    dialogRef.afterClosed().subscribe((result: Vlan) => {
      if (result) {
        this.adminService.saveVlan({ vlan: vl, del: false });
      }
    });
  }

  protected handleDelete(vl: Vlan) {
    void this.askDelete("Vlan löschen", `Soll das Vlan "${vl.bezeichnung}" gelöscht werden?`).then(
      (result) => {
        if (result) {
          this.adminService.saveVlan({ vlan: vl, del: true });
        }
      }
    );
  }

  protected buildColumns() {
    this.columns.push(
      new SbsdbColumn<AdminPanelVlanComponent, Vlan>(
        this,
        "id",
        () => "ID",
        () => "id",
        () => "id",
        (v: Vlan) => v.id.toString(10),
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
      new SbsdbColumn<AdminPanelVlanComponent, Vlan>(
        this,
        "vlan",
        () => "Bezeichnung",
        () => "bezeichnung",
        () => "bezeichnung",
        (v: Vlan) => v.bezeichnung,
        "",
        true,
        1,
        ColumnType.STRING,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelVlanComponent, Vlan>(
        this,
        "ip",
        () => "IP",
        () => "ip",
        () => "ip",
        (v: Vlan) => IpHelper.getIpString(v.ip),
        "",
        true,
        2,
        ColumnType.NUMBER,
        null,
        null,
        true,
        "S"
      )
    );
    this.columns.push(
      new SbsdbColumn<AdminPanelVlanComponent, Vlan>(
        this,
        "nm",
        () => "Netmask",
        () => "netmask",
        () => "netmask",
        (v: Vlan) => IpHelper.getIpString(v.netmask),
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
  }
}
