import { Component, EventEmitter, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { StringCompare } from "../../shared/helper";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { MoveData } from "./move-data";

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
  public moveSelect: { value: number; text: string }[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MoveData,
    public matDialogRef: MatDialogRef<MoveDialogComponent>,
    public formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.formGroup = this.formBuilder.group({});

    this.apSelect = this.dataService.apList
      .filter((a) => a.apKatId === this.data.ap.apKatId && a.apId !== this.data.ap.apId)
      .sort((a, b) => StringCompare(a.apname, b.apname));
    this.apSelect.unshift(null);
    this.moveSelect = [];
    this.moveSelect.push(null);
    this.moveSelect.push({ value: 1, text: "Hardware" });
    this.moveSelect.push({ value: 2, text: "Sonstige Informationen" });
    this.moveSelect.push({ value: 3, text: "Hardware + Sonstige Informationen" });
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.apCtrl = new FormControl(null, [Validators.required]);
    this.formGroup.addControl("ap", this.apCtrl);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.moveCtrl = new FormControl(null, [Validators.required]);
    this.formGroup.addControl("movw", this.moveCtrl);
  }

  public onSubmit() {
    this.data.target = this.apCtrl.value as Arbeitsplatz;
    this.data.what = (this.moveCtrl.value as { value: number; text: string }).value;
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }
}
