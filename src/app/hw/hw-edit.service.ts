import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "../shared/data.service";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { Hardware } from "../shared/model/hardware";
import { EditConfigData } from "./edit-config-dialog/edit-config-data";
import { EditConfigDialogComponent } from "./edit-config-dialog/edit-config-dialog.component";
import { EditHwTransport } from "./hw-edit-dialog/edit-hw-transport";
import { HwEditDialogData } from "./hw-edit-dialog/hw-edit-dialog-data";
import { HwEditDialogComponent } from "./hw-edit-dialog/hw-edit-dialog.component";

@Injectable({
  providedIn: "root",
})
export class HwEditService extends BaseEditService {
  constructor(public dialog: MatDialog, public dataService: DataService) {
    super(dialog, dataService);
    console.debug("c'tor HwEditService");
  }

  public hwEdit(hw: Hardware): void {
    this.edit({ hw: hw, editAp: true, editHw: true, editMac: true } as HwEditDialogData);
  }
  public hwapEdit(hw: Hardware): void {
    this.edit({ hw: hw, editAp: true } as HwEditDialogData);
  }
  public hwhwEdit(hw: Hardware): void {
    this.edit({ hw: hw, editHw: true } as HwEditDialogData);
  }
  public hwmacEdit(hw: Hardware): void {
    this.edit({ hw: hw, editMac: true } as HwEditDialogData);
  }

  public editConfig(hw: Hardware): void {
    this.editConf({ hw: hw });
  }

  private edit(hwe: HwEditDialogData): void {
    const dialogRef = this.dialog.open(HwEditDialogComponent, {
      disableClose: true,
      data: hwe,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: HwEditDialogData) => {
      console.debug("dialog closed");
      console.dir(result);
      if (result) {
        this.saveDlg(result);
      }
    });
  }

  private saveDlg(result: HwEditDialogData): void {
    const post = {
      hw: result.hw.id,
    } as EditHwTransport;
    this.save(post);
  }

  private save(post: EditHwTransport): void {
    console.debug("save changes");
    console.dir(post);
    this.dataService.post(this.dataService.changeHwUrl, post).subscribe(
      (a: never) => {
        console.debug("post succeeded");
        console.dir(a);
        // if (a) {
        //   this.dataService.updateAp(a.ap, a.hw, a.delApId);
        //   // TODO trigger apfilter f. new ap/hw
        //   //      braucht wohl einen event zu ap-filter-service -> einbauen im Kontext
        //   //      der SSE-Impementierung
        //   filterChange.emit();
        //
        //   console.debug("post succeeded");
        //   console.dir(a);
        // } else {
        //   console.error("Server liefert kein Ergebnis für apchange");
        // }
      },
      (err: Error) => {
        console.error("Error " + err.message);
        console.dir(err);
      }
    );
  }

  private editConf(hwe: EditConfigData): void {
    const dialogRef = this.dialog.open(EditConfigDialogComponent, {
      disableClose: true,
      data: hwe,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: EditConfigData) => {
      console.debug("dialog closed");
      console.dir(result);
      // if (result) {
      //   this.saveDlg(result);
      // }
    });
  }
}
