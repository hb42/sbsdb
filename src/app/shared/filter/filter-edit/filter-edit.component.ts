import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../../environments/environment";
import { FormFieldErrorStateMatcher } from "../../form-field-error-state-matcher";
import { SbsdbColumn } from "../../table/sbsdb-column";
import { Field } from "../field";
import { RelOp } from "../rel-op.enum";
import { FilterEditData } from "./filter-edit-data";

@Component({
  selector: "sbsdb-filter-edit",
  templateUrl: "./filter-edit.component.html",
  styleUrls: ["./filter-edit.component.scss"],
})
export class FilterEditComponent implements OnInit {
  public formGroup: FormGroup;
  public fieldCtrl: FormControl;
  public opCtrl: FormControl;
  public valCtrl: FormControl;
  public matcher = new FormFieldErrorStateMatcher();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FilterEditData,
    public matDialogRef: MatDialogRef<FilterEditComponent>,
    public formBuilder: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.formGroup = this.formBuilder.group({});
  }
  @HostListener("document:keydown.esc", ["$event"])
  public handleEsc(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.matDialogRef.close();
  }
  @HostListener("document:keydown.enter", ["$event"])
  public handleEnter(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.formGroup.valid) {
      this.onSubmit();
      this.matDialogRef.close(this.data);
    }
  }

  ngOnInit(): void {
    const selField = this.data.f
      ? this.data.columns.find(
          (col: SbsdbColumn<unknown, unknown>) => col.displayName === this.data.f.displayName
        )
      : null;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.fieldCtrl = new FormControl(selField, [Validators.required]);
    this.formGroup.addControl("field", this.fieldCtrl);
    this.fieldCtrl.markAsTouched();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.opCtrl = new FormControl(this.data.o, [Validators.required]);
    this.formGroup.addControl("op", this.opCtrl);
    this.opCtrl.markAsTouched();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.valCtrl = new FormControl(this.data.c, [Validators.required]);
    this.formGroup.addControl("val", this.valCtrl);
    if (this.noValueRequired()) {
      this.valCtrl.disable();
    } else {
      this.valCtrl.markAsTouched();
    }
  }

  public columnList(): SbsdbColumn<unknown, unknown>[] {
    return this.data.columns.filter((c) => c.operators);
  }

  public selectedColumn(): SbsdbColumn<unknown, unknown> {
    const col = this.fieldCtrl.value as SbsdbColumn<unknown, unknown>;
    return col
      ? this.data.columns.find(
          (c: SbsdbColumn<unknown, unknown>) => c.displayName === col.displayName
        )
      : null;
  }

  public compareAsList(): boolean {
    const op = this.opCtrl.value as RelOp;
    return (
      op &&
      (op === RelOp.inlist ||
        op === RelOp.notinlist ||
        op === RelOp.inlistlike ||
        op === RelOp.notinlistlike)
    );
  }

  public noValueRequired(): boolean {
    const op = this.opCtrl.value as RelOp;
    return op && (op === RelOp.exist || op === RelOp.notexist);
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }

  public onFieldSelectionChange(): void {
    const col = this.fieldCtrl.value as SbsdbColumn<unknown, unknown>;
    if (this.data.f) {
      if (this.data.f.displayName !== col.displayName) {
        this.opCtrl.setValue(null);
        this.valCtrl.setValue(null);
        this.valCtrl.enable();
        this.cd.detectChanges();
      }
      this.data.f.displayName = col.displayName;
      this.data.f.fieldName = col.fieldName;
      this.data.f.type = col.typeKey;
    } else {
      this.data.f = new Field(col.fieldName, col.displayName, col.typeKey);
    }
  }

  public onOpSelectionChange(): void {
    if (this.noValueRequired()) {
      this.valCtrl.disable();
      this.valCtrl.setValue(null);
    } else {
      this.valCtrl.enable();
    }
  }

  public onSubmit(): void {
    this.data.o = this.opCtrl.value as RelOp;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.data.c = this.valCtrl.value;
  }
}
