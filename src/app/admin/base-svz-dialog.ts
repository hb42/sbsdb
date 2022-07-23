import { Inject } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormControlOptions,
  FormControlState,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "../shared/data.service";
import { FormFieldErrorStateMatcher } from "../shared/form-field-error-state-matcher";

export class BaseSvzDialog<T> {
  public formGroup: FormGroup;
  public matcher = new FormFieldErrorStateMatcher();
  public readonly intPattern = /^\d{1,5}$/;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: T,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    this.formGroup = this.formBuilder.group({});
  }

  /**
   * Required-Validator als Ersatz fuer Validators.required
   *
   * Damit kann die Fehlermeldung "Avoid referencing unbound methods..." vermieden werden.
   * Allerdings muss dann beim jeweiligen Feld required="true" eingetragen werden.
   *
   * @param control
   */
  public required = (control: FormControl): ValidationErrors => {
    return Validators.required(control);
  };

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Bitte einen Wert eingeben.";
    }
    if (control.hasError("pattern")) {
      return "Bitte eine Zahl eingeben.";
    }
    return null;
  }

  protected addFormControl(
    value: FormControlState<unknown> | unknown,
    name: string,
    validator?: ValidatorFn | ValidatorFn[] | FormControlOptions
  ): FormControl {
    const ctl = new FormControl(value, validator);
    this.formGroup.addControl(name, ctl);
    return ctl;
  }
}
