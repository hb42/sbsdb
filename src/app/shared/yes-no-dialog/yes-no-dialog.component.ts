import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "sbsdb-yes-no-dialog",
  templateUrl: "./yes-no-dialog.component.html",
  styleUrls: ["./yes-no-dialog.component.scss"],
})
export class YesNoDialogComponent {
  public title = "";
  public text = "";
  constructor(@Inject(MAT_DIALOG_DATA) private data) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    this.title = data.title;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    this.text = data.text;
  }
}
