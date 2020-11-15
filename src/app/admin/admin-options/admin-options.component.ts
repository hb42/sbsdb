import { Component, HostBinding } from "@angular/core";
import { AppRoutingModule } from "../../app-routing.module";
import { NavigationService } from "../../shared/navigation.service";

@Component({
  selector: "sbsdb-admin-options",
  templateUrl: "./admin-options.component.html",
  styleUrls: ["./admin-options.component.scss"],
})
export class AdminOptionsComponent {
  @HostBinding("attr.class") public cssClass = "flex-content";
  public admApFilterPath = "/" + AppRoutingModule.admApfilterPath;
  public admConfig = "/" + AppRoutingModule.admConfig;

  constructor(public navigationService: NavigationService) {}
}
