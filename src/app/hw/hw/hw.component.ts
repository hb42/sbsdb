import { Component, HostBinding, OnInit } from "@angular/core";

@Component({
             selector   : "sbsdb-hw",
             templateUrl: "./hw.component.html",
             styleUrls  : ["./hw.component.scss"]
           })
export class HwComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  public leftPaneWidth: string;
  public leftPaneMinWidth: string;
  public centerPaneWidth: string;
  public centerPaneMinWidth: string;

  constructor() {
    console.debug("c'tor HwComponent");
  }

  ngOnInit() {
    console.debug("onInit HwComponent");
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";
  }

}
