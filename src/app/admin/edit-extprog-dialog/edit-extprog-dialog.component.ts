import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "../../shared/data.service";
import { ApTyp } from "../../shared/model/ap-typ";
import { BaseSvzDialog } from "../base-svz-dialog";
import { EditExtprogTransport } from "./edit-extprog-transport";

@Component({
  selector: "sbsdb-edit-extprog-dialog",
  templateUrl: "./edit-extprog-dialog.component.html",
  styleUrls: ["./edit-extprog-dialog.component.scss"],
})
export class EditExtprogDialogComponent
  extends BaseSvzDialog<EditExtprogTransport>
  implements OnInit
{
  public aptypControl: FormControl;
  public flagControl: FormControl;
  public keyControl: FormControl;
  public nameControl: FormControl;
  public paramControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditExtprogTransport,
    public formBuilder: FormBuilder,
    public dataService: DataService
  ) {
    super(data, formBuilder, dataService);
  }

  public ngOnInit(): void {
    const aptypIn: ApTyp[] = this.data.in ? this.data.in.types.map((i) => i.aptyp) : [];

    this.keyControl = this.addFormControl(this.data.in?.program ?? "", "key", [this.required]);
    this.nameControl = this.addFormControl(this.data.in?.bezeichnung ?? "", "name", [
      this.required,
    ]);
    this.paramControl = this.addFormControl(this.data.in?.param ?? "", "param");
    this.flagControl = this.addFormControl(this.data.in?.flag ?? 0, "flag", [
      Validators.pattern(this.intPattern),
    ]);
    this.aptypControl = this.addFormControl(aptypIn, "aptyp", [this.required]);
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

  public onKeyChange() {
    this.keyControl.setValue((this.keyControl.value as string).toUpperCase());
  }
}
