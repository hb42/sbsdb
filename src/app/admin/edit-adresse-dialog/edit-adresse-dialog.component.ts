import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { Adresse } from "../../shared/model/adresse";
import { BaseSvzDialog } from "../base-svz-dialog";

@Component({
  selector: "sbsdb-edit-adresse-dialog",
  templateUrl: "./edit-adresse-dialog.component.html",
  styleUrls: ["./edit-adresse-dialog.component.scss"],
})
export class EditAdresseDialogComponent extends BaseSvzDialog<Adresse> implements OnInit {
  public plzControl: FormControl;
  public ortControl: FormControl;
  public strasseControl: FormControl;
  public hausnrControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Adresse,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  ngOnInit(): void {
    this.plzControl = this.addFormControl(this.data.plz, "plz");
    this.ortControl = this.addFormControl(this.data.ort, "ort");
    this.strasseControl = this.addFormControl(this.data.strasse, "strasse");
    this.hausnrControl = this.addFormControl(this.data.hausnr, "hausnr");
  }

  onSubmit(): void {
    this.data.plz = this.plzControl.value as string;
    this.data.ort = this.ortControl.value as string;
    this.data.strasse = this.strasseControl.value as string;
    this.data.hausnr = this.hausnrControl.value as string;
  }
}
