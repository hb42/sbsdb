import { AfterViewInit, Component, HostBinding, HostListener, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatMenu } from "@angular/material/menu";
import { Router } from "@angular/router";
import { ADM_PATH, AP_PATH, CONF_PATH, HW_PATH } from "../../app-routing-const";
import { AboutDialogComponent } from "../about-dialog/about-dialog.component";
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
    { path: "/" + AP_PATH, label: "Arbeitsplätze", key: "a", menu: null, icon: "desktop_mac" },
    { path: "/" + HW_PATH, label: "Hardware", key: "h", menu: null, icon: "devices" },
    {
      path: "/" + CONF_PATH,
      label: "Konfigurationen",
      key: "k",
      menu: null,
      icon: "important_devices",
    },
    { path: "/" + ADM_PATH, label: "Admin", key: "d", menu: null, icon: "settings" },
  ];

  public selected = "";

  public search: string;

  constructor(
    private router: Router,
    public navigationService: NavigationService,
    public configService: ConfigService,
    public dialog: MatDialog
  ) {}

  @HostListener("document:keydown", ["$event"])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.altKey) {
      this.navLinks.forEach((nav) => {
        if (nav.key === event.key) {
          console.debug("KEYBOARD EVENT alt." + event.key);
          if (this.navigationService.isPage(nav.path)) {
            console.debug("on page");
            if (this.menuBtn) {
              console.dir(this.menuBtn);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
              this.menuBtn._elementRef.nativeElement.click(); // TODO noch sinnvoll?
            } else {
              console.debug("no this.menuBtn");
            }
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

  public btnTitle(): string {
    let rc = "";
    this.navLinks.forEach((nav) => {
      if (this.navigationService.isPage(nav.path)) {
        rc = nav.label;
      }
    });
    return rc;
  }
  public btnTitleIcon(): string {
    let rc = "";
    this.navLinks.forEach((nav) => {
      if (this.navigationService.isPage(nav.path)) {
        rc = nav.icon;
      }
    });
    return rc;
  }

  public navigate(target: string): void {
    if (!this.navigationService.isPage(target)) {
      void this.router.navigate([target]);
    }
  }

  public test(rla: unknown, link: unknown): void {
    console.debug("### Test main button");
    console.dir(rla);
    console.dir(link);
  }

  public about(): void {
    // throw new SyntaxError("Test exception");
    // TODO dialog starten
    this.dialog.open(AboutDialogComponent);

    // Dialog-Ergebnis
    // dialogRef.afterClosed().subscribe((result: ApEditDialogData) => {
    //   console.debug("dialog closed");
    //   console.dir(result);
    //   if (result) {
    //     this.saveDlg(result);
    //   }
    // });
  }

  public backBtn(): void {
    history.back();
  }

  public forwardBtn(): void {
    history.forward();
  }
}
