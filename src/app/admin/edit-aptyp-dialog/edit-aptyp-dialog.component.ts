import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { ApTyp } from "../../shared/model/ap-typ";

@Component({
  selector: "sbsdb-edit-aptyp-dialog",
  templateUrl: "./edit-aptyp-dialog.component.html",
  styleUrls: ["./edit-aptyp-dialog.component.scss"],
})
export class EditAptypDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public bezeichControl: FormControl;
  public flagControl: FormControl;
  public katControl: FormControl;

  public matcher = new FormFieldErrorStateMatcher();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApTyp,
    public matDialogRef: MatDialogRef<EditAptypDialogComponent>,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    this.formGroup = this.formBuilder.group({});
    this.dataService.apkatList.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
  }

  public ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.bezeichControl = new FormControl(this.data.bezeichnung, [Validators.required]);
    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("bezeich", this.bezeichControl);

    // an flag haengt Programmlogik ("fremde HW"), da ist eine Aenderung nicht sinnvoll
    this.flagControl = new FormControl({ value: this.data.flag, disabled: !!this.data.id }, [
      Validators.pattern(/^\d{1,5}$/),
    ]);
    this.formGroup.addControl("flag", this.flagControl);

    // ueber Kategorie wird die Auswhl der primaeren HW gesteuert, besser nicht anfassen
    this.katControl = new FormControl(
      { value: this.data.apKategorieId, disabled: !!this.data.id },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      [Validators.required]
    );
    this.formGroup.addControl("kat", this.katControl);
  }

  onSubmit(value: unknown): void {
    console.log("you submitted value: ");
    console.dir(value);
    this.data.bezeichnung = this.bezeichControl.value as string;
    this.data.flag = Number.parseInt(this.flagControl.value as string, 10);
    this.data.apKategorieId = this.katControl.value as number;
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Bitte einen Wert eingeben.";
    }
    if (control.hasError("pattern")) {
      return "Bitte eine Zahl eingeben.";
    }
    return null;
  }
}
