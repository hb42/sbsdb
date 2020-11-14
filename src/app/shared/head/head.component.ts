import {
  AfterViewInit,
  Component,
  HostBinding,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ArbeitsplatzService } from "../../ap/arbeitsplatz.service";
import { ConfigService } from "../config/config.service";
import { NavigationService } from "../navigation.service";

@Component({
  selector: "sbsdb-head",
  templateUrl: "./head.component.html",
  styleUrls: ["./head.component.scss"],
})
export class HeadComponent implements OnInit, AfterViewInit {
  @HostBinding("attr.class") public cssClass = "flex-panel";

  @ViewChild("menubtn") public menuBtn;

  @ViewChild("apmenu", { static: true }) public apmenu;
  @ViewChild("hwmenu", { static: true }) public hwmenu;
  @ViewChild("admenu", { static: true }) public admenu;

  public navLinks = [
    { path: "/ap", label: "Arbeitsplätze", key: "a", menu: null },
    { path: "/hw", label: "Hardware", key: "h", menu: null },
    { path: "/admin", label: "Admin", key: "d", menu: null },
  ];

  public search: string;

  constructor(
    private router: Router,
    public navigationService: NavigationService,
    public configService: ConfigService,
    public apService: ArbeitsplatzService
  ) {}

  @HostListener("document:keydown", ["$event"])
  public handleKeyboardEvent(event: KeyboardEvent) {
    if (event.altKey) {
      this.navLinks.forEach((nav) => {
        if (nav.key === event.key) {
          console.debug("KEYBOARD EVENT alt." + event.key);
          if (this.navigationService.isPage(nav.path)) {
            console.debug("on page");
            console.dir(this.menuBtn);
            // eslint-disable-next-line no-underscore-dangle
            this.menuBtn._elementRef.nativeElement.click();
          } else {
            console.debug("navigate");
            this.navigationService.navigate(nav.path);
          }
          event.preventDefault();
          event.stopPropagation();
        }
      });
    }
  }

  public ngOnInit() {
    // noop
  }

  public ngAfterViewInit(): void {
    this.navLinks[0].menu = this.apmenu;
    this.navLinks[1].menu = this.hwmenu;
    this.navLinks[2].menu = this.admenu;
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
