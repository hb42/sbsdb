import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "../shared/data.service";
import { BaseEditService } from "../shared/filter/base-edit-service";
import { IpHelper } from "../shared/ip-helper";
import { ApHw } from "../shared/model/ap-hw";
import { ApTyp } from "../shared/model/ap-typ";
import { Arbeitsplatz } from "../shared/model/arbeitsplatz";
import { Hardware } from "../shared/model/hardware";
import { HwKonfig } from "../shared/model/hw-konfig";
import { Netzwerk } from "../shared/model/netzwerk";
import { Vlan } from "../shared/model/vlan";
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
    console.debug("c'tor ApEditService");
  }

  public newAp(): void {
    const dialogRef = this.dialog.open(NewApComponent, { data: { typ: null } });
    dialogRef.afterClosed().subscribe((result: NewApData) => {
      console.debug("dlg closed");
      if (result && result.typ) {
        console.debug("with result");
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
          hwTypStr: "",
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
        if ((result.typ.flag & DataService.FREMDE_HW_FLAG) !== 0) {
          // fremde HW: hier nur das Noetigste eintragen, der Rest wird auf dem Server erledigt
          const hwkonfig: HwKonfig = {
            apKatBezeichnung: "",
            apKatFlag: 0,
            apKatId: 0,
            bezeichnung: "",
            hd: "",
            hersteller: "",
            hwTypBezeichnung: "",
            hwTypFlag: DataService.FREMDE_HW_FLAG,
            hwTypId: 0,
            id: 0,
            prozessor: "",
            ram: "",
            sonst: "",
            video: "",
          };
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
          hw.konfiguration = "";
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
        if (a) {
          this.dataService.updateAp(a.ap, a.hw);
          // TODO trigger apfilter f. new ap/hw
          //      braucht wohl einen event zu ap-filter-service -> einbauen im Kontext
          //      der SSE-Impementierung
          console.debug("post succeeded");
          console.dir(a);
        } else {
          console.error("Server liefert kein Ergebnis für apchange");
        }
      },
      (err: Error) => {
        console.error("Error " + err.message);
        console.dir(err);
      }
    );
  }
}
