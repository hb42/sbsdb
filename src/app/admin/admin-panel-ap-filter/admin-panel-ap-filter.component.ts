import { Component, HostBinding } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ApFilterService } from "../../ap/ap-filter.service";

@Component({
  selector: "sbsdb-admin-panel-ap-filter",
  templateUrl: "./admin-panel-ap-filter.component.html",
  styleUrls: ["./admin-panel-ap-filter.component.scss"],
})
export class AdminPanelApFilterComponent {
  @HostBinding("attr.class") public cssClass = "flex-content";
  constructor(public apFilter: ApFilterService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
