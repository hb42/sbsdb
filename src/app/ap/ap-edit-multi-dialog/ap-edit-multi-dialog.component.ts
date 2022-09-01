import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { MultiChange } from "../edit-multi/multi-change";
import { TagChange } from "../edit-tags/tag-change";
import { EditApMultiData } from "./edit-ap-multi-data";

@Component({
  selector: "sbsdb-ap-edit-multi-dialog",
  templateUrl: "./ap-edit-multi-dialog.component.html",
  styleUrls: ["./ap-edit-multi-dialog.component.scss"],
})
export class ApEditMultiDialogComponent {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  public pseudoAp: Arbeitsplatz;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditApMultiData,
    public matDialogRef: MatDialogRef<ApEditMultiDialogComponent>,
    public formBuilder: FormBuilder
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.formGroup = this.formBuilder.group({});
    this.pseudoAp = {
      apId: 0,
      apKatBezeichnung: "",
      apKatFlag: 0,
      apKatId: data.apkatid,
      apTypBezeichnung: "",
      apTypFlag: 0,
      apTypId: 0,
      apname: "",
      bemerkung: "",
      bezeichnung: "",
      hw: [],
      hwStr: "",
      ipStr: "",
      macStr: "",
      macsearch: "",
      oe: undefined,
      oeId: 0,
      sonstHwStr: "",
      tags: [],
      verantwOe: undefined,
      verantwOeId: 0,
      vlanStr: "",
    };
  }

  public onSubmit() {
    console.debug("ap multi edit submit");
    this.onSubmitEvent.emit();
  }

  public tagReady(evt: TagChange[]): void {
    this.data.tags = evt;
  }

  public multiReady(evt: MultiChange): void {
    this.data.change = evt;
  }
}
