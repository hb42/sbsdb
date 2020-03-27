import { Component, OnInit } from "@angular/core";
import { NavigationService } from "./shared/navigation.service";

@Component({
  selector: "sbsdb-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(private nav: NavigationService) {
    console.debug("c'tor AppComponent");
  }

  public ngOnInit(): void {
    // zur letzten gespeicherten Seite des Users
    this.nav.gotoUserPath();
  }
}
