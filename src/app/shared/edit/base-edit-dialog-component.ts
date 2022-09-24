import { Component, EventEmitter, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DialogTitleComponent } from "../dialog-title/dialog-title.component";
import { YesNoDialogComponent } from "../yes-no-dialog/yes-no-dialog.component";
import { BaseEditDialogData } from "./base-edit-dialog-data";

/**
 * Basis-Klasse fuer Edit-Dialoge mit Vor-/Zurück-Button
 */
@Component({
  selector: "sbsdb-base-edit-dialog",
  template: "",
})
export abstract class BaseEditDialogComponent {
  public formGroup: FormGroup;
  public onSubmitEvent: EventEmitter<void> = new EventEmitter<void>();

  public showNav = -1;

  protected constructor(
    @Inject(MAT_DIALOG_DATA) public data: BaseEditDialogData,
    public matDialogRef: MatDialogRef<BaseEditDialogComponent>,
    public formBuilder: FormBuilder,
    protected dialog: MatDialog
  ) {
    this.formGroup = this.formBuilder.group({});
    if (this.data.navigate !== undefined) {
      this.showNav = this.data.navigate;
      this.data.navigate = DialogTitleComponent.NO_NAV;
    }
    this.data.savedata = true;
  }

  public onSubmit(): void {
    this.onSubmitEvent.emit();
  }

  public navBack(): void {
    this.data.navigate = DialogTitleComponent.NAV_BACK;
    this.navigate();
  }
  public navForward(): void {
    this.onSubmit();
    this.data.navigate = DialogTitleComponent.NAV_FORWARD;
    this.navigate();
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
          this.onSubmit();
          this.matDialogRef.close(this.data);
        } else {
          this.data.savedata = false;
          this.matDialogRef.close(this.data);
        }
      });
    } else {
      this.data.savedata = false;
      this.matDialogRef.close(this.data);
    }
  }
}
