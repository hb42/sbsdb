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
  public oeffControl: FormControl;
  public apControl: FormControl;
  public parentControl: FormControl;
  public adrControl: FormControl;

  public hierarchie: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Betrst,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
    console.debug("c'tor EditOeDialogComponent");
    this.hierarchie = data.hierarchy;
  }

  public ngOnInit(): void {
    this.betrstControl = this.addFormControl(this.data.betriebsstelle, "betrst", [this.required]);
    this.bstControl = this.addFormControl(`000${this.data.bstNr}`.slice(-3), "bst", [
      Validators.pattern(this.intPattern),
    ]);
    this.oeffControl = this.addFormControl(this.data.oeff, "oeff");
    this.apControl = this.addFormControl(
      { value: this.data.ap, disabled: !!this.data.bstId },
      "ap"
    );
    this.parentControl = this.addFormControl(this.data.parentId, "parent");
    this.adrControl = this.addFormControl(this.data.adresseId, "adresse", [this.required]);
  }

  onSubmit(): void {
    this.data.betriebsstelle = this.betrstControl.value as string;
    this.data.bstNr = Number.parseInt(this.bstControl.value as string, 10);
    // this.data.tel = this.telControl.value as string;
    this.data.oeff = this.oeffControl.value as string;
    this.data.ap = this.apControl.value as boolean;
    this.data.parentId = this.parentControl.value as number;
    this.data.adresseId = this.adrControl.value as number;
  }

  public onKeyChange() {
    this.bstControl.setValue(`000${this.bstControl.value as string}`.slice(-3));
  }

  public onParentChange() {
    const id = this.parentControl.value as number;
    if (id !== this.data.parentId) {
      const nr = this.bstControl.valid ? (this.bstControl.value as number) : this.data.bstNr;
      const betrst = this.betrstControl.valid
        ? (this.betrstControl.value as string)
        : this.data.betriebsstelle;
      this.hierarchie = `000${nr}`.slice(-3) + " " + betrst;
      let p = this.dataService.bstList.find((b) => b.bstId === id);
      while (p) {
        this.hierarchie = (p.fullname ? p.fullname + "|" : "") + this.hierarchie;
        p = p.parent;
      }
    }
  }
}
