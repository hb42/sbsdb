import { AfterViewInit, Component, HostBinding, HostListener, ViewChild } from "@angular/core";
import { MatMenu } from "@angular/material/menu";
import { Router } from "@angular/router";
import { ADM_PATH, AP_PATH, HW_PATH } from "../../app-routing-const";
import { ConfigService } from "../config/config.service";
import { NavigationService } from "../navigation.service";

@Component({
  selector: "sbsdb-head",
  templateUrl: "./head.component.html",
  styleUrls: ["./head.component.scss"],
})
export class HeadComponent implements AfterViewInit {
  @HostBinding("attr.class") public cssClass = "flex-panel";

  @ViewChild("menubtn") public menuBtn;

  @ViewChild("apmenu", { static: true }) public apmenu: MatMenu;
  @ViewChild("hwmenu", { static: true }) public hwmenu: MatMenu;
  @ViewChild("admenu", { static: true }) public admenu: MatMenu;

  public navLinks = [
    { path: "/" + AP_PATH, label: "Arbeitsplätze", key: "a", menu: null },
    { path: "/" + HW_PATH, label: "Hardware", key: "h", menu: null },
    { path: "/" + ADM_PATH, label: "Admin", key: "d", menu: null },
  ];

  public search: string;

  constructor(
    private router: Router,
    public navigationService: NavigationService,
    public configService: ConfigService
  ) {}

  @HostListener("document:keydown", ["$event"])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.altKey) {
      this.navLinks.forEach((nav) => {
        if (nav.key === event.key) {
          console.debug("KEYBOARD EVENT alt." + event.key);
          if (this.navigationService.isPage(nav.path)) {
            console.debug("on page");
            console.dir(this.menuBtn);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            this.menuBtn._elementRef.nativeElement.click();
          } else {
            console.debug("navigate");
            this.navigationService.navigateByUrl(nav.path);
          }
          event.preventDefault();
          event.stopPropagation();
        }
      });
    }
  }

  public ngAfterViewInit(): void {
    this.navLinks[0].menu = this.apmenu;
    this.navLinks[1].menu = this.hwmenu;
    this.navLinks[2].menu = this.admenu;
  }

  public navigate(target: string): void {
    if (!this.navigationService.isPage(target)) {
      void this.router.navigate([target]);
    }
  }

  public about(): void {
    // TODO dialog starten
    throw new SyntaxError("Test exception");
  }

  public backBtn(): void {
    history.back();
  }

  public forwardBtn(): void {
    history.forward();
  }
}
