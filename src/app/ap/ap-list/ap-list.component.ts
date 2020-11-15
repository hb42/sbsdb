import { Component, HostBinding } from "@angular/core";
import { ArbeitsplatzService } from "../arbeitsplatz.service";

@Component({
  selector: "sbsdb-ap-list",
  templateUrl: "./ap-list.component.html",
  styleUrls: ["./ap-list.component.scss"],
})
export class ApListComponent {
  @HostBinding("attr.class") public cssClass = "flex-content";

  constructor(public apService: ArbeitsplatzService) {}
}
