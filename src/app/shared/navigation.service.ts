import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { ConfigService } from "./config/config.service";

@Injectable({providedIn: "root"})
export class NavigationService {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private configService: ConfigService) {

    // aktuelle Seite im Benutzerprofil speichern
    this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd))
        .subscribe((evt: NavigationEnd) => {
          const last: string = evt.urlAfterRedirects;

          console.debug("## NavigationService " + last);
          console.dir(evt);
          // last enthaelt alle param: z.B. "/ap;id=42;tree=vlan"
          // Navigation mit diesem String:
          //   this.router.navigateByUrl(this.router.parseUrl("/ap;id=42;tree=vlan"))

          if (last && !last.endsWith("error")) {
            this.configService.getUser().path = last;
          }
        });

    // zur letzten Seite des Users
    console.debug("--- c'tor NavigationService");
    // TODO das hier als fn, Aufruf aus AppComponent (c'tor|onInit?)
    //      dort route checken & nur zu Userpath wenn route == "/"
    console.dir(this.route.snapshot);
    let goto = this.configService.getUser().path;
    if (goto && goto.endsWith("error")) {
      goto = "";
    }
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
          this.configService.getUser().path = "";
          this.router.navigate(["/"]);
        });
  }

}
