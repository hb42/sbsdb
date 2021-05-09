import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { Hardware } from "../../shared/model/hardware";
import { HwChange } from "./hw-change";

@Component({
  selector: "sbsdb-edit-ap-hw",
  templateUrl: "./edit-ap-hw.component.html",
  styleUrls: ["./edit-ap-hw.component.scss"],
})
export class EditApHwComponent implements OnInit {
  @Input() public ap: Arbeitsplatz;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public hwReady: EventEmitter<HwChange>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public hwFormGroup: FormGroup;

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    console.debug("c'tor EditApHwCompomnenmt");
    this.hwReady = new EventEmitter<HwChange>();
    this.hwFormGroup = this.formBuilder.group({});
  }

  public ngOnInit(): void {
    this.onSubmit.subscribe(() => {
      // resultHW = [] -> hwId, mac, vlanId, ip
      this.submit();
    });

    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("tag", this.hwFormGroup);
  }

  public submit(): void {
    console.debug("edit hw submit");
    const changes: HwChange = {
      apid: this.ap.apId,
      // TODO Datenstruktur fuer die Rueckmeldung
      // hw: this.resultHw
    };

    // FIXME hier sind die Ergebnisse aus hwInputReady noch nicht da
    //       ueber hwFormGroup iterieren?
    Object.keys(this.hwFormGroup.controls).forEach((key) => {
      console.debug("formgroup.key = " + key);
      // -> key: formGroup -> formGroup.controls key: formControl/formGroup
      console.dir(this.hwFormGroup.get(key));
    });
    this.hwReady.emit(changes);
  }

  public hwInputReady(evt: Hardware): void {
    console.debug("from hw input");
    // TODO Daten vorbereiten fuer submit()
    // resultHw.push(evt)
  }

  public priHw(): Hardware {
    return this.ap.hw.find((h) => h.pri);
  }

  public periHw(): Hardware[] {
    return this.ap.hw.filter((h) => !h.pri);
  }
}
