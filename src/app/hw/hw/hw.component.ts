import { Component, HostBinding, OnInit } from "@angular/core";
import { ConfigService } from "../../shared/config/config.service";

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

  constructor(private config: ConfigService) {
    console.debug("c'tor HwComponent");
    this.config.saveConfig("test2", 42);
  }

  ngOnInit() {
    console.debug("onInit HwComponent");
    // this.config.getUser().path = "TEST";
    this.config.saveConfig("test.entry", {a: 10, b: "test"});
    console.debug("config#2 " + this.config.getConfig("test2"));
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";
  }

}
