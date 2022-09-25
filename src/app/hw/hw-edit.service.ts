import { formatDate, formatNumber } from "@angular/common";
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
import { YesNoDialogComponent } from "../shared/yes-no-dialog/yes-no-dialog.component";
import { HwAussondData } from "./hw-aussond-dialog/hw-aussond-data";
import { HwAussondDialogComponent } from "./hw-aussond-dialog/hw-aussond-dialog.component";
import { EditHwTransport } from "./hw-edit-dialog/edit-hw-transport";
import { HwEditDialogData } from "./hw-edit-dialog/hw-edit-dialog-data";
import { HwEditDialogComponent } from "./hw-edit-dialog/hw-edit-dialog.component";
import { EditHwMultiData } from "./hw-edit-multi-dialog/edit-hw-multi-data";
import { HwEditMultiDialogComponent } from "./hw-edit-multi-dialog/hw-edit-multi-dialog.component";
import { HwFilterService } from "./hw-filter.service";
import { NewHwData } from "./new-hw-dialog/new-hw-data";
import { NewHwDialogComponent } from "./new-hw-dialog/new-hw-dialog.component";
import { NewHwTransport } from "./new-hw-dialog/new-hw-transport";
import { ShowHistoryDialogComponent } from "./show-history-dialog/show-history-dialog.component";

@Injectable({
  providedIn: "root",
})
export class HwEditService extends BaseEditService<Hardware> {
  private aussondGrund = "defekt";

  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
    private filterService: HwFilterService
  ) {
    super(dialog, dataService);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  protected setEditFromNavigation() {
    this.editFromNavigation.subscribe((hw) => this.hwEdit(hw));
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
      navigate: this.filterService.getNavigationIcons((h) => h.id === hw.id),
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

  public editSelected(selectlist: Hardware[]): void {
    console.debug("edit selected count=", selectlist.length);
    const dialogRef = this.dialog.open(HwEditMultiDialogComponent, {
      disableClose: true,
      id: "edit-dialog",
      data: {
        selectList: selectlist,
        change: null,
        removeAp: false,
      } as EditHwMultiData,
    });
    dialogRef.afterClosed().subscribe((result: EditHwMultiData) => {
      console.debug("hw edit multi dlg afterClose");
      console.dir(result);
      const resultlist: EditHwTransport[] = [];
      if (result) {
        selectlist.forEach((hw) => {
          if (
            result.change.invNr ||
            result.change.anschDat ||
            result.change.anschWert ||
            result.change.wartungFa ||
            result.removeAp
          ) {
            const hwt: EditHwTransport = {
              delHw: false,
              removeAp: false,
              id: hw.id,
              sernr: hw.sernr,
              invNr: hw.invNr,
              anschDat: hw.anschDat,
              anschWert: hw.anschWert,
              wartungFa: hw.wartungFa,
              bemerkung: hw.bemerkung,
              hwKonfigId: hw.hwKonfigId,
              smbiosgiud: hw.smbiosgiud,
              vlans: [],
            };
            if (result.change.invNr) {
              hwt.invNr = result.change.invNr;
            }
            if (result.change.anschDat) {
              hwt.anschDat = result.change.anschDat;
            }
            if (result.change.anschWert) {
              hwt.anschWert = result.change.anschWert;
            }
            if (result.change.wartungFa) {
              hwt.wartungFa = result.change.wartungFa;
            }
            if (result.removeAp) {
              hwt.removeAp = result.removeAp;
            }
            resultlist.push(hwt);
          }
        });
        if (resultlist.length) {
          this.saveMulti(result, resultlist);
        }
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
      id: "edit-dialog",
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: HwEditDialogData) => {
      if (result) {
        if (result.savedata) {
          this.saveDlg(result);
        }
        // handle navigation
        const to = this.filterService.navigateTo(result.navigate, (h) => h.id === result.hw.id);
        if (to) {
          this.editFromNavigation.emit(to);
        }
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

  private saveMulti(result: EditHwMultiData, resultlist: EditHwTransport[]): void {
    const plural = result.selectList.length !== 1;
    const count = result.selectList.length.toString(10);
    let msg = `Bei Klick auf "OK" werden die folgenden Änderungen für ${
      plural ? "die " + count + " ausgewählten Geräte" : "das ausgewählte Gerät"
    } vorgenommen:\n`;
    if (result.removeAp) {
      msg += `\n  - Zuordnung zum Arbeitsplatz wird gelöscht`;
    }
    if (result.change.invNr) {
      msg += `\n  - der Inventar-Nr. wird zu "${result.change.invNr}" geändert`;
    }
    if (result.change.anschDat) {
      msg += `\n  - das Anschaffungs-Datum wird zu "${formatDate(
        result.change.anschDat,
        "mediumDate",
        "de"
      )}" geändert`;
    }
    if (result.change.anschWert) {
      msg += `\n  - der Anschaffungs-Wert wird zu "${formatNumber(
        result.change.anschWert,
        "de",
        "1.2-2"
      )}" geändert`;
    }
    if (result.change.wartungFa) {
      msg += `\n  - die Wartungs-Firma wird zu "${result.change.wartungFa}" geändert`;
    }

    const yesno = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: plural ? `${count} Geräte ändern` : "Gerät ändern",
        text: msg,
      },
    });
    yesno.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.dataService.post(this.dataService.changeHwMultiUrl, resultlist);
      }
    });
  }
}
