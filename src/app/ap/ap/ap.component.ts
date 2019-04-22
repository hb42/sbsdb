import { Component, HostBinding, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ConfigService } from "../../shared/config/config.service";

@Component({
             selector   : "sbsdb-ap",
             templateUrl: "./ap.component.html",
             styleUrls  : ["./ap.component.scss"]
           })
export class ApComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  public leftPaneWidth: string;
  public leftPaneMinWidth: string;
  public centerPaneWidth: string;
  public centerPaneMinWidth: string;

  constructor(private route: ActivatedRoute, private config: ConfigService) {
    console.debug("c'tor ApComponent");
  }

  ngOnInit() {
    const par = this.route.snapshot.params["tree"];
    console.debug("onInit ApComponent par=" + par);
    if (this.config.getUser()) {
      console.debug("onInit UserSession path=" + this.config.getUser().path);
    } else {
      console.debug("onInit UserSession is undefined");
    }

    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

  }

}
