import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { ErrorService } from "@hb42/lib-client";
import { filter } from "rxjs/operators";
import { ConfigService } from "./config/config.service";

@Injectable({providedIn: "root"})
export class NavigationService {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private location: Location,
              private configService: ConfigService) {

    console.debug("c'tor NavigationService");

    // aktuelle Navigation im Benutzerprofil speichern
    this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd))
        .subscribe((evt: NavigationEnd) => {
          const last: string = evt.urlAfterRedirects;

          console.debug("## NavigationService " + last);
          console.dir(evt);
          // last enthaelt alle param: z.B. "/ap;id=42;tree=vlan"
          // Navigation zu diesem String:
          //   this.router.navigateByUrl(this.router.parseUrl("/ap;id=42;tree=vlan"))
          if (last && !last.endsWith(ErrorService.errorPage)) {
            this.configService.getUser().path = last;
          }
        });

  }

  /**
   * Beim Start der Anwendung zur letzten gespeicherten URL
   * des Users navigieren.
   *
   * Wenn explizit eine Adresse eingegeben wurde, hat diese Vorrang.
   * Die fn sollte in ngOnInit der ersten component aufgerufen weden
   * (i.d.R. also AppComponent).
   */
  public gotoUserPath() {
    console.debug("--- gotoUserPath");
    // mit welcher Adresse wird die Anwendung gestartet?
    // (location.path() liefert den Teil nach BASE_URL,
    //  -> "" wenn keine Adresse eingegeben wurde).
    const applicationCall = this.location.path();

    if (applicationCall !== "" && applicationCall !== "/") {
      console.debug("Ignoring user path and going to " + applicationCall);
      return;
    }

    // falls die Fehlerseite als letzte Navigation gespeichert wurde,
    // zur Startseite gehen.
    let goto = this.configService.getUser().path;
    if (goto && goto.endsWith(ErrorService.errorPage)) {
      goto = "/";
    }
    // ungueltige Werte -> Startseite
    if (goto == null || goto === "") {
      goto = "/";
    }
    this.router.navigateByUrl(this.router.parseUrl(goto))
        .then((nav) => {
          if (!nav) {  // canActivate liefert false, also zur Startseite
            this.router.navigate(["/"]);
          }
        })
        .catch((err) => {
          console.debug("user navigation error " + err);
          // womoeglich ungueltige Daten im User-Profil, also noch ein Versuch
          // mit der Startseite
          this.configService.getUser().path = "";
          this.router.navigate(["/"]);
        });

  }


}
