import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { Arbeitsplatz } from "../shared/model/arbeitsplatz";
import { ApEditDialogData } from "./ap-edit-dialog/ap-edit-dialog-data";
import { ApEditDialogComponent } from "./ap-edit-dialog/ap-edit-dialog.component";

@Injectable({
  providedIn: "root",
})
export class ApEditService extends BaseEditService {
  constructor(public dialog: MatDialog) {
    super(dialog);
    console.debug("c'tor ApEditService");
  }

  public testTagEdit(ap: Arbeitsplatz): void {
    const dialogRef = this.dialog.open(ApEditDialogComponent, {
      disableClose: true,
      data: { ap: ap } as ApEditDialogData,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: ApEditDialogData) => {
      console.debug("dialog closed");
    });
  }
}
