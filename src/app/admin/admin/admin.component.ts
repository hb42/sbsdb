import { Component, HostBinding, OnInit } from "@angular/core";
import { environment } from "../../../environments/environment";
import { AdminService } from "../admin.service";

@Component({
  selector: "sbsdb-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  constructor(public adminService: AdminService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  ngOnInit(): void {
    this.adminService.openChildPage(this.adminService.userSettings.adminPath);
  }
}
