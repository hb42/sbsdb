import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { ShowHistoryData } from "./show-history-data";

@Component({
  selector: "sbsdb-show-history-dialog",
  templateUrl: "./show-history-dialog.component.html",
  styleUrls: ["./show-history-dialog.component.scss"],
})
export class ShowHistoryDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ShowHistoryData) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
