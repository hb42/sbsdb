import { Component, HostListener, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { SbsdbColumn } from "../table/sbsdb-column";
import { CsvDialogData } from "./csv-dialog-data";

@Component({
  selector: "sbsdb-csv-dialog",
  templateUrl: "./csv-dialog.component.html",
  styleUrls: ["./csv-dialog.component.scss"],
})
export class CsvDialogComponent implements OnInit {
  public formControl = new FormControl();
  public formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CsvDialogData,
    public matDialogRef: MatDialogRef<CsvDialogComponent>,
    private formBuilder: FormBuilder
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.formGroup = this.formBuilder.group({});
  }

  public checkCtrl: FormControl;
  public listCtrl: FormControl;

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

  ngOnInit(): void {
    this.checkCtrl = new FormControl(this.data.all);
    this.formGroup.addControl("checkbox", this.checkCtrl);
    this.listCtrl = new FormControl({ value: this.data.resultList, disabled: true });
    this.formGroup.addControl("list", this.listCtrl);
    this.formGroup.markAsDirty();
  }

  public onSubmit() {
    console.debug("hw multi edit submit");
    this.data.all = this.checkCtrl.value as boolean;
    this.data.resultList = this.listCtrl.value as SbsdbColumn<unknown, unknown>[];
  }

  public checkClick() {
    if (this.checkCtrl.value as boolean) {
      this.listCtrl.disable();
    } else {
      this.listCtrl.enable();
    }
  }
}
