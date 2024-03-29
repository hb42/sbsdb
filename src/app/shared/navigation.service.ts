import { Location } from "@angular/common";
import { EventEmitter, Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router, UrlTree } from "@angular/router";
import { filter } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { ERROR_PATH } from "../const";
import { ConfigService } from "./config/config.service";

@Injectable({ providedIn: "root" })
export class NavigationService {
  public lastError: Error = new Error("");
  public currentPath = "";

  public navToAp: EventEmitter<{ col: string; search: string | number }> = new EventEmitter<{
    col: string;
    search: string | number;
  }>();
  public navToHw: EventEmitter<{ col: string; search: string | number }> = new EventEmitter<{
    col: string;
    search: string | number;
  }>();
  public navToKonf: EventEmitter<{ col: string; search: string | number }> = new EventEmitter<{
    col: string;
    search: string | number;
  }>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    public configService: ConfigService
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);

    // aktuelle Navigation im Benutzerprofil speichern
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((evt: NavigationEnd) => {
        const last: string = evt.urlAfterRedirects;
        // last enthaelt alle param: z.B. "/ap;id=42;tree=vlan"
        // Navigation zu diesem String:
        //   this.router.navigateByUrl(this.router.parseUrl("/ap;id=42;tree=vlan"))
        if (last && !last.endsWith(ERROR_PATH)) {
          this.configService.getUser().path = last;
          this.currentPath = last;
        }
      });
  }

  public isPage(check: string): boolean {
    return this.location.path().startsWith(check);
  }
  /**
   * Beim Start der Anwendung zur letzten gespeicherten URL
   * des Users navigieren.
   *
   * Wenn explizit eine Adresse eingegeben wurde, hat diese Vorrang.
   * Die fn sollte in ngOnInit der ersten component aufgerufen weden
   * (i.d.R. also AppComponent).
   */
  public gotoUserPath(): void {
    // mit welcher Adresse wird die Anwendung gestartet?
    // (location.path() liefert den Teil nach BASE_URL,
    //  -> "" wenn keine Adresse eingegeben wurde).
    const applicationCall = this.location.path();

    if (applicationCall !== "" && applicationCall !== "/") {
      // Ignoring user path and going to applicationCall
      return;
    }

    // falls die Fehlerseite als letzte Navigation gespeichert wurde,
    // zur Startseite gehen.
    let goto = this.configService.getUser().path;
    if (goto && goto.endsWith(ERROR_PATH)) {
      goto = "/";
    }
    // ungueltige Werte -> Startseite
    if (goto == null || goto === "") {
      goto = "/";
    }
    this.navigateByUrl(goto);
  }

  public navigateByUrl(url: string | UrlTree): void {
    // Navigation nur, wenn sich die URL auch geaendert hat
    if (url.toString() === this.currentPath) {
      return;
    }
    this.router
      .navigateByUrl(/*this.router.parseUrl(url)*/ url)
      .then((nav) => {
        if (!nav) {
          // canActivate liefert false, also zur Startseite
          void this.router.navigate(["/"]);
        }
      })
      .catch((err) => {
        console.error("user navigation error", err);
        // womoeglich ungueltige Daten im User-Profil, also noch ein Versuch
        // mit der Startseite
        this.configService.getUser().path = "";
        void this.router.navigate(["/"]);
      });
  }

  public navigateByCmd(command: unknown[]): void {
    this.navigateByUrl(this.router.createUrlTree(command));
  }

  public resetApp(): void {
    window.location.href = this.location.prepareExternalUrl("/");
  }
}
