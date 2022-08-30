import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../environments/environment";
import { DataService } from "../shared/data.service";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { IpHelper } from "../shared/ip-helper";
import { Arbeitsplatz } from "../shared/model/arbeitsplatz";
import { ChangeAptypTransport } from "../shared/model/change-aptyp-transport";
import { Hardware } from "../shared/model/hardware";
import { HwKonfig } from "../shared/model/hw-konfig";
import { Netzwerk } from "../shared/model/netzwerk";
import { YesNoDialogComponent } from "../shared/yes-no-dialog/yes-no-dialog.component";
import { ApEditDialogData } from "./ap-edit-dialog/ap-edit-dialog-data";
import { ApEditDialogComponent } from "./ap-edit-dialog/ap-edit-dialog.component";
import { EditApTransport } from "./ap-edit-dialog/edit-ap-transport";
import { NewApData } from "./new-ap/new-ap-data";
import { NewApComponent } from "./new-ap/new-ap.component";

@Injectable({
  providedIn: "root",
})
export class ApEditService extends BaseEditService {
  constructor(public dialog: MatDialog, public dataService: DataService) {
    super(dialog, dataService);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public newAp(): void {
    const dialogRef = this.dialog.open(NewApComponent, { data: { typ: null } });
    dialogRef.afterClosed().subscribe((result: NewApData) => {
      if (result && result.typ) {
        const ap: Arbeitsplatz = {
          apKatBezeichnung: result.typ.apkategorie,
          apKatFlag: 0,
          apKatId: result.typ.apKategorieId,
          apTypBezeichnung: result.typ.bezeichnung,
          apTypFlag: result.typ.flag,
          apTypId: result.typ.id,
          apname: "",
          bemerkung: "",
          bezeichnung: "",
          hw: [],
          hwStr: "",
          // hwTypStr: "",
          ipStr: "",
          macStr: IpHelper.getMacString("0"),
          macsearch: "",
          oe: undefined,
          oeId: 0,
          sonstHwStr: "",
          tags: [],
          verantwOe: undefined,
          verantwOeId: 0,
          vlanStr: "",
          apId: 0,
        };
        if (this.dataService.isFremderApTyp(result.typ)) {
          // fremde HW: hier nur das Noetigste eintragen, der Rest wird auf dem Server erledigt
          const hwkonfig: HwKonfig = new HwKonfig();
          hwkonfig.apKatBezeichnung = "";
          hwkonfig.apKatFlag = 0;
          hwkonfig.apKatId = 0;
          hwkonfig.bezeichnung = "";
          hwkonfig.hd = "";
          hwkonfig.hersteller = "";
          hwkonfig.hwTypBezeichnung = "";
          hwkonfig.hwTypFlag = DataService.FREMDE_HW_FLAG;
          hwkonfig.hwTypId = 0;
          hwkonfig.id = 0;
          hwkonfig.prozessor = "";
          hwkonfig.ram = "";
          hwkonfig.sonst = "";
          hwkonfig.video = "";
          hwkonfig.konfiguration = "";

          const hw = new Hardware();
          hw.anschWert = 0;
          hw.apId = 0;
          hw.apStr = "Fremde HW - " + result.typ.apkategorie;
          hw.bemerkung = "";
          hw.hwKonfig = hwkonfig;
          hw.hwKonfigId = 0;
          hw.id = 0;
          hw.invNr = "";
          hw.ipStr = "";
          hw.macStr = IpHelper.getMacString(IpHelper.NULL_MAC);
          hw.macsearch = "";
          hw.pri = true;
          hw.sernr = "";
          hw.smbiosgiud = "";
          hw.vlanStr = "";
          hw.vlans = [];
          hw.wartungFa = "";

          const vlan: Netzwerk = {
            bezeichnung: "",
            hwMacId: 0,
            ip: 0,
            ipStr: "",
            mac: IpHelper.NULL_MAC,
            macStr: IpHelper.getMacString(IpHelper.NULL_MAC),
            netmask: 0,
            vlan: 0,
            vlanId: 0,
          };
          hw.vlans.push(vlan);
          ap.hw.push(hw);
        }
        this.apEdit(ap);
      }
    });
  }

  public apEdit(ap: Arbeitsplatz): void {
    this.edit({ ap: ap, editAp: true, editHw: true, editTags: true } as ApEditDialogData);
  }

  public hwEdit(ap: Arbeitsplatz): void {
    this.edit({ ap: ap, editHw: true } as ApEditDialogData);
  }

  public tagsEdit(ap: Arbeitsplatz): void {
    this.edit({ ap: ap, editTags: true } as ApEditDialogData);
  }

  public deleteAp(ap: Arbeitsplatz): void {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: "Arbeitsplatz löschen",
        text: `Soll der Arbeitsplatz "${ap.apname} ${ap.oe.betriebsstelle} - ${ap.bezeichnung}" gelöscht werden?`,
      },
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        const post = {
          id: ap.apId,
          ap: null,
          hw: null,
          tags: null,
          delAp: true,
        } as EditApTransport;
        this.save(post);
      }
    });
  }

  public changeAptyp(ap: Arbeitsplatz): void {
    const aptyp = this.dataService.aptypList.find((t) => t.id === ap.apTypId);
    const dialogRef = this.dialog.open(NewApComponent, { data: { typ: aptyp } });
    dialogRef.afterClosed().subscribe((result: NewApData) => {
      if (result && result.typ.id !== aptyp.id) {
        const post: ChangeAptypTransport = { apid: ap.apId, aptypid: result.typ.id };
        const oldFremde = this.dataService.isFremderApTyp(aptyp);
        const newFremde = this.dataService.isFremderApTyp(result.typ);
        if (oldFremde !== newFremde) {
          if (!newFremde) {
            // fremdeHW zu !fremdeHW
            const yesno = this.dialog.open(YesNoDialogComponent, {
              data: {
                title: "Arbeitsplatz-Typ ändern",
                text: `Änderung durchführen? Die Hardware mit der Netzwerkadresse "${
                  ap.ipStr ? ap.ipStr + (ap.macStr ? " –– " + ap.macStr : "") : ap.macStr
                }" wird gelöscht!`,
              },
            });
            yesno.afterClosed().subscribe((res: boolean) => {
              if (res) {
                this.dataService.post(this.dataService.changeApAptypUrl, post);
              }
            });
          } else {
            // !fremdeHW zu fremdeHW
            const yesno = this.dialog.open(YesNoDialogComponent, {
              data: {
                title: "Arbeitsplatz-Typ ändern",
                text: `Änderung durchführen? Zugeordnete Hardware wird entfernt und ein neuer "Fremde Hardware"-Datensatz wird eingetragen!`,
              },
            });
            yesno.afterClosed().subscribe((res: boolean) => {
              if (res) {
                this.dataService.post(this.dataService.changeApAptypUrl, post);
              }
            });
          }
        } else {
          this.dataService.post(this.dataService.changeApAptypUrl, post);
        }
      }
    });
  }

  private edit(dat: ApEditDialogData) {
    const dialogRef = this.dialog.open(ApEditDialogComponent, {
      disableClose: true,
      data: dat,
    });

    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: ApEditDialogData) => {
      if (result) {
        this.saveDlg(result);
      }
    });
  }

  private saveDlg(result: ApEditDialogData): void {
    const post = {
      id: result.ap.apId,
      ap: result.apData,
      tags: result.tags ?? [],
      hw: result.hw,
      delAp: false,
    } as EditApTransport;
    this.save(post);
  }

  private save(post: EditApTransport): void {
    this.dataService.post(this.dataService.changeApUrl, post);
  }
}
