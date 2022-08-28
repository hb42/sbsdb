import { Component } from "@angular/core";
import { environment } from "../../../environments/environment";
import { VersionService } from "../version.service";

@Component({
  selector: "sbsdb-about-dialog",
  templateUrl: "./about-dialog.component.html",
  styleUrls: ["./about-dialog.component.scss"],
})
export class AboutDialogComponent {
  constructor(public version: VersionService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
