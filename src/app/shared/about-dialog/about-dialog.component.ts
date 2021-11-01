import { Component } from "@angular/core";
import { VersionService } from "../version.service";

@Component({
  selector: "sbsdb-about-dialog",
  templateUrl: "./about-dialog.component.html",
  styleUrls: ["./about-dialog.component.scss"],
})
export class AboutDialogComponent {
  constructor(public version: VersionService) {
    console.debug("c'tor AboutDialogComponent");
  }
}
