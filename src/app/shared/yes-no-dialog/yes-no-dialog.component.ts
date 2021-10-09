import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "sbsdb-yes-no-dialog",
  templateUrl: "./yes-no-dialog.component.html",
  styleUrls: ["./yes-no-dialog.component.scss"],
})
export class YesNoDialogComponent implements OnInit {
  public title = "";
  public text = "";
  constructor(@Inject(MAT_DIALOG_DATA) private data) {
    this.title = data.title;
    this.text = data.text;
  }

  ngOnInit(): void {}
}
