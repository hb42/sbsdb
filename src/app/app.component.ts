import { Component, OnInit } from "@angular/core";
import { environment } from "../environments/environment";
import { InitService } from "./shared/init.service";
import { NavigationService } from "./shared/navigation.service";

@Component({
  selector: "sbsdb-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(private nav: NavigationService, private init: InitService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public ngOnInit(): void {
    // zur letzten gespeicherten Seite des Users
    this.nav.gotoUserPath();
  }
}
