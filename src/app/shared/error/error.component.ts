import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ErrorService } from "@hb42/lib-client";
import { ConfigService } from "../config/config.service";

// FIXME kann wieder raus, sobald das interface in lib-client eingebaut ist
interface ErrorMsg {
  title: string;
  message: string;
}

@Component({
  selector: "sbsdb-error",
  templateUrl: "./error.component.html",
  styleUrls: ["./error.component.scss"],
})
export class ErrorComponent implements OnInit {
  public status: string;
  public message: string;

  constructor(
    private route: ActivatedRoute,
    public errorService: ErrorService,
    private configService: ConfigService
  ) {
    console.debug("c'tor ErrorComponent");
  }

  public ngOnInit(): void {
    const latest: ErrorMsg = this.errorService.getLastError() as ErrorMsg;
    this.status = latest.title;
    this.message = latest.message;
    console.debug("Error:");
    console.dir(latest);
  }

  /**
   * Bevor die App zurueckgesetzt wird, noch den Pfad, der fuer den User
   * gespeichert ist auf default setzen (sonst dreht sich ein 404 im Kreis).
   */
  public restartApp(): void {
    this.configService.getUser().path = "/";
    this.errorService.resetApp();
  }
}
