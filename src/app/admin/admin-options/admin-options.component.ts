import { Component, HostBinding } from "@angular/core";
import { ADM_FILTER_PATH, ADM_OPTIONS_PATH, ADM_PATH } from "../../const";
import { NavigationService } from "../../shared/navigation.service";

@Component({
  selector: "sbsdb-admin-options",
  templateUrl: "./admin-options.component.html",
  styleUrls: ["./admin-options.component.scss"],
})
export class AdminOptionsComponent {
  @HostBinding("attr.class") public cssClass = "flex-content";
  public admApFilterPath = "/" + ADM_PATH + "/" + ADM_FILTER_PATH;
  public admConfig = "/" + ADM_PATH + "/" + ADM_OPTIONS_PATH;

  constructor(public navigationService: NavigationService) {}
}
