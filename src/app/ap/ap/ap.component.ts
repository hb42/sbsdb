import { Component, HostBinding, OnInit } from "@angular/core";
import {ActivatedRoute, ParamMap} from "@angular/router";
import { ConfigService } from "../../shared/config/config.service";
import {switchMap} from "rxjs/operators";
import {Observable, Subscription} from "rxjs";

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

  private urlParams: Observable<ParamMap>;

  constructor(private route: ActivatedRoute, private config: ConfigService) {
    console.debug("c'tor ApComponent");
  }

  ngOnInit() {
    const par = this.route.snapshot.params["tree"];
    console.debug("onInit ApComponent par=" + par);

    /*  verschiedene parameter
    https://stackoverflow.com/questions/49738911/angular-5-routing-to-same-component-but-different-param-not-working
     */
    this.urlParams = this.route.paramMap;

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
