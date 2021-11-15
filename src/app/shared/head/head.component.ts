import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { Router } from "@angular/router";
import {
  ADM_PATH,
  AP_PATH,
  CONF_PATH,
  HW_PATH,
  KEY_ADM_PAGE,
  KEY_AP_PAGE,
  KEY_CSV,
  KEY_DEL_FILTER,
  KEY_EXT_FILTER,
  KEY_HW_PAGE,
  KEY_KONF_PAGE,
  KEY_MAIN_MENU,
  KEY_NEW,
} from "../../const";
import { AboutDialogComponent } from "../about-dialog/about-dialog.component";
import { ConfigService } from "../config/config.service";
import { UserSession } from "../config/user.session";
import { BaseFilterService } from "../filter/base-filter-service";
import { KeyboardListener } from "../keyboard-listener";
import { KeyboardService } from "../keyboard.service";
import { NavigationService } from "../navigation.service";

@Component({
  selector: "sbsdb-head",
  templateUrl: "./head.component.html",
  styleUrls: ["./head.component.scss"],
})
export class HeadComponent implements AfterViewInit, OnDestroy {
  @HostBinding("attr.class") public cssClass = "flex-panel";

  @ViewChild("mainMenuTrigger") menuTrigger: MatMenuTrigger;

  @Input() public filterService: BaseFilterService;
  @Input() public newTitle: string;
  @Input() public newElement: EventEmitter<void>;
  @Input() public mainMenu: MatMenu;

  public userSettings: UserSession;

  public navLinks = [
    {
      path: "/" + AP_PATH,
      label: "Arbeitsplätze",
      key: KEY_AP_PAGE,
      icon: "desktop_mac",
    },
    {
      path: "/" + HW_PATH,
      label: "Hardware",
      key: KEY_HW_PAGE,
      icon: "devices",
    },
    {
      path: "/" + CONF_PATH,
      label: "Konfigurationen",
      key: KEY_KONF_PAGE,
      icon: "important_devices",
    },
    {
      path: "/" + ADM_PATH,
      label: "Admin",
      key: KEY_ADM_PAGE,
      icon: "settings",
    },
  ];

  public selected = "";
  public search: string;

  private keyboardEvents: KeyboardListener[] = [];
  private ctrlKeyboardEvents: KeyboardListener[] = [];

  constructor(
    private router: Router,
    public navigationService: NavigationService,
    public configService: ConfigService,
    public dialog: MatDialog,
    private keyboardService: KeyboardService
  ) {
    this.userSettings = configService.getUser();
  }

  public ngAfterViewInit(): void {
    let listener: KeyboardListener;
    if (this.filterService) {
      listener = { trigger: new EventEmitter<void>(), key: KEY_EXT_FILTER };
      this.keyboardService.register(listener);
      listener.trigger.subscribe(() => this.filterService.toggleExtendedFilter());
      this.keyboardEvents.push(listener);

      listener = { trigger: new EventEmitter<void>(), key: KEY_DEL_FILTER };
      this.keyboardService.register(listener);
      listener.trigger.subscribe(() => this.filterService.resetFilters());
      this.keyboardEvents.push(listener);

      listener = { trigger: new EventEmitter<void>(), key: KEY_CSV };
      this.keyboardService.register(listener);
      listener.trigger.subscribe(() => void this.filterService.toCsv());
      this.keyboardEvents.push(listener);
    }
    if (this.newElement && this.userSettings.isAdmin) {
      listener = { trigger: new EventEmitter<void>(), key: KEY_NEW };
      this.keyboardService.register(listener);
      listener.trigger.subscribe(() => this.newBtnClick());
      this.keyboardEvents.push(listener);
    }
    if (this.mainMenu) {
      listener = { trigger: new EventEmitter<void>(), key: KEY_MAIN_MENU };
      this.keyboardService.register(listener, true);
      listener.trigger.subscribe(() => this.menuTrigger.toggleMenu());
      this.ctrlKeyboardEvents.push(listener);
    }

    this.navLinks.forEach((n) => {
      listener = { trigger: new EventEmitter<void>(), key: n.key };
      this.keyboardService.register(listener);
      this.keyboardEvents.push(listener);
      listener.trigger.subscribe(() => {
        if (!this.navigationService.isPage(n.path)) {
          console.debug("navigate");
          this.navigationService.navigateByUrl(n.path);
        } else {
          console.debug("on page");
        }
      });
    });
  }

  public ngOnDestroy(): void {
    console.debug("HeadComponent: unregister keyboard events");
    this.keyboardEvents.forEach((ke) => {
      this.keyboardService.unregister(ke.key);
      ke.trigger.unsubscribe();
    });
    this.ctrlKeyboardEvents.forEach((ke) => {
      this.keyboardService.unregister(ke.key, true);
      ke.trigger.unsubscribe();
    });
  }

  public newBtnClick(): void {
    if (this.newElement) {
      this.newElement.emit();
    }
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
