import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { HwTyp } from "../../shared/model/hw-typ";
import { EditConfigData } from "../edit-config-dialog/edit-config-data";

@Component({
  selector: "sbsdb-edit-config",
  templateUrl: "./edit-config.component.html",
  styleUrls: ["./edit-config.component.scss"],
})
export class EditConfigComponent implements OnInit {
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public data: EditConfigData;
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public konfigReady: EventEmitter<EditConfigData>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public konfigFormGroup: FormGroup;
  public hwtypCtrl: FormControl;
  public herstellerCtrl: FormControl;
  public bezeichCtrl: FormControl;
  public cpuCtrl: FormControl;
  public ramCtrl: FormControl;
  public hdCtrl: FormControl;
  public videoCtrl: FormControl;
  public sonstCtrl: FormControl;

  public hwtyplist: HwTyp[];

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    console.debug("c'tor EditConfigComponent");
    this.konfigReady = new EventEmitter<EditConfigData>();
    this.konfigFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // form submit
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    this.hwtyplist = this.dataService.hwtypList
      .filter((ht) => !this.dataService.isFremderHwTyp(ht))
      .sort((a, b) =>
        this.dataService.collator.compare(
          a.apkategorie + a.bezeichnung,
          b.apkategorie + b.bezeichnung
        )
      );
    this.hwtyplist.unshift(null);

    this.hwtypCtrl = new FormControl(
      { value: this.data.konfig?.hwTypId ?? null, disabled: this.data.konfig },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      [Validators.required]
    );
    this.hwtypCtrl.markAsTouched();
    this.formGroup.addControl("hwtyp", this.hwtypCtrl);

    this.herstellerCtrl = new FormControl(this.data.konfig?.hersteller ?? null, [
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Validators.required,
    ]);
    this.formGroup.addControl("herst", this.herstellerCtrl);
    this.bezeichCtrl = new FormControl(this.data.konfig?.bezeichnung ?? null, [
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Validators.required,
    ]);
    this.formGroup.addControl("bezeich", this.bezeichCtrl);
    this.cpuCtrl = new FormControl(this.data.konfig?.prozessor ?? null);
    this.formGroup.addControl("cpu", this.cpuCtrl);
    this.ramCtrl = new FormControl(this.data.konfig?.ram ?? null);
    this.formGroup.addControl("ram", this.ramCtrl);
    this.hdCtrl = new FormControl(this.data.konfig?.hd ?? null);
    this.formGroup.addControl("hd", this.hdCtrl);
    this.videoCtrl = new FormControl(this.data.konfig?.video ?? null);
    this.formGroup.addControl("video", this.videoCtrl);
    this.sonstCtrl = new FormControl(this.data.konfig?.sonst ?? null);
    this.formGroup.addControl("sonst", this.sonstCtrl);
  }

  public submit(): void {
    this.data.chg = {
      id: this.data.konfig ? this.data.konfig.id : 0,
      hwTypId: this.hwtypCtrl.value as number,
      hersteller: this.herstellerCtrl.value as string,
      bezeichnung: this.bezeichCtrl.value as string,
      prozessor: this.cpuCtrl.value as string,
      ram: this.ramCtrl.value as string,
      hd: this.hdCtrl.value as string,
      video: this.videoCtrl.value as string,
      sonst: this.sonstCtrl.value as string,
    };
    this.konfigReady.emit(this.data);
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    if (control.errors) {
      console.dir(control.errors);
      return "undefinded error";
    }
    return null;
  }
}
