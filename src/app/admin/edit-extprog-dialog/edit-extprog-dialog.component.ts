import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { ApTyp } from "../../shared/model/ap-typ";
import { EditExtprogTransport } from "./edit-extprog-transport";

@Component({
  selector: "sbsdb-edit-extprog-dialog",
  templateUrl: "./edit-extprog-dialog.component.html",
  styleUrls: ["./edit-extprog-dialog.component.scss"],
})
export class EditExtprogDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public aptypControl: FormControl;
  public flagControl: FormControl;
  public keyControl: FormControl;
  public nameControl: FormControl;
  public paramControl: FormControl;

  public matcher = new FormFieldErrorStateMatcher();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditExtprogTransport,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    this.formGroup = this.formBuilder.group({});
    this.dataService.aptypList.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
  }

  public ngOnInit(): void {
    const aptypIn: ApTyp[] = this.data.in ? this.data.in.types.map((i) => i.aptyp) : [];

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.keyControl = new FormControl(this.data.in?.program ?? "", [Validators.required]);
    this.formGroup.addControl("key", this.keyControl);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.nameControl = new FormControl(this.data.in?.bezeichnung ?? "", [Validators.required]);
    this.formGroup.addControl("name", this.nameControl);
    this.paramControl = new FormControl(this.data.in?.param ?? "");
    this.formGroup.addControl("param", this.paramControl);
    this.flagControl = new FormControl(this.data.in?.flag ?? 0, [Validators.pattern(/^\d{1,5}$/)]);
    this.formGroup.addControl("flag", this.flagControl);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.aptypControl = new FormControl(aptypIn, [Validators.required]);
    this.formGroup.addControl("aptyp", this.aptypControl);
  }

  public onSubmit(value: unknown): void {
    const prg = this.keyControl.value as string;
    const bez = this.nameControl.value as string;
    const par = (this.paramControl.value as string) ?? "";
    const flg = Number.parseInt(this.flagControl.value as string, 10);
    const aptypes = (this.aptypControl.value as ApTyp[]) ?? [];
    const oldTypes = this.data.in ? this.data.in.types.map((t) => t) : [];
    const onlyTypes = this.data.in
      ? prg === this.data.in.program &&
        bez === this.data.in.bezeichnung &&
        par === (this.data.in.param ?? "") &&
        flg === this.data.in.flag
      : false;

    aptypes.forEach((at) => {
      const idx = oldTypes.findIndex((o) => o.aptyp.id === at.id);
      if (idx === -1) {
        // new
        if (!this.data.outNew) {
          this.data.outNew = {
            program: prg,
            bezeichnung: bez,
            param: par,
            flag: flg,
            types: [],
          };
        }
        this.data.outNew.types.push({ id: 0, aptyp: at });
      } else {
        const old = oldTypes.splice(idx, 1);
        if (!onlyTypes && old) {
          // chg
          if (!this.data.outChg) {
            this.data.outChg = {
              program: prg,
              bezeichnung: bez,
              param: par,
              flag: flg,
              types: [],
            };
          }
          this.data.outChg.types.push({ id: old[0].id, aptyp: at });
        }
      }
    });
    oldTypes.forEach((ot) => {
      // del
      if (!this.data.outDel) {
        this.data.outDel = {
          program: prg,
          bezeichnung: bez,
          param: par,
          flag: flg,
          types: [],
        };
      }
      this.data.outDel.types.push(ot);
    });
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Bitte einen Wert eingeben.";
    }
    if (control.hasError("pattern")) {
      return "Bitte eine Zahl eingeben.";
    }
    return null;
  }

  public onKeyChange() {
    this.keyControl.setValue((this.keyControl.value as string).toUpperCase());
  }
}
