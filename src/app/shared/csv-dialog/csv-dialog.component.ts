import { Component, HostListener, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CsvDialogData } from "./csv-dialog-data";

@Component({
  selector: "sbsdb-csv-dialog",
  templateUrl: "./csv-dialog.component.html",
  styleUrls: ["./csv-dialog.component.scss"],
})
export class CsvDialogComponent {
  public formControl = new FormControl();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CsvDialogData,
    public matDialogRef: MatDialogRef<CsvDialogComponent>
  ) {
    console.debug("c'tor CsvDialogComponent");
  }

  @HostListener("document:keydown.esc", ["$event"])
  public handleEsc(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.matDialogRef.close();
  }

  // FIXME  ENTER in der Liste toggelt die jeweiligbe Checkbox und landet dann hier
  //        d.h. der User bekommt eine Spalte zuwenig oder zuviel geliefert
  //        => erstmal abschalten bis mir etwas Besseres einfaellt
  // @HostListener("document:keydown.enter", ["$event"])
  // public handleEnter(event: KeyboardEvent): void {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.matDialogRef.close(this.data);
  // }
}
