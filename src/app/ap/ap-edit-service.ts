import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "../shared/data.service";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { ApHw } from "../shared/model/ap-hw";
import { Arbeitsplatz } from "../shared/model/arbeitsplatz";
import { ApEditDialogData } from "./ap-edit-dialog/ap-edit-dialog-data";
import { ApEditDialogComponent } from "./ap-edit-dialog/ap-edit-dialog.component";
import { EditApTransport } from "./ap-edit-dialog/edit-ap-transport";

@Injectable({
  providedIn: "root",
})
export class ApEditService extends BaseEditService {
  constructor(public dialog: MatDialog, public dataService: DataService) {
    super(dialog, dataService);
    console.debug("c'tor ApEditService");
  }

  public apEdit(ap: Arbeitsplatz): void {
    this.edit({ ap: ap, editAp: true, editHw: true, editTags: true } as ApEditDialogData);
  }

  public hwEdit(ap: Arbeitsplatz): void {
    console.debug("open edit aphw");
    console.dir(ap);
    this.edit({ ap: ap, editHw: true } as ApEditDialogData);
  }

  public tagsEdit(ap: Arbeitsplatz): void {
    this.edit({ ap: ap, editTags: true } as ApEditDialogData);
  }

  private edit(dat: ApEditDialogData) {
    const dialogRef = this.dialog.open(ApEditDialogComponent, {
      disableClose: true,
      data: dat,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: ApEditDialogData) => {
      console.debug("dialog closed");
      console.dir(result);
      if (result) {
        this.save(result);
      }
    });
  }

  private save(result: ApEditDialogData): void {
    const post = {
      id: result.ap.apId,
      ap: result.apData,
      tags: result.tags ?? [],
      hw: result.hw,
    } as EditApTransport;
    console.debug("save changes");
    console.dir(post);
    this.dataService.post(this.dataService.changeApUrl, post).subscribe(
      (a: ApHw) => {
        // TODO handle changed AP
        this.dataService.updateAp(a.ap, a.hw);

        console.debug("post succeeded");
        console.dir(a);
      },
      (err: Error) => {
        console.error("Error " + err.message);
        console.dir(err);
      }
    );
  }
}
