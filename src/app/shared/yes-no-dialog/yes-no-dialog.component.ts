import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { YesNoDialogData } from "./yes-no-dialog-data";

@Component({
  selector: "sbsdb-yes-no-dialog",
  templateUrl: "./yes-no-dialog.component.html",
  styleUrls: ["./yes-no-dialog.component.scss"],
})
export class YesNoDialogComponent {
  public title = "";
  public text = "";
  constructor(@Inject(MAT_DIALOG_DATA) private data: YesNoDialogData) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.title = data.title;
    this.text = data.text;
  }
}
