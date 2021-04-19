import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { Tag } from "app/shared/model/tag";
import { DataService } from "../../shared/data.service";
import { FormFieldErrorStateMatcher } from "../../shared/form-field-error-state-matcher";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { TagTyp } from "../../shared/model/tagTyp";
import { TagInput } from "./tag-input";

@Component({
  selector: "sbsdb-edit-tags",
  templateUrl: "./edit-tags.component.html",
  styleUrls: ["./edit-tags.component.scss"],
})
export class EditTagsComponent implements OnInit {
  @Input() public ap: Arbeitsplatz;
  @Input() public formGroup: FormGroup;
  @Input() public onSubmit: EventEmitter<void>;
  @Output() public tagReady: EventEmitter<unknown>;

  public matcher = new FormFieldErrorStateMatcher();
  public tagFormGroup: FormGroup;
  public apTagTypes: TagTyp[];
  public tagInput: TagInput[];
  public newTag: FormControl;
  public newText: FormControl;
  public noTextFlag: number = DataService.BOOL_TAG_FLAG;

  private count = 0;
  private remove: TagInput[] = [];

  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    console.debug("c'tor EditTagsCompomnenmt");
    this.tagReady = new EventEmitter<unknown>();
    this.tagFormGroup = this.formBuilder.group({});
  }

  async ngOnInit(): Promise<void> {
    this.onSubmit.subscribe(() => {
      console.debug("EditTagsComponent onSubmit");
      this.tagReady.emit(this.tagInput);
    });

    const tt = (await this.dataService
      .get(this.dataService.allTagTypesUrl)
      .toPromise()) as TagTyp[];
    this.apTagTypes = tt
      .filter((t) => t.apKategorieId === this.ap.apKatId)
      .sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));

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
        // eslint-disable-next-line @typescript-eslint/unbound-method
        textCtrl: new FormControl(tag.text, [Validators.required]),
      };
      this.tagFormGroup.addControl(`tag_${rc.id}`, rc.tagCtrl);
      this.tagFormGroup.addControl(`txt_${rc.id}`, rc.textCtrl);
      return rc;
    });
    const empty: TagInput = {
      apid: this.ap.apId,
      tag: null,
      id: this.count++,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      tagCtrl: new FormControl(null, [Validators.required, this.checkTypes]),
      // eslint-disable-next-line @typescript-eslint/unbound-method
      textCtrl: new FormControl("", [Validators.required]),
    };
    // Formfelder fuer neue Werte nicht an FormGroup haengen. Die waere immer invalid, wenn
    // diese beiden leer sind!
    this.newTag = empty.tagCtrl;
    this.newText = empty.textCtrl;
    this.tagInput.push(empty);
    // an die uebergeordnete Form anhaengen
    this.formGroup.addControl("tag", this.tagFormGroup);
  }

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

  public checkTypes(control: FormControl): ValidationErrors {
    if (control.parent) {
      const set = new Set();
      let count = 0;
      Object.keys(control.parent.controls).forEach((key) => {
        const val: unknown = control.parent.get(key).value;
        // eslint-disable-next-line no-prototype-builtins
        if (val && val.hasOwnProperty("apKategorieId")) {
          set.add(val["id"]);
          count++;
        }
      });
      return set.size !== count ? { singleTags: true } : null;
    } else {
      return null;
    }
  }

  public delete(tag: TagInput): void {
    if (tag) {
      const idx = this.tagInput.findIndex((t) => t.id === tag.id);
      const remove = this.tagInput.splice(idx, 1);
      // der geloeschte Wert war schoin gespeichert als merken
      if (remove.length === 1 && tag.tag.apTagId) {
        this.remove.push(remove[0]);
      }
      this.tagFormGroup.removeControl(`tag_${tag.id}`);
      this.tagFormGroup.removeControl(`txt_${tag.id}`);
      tag.tagCtrl = null;
      tag.textCtrl = null;
    }
  }

  public add(tag: TagTyp, val: string): void {
    // Validierung der "neu"-Felder ??
    const t = new Tag();
    t.apTagId = this.ap.apId;
    t.tagId = tag.id;
    t.text = val;
    const rc: TagInput = {
      apid: this.ap.apId,
      tag: t,
      id: this.count++,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      tagCtrl: new FormControl(tag, [Validators.required, this.checkTypes]),
      // eslint-disable-next-line @typescript-eslint/unbound-method
      textCtrl: new FormControl(val, [Validators.required]),
    };
    this.tagFormGroup.addControl(`tag_${rc.id}`, rc.tagCtrl);
    this.tagFormGroup.addControl(`txt_${rc.id}`, rc.textCtrl);
    this.newTag.reset();
    this.newText.reset();
    const newentry = this.tagInput.pop();
    this.tagInput.push(rc);
    this.tagInput.push(newentry);
    console.debug("add");
  }
}
