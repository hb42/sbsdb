import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { DialogTitleComponent } from "../../shared/dialog-title/dialog-title.component";
import { YesNoDialogComponent } from "../../shared/yes-no-dialog/yes-no-dialog.component";
import { HwChange } from "../edit-ap-hw/hw-change";
import { ApChange } from "../edit-ap/ap-change";
import { TagChange } from "../edit-tags/tag-change";
import { ApEditDialogData } from "./ap-edit-dialog-data";

@Component({
  selector: "sbsdb-ap-edit-dialog",
  templateUrl: "./ap-edit-dialog.component.html",
  styleUrls: ["./ap-edit-dialog.component.scss"],
})
export class ApEditDialogComponent {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  public showNav = -1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApEditDialogData,
    public matDialogRef: MatDialogRef<ApEditDialogComponent>,
    public formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.formGroup = this.formBuilder.group({});
    if (this.data.navigate !== undefined) {
      this.showNav = this.data.navigate;
      this.data.navigate = DialogTitleComponent.NO_NAV;
    }
    // if (this.data.editAp && this.data.editAp && this.data.editTags) {
    //   this.showNav = 3; // TODO
    // }
  }

  public onSubmit(): void {
    console.debug("apEditDialog onSubmit()");
    this.onSubmitEvent.emit();
  }

  public tagReady(evt: TagChange[]): void {
    console.debug("apEditDialog tagReady()");
    this.data.tags = evt;
  }

  public hwReady(evt: HwChange): void {
    console.debug("apEditDialog hwChange()");
    this.data.hw = evt;
  }

  public apReady(evt: ApChange): void {
    console.debug("apEditDialog apReady()");
    this.data.apData = evt;
  }

  public navBack(evt: unknown): void {
    console.debug("apEditDialog navBack()");
    console.dir(evt);
    this.data.navigate = DialogTitleComponent.NAV_BACK;
    this.navigate();
    // this.matDialogRef.close();
  }
  public navForward(evt: unknown): void {
    console.debug("apEditDialog navForward()");
    console.dir(evt);
    this.onSubmit();
    this.data.navigate = DialogTitleComponent.NAV_FORWARD;
    this.navigate();
    // this.matDialogRef.close(this.data);
  }

  private navigate() {
    if (this.formGroup.dirty) {
      const yesno = this.dialog.open(YesNoDialogComponent, {
        data: {
          title: "Daten verändert",
          text: "Sollen die geänderten Daten gespeichert werden?",
        },
      });
      yesno.afterClosed().subscribe((ok: boolean) => {
        if (ok) {
          console.debug("apEditDialog nav+save");
          this.onSubmit();
          this.matDialogRef.close(this.data);
        } else {
          console.debug("apEditDialog nav+abort");
          this.data.apData = null; // signalisiert "nicht speichern"
          this.matDialogRef.close(this.data);
        }
      });
    } else {
      this.data.apData = null;
      this.matDialogRef.close(this.data);
    }
  }
}
