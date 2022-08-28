import { Component, OnInit } from "@angular/core";
import { environment } from "../../../environments/environment";
import { AdminService } from "../admin.service";

@Component({
  selector: "sbsdb-admin-panel-tclogs",
  templateUrl: "./admin-panel-tclogs.component.html",
  styleUrls: ["./admin-panel-tclogs.component.scss"],
})
export class AdminPanelTclogsComponent implements OnInit {
  constructor(public adminService: AdminService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public log = "";

  ngOnInit(): void {
    this.adminService.getTcLogs().subscribe((val) => (this.log = val as string));
  }
}
