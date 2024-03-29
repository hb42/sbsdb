import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { Tag } from "app/shared/model/tag";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { StringCompare } from "../../shared/helper";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { TagTyp } from "../../shared/model/tagTyp";
import { TagChange } from "./tag-change";
import { TagInput } from "./tag-input";

@Component({
  selector: "sbsdb-edit-tags",
  templateUrl: "./edit-tags.component.html",
  styleUrls: ["./edit-tags.component.scss"],
})
export class EditTagsComponent implements OnInit {
  @Input() public ap: Arbeitsplatz;
  @Input() public formGroup: FormGroup; // uebergeordnete formGroup
  @Input() public existingTags: TagTyp[]; // nur fuer Multiedit
  @Input() public onSubmit: EventEmitter<void>; // fuer den submit der form
  @Output() public tagReady: EventEmitter<TagChange[]>; // liefert die zu aenderenden Daten

  public matcher = new FormFieldErrorStateMatcher();
  public tagFormGroup: FormGroup;
  public apTagTypes: TagTyp[] = [];
  public tagInput: TagInput[];
  public newTag: FormControl;
  public newText: FormControl;

  private count = 0;
  private changes: TagChange[] = [];

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.tagReady = new EventEmitter<TagChange[]>();
    this.tagFormGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // form submit
    this.onSubmit.subscribe(() => {
      this.submit();
    });
    // select list
    this.apTagTypes = this.dataService.tagTypList
      .filter((t) => t.apKategorieId === this.ap.apKatId)
      .sort((a, b) => StringCompare(a.bezeichnung, b.bezeichnung));
    // Daten fuer Form
    this.tagInput = this.ap.tags.map((tag) => {
      const rc = {
        apid: this.ap.apId,
        tag: tag,
        id: this.count++,
        tagCtrl: new FormControl(
          this.apTagTypes.find((t) => t.id === tag.tagId),
          // eslint-disable-next-line @typescript-eslint/unbound-method
          [Validators.required, this.checkTypes]
        ),
        textCtrl: new FormControl(this.isBoolTag(tag.flag) ? " " : tag.text, [
          // eslint-disable-next-line @typescript-eslint/unbound-method
          Validators.required,
        ]),
      };
      this.tagFormGroup.addControl(`tag_${rc.id}`, rc.tagCtrl);
      this.tagFormGroup.addControl(`txt_${rc.id}`, rc.textCtrl);
      return rc;
    });
    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("tag", this.tagFormGroup);
  }

  /**
   * Texte fuer die verschiedenen Fehler
   *
   * @param control
   */
  public getErrorMessage(control: FormControl): string {
    if (control.hasError("singleTags")) {
      return "TAGs dürfen nur einmal vergeben werden!";
    }
    if (control.hasError("required")) {
      return "Das Feld darf nicht leer sein.";
    }
    return null;
  }
  public getFormErrorMessage(): string {
    return null;
  }

  /**
   * Wenn neuer TAG ausgewaehlt wird, Text-Input leeren.
   *
   * @param input
   */
  public onSelectionChange(input: TagInput): void {
    input.textCtrl.setValue("");
    input.textCtrl.markAsTouched();
  }

  /**
   * Validator fuer den Check gegen doppelte TAGs
   *
   * als Lambda deklarieren, damit bleibt 'this' erhalten
   */
  public checkTypes = (control: FormControl): ValidationErrors => {
    if (control.parent && control.value /*&& control.value.apKategorieId*/) {
      const inp: TagTyp = control.value as TagTyp;
      let count = 0;
      Object.keys(control.parent.controls).forEach((key) => {
        const val: unknown = control.parent.get(key).value;
        // eslint-disable-next-line no-prototype-builtins
        if (val && val.hasOwnProperty("apKategorieId")) {
          if (inp.id == val["id"]) {
            count++;
          }
        }
      });
      return count > 1 ? { singleTags: true } : null;
    } else {
      return null;
    }
  };

  /**
   * Eintrag aus Liste loeschen
   *
   * @param tag
   */
  public delete(tag: TagInput): void {
    const idx = this.tagInput.findIndex((t) => t.id === tag.id);
    const remove = this.tagInput.splice(idx, 1);
    if (tag.tag) {
      // den geloeschten Wert merken
      if (remove.length === 1 && tag.tag.apTagId) {
        this.changes.push({
          apId: this.ap.apId,
          apTagId: remove[0].tag.apTagId,
          tagId: null,
          text: "",
        });
      }
    }
    this.tagFormGroup.removeControl(`tag_${tag.id}`);
    this.tagFormGroup.removeControl(`txt_${tag.id}`);
    tag.tagCtrl = null;
    tag.textCtrl = null;
    this.tagFormGroup.markAsDirty();
  }

  /**
   * Eintrag aus Liste der vorhandenen loeschen (Multiedit)
   *
   * @param tag
   */
  public deleteOld(tag: TagTyp): void {
    if (tag) {
      const idx = this.existingTags.findIndex((t) => t.id === tag.id);
      if (idx >= 0) {
        this.existingTags.splice(idx, 1);
      }
      // stellt sicher, dass diese Eintraege immer am Anfang der Liste stehen
      // (Rest wir erst bei submit angehaengt)
      this.changes.push({
        apId: 0,
        apTagId: -1,
        tagId: tag.id,
        text: "",
      });
      this.tagFormGroup.markAsDirty();
    }
  }

  /**
   * Neuen TAG anfuegen
   *
   * @param tag
   * @param val
   */
  public add(tag: TagTyp, val: string): void {
    const t = new Tag();
    t.tagId = tag.id;
    t.text = this.isBoolTag(tag.flag) ? "1" : val;
    const rc: TagInput = {
      apid: this.ap.apId,
      tag: t,
      id: this.count++,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      tagCtrl: new FormControl(tag, [Validators.required, this.checkTypes]),
      // eslint-disable-next-line @typescript-eslint/unbound-method
      textCtrl: new FormControl(this.isBoolTag(tag.flag) ? " " : val, [Validators.required]),
    };
    rc.tagCtrl.markAsTouched();
    rc.textCtrl.markAsTouched();
    this.tagFormGroup.addControl(`tag_${rc.id}`, rc.tagCtrl);
    this.tagFormGroup.addControl(`txt_${rc.id}`, rc.textCtrl);
    const newentry = this.tagInput.pop();
    this.tagInput.push(rc);
    this.tagInput.push(newentry);
    this.newTag.reset();
    this.newText.reset();
  }

  public addTag(): void {
    const rc: TagInput = {
      apid: this.ap.apId,
      tag: null,
      id: this.count++,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      tagCtrl: new FormControl(null, [Validators.required, this.checkTypes]),
      // eslint-disable-next-line @typescript-eslint/unbound-method
      textCtrl: new FormControl("", [Validators.required]),
    };
    rc.tagCtrl.markAsTouched();
    rc.textCtrl.markAsTouched();
    this.tagFormGroup.addControl(`tag_${rc.id}`, rc.tagCtrl);
    this.tagFormGroup.addControl(`txt_${rc.id}`, rc.textCtrl);
    this.tagInput.push(rc);
  }
  /**
   * Uebergeordnete form wurde abgeschickt
   *
   * Aenderungen zusammenstellen und per event zurueckschicken
   * tagId == null -> DEL
   * apTagId == null -> NEW
   */
  public submit(): void {
    // Aenderungen zusammenstellen
    // tagId == null -> DEL
    // apTagId == null -> NEW
    // Neu-Zeile wird nicht mehr gebraucht
    // this.tagInput.pop();
    this.tagInput.forEach((ti) => {
      const newTag: TagTyp = ti.tagCtrl.value as TagTyp;
      const newText: string = ti.textCtrl.value as string;
      if (ti.tag) {
        if (
          ti.tag.tagId !== newTag.id ||
          (!this.isBoolTag(ti.tag.flag) && ti.tag.text !== newText)
        ) {
          // Aenderung eines vorhandenen
          this.changes.push({
            apId: this.ap.apId,
            apTagId: ti.tag.apTagId,
            tagId: newTag.id,
            text: this.isBoolTag(newTag.flag) ? "" : newText,
          });
        }
      } else {
        // Neuer TAG
        this.changes.push({
          apId: this.ap.apId,
          apTagId: null,
          tagId: newTag.id,
          text: this.isBoolTag(newTag.flag) ? "" : newText,
        });
      }
    });

    this.tagReady.emit(this.changes);
  }

  public isBoolTag(flag: number): boolean {
    return (flag & DataService.BOOL_TAG_FLAG) !== 0;
  }
}
