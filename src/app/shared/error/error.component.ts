import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ConfigService } from "../config/config.service";
import { NavigationService } from "../navigation.service";

@Component({
  selector: "sbsdb-error",
  templateUrl: "./error.component.html",
  styleUrls: ["./error.component.scss"],
})
export class ErrorComponent implements OnInit {
  public status: string;
  public message: string;
  public stack: string;

  public backToApp: string;

  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService,
    private location: Location,
    private navigationService: NavigationService
  ) {
    console.debug("c'tor ErrorComponent");
    // Bevor die App zurueckgesetzt wird, noch den Pfad, der fuer den User
    // gespeichert ist auf default setzen (sonst dreht sich ein 404 im Kreis).
    this.configService.getUser().path = "/";
    this.backToApp = this.location.prepareExternalUrl("/");
  }

  public ngOnInit(): void {
    this.status = this.navigationService.lastError.name;
    this.message = this.navigationService.lastError.message;
    this.stack = this.navigationService.lastError.stack;
  }

  // public restartApp(): void {
  //   this.navigationService.resetApp();
  // }
}
