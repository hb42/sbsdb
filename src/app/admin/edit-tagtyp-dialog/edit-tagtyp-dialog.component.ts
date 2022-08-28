import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { TagTyp } from "../../shared/model/tagTyp";
import { BaseSvzDialog } from "../base-svz-dialog";

@Component({
  selector: "sbsdb-edit-tagtyp-dialog",
  templateUrl: "./edit-tagtyp-dialog.component.html",
  styleUrls: ["./edit-tagtyp-dialog.component.scss"],
})
export class EditTagtypDialogComponent extends BaseSvzDialog<TagTyp> implements OnInit {
  public bezeichControl: FormControl;
  public paramControl: FormControl;
  public flagControl: FormControl;
  public katControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TagTyp,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public ngOnInit(): void {
    this.bezeichControl = this.addFormControl(this.data.bezeichnung, "bezeich", [this.required]);
    this.paramControl = this.addFormControl(this.data.param, "param");
    this.flagControl = this.addFormControl(this.data.flag, "flag", [
      Validators.pattern(this.intPattern),
    ]);
    // Aenderung der Kategorie wuerde erfordern, die vorhandenen Eintraege fuer
    // diesen tag zu loeschen (da falsche Kategorie). Das duerfte in den meisten
    // Faellen nicht gewuenscht sein => Feld nur fuer NEU erlauben
    this.katControl = this.addFormControl(
      { value: this.data.apKategorieId, disabled: !!this.data.id },
      "kat",
      [this.required]
    );
  }

  onSubmit(): void {
    this.data.bezeichnung = this.bezeichControl.value as string;
    this.data.param = this.paramControl.value as string;
    this.data.flag = Number.parseInt(this.flagControl.value as string, 10);
    this.data.apKategorieId = this.katControl.value as number;
  }
}
