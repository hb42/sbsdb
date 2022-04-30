import { Component, HostBinding } from "@angular/core";
import { AdminService } from "../admin.service";

@Component({
  selector: "sbsdb-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  constructor(public adminService: AdminService) {
    //no op
  }
}
