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
  }

  ngOnInit() {
    console.debug("onInit HwComponent");
    this.config.saveConfig("test2", 42).then((val) => {
      console.debug("save config test2: " + val);
      this.config.getConfig("test2").then((val2) => {
        console.debug("get config test2: " + val2);
      });
    });
    this.config.saveConfig("test.entry", {a: 10, b: "test"}).then((rc) => {
      console.debug("save config test.entry");
      console.dir(rc);
    });
    // this.config.getUser().path = "TEST";
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";
  }

}
