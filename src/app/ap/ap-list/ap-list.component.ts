import { Component, OnInit } from "@angular/core";
import {ArbeitsplatzService} from "../arbeitsplatz.service";

@Component({
             selector   : "sbsdb-ap-list",
             templateUrl: "./ap-list.component.html",
             styleUrls  : ["./ap-list.component.scss"]
           })
export class ApListComponent implements OnInit {

  constructor(public apService: ArbeitsplatzService) {
  }

  ngOnInit() {
  }

}
