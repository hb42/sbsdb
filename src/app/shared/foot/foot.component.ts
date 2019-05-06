import {Component, HostBinding, OnInit} from "@angular/core";
import { ConfigService } from "../config/config.service";

@Component({
             selector   : "sbsdb-foot",
             templateUrl: "./foot.component.html",
             styleUrls  : ["./foot.component.scss"]
           })
export class FootComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel";

  constructor(public configService: ConfigService) {
  }

  ngOnInit() {
  }

}
