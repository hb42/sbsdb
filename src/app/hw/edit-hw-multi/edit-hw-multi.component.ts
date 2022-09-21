import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";

@Component({
  selector: "sbsdb-edit-hw-multi",
  templateUrl: "./edit-hw-multi.component.html",
  styleUrls: ["./edit-hw-multi.component.scss"],
})
export class EditHwMultiComponent implements OnInit {
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Input() public apremove: boolean;
  @Output() public dataReady: EventEmitter<boolean>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public multiFormGroup: FormGroup;
  public remapCtrl: FormControl;

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.dataReady = new EventEmitter<boolean>();
    this.multiFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    this.remapCtrl = new FormControl(this.apremove);
    this.formGroup.addControl("removeap", this.remapCtrl);
  }

  public submit(): void {
    this.dataReady.emit(this.remapCtrl.value as boolean);
  }
}
