import { Component, OnInit } from "@angular/core";
import { ConfigService } from "../config/config.service";

@Component({
             selector   : "sbsdb-foot",
             templateUrl: "./foot.component.html",
             styleUrls  : ["./foot.component.scss"]
           })
export class FootComponent implements OnInit {

  constructor(public configService: ConfigService) {
  }

  ngOnInit() {
  }

}
