import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { lastValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { DataService } from "../shared/data.service";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { PrepDateForDB } from "../shared/helper";
import { Hardware } from "../shared/model/hardware";
import { HwHistory } from "../shared/model/hw-history";
import { HwKonfig } from "../shared/model/hw-konfig";
import { HwAussondData } from "./hw-aussond-dialog/hw-aussond-data";
import { HwAussondDialogComponent } from "./hw-aussond-dialog/hw-aussond-dialog.component";
import { EditHwTransport } from "./hw-edit-dialog/edit-hw-transport";
import { HwEditDialogData } from "./hw-edit-dialog/hw-edit-dialog-data";
import { HwEditDialogComponent } from "./hw-edit-dialog/hw-edit-dialog.component";
import { NewHwData } from "./new-hw-dialog/new-hw-data";
import { NewHwDialogComponent } from "./new-hw-dialog/new-hw-dialog.component";
import { NewHwTransport } from "./new-hw-dialog/new-hw-transport";
import { ShowHistoryDialogComponent } from "./show-history-dialog/show-history-dialog.component";

@Injectable({
  providedIn: "root",
})
export class HwEditService extends BaseEditService {
  private aussondGrund = "defekt";

  constructor(public dialog: MatDialog, public dataService: DataService) {
    super(dialog, dataService);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public hwEdit(hw: Hardware): void {
    this.edit({
      hw: hw,
      editAp: true,
      editHw: !this.dataService.isFremdeHardware(hw),
      editMac: true,
      macs: [],
      removeAp: false,
      delHw: false,
      hwChange: null,
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
      delHw: false,
      hwChange: null,
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
      delHw: false,
      hwChange: null,
    } as HwEditDialogData);
  }

  public newHw(hwkonfig: HwKonfig): void {
    const dialogRef = this.dialog.open(NewHwDialogComponent, {
      disableClose: true,
      data: hwkonfig,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: NewHwData) => {
      if (result) {
        result.anschDat = PrepDateForDB(result.anschDat);
        const post: NewHwTransport = {
          konfigId: result.konfig.id,
          invNr: result.invNr ?? "",
          anschWert: result.anschWert ?? 0,
          anschDat: result.anschDat,
          wartungFa: result.wartungFa ?? "",
          bemerkung: result.bemerkung ?? "",
          devices: result.devices,
        };
        this.dataService.post(this.dataService.addHwUrl, post);
      }
    });
  }

  public async showHistory(hw: Hardware): Promise<void> {
    const url = `${this.dataService.hwHistoryUrl}/${hw.id}`;
    const hwh: HwHistory[] = (await lastValueFrom(this.dataService.get(url))) as HwHistory[];
    this.dialog.open(ShowHistoryDialogComponent, {
      disableClose: true,
      data: { hw: hw, list: hwh },
    });
  }

  public deleteHw(hw: Hardware): void {
    const dialogRef = this.dialog.open(HwAussondDialogComponent, {
      data: {
        title: `${hw.hwKonfig.hwTypBezeichnung}: ${hw.hwKonfig.konfiguration} [${hw.sernr}] aussondern`,
        reason: this.aussondGrund,
      } as HwAussondData,
    });
    dialogRef.afterClosed().subscribe((result: HwAussondData) => {
      if (result) {
        this.aussondGrund = result.reason;
        const post = {
          id: hw.id,
          delHw: true,
          removeAp: false,
          vlans: [],
          aussonderung: result.reason,
        } as EditHwTransport;
        this.save(post);
      }
    });
  }

  private edit(hwe: HwEditDialogData): void {
    if (this.dataService.isPeripherie(hwe.hw)) {
      hwe.editMac = false;
    }
    const dialogRef = this.dialog.open(HwEditDialogComponent, {
      disableClose: true,
      data: hwe,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: HwEditDialogData) => {
      if (result) {
        this.saveDlg(result);
      }
    });
  }

  private saveDlg(result: HwEditDialogData): void {
    const post = {
      id: result.hw.id,
      delHw: result.delHw,
      removeAp: result.removeAp,
      vlans: result.macs,
    } as EditHwTransport;
    if (result.hwChange) {
      post.sernr = result.hwChange.sernr;
      post.anschDat = PrepDateForDB(result.hwChange.anschDat);
      post.anschWert = result.hwChange.anschWert;
      post.invNr = result.hwChange.invNr;
      post.bemerkung = result.hwChange.bemerkung;
      post.smbiosgiud = result.hwChange.smbiosgiud;
      post.wartungFa = result.hwChange.wartungFa;
    } else {
      post.sernr = null;
    }
    this.save(post);
  }

  private save(post: EditHwTransport): void {
    this.dataService.post(this.dataService.changeHwUrl, post);
  }
}
