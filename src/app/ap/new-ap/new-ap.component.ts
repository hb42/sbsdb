import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { ApTyp } from "../../shared/model/ap-typ";
import { NewApData } from "./new-ap-data";

@Component({
  selector: "sbsdb-new-ap",
  templateUrl: "./new-ap.component.html",
  styleUrls: ["./new-ap.component.scss"],
})
export class NewApComponent implements OnInit {
  public formGroup: FormGroup;
  public matcher = new FormFieldErrorStateMatcher();

  public typCtrl: FormControl;
  public aptypList: ApTyp[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NewApData,
    public matDialogRef: MatDialogRef<NewApComponent>,
    public formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.formGroup = this.formBuilder.group({});
    this.aptypList = this.dataService.aptypList.sort((a, b) =>
      this.dataService.collator.compare(a.bezeichnung, b.bezeichnung)
    );
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.typCtrl = new FormControl(this.data.typ, [Validators.required]);
    this.formGroup.addControl("aptyp", this.typCtrl);
  }

  public submit(): void {
    console.debug("onsubmit");
    this.data.typ = this.typCtrl.value as ApTyp;
    console.dir(this.data);
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }
}