import {Component, HostBinding, OnInit} from "@angular/core";
import { ConfigService } from "../config/config.service";
import {ArbeitsplatzService} from "../../ap/arbeitsplatz.service";

@Component({
             selector   : "sbsdb-foot",
             templateUrl: "./foot.component.html",
             styleUrls  : ["./foot.component.scss"]
           })
export class FootComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel";

  // TODO apService muss hier wieder raus - Footer notwendig?
  constructor(public configService: ConfigService, public apService: ArbeitsplatzService) {
  }

  ngOnInit() {
  }

}
