import { Component, HostBinding, OnInit } from "@angular/core";
import { AdminService } from "../admin.service";

@Component({
  selector: "sbsdb-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  constructor(public adminService: AdminService) {
    console.debug("c'tor AdminComponent");
  }

  ngOnInit(): void {
    this.adminService.openChildPage(this.adminService.userSettings.adminPath);
  }
}
