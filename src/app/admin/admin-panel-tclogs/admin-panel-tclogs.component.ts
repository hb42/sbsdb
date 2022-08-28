import { Component, OnInit } from "@angular/core";
import { AdminService } from "../admin.service";

@Component({
  selector: "sbsdb-admin-panel-tclogs",
  templateUrl: "./admin-panel-tclogs.component.html",
  styleUrls: ["./admin-panel-tclogs.component.scss"],
})
export class AdminPanelTclogsComponent implements OnInit {
  constructor(public adminService: AdminService) {
    console.debug("c'tor AdminPanelTclogsComponent");
  }

  public log = "";

  ngOnInit(): void {
    this.adminService.getTcLogs().subscribe((val) => (this.log = val as string));
  }
}
