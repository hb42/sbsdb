import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { NewAussondMeldData } from "./new-aussond-meld-data";

@Component({
  selector: "sbsdb-new-aussond-meld",
  templateUrl: "./new-aussond-meld.component.html",
  styleUrls: ["./new-aussond-meld.component.scss"],
})
export class NewAussondMeldComponent implements OnInit {
  public formGroup: FormGroup;
  public matcher = new FormFieldErrorStateMatcher();

  public dateCtrl: FormControl;
  public title = "Neue Aussonderungs-Meldung";
  public minDate: Date;
  public maxDate: Date = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NewAussondMeldData,
    public matDialogRef: MatDialogRef<NewAussondMeldComponent>,
    public formBuilder: FormBuilder
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.formGroup = this.formBuilder.group({});
    this.minDate = data.minDate;
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.dateCtrl = new FormControl(this.data.meldung, [Validators.required]);
    this.formGroup.addControl("date", this.dateCtrl);
    this.formGroup.markAsDirty();
  }

  public submit(): void {
    this.data.meldung = this.dateCtrl.value as Date;
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    if (control.hasError("matDatepickerParse")) {
      return "Ungültiges Datum.";
    }
    if (control.hasError("matDatepickerMin")) {
      return "Datum muss nach der letzten Meldung liegen.";
    }
    return null;
  }
}
