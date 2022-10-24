import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { StringCompare } from "../../shared/helper";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { MoveData } from "./move-data";

interface MoveValue {
  value: number;
  text: string;
}

@Component({
  selector: "sbsdb-move-dialog",
  templateUrl: "./move-dialog.component.html",
  styleUrls: ["./move-dialog.component.scss"],
})
export class MoveDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  public matcher = new FormFieldErrorStateMatcher();
  public apCtrl: FormControl;
  public moveCtrl: FormControl;
  public apSelect: Arbeitsplatz[];
  public moveSelect: MoveValue[];

  private fremdeHwSource = false;
  private fremdeHwTarget = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MoveData,
    public matDialogRef: MatDialogRef<MoveDialogComponent>,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private cdRef: ChangeDetectorRef
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.formGroup = this.formBuilder.group({});
    this.fremdeHwSource = this.dataService.isFremderAp(data.ap);
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.apCtrl = new FormControl(null, [Validators.required]);
    this.formGroup.addControl("ap", this.apCtrl);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.moveCtrl = new FormControl(null, [Validators.required]);
    this.formGroup.addControl("movw", this.moveCtrl);

    this.apSelect = this.dataService.apList
      .filter((a) => a.apKatId === this.data.ap.apKatId && a.apId !== this.data.ap.apId)
      .sort((a, b) => StringCompare(a.apname, b.apname));
    this.apSelect.unshift(null);
    this.mkMoveSelect();
  }

  public targetChange(): void {
    this.fremdeHwTarget = this.dataService.isFremderAp(this.apCtrl.value as Arbeitsplatz);
    this.mkMoveSelect();
    // Das Aendern der selectList aendert den Status der formControl
    // und das triggert *ExpressionChangedAfterItHasBeenCheckedError*.
    // Das folgende verhindert diesen Fehler.
    this.cdRef.detectChanges();
  }

  public onSubmit() {
    this.data.target = this.apCtrl.value as Arbeitsplatz;
    this.data.what = (this.moveCtrl.value as MoveValue).value;
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }

  private mkMoveSelect() {
    const old: number = this.moveCtrl.value ? (this.moveCtrl.value as MoveValue).value : 0;

    this.moveSelect = [];
    this.moveSelect.push(null);
    if (!this.fremdeHwSource && !this.fremdeHwTarget) {
      this.moveSelect.push({ value: 1, text: "Hardware" });
    }
    this.moveSelect.push({ value: 2, text: "Sonstige Informationen" });
    if (!this.fremdeHwSource && !this.fremdeHwTarget) {
      this.moveSelect.push({ value: 3, text: "Hardware + Sonstige Informationen" });
    }

    if (old) {
      const val = this.moveSelect.find((m) => (m ? m.value === old : false));
      if (val) {
        this.moveCtrl.setValue(val);
      } else {
        this.moveCtrl.setValue(null);
      }
    } else {
      this.moveCtrl.setValue(null);
    }
  }
}
