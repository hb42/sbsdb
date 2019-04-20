import { Component, HostBinding, OnInit } from "@angular/core";

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

  constructor() {
  }

  ngOnInit() {
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

  }

}
