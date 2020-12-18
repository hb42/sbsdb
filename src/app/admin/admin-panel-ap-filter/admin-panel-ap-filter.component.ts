import { Component, HostBinding } from "@angular/core";
import { ApFilterService } from "../../ap/ap-filter.service";

@Component({
  selector: "sbsdb-admin-panel-ap-filter",
  templateUrl: "./admin-panel-ap-filter.component.html",
  styleUrls: ["./admin-panel-ap-filter.component.scss"],
})
export class AdminPanelApFilterComponent {
  @HostBinding("attr.class") public cssClass = "flex-content";
  constructor(public apFilter: ApFilterService) {}
}
