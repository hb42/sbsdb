import {Component, OnInit} from "@angular/core";
import {ArbeitsplatzService} from "../arbeitsplatz.service";

@Component({
             selector   : "sbsdb-ap-filter",
             templateUrl: "./ap-filter.component.html",
             styleUrls  : ["./ap-filter.component.scss"]
           })
export class ApFilterComponent implements OnInit {

  constructor(public apService: ArbeitsplatzService) {
    console.debug("c'tor ApFilterComponent");
  }

  ngOnInit() {
  }

}
