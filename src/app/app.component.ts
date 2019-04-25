import { Component } from "@angular/core";
import { NavigationService } from "./shared/navigation.service";

@Component(
    {
      selector   : "sbsdb-root",
      templateUrl: "./app.component.html",
      styleUrls  : ["./app.component.scss"]
    })
export class AppComponent {
  constructor(private nav: NavigationService) {

  }

}
