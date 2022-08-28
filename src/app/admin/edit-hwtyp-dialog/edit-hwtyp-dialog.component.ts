import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { HwTyp } from "../../shared/model/hw-typ";
import { BaseSvzDialog } from "../base-svz-dialog";

@Component({
  selector: "sbsdb-edit-hwtyp-dialog",
  templateUrl: "./edit-hwtyp-dialog.component.html",
  styleUrls: ["./edit-hwtyp-dialog.component.scss"],
})
export class EditHwtypDialogComponent extends BaseSvzDialog<HwTyp> implements OnInit {
  public bezeichControl: FormControl;
  public flagControl: FormControl;
  public katControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HwTyp,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
    console.debug("c'tor EditHwtypDialogComponent");
  }

  ngOnInit(): void {
    this.bezeichControl = this.addFormControl(this.data.bezeichnung, "bezeich", [this.required]);
    // an flag haengt Programmlogik ("fremdeHW"), da ist eine Aenderung nicht sinnvoll
    this.flagControl = this.addFormControl(
      { value: this.data.flag, disabled: !!this.data.id },
      "flag",
      [Validators.pattern(this.intPattern)]
    );
    // ueber Kategorie wird die Auswhl der pri HW gesteuert, besser nicht anfassen
    this.katControl = this.addFormControl(
      { value: this.data.apKategorieId, disabled: !!this.data.id },
      "kat",
      [this.required]
    );
  }

  onSubmit(): void {
    this.data.bezeichnung = this.bezeichControl.value as string;
    this.data.flag = Number.parseInt(this.flagControl.value as string, 10);
    this.data.apKategorieId = this.katControl.value as number;
  }
}
