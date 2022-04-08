import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { lastValueFrom } from "rxjs";
import { DataService } from "../shared/data.service";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { Hardware } from "../shared/model/hardware";
import { HwHistory } from "../shared/model/hw-history";
import { EditConfigData } from "./edit-config-dialog/edit-config-data";
import { EditConfigDialogComponent } from "./edit-config-dialog/edit-config-dialog.component";
import { EditHwTransport } from "./hw-edit-dialog/edit-hw-transport";
import { HwEditDialogData } from "./hw-edit-dialog/hw-edit-dialog-data";
import { HwEditDialogComponent } from "./hw-edit-dialog/hw-edit-dialog.component";
import { ShowHistoryDialogComponent } from "./show-history-dialog/show-history-dialog.component";

@Injectable({
  providedIn: "root",
})
export class HwEditService extends BaseEditService {
  constructor(public dialog: MatDialog, public dataService: DataService) {
    super(dialog, dataService);
    console.debug("c'tor HwEditService");
  }

  public hwEdit(hw: Hardware): void {
    this.edit({
      hw: hw,
      editAp: true,
      editHw: true,
      editMac: true,
      macs: [],
      removeAp: false,
    } as HwEditDialogData);
  }
  public hwapEdit(hw: Hardware): void {
    this.edit({
      hw: hw,
      editAp: true,
      editHw: false,
      editMac: false,
      macs: [],
      removeAp: false,
    } as HwEditDialogData);
  }
  public hwhwEdit(hw: Hardware): void {
    this.edit({
      hw: hw,
      editAp: false,
      editHw: true,
      editMac: false,
      macs: [],
      removeAp: false,
    } as HwEditDialogData);
  }
  public hwmacEdit(hw: Hardware): void {
    this.edit({
      hw: hw,
      editAp: false,
      editHw: false,
      editMac: true,
      macs: [],
      removeAp: false,
    } as HwEditDialogData);
  }

  public newHw(): void {
    console.debug("new HW clicked");
  }

  public async showHistory(hw: Hardware): Promise<void> {
    const url = `${this.dataService.hwHistoryUrl}/${hw.id}`;
    const hwh: HwHistory[] = (await lastValueFrom(this.dataService.get(url))) as HwHistory[];
    const dialogRef = this.dialog.open(ShowHistoryDialogComponent, {
      disableClose: true,
      data: { hw: hw, list: hwh },
    });
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
      id: result.hw.id,
      removeAp: result.removeAp,
      vlans: result.macs,

      anschDat: result.hwChange.anschDat,
      anschWert: result.hwChange.anschWert,
      sernr: result.hwChange.sernr,
      invNr: result.hwChange.invNr,
      bemerkung: result.hwChange.bemerkung,
      smbiosgiud: result.hwChange.smbiosgiud,
      wartungFa: result.hwChange.wartungFa,
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
