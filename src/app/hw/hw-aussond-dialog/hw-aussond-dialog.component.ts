import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { HwAussondData } from "./hw-aussond-data";

@Component({
  selector: "sbsdb-hw-aussond-dialog",
  templateUrl: "./hw-aussond-dialog.component.html",
  styleUrls: ["./hw-aussond-dialog.component.scss"],
})
export class HwAussondDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public matcher = new FormFieldErrorStateMatcher();

  public grundCtrl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HwAussondData,
    public formBuilder: FormBuilder
  ) {
    console.debug("c'tor HwAussondDialogComponent");
    this.formGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.grundCtrl = new FormControl(this.data.reason, [Validators.required]);
    this.formGroup.addControl("grund", this.grundCtrl);
  }

  public submit(): void {
    this.data.reason = this.grundCtrl.value as string;
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }
}
