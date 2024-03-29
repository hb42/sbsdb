import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../environments/environment";
import { ConfigService } from "../shared/config/config.service";
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
import { ApEditMultiDialogComponent } from "./ap-edit-multi-dialog/ap-edit-multi-dialog.component";
import { EditApMultiData } from "./ap-edit-multi-dialog/edit-ap-multi-data";
import { ApFilterService } from "./ap-filter.service";
import { HwPeriChange } from "./edit-ap-hw/hw-peri-change";
import { TagChange } from "./edit-tags/tag-change";
import { MoveData } from "./move-dialog/move-data";
import { MoveDialogComponent } from "./move-dialog/move-dialog.component";
import { NewApData } from "./new-ap/new-ap-data";
import { NewApComponent } from "./new-ap/new-ap.component";

@Injectable({
  providedIn: "root",
})
export class ApEditService extends BaseEditService<Arbeitsplatz> {
  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
    private configSservice: ConfigService,
    private filterService: ApFilterService
  ) {
    super(dialog, dataService);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  protected setEditFromNavigation() {
    this.editFromNavigation.subscribe((ap) => this.apEdit(ap));
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
    this.edit({
      ap: ap,
      editAp: true,
      editHw: true,
      editTags: true,
      navigate: this.filterService.getNavigationIcons((a) => a.apId === ap.apId),
    } as ApEditDialogData);
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
                this.dataService.post(this.configSservice.changeApAptypUrl, post);
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
                this.dataService.post(this.configSservice.changeApAptypUrl, post);
              }
            });
          }
        } else {
          this.dataService.post(this.configSservice.changeApAptypUrl, post);
        }
      }
    });
  }

  public editSelected(selectlist: Arbeitsplatz[]) {
    // nur wenn alle Element die gleiche ApKategorie haben dürfen TAGs und APTyp geaendert werden
    const katid = selectlist[0].apKatId;
    const isOneKat = !selectlist.some((ap) => ap.apKatId !== katid);

    const dialogRef = this.dialog.open(ApEditMultiDialogComponent, {
      disableClose: true,
      id: "edit-dialog",
      data: {
        selectlist: selectlist,
        apkatid: isOneKat ? katid : null,
        change: { newApTypId: null, newOeId: null, newVOeId: null },
        tags: [],
      } as EditApMultiData,
    });
    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: EditApMultiData) => {
      const resultList = this.prepareMultiResult(result);
      if (resultList.length) {
        this.saveMulti(result, resultList);
      }
    });
  }

  /**
   * Hardware und/oder TAGs zu anderem AP uebertragen
   *
   * Dabei werden auf dem Ziel ggf. vorhandene HW und/oder TAGs entfernt.
   * D.h. HW und/oder TAGs der Quelle ersetzen die Eintraege im Ziel.
   *
   * @param ap
   */
  public moveAp(ap: Arbeitsplatz): void {
    const dialogRef = this.dialog.open(MoveDialogComponent, {
      disableClose: true,
      data: {
        ap: ap,
      },
    });
    dialogRef.afterClosed().subscribe((result: MoveData) => {
      let save = false;
      if (result) {
        if (result.ap && result.target && result.what) {
          const source: EditApTransport = {
            id: result.ap.apId,
            delAp: false,
            ap: null,
            hw: null,
            tags: [],
          };
          const target: EditApTransport = {
            id: result.target.apId,
            delAp: false,
            ap: null,
            hw: null,
            tags: [],
          };
          // result.what -> 1 - HW, 2 - TAGs, 3 - HW+TAGs
          if (result.what > 1 && result.ap.tags && result.ap.tags.length) {
            // move TAGs, nur wenn in Quelle TAGs vorhanden
            // beim Ziel alte entfernen
            save = true;
            result.target.tags.forEach((t) =>
              target.tags.push({
                apId: result.target.apId,
                tagId: null,
                apTagId: t.apTagId,
                text: t.text,
              })
            );
            result.ap.tags.forEach((t) => {
              source.tags.push({
                apId: result.ap.apId,
                tagId: null,
                apTagId: t.apTagId,
                text: t.text,
              });
              target.tags.push({
                apId: result.target.apId,
                tagId: t.tagId,
                apTagId: null,
                text: t.text,
              });
            });
          }
          if ((result.what & 0b01) > 0 && result.ap.hw && result.ap.hw.length) {
            save = true;
            target.hw = {
              apid: result.target.apId,
              newpriId: 0,
              periph: [],
              priVlans: [],
            };
            source.hw = {
              apid: result.ap.apId,
              newpriId: 0,
              periph: [],
              priVlans: [],
            };
            // HW von target entfernen
            result.target.hw.forEach((hw) => {
              if (hw.pri) {
                target.hw.newpriId = 0;
              } else {
                target.hw.periph.push({ hwId: hw.id, del: true, vlans: [] });
              }
            });
            result.ap.hw.forEach((hw) => {
              if (hw.pri) {
                target.hw.newpriId = hw.id;
                hw.vlans.forEach((v) =>
                  target.hw.priVlans.push({
                    vlanId: v.vlanId,
                    mac: v.mac,
                    ip: v.ip,
                    hwMacId: v.hwMacId,
                  })
                );
              } else {
                source.hw.periph.push({ hwId: hw.id, del: true, vlans: [] });
                const periph: HwPeriChange = { hwId: hw.id, del: false, vlans: [] };
                hw.vlans.forEach((v) =>
                  periph.vlans.push({ vlanId: v.vlanId, mac: v.mac, ip: v.ip, hwMacId: v.hwMacId })
                );
                target.hw.periph.push(periph);
              }
            });
          }
          if (save) {
            this.dataService.post(this.configSservice.changeApMoveUrl, [source, target]);
          }
        }
      }
    });
  }

  private edit(dat: ApEditDialogData) {
    const dialogRef = this.dialog.open(ApEditDialogComponent, {
      disableClose: true,
      data: dat,
      id: "edit-dialog",
    });
    // Dialog-Ergebnis
    dialogRef.afterClosed().subscribe((result: ApEditDialogData) => {
      if (result) {
        if (result.savedata) {
          this.saveDlg(result);
        }
        // handle navigation
        const to = this.filterService.navigateTo(result.navigate, (a) => a.apId === result.ap.apId);
        if (to) {
          this.editFromNavigation.emit(to);
        }
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
    this.dataService.post(this.configSservice.changeApUrl, post);
  }

  private prepareMultiResult(result: EditApMultiData): EditApTransport[] {
    const resultList: EditApTransport[] = [];
    if (
      result &&
      (result.tags || result.change.newOeId || result.change.newVOeId || result.change.newApTypId)
    ) {
      result.selectlist.forEach((ap) => {
        const res: EditApTransport = {
          ap: { apid: ap.apId },
          delAp: false,
          hw: undefined,
          id: ap.apId,
          tags: [],
        };
        if (result.change.newOeId && ap.oeId !== result.change.newOeId) {
          res.ap.standortId = result.change.newOeId;
        }
        if (result.change.newVOeId && ap.verantwOeId !== result.change.newVOeId) {
          res.ap.verantwId = result.change.newVOeId;
        }
        if (result.change.newApTypId && ap.apTypId !== result.change.newApTypId) {
          res.ap.apTypId = result.change.newApTypId;
        }
        if (result.tags) {
          result.tags.forEach((t) => {
            const tagchange: TagChange = {
              apId: ap.apId,
              apTagId: null,
              tagId: t.tagId,
              text: t.text,
            };
            const exist = ap.tags.find((ex) => ex.tagId === t.tagId);
            if (exist) {
              tagchange.apTagId = exist.apTagId;
              // ueberschreiben oder loeschen
              if (t.apTagId === -1) {
                // loeschen
                tagchange.tagId = null;
                res.tags.push(tagchange);
              } else {
                // aendern
                const isdeleted = res.tags.find((r) => r.apTagId === exist.apTagId);
                if (isdeleted) {
                  // es existiert schon ein Loeschauftrag fuer TagID
                  // (Loeschauftraege stehen immer am Anfang von result.tags -> EditTagsComponent#deleteOld())
                  // statt delete + new nur change
                  isdeleted.tagId = exist.tagId;
                  isdeleted.text = t.text;
                } else {
                  res.tags.push(tagchange);
                }
              }
            } else {
              // neuer Tag
              if (t.apTagId !== -1) {
                res.tags.push(tagchange);
              }
            }
          });
        }
        if (res.ap.standortId || res.ap.verantwId || res.ap.apTypId || res.tags.length) {
          resultList.push(res);
        }
      });
    }
    return resultList;
  }

  private saveMulti(result: EditApMultiData, resultlist: EditApTransport[]): void {
    const plural = result.selectlist.length !== 1;
    const count = result.selectlist.length.toString(10);
    let msg = `Bei Klick auf "OK" werden die folgenden Änderungen für ${
      plural ? "die " + count + " ausgewählten Arbeitsplätze" : "den ausgewählten Arbeitsplatz"
    } vorgenommen:\n`;
    if (result.change.newApTypId) {
      const typ = this.dataService.aptypList.find(
        (t) => t.id === result.change.newApTypId
      ).bezeichnung;
      msg += `\n  - der Arbeitsplatztyp wird zu "${typ}" geändert`;
    }
    if (result.change.newOeId) {
      const bst = this.dataService.bstList.find(
        (b) => b.bstId === result.change.newOeId
      ).betriebsstelle;
      msg += `\n  - der Standort ${
        result.change.newOeId === result.change.newVOeId
          ? "und die verantwortliche OE werden"
          : "wird"
      } zu "${bst}" geändert`;
    }
    if (result.change.newVOeId && result.change.newVOeId !== result.change.newOeId) {
      const bst = this.dataService.bstList.find(
        (b) => b.bstId === result.change.newVOeId
      ).betriebsstelle;
      msg += `\n  - die verantwortliche OE wird zu "${bst}" geändert`;
    }
    if (result.tags) {
      result.tags.forEach((tag) => {
        const tagname = this.dataService.tagTypList.find((t) => t.id === tag.tagId).bezeichnung;
        if (tag.apTagId === -1) {
          msg += `\n  - die sonstige Information "${tagname}" wird${
            plural ? " bei allen Arbeitsplätzen" : ""
          } entfernt`;
        } else {
          msg += `\n  - die sonstige Information "${tagname}" wird ${
            tag.text ? 'mit dem Wert "' + tag.text + '"' : ""
          } eingetragen`;
        }
      });
    }
    const yesno = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: plural ? `${count} Arbeitsplätze ändern` : "Arbeitsplatz ändern",
        text: msg,
      },
    });
    yesno.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.dataService.post(this.configSservice.changeApMultiUrl, resultlist);
      }
    });
  }
}
