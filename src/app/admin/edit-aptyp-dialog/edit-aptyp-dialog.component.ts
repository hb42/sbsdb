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
  public bezeichControl: FormControl;
  public flagControl: FormControl;
  public katControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApTyp,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
  }

  public ngOnInit(): void {
    this.bezeichControl = this.addFormControl(this.data.bezeichnung, "bezeich", [this.required]);
    // an flag haengt Programmlogik ("fremde HW"), da ist eine Aenderung nicht sinnvoll
    this.flagControl = this.addFormControl(
      { value: this.data.flag, disabled: !!this.data.id },
      "flag",
      [Validators.pattern(this.intPattern)]
    );
    // ueber Kategorie wird die Auswhl der primaeren HW gesteuert, besser nicht anfassen
    this.katControl = this.addFormControl(
      { value: this.data.apKategorieId, disabled: !!this.data.id },
      "kat",
      [this.required]
    );
  }

  onSubmit(value: unknown): void {
    console.log("you submitted value: ");
    console.dir(value);
    this.data.bezeichnung = this.bezeichControl.value as string;
    this.data.flag = Number.parseInt(this.flagControl.value as string, 10);
    this.data.apKategorieId = this.katControl.value as number;
  }
}
