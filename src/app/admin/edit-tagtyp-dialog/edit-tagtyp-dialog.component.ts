import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { TagTyp } from "../../shared/model/tagTyp";

@Component({
  selector: "sbsdb-edit-tagtyp-dialog",
  templateUrl: "./edit-tagtyp-dialog.component.html",
  styleUrls: ["./edit-tagtyp-dialog.component.scss"],
})
export class EditTagtypDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public bezeichControl: FormControl;
  public paramControl: FormControl;
  public flagControl: FormControl;
  public katControl: FormControl;

  public matcher = new FormFieldErrorStateMatcher();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TagTyp,
    public matDialogRef: MatDialogRef<EditTagtypDialogComponent>,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    this.formGroup = this.formBuilder.group({});
    this.dataService.apkatList.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
  }

  public ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.bezeichControl = new FormControl(this.data.bezeichnung, [Validators.required]);
    this.formGroup.addControl("bezeich", this.bezeichControl);

    this.paramControl = new FormControl(this.data.param);
    this.formGroup.addControl("param", this.paramControl);

    // TODO Aendern erlauben? -> Testen, wie das Programm damit klarkommt
    this.flagControl = new FormControl(this.data.flag, [Validators.pattern(/^\d{1,5}$/)]);
    this.formGroup.addControl("flag", this.flagControl);

    // Aenderung der Kategorie wuerde erfordern, die vorhandenen Eintraege fuer
    // diesen tag zu loeschen (da falsche Kategorie). Das duerfte in den meisten
    // Faellen nicht gewuenscht sein => Feld nur fuer NEU erlauben
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
    this.data.param = this.paramControl.value as string;
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
