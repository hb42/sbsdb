import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { ApTyp } from "../../shared/model/ap-typ";
import { BaseSvzDialog } from "../base-svz-dialog";

@Component({
  selector: "sbsdb-edit-aptyp-dialog",
  templateUrl: "./edit-aptyp-dialog.component.html",
  styleUrls: ["./edit-aptyp-dialog.component.scss"],
})
export class EditAptypDialogComponent extends BaseSvzDialog<ApTyp> implements OnInit {
  public apbezeichControl: FormControl;
  public apflagControl: FormControl;
  public apkatControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApTyp,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
    console.debug("c'tor EditAptypDialogComponent");
  }

  public ngOnInit(): void {
    this.apbezeichControl = this.addFormControl(this.data.bezeichnung, "bezeich", [this.required]);
    // an flag haengt Programmlogik ("fremde HW"), da ist eine Aenderung nicht sinnvoll
    this.apflagControl = this.addFormControl(
      { value: this.data.flag, disabled: !!this.data.id },
      "flag",
      [Validators.pattern(this.intPattern)]
    );
    // ueber Kategorie wird die Auswhl der primaeren HW gesteuert, besser nicht anfassen
    this.apkatControl = this.addFormControl(
      { value: this.data.apKategorieId, disabled: !!this.data.id },
      "kat",
      [this.required]
    );
  }

  onSubmit(): void {
    this.data.bezeichnung = this.apbezeichControl.value as string;
    this.data.flag = Number.parseInt(this.apflagControl.value as string, 10);
    this.data.apKategorieId = this.apkatControl.value as number;
  }
}
