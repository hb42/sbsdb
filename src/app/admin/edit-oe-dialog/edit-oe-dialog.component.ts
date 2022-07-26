import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { Betrst } from "../../shared/model/betrst";
import { BaseSvzDialog } from "../base-svz-dialog";

@Component({
  selector: "sbsdb-edit-oe-dialog",
  templateUrl: "./edit-oe-dialog.component.html",
  styleUrls: ["./edit-oe-dialog.component.scss"],
})
export class EditOeDialogComponent extends BaseSvzDialog<Betrst> implements OnInit {
  public betrstControl: FormControl;
  public bstControl: FormControl;
  public faxControl: FormControl;
  public telControl: FormControl;
  public oeffControl: FormControl;
  public apControl: FormControl;
  public parentControl: FormControl;
  public adrControl: FormControl;

  // public betriebsstelle: string;
  // public bstNr: number;
  // public fax: string;
  // public tel: string;
  // public oeff: string;
  // public ap: boolean;
  // public parentId?: number;
  // public adresseId: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Betrst,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
  }

  public ngOnInit(): void {
    this.betrstControl = this.addFormControl(this.data.betriebsstelle, "betrst", [this.required]);
    this.bstControl = this.addFormControl(`000${this.data.bstNr}`.slice(-3), "bst", [
      Validators.pattern(this.intPattern),
    ]);
    this.faxControl = this.addFormControl(this.data.fax, "fax");
    this.telControl = this.addFormControl(this.data.tel, "tel");
    this.oeffControl = this.addFormControl(this.data.oeff, "oeff");
    this.apControl = this.addFormControl(
      { value: this.data.ap, disabled: !!this.data.bstId },
      "ap"
    );
    this.parentControl = this.addFormControl(this.data.parentId, "parent");
    this.adrControl = this.addFormControl(this.data.adresseId, "adresse", [this.required]);
  }

  onSubmit(value: unknown): void {
    console.log("you submitted value: ");
    console.dir(value);
    this.data.betriebsstelle = this.betrstControl.value as string;
    this.data.bstNr = Number.parseInt(this.bstControl.value as string, 10);
    this.data.fax = this.faxControl.value as string;
    this.data.tel = this.telControl.value as string;
    this.data.oeff = this.oeffControl.value as string;
    this.data.ap = this.apControl.value as boolean;
    this.data.parentId = this.parentControl.value as number;
    this.data.adresseId = this.adrControl.value as number;
  }

  public onKeyChange() {
    this.bstControl.setValue(`000${this.bstControl.value as string}`.slice(-3));
  }
}
