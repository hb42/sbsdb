import { Component, OnInit } from "@angular/core";
import { AdminService } from "../admin.service";

@Component({
  selector: "sbsdb-admin-panel-tclogs",
  templateUrl: "./admin-panel-tclogs.component.html",
  styleUrls: ["./admin-panel-tclogs.component.scss"],
})
export class AdminPanelTclogsComponent implements OnInit {
  constructor(public adminService: AdminService) {}

  public log = "";

  ngOnInit(): void {
    this.adminService.getTcLogs().subscribe((val) => (this.log = val as string));
  }
}
