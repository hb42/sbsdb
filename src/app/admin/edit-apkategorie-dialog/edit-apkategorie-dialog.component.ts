import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { ApKategorie } from "../../shared/model/ap-kategorie";
import { BaseSvzDialog } from "../base-svz-dialog";

@Component({
  selector: "sbsdb-edit-apkategorie-dialog",
  templateUrl: "./edit-apkategorie-dialog.component.html",
  styleUrls: ["./edit-apkategorie-dialog.component.scss"],
})
export class EditApkategorieDialogComponent extends BaseSvzDialog<ApKategorie> implements OnInit {
  public bezeichControl: FormControl;
  public flagControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApKategorie,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
  }
  ngOnInit(): void {
    this.bezeichControl = this.addFormControl(this.data.bezeichnung, "bezeich", [this.required]);
    // an flag haengt Programmlogik ("Peripherie"), da ist eine Aenderung nicht sinnvoll
    this.flagControl = this.addFormControl(
      { value: this.data.flag, disabled: !!this.data.id },
      "flag",
      [Validators.pattern(this.intPattern)]
    );
  }

  public onSubmit(value: unknown): void {
    console.log("you submitted value: ");
    console.dir(value);
    this.data.bezeichnung = this.bezeichControl.value as string;
    this.data.flag = Number.parseInt(this.flagControl.value as string, 10);
  }
}
