import { Component, HostBinding } from "@angular/core";
import { ArbeitsplatzService } from "../../ap/arbeitsplatz.service";
import { ConfigService } from "../config/config.service";

@Component({
  selector: "sbsdb-foot",
  templateUrl: "./foot.component.html",
  styleUrls: ["./foot.component.scss"],
})
export class FootComponent {
  @HostBinding("attr.class") public cssClass = "flex-panel";

  // TODO apService muss hier wieder raus - Footer notwendig?
  constructor(public configService: ConfigService, public apService: ArbeitsplatzService) {}
}
