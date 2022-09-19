import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { StringCompare } from "../../shared/helper";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { TagTyp } from "../../shared/model/tagTyp";
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
  public oldTags: TagTyp[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditApMultiData,
    public matDialogRef: MatDialogRef<ApEditMultiDialogComponent>,
    public formBuilder: FormBuilder,
    private dataService: DataService
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
    let tags: number[] = [];
    // TypIDs aller Tags der APs
    this.data.selectlist.forEach((ap) => ap.tags.forEach((t) => tags.push(t.tagId)));
    // auf eindeutige IDs reduzieren
    tags = [...new Set(tags)];
    // diese TagTypen aus der Liste holen
    tags.forEach((t) => this.oldTags.push(this.dataService.tagTypList.find((l) => l.id === t)));
    this.oldTags.sort((a, b) => StringCompare(a.bezeichnung, b.bezeichnung));
  }

  public onSubmit() {
    console.debug("ap multi edit submit");
    this.onSubmitEvent.emit();
  }

  public tagReady(evt: TagChange[]): void {
    console.debug("evt tagReady");
    console.dir(evt);
    this.data.tags = evt;
  }

  public multiReady(evt: MultiChange): void {
    this.data.change = evt;
  }
}
