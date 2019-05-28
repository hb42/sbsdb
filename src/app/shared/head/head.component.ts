import {Component, HostBinding, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {ArbeitsplatzService} from "../../ap/arbeitsplatz.service";
import {ConfigService} from "../config/config.service";
import {NavigationService} from "../navigation.service";

@Component({
             selector   : "sbsdb-head",
             templateUrl: "./head.component.html",
             styleUrls  : ["./head.component.scss"]
           })
export class HeadComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel";

  public navLinks = [
    {path: "/ap", label: "Arbeitsplätze"},
    {path: "/hw", label: "Hardware"},
    {path: "/admin", label: "Admin"},
  ];

  public search: string;

  constructor(private router: Router, public navigationService: NavigationService,
              public configService: ConfigService,
              public apService: ArbeitsplatzService
  ) {
  }

  ngOnInit() {
    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.key === "a") {
        console.debug("KEYBOARD EVENT altA");
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  public navigate(target: string) {
    if (!this.navigationService.isPage(target)) {
      this.router.navigate([target]);
    }
  }

  public backBtn() {
    history.back();
  }

  public forwardBtn() {
    history.forward();
  }

}
