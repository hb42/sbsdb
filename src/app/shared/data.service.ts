import { formatNumber } from "@angular/common";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { lastValueFrom, Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ConfigService } from "./config/config.service";
import { IpHelper } from "./ip-helper";
import { ApTransport } from "./model/ap-transport";
import { ApTyp } from "./model/ap-typ";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { Betrst } from "./model/betrst";
import { ExtProg } from "./model/ext-prog";
import { Hardware } from "./model/hardware";
import { HwKonfig } from "./model/hw-konfig";
import { HwTransport } from "./model/hw-transport";
import { TagTyp } from "./model/tagTyp";
import { Vlan } from "./model/vlan";
import { NotificationService } from "./notification.service";

@Injectable({
  providedIn: "root",
})
export class DataService {
  public static defaultpageSize = 200;
  public static TAG_DISPLAY_NAME = "TAG";
  public static BOOL_TAG_FLAG = 0b0000_0001;
  // public static FREMDE_HW_FLAG = 0b0000_0001;
  public static PERIPHERIE_FLAG = 0b0000_0001;

  public apList: Arbeitsplatz[] = [];
  public bstList: Betrst[] = [];
  public hwList: Hardware[] = [];
  public hwKonfigList: HwKonfig[] = [];
  public tagTypList: TagTyp[] = [];
  public vlanList: Vlan[] = [];
  public aptypList: ApTyp[] = [];
  public extProgList: ExtProg[] = [];

  // Signale fuer das Laden der benoetigten Daten:
  //   apListFetched signalisiert, dass die AP-Liste vollstaendig geladen ist (und
  //   implizit Bst-Liste). Mit hwListReady wurde HW- und HwKonfig-Liste geladen und
  //   die Verknuepfung zur Hardware in die AP-Liste eingetragen, danach wird
  //   apListReady ausgeloest, d.h. damit sind alle Daten einsatzbereit.
  public apListFetched: EventEmitter<void> = new EventEmitter<void>();
  public apListReady: EventEmitter<void> = new EventEmitter<void>();
  public bstListReady: EventEmitter<void> = new EventEmitter<void>();
  public hwListReady: EventEmitter<void> = new EventEmitter<void>();
  public hwKonfigListReady: EventEmitter<void> = new EventEmitter<void>();
  // dataReady signalisiert, dass alle Daten geladen und vorbereitet sind
  public dataReady: EventEmitter<void> = new EventEmitter<void>();

  // TODO wenn die Signalisierung funktioniert, kann hier das Handling einer
  //      aktualisierten Liste eingehaengt werden
  public tagTypListReady: EventEmitter<void> = new EventEmitter<void>();
  public vlanListReady: EventEmitter<void> = new EventEmitter<void>();
  public aptypListReady: EventEmitter<void> = new EventEmitter<void>();

  public apListChanged: EventEmitter<void> = new EventEmitter<void>();

  // Web-API calls
  public readonly oeTreeUrl: string;
  public readonly allApsUrl: string;
  public readonly pageApsUrl: string;
  public readonly singleApUrl: string;
  public readonly countApUrl: string;
  public readonly allBstUrl: string;
  public readonly allHwUrl: string;
  public readonly countHwUrl: string;
  public readonly pageHwUrl: string;
  public readonly allHwKonfig: string;
  public readonly allTagTypesUrl: string;
  public readonly allVlansUrl: string;
  public readonly allApTypUrl: string;
  public readonly changeApUrl: string;
  public readonly changeHwUrl: string;
  public readonly hwHistoryUrl: string;
  public readonly extProgUrl: string;

  // case-insensitive alpha sort
  // deutlich schneller als String.localeCompare()
  //  -> result = this.collator.compare(a, b)
  public collator = new Intl.Collator("de", {
    numeric: true,
    sensitivity: "base",
  });

  private aplistfetched = false;
  private aplistready = false;
  private bstlistready = false;
  private hwlistready = false;
  private hwkonfiglistready = false;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private notification: NotificationService
  ) {
    console.debug("c'tor DataService");

    this.oeTreeUrl = this.configService.webservice + "/tree/oe";
    this.allApsUrl = this.configService.webservice + "/ap/all";
    this.pageApsUrl = this.configService.webservice + "/ap/page/";
    this.singleApUrl = this.configService.webservice + "/ap/id/";
    this.countApUrl = this.configService.webservice + "/ap/count";
    this.allBstUrl = this.configService.webservice + "/betrst/all";
    this.allHwUrl = this.configService.webservice + "/hw/all";
    this.pageHwUrl = this.configService.webservice + "/hw/page/";
    this.countHwUrl = this.configService.webservice + "/hw/count";
    this.allHwKonfig = this.configService.webservice + "/hwkonfig/all";
    this.allTagTypesUrl = this.configService.webservice + "/ap/tagtypes";
    this.allVlansUrl = this.configService.webservice + "/ap/vlans";
    this.allApTypUrl = this.configService.webservice + "/ap/aptypes";

    this.changeApUrl = this.configService.webservice + "/ap/changeap";
    this.changeHwUrl = this.configService.webservice + "/hw/changehw";

    this.hwHistoryUrl = this.configService.webservice + "/hw/hwhistoryfor";

    this.extProgUrl = this.configService.webservice + "/svz/extprog/all";

    const readyEventCheck = () => {
      if (this.isDataReady()) {
        console.debug("## all data ready");
        this.dataReady.emit();
      }
    };
    this.apListFetched.subscribe(() => {
      this.aplistfetched = true;
      readyEventCheck();
    });
    this.apListReady.subscribe(() => {
      this.aplistready = true;
      readyEventCheck();
    });
    this.bstListReady.subscribe(() => {
      this.bstlistready = true;
      readyEventCheck();
    });
    this.hwListReady.subscribe(() => {
      this.hwlistready = true;
      readyEventCheck();
    });
    this.hwKonfigListReady.subscribe(() => {
      this.hwkonfiglistready = true;
      readyEventCheck();
    });

    this.fetchExtProgList();
    this.fetchTagTypList();
    this.fetchVlanList();
    this.fetchApTypList();

    notification.initialize();

    notification.apChange.subscribe((data) => {
      console.debug("dataService start update ap");
      this.updateAp(data);
      this.updateHwKonfigListCount();
      if (!notification.isOpen()) {
        console.debug("reopening Notification");
        notification.initialize();
      }
      this.apListChanged.emit();
    });

    notification.hwChange.subscribe((data) => {
      console.debug("dataService start update hw");
      this.updateHw(data);
      this.updateHwKonfigListCount();
      if (!notification.isOpen()) {
        console.debug("reopening Notification");
        notification.initialize();
      }
      this.apListChanged.emit();
    });

    // TODO hwKonfig-Aenderung
    // notification.hwKonfigChange.subscribe((data) => {
    //   console.debug("dataService start update hwKonfig");
    //   this.updateHwKonfig(data);
    //   -> update list ...
    //      this.apList.forEach((ap) => {
    //        this.updateApHw(ap.apId);
    //      })
    //
    //   this.updateHwKonfigListCount();
    //   --- TODO auslagern
    //   if (!notification.isOpen()) {
    //     console.debug("reopening Notification");
    //     notification.initialize();
    //   }
    //   ---
    //   this.hwKonfigListChanged.emit();
    // });
  }

  public get(url: string): Observable<unknown> {
    return this.http.get(url);
  }

  public post(url: string, data: unknown): Observable<unknown> {
    return this.http.post(url, data).pipe(catchError(this.handleError));
  }

  public isDataReady(): boolean {
    return this.aplistready && this.bstlistready && this.hwlistready && this.hwkonfiglistready;
  }

  public isApListFetched(): boolean {
    return this.aplistfetched;
  }

  public isApListReady(): boolean {
    return this.aplistready;
  }

  public isBstListReady(): boolean {
    return this.bstlistready;
  }

  public isHwListReady(): boolean {
    return this.hwlistready;
  }

  public isHwKonfigListReady(): boolean {
    return this.hwkonfiglistready;
  }

  public async fetchBstList(): Promise<void> {
    const bst = (await lastValueFrom(this.get(this.allBstUrl))) as Betrst[];
    console.debug("fetch Betrst size=", bst.length);
    this.bstList = bst;
    this.prepBst();
    this.bstListReady.emit();
  }

  public fetchTagTypList(): void {
    this.get(this.allTagTypesUrl).subscribe((tt: TagTyp[]) => {
      this.tagTypList = tt;
      this.tagTypListReady.emit();
    });
  }

  public fetchVlanList(): void {
    this.get(this.allVlansUrl).subscribe((v: Vlan[]) => {
      this.vlanList = v;
      this.vlanListReady.emit();
    });
  }

  public fetchApTypList(): void {
    this.get(this.allApTypUrl).subscribe((t: ApTyp[]) => {
      this.aptypList = t;
      this.aptypListReady.emit();
    });
  }

  public fetchExtProgList(): void {
    this.get(this.extProgUrl).subscribe((e: ExtProg[]) => {
      this.extProgList = e;
    });
  }

  public prepareApList(): void {
    this.apList.forEach((ap) => {
      this.prepareAp(ap);
    });
  }

  public prepareHwList(): void {
    this.updateHwKonfigListCount();
    this.hwList.forEach((hw) => {
      this.prepareHw(hw);
    });
    this.apList.forEach((ap) => {
      this.apSortHw(ap);
    });
  }

  /**
   * Anzahl der Zuordnungen in der HwKonfigList eintragen
   */
  public updateHwKonfigListCount(): void {
    this.hwKonfigList.forEach((conf) => {
      conf.konfiguration = conf.hersteller + " - " + conf.bezeichnung;
      let count = 0;
      let inuse = 0;
      for (let i = 0; i < this.hwList.length; i++) {
        if (this.hwList[i].hwKonfigId === conf.id) {
          count++;
          if (this.hwList[i].apId) {
            inuse++;
          }
        }
      }
      conf.deviceCount = count;
      conf.apCount = inuse;
    });
  }

  /**
   * Felder RAM + HD formatieren.
   * Die Felder enthalten i.d.R. einen Integer-Wert, der die Groesse in MB angibt.
   * Da die Felder als String gespeichert werden, sind auch andere Eingaben moeglich.
   * Sofern es sich um einen reinen Zahlwert handelt, wird er als Zahl mit Tausender-
   * Trennung formatiert. Alles andere wird nur durchgereicht.
   *
   * @param num
   */
  public formatMbSize(num: string): string {
    const isnumber = /^[+-]?\d+$/;
    num = num ? num.trim() : "";
    if (isnumber.test(num)) {
      return formatNumber(Number.parseFloat(num), "de", "1.0-0") + " MB";
    } else {
      return num;
    }
  }

  public tagFieldName(tag: string): string {
    // alles ausser Buchstaben (a-z) und Ziffern aus der TAG-Bezeichnung entfernen
    // fuer die Verwendung als Feldname im Arbeitsplatz.Object
    const name = tag.replace(/[^\w^\d]/g, "");
    return `${DataService.TAG_DISPLAY_NAME}${name}`;
  }

  // OE-Hierarchie aufbauen
  // -> bst.children enthaelt die direkt untergeordneten OEs (=> Rekursion fuers Auslesen)
  private prepBst() {
    this.bstList.forEach((bst) => {
      // idx 0 -> BST "Reserve" => 0 als parent == kein parent
      bst.fullname = `00${bst.bstNr}`.slice(-3) + " " + bst.betriebsstelle;
      if (bst.parentId) {
        const parent = this.bstList.find((b) => b.bstId === bst.parentId);
        if (parent) {
          bst.parent = parent;
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(bst);
        } else {
          bst.parent = null;
        }
      }
    });
    this.bstList.forEach((bst) => {
      bst.hierarchy = bst.fullname;
      if (bst.parent) {
        let p = bst.parent;
        while (p) {
          bst.hierarchy = p.fullname + "/" + bst.hierarchy;
          p = p.parent;
        }
      }
    });
  }

  /**
   * AP-Aenderung eintragen
   * @param data: .ap = geaenderter AP, .hw = alle geaenderten HW-records
   * @private
   */
  private updateAp(data: ApTransport): void {
    if (data.delApId > 0) {
      // DEL AP
      this.apList.splice(
        this.apList.findIndex((ap) => ap.apId === data.delApId),
        1
      );
      this.changeApHw(data.hw);
    } else {
      const ap = this.changeAp(data);
      this.apSortHw(ap);
    }
  }

  /**
   * HW-Aenderung eintragen
   * @param data: .hw = geaenderte HW, .delHwId > 0 => HW loeschen
   * @private
   */
  private updateHw(data: HwTransport): void {
    this.changeHw(data.hw, data.delHwId > 0);
  }

  /**
   * AP-Daten vom Server in lokale Datenstruktur ueberfuehren
   *
   * HW-Daten werden in prepareHw() eingetragen
   */
  private prepareAp(ap: Arbeitsplatz): void {
    ap.hwStr = ""; // keine undef Felder!
    ap.sonstHwStr = ""; // keine undef Felder!
    ap.hw = [];

    ap.ipStr = ""; // aus priHW
    ap.macStr = ""; // aus priHW
    ap.vlanStr = ""; // aus priHW
    ap.macsearch = ""; // alle MACs

    const oe = this.bstList.find((bst) => ap.oeId === bst.bstId);
    if (oe) {
      ap.oe = oe;
    } else {
      // TODO leere OE anhaengen
    }
    if (ap.verantwOeId) {
      const voe = this.bstList.find((bst) => ap.verantwOeId === bst.bstId);
      if (voe) {
        ap.verantwOe = voe;
      } else {
        // TODO leere OE anhaengen
      }
    } else {
      ap.verantwOe = ap.oe;
    }

    // ap.oesearch = `00${ap.oe.bstNr}`.slice(-3) + " " + ap.oe.betriebsstelle; // .toLowerCase();
    // ap.oesort = ap.oe.betriebsstelle; // .toLowerCase();
    // ap.voesearch = `00${ap.verantwOe.bstNr}`.slice(-3) + " " + ap.verantwOe.betriebsstelle; // .toLowerCase();
    // ap.voesort = ap.verantwOe.betriebsstelle; // .toLowerCase();

    // ap.subTypes = [];
    ap.tags.forEach((tag) => {
      tag.text = tag.flag & DataService.BOOL_TAG_FLAG ? "1" : tag.text;
      ap[this.tagFieldName(tag.bezeichnung)] = tag.text;
    });
    this.sortAP(ap);
  }

  /**
   * HW-Daten vom Server in die lokalen Datenstrukturen ueberfuehren
   *
   * Voraussetzung: die fn muss in einer Schleife fuer die gesamte HW eines AP
   *                aufgerufen werden.
   */
  private prepareHw(hw: Hardware): void {
    hw.hwKonfig = this.hwKonfigList.find((h) => h.id === hw.hwKonfigId);
    let macsearch = "";
    hw.ipStr = "";
    hw.macStr = "";
    hw.vlanStr = "";
    hw.ap = null;
    hw.apStr = "";
    hw.anschDat = new Date(hw.anschDat);
    // TODO ext MAC?
    if (hw.vlans && hw.vlans[0]) {
      hw.vlans.forEach((v) => {
        const dhcp = v.ip === 0 ? " (DHCP)" : "";
        v.ipStr = v.vlan ? IpHelper.getIpString(v.vlan + v.ip) + dhcp : "";
        v.macStr = IpHelper.getMacString(v.mac);
        hw.ipStr += hw.ipStr ? "/ " + v.ipStr : v.ipStr;
        hw.macStr += hw.macStr ? "/ " + v.macStr : v.macStr;
        hw.vlanStr += hw.vlanStr ? "/ " + v.bezeichnung : v.bezeichnung;
        macsearch += v.mac;
      });
      hw.macsearch = macsearch;
    }

    if (hw.apId) {
      const ap = this.apList.find((a) => a.apId === hw.apId);
      if (ap) {
        hw.ap = ap;
        hw.apStr = ap.apname + " | " + ap.oe.betriebsstelle + " | " + ap.bezeichnung; // TODO ext OE
        ap.hw.push(hw);
        if (hw.pri) {
          // if ((hw.hwKonfig.hwTypFlag & DataService.FREMDE_HW_FLAG) === 0) {
          //   ap.hwTypStr = hw.hwKonfig.konfiguration;
          // }
          ap.macsearch = macsearch;
          ap.hwStr = hw.hwKonfig.konfiguration + " [" + hw.sernr + "]"; // TODO ext KONFIG
          ap.ipStr += ap.ipStr ? " / " + hw.ipStr : hw.ipStr;
          ap.macStr += ap.macStr ? " / " + hw.macStr : hw.macStr;
          ap.vlanStr += ap.vlanStr ? " / " + hw.vlanStr : hw.vlanStr;
        } else {
          // fuer die Suche in sonstiger HW
          ap.sonstHwStr +=
            (ap.sonstHwStr ? " / " : "") +
            " " +
            hw.hwKonfig.konfiguration + // TODO ext KONFIG
            (hw.sernr && !hw.hwKonfig.fremdeHw ? " [" + hw.sernr + "]" : "");
        }
      }
    } else {
      // no AP
      if (hw.hwKonfig.fremdeHw) {
        // fremde HW ohne AP loeschen
        this.hwList.splice(
          this.hwList.findIndex((h) => h.id === hw.id),
          1
        );
      }
    }
  }

  /**
   * Geaenderte AP-Daten in die lokalen Datenstrukturen einbauen
   */
  private changeAp(data: ApTransport): Arbeitsplatz {
    const neu = data.ap;
    let ap = this.apList.find((a) => a.apId === neu.apId);
    if (!ap) {
      console.debug("updateAp() new ap");
      ap = this.newAp(neu.apId);
    }
    const keys = Object.keys(ap);
    keys.forEach((key) => {
      if (key.startsWith(DataService.TAG_DISPLAY_NAME)) {
        delete ap[key];
      }
    });
    ap.oeId = neu.oeId;
    ap.verantwOeId = neu.verantwOeId;
    ap.oe = null;
    ap.verantwOe = null;
    ap.tags = neu.tags;
    ap.apname = neu.apname;
    ap.bezeichnung = neu.bezeichnung;
    ap.apKatId = neu.apKatId;
    ap.apKatBezeichnung = neu.apKatBezeichnung;
    ap.apKatFlag = neu.apKatFlag;
    ap.apTypId = neu.apTypId;
    ap.apTypBezeichnung = neu.apTypBezeichnung;
    ap.apTypFlag = neu.apTypFlag;
    ap.bemerkung = neu.bemerkung;
    this.prepareAp(ap);
    this.changeApHw(data.hw);
    return ap;
  }

  /**
   * AP wurde geaendert, (ggf. geaenderte) HW wieder eintragen
   */
  private changeApHw(neuHw: Hardware[]): void {
    neuHw.forEach((nhw) => {
      if (nhw.sernr) {
        const hw = this.addOrChangeHw(nhw);
        this.prepareHw(hw);
      } else {
        // DEL HW
        this.hwList.splice(
          this.hwList.findIndex((h) => h.id === nhw.id),
          1
        );
      }
    });
  }

  /**
   * Geaenderte HW eintragen
   */
  private changeHw(neu: Hardware, del: boolean): void {
    const old = this.hwList.find((h) => h.id === neu.id);
    let oldApId = 0;
    if (old && old.apId !== neu.apId) {
      oldApId = old.apId;
    }
    // Falls AP-Wechsel, HW aus altem AP austragen
    if (oldApId) {
      this.updateApHw(oldApId, neu.id);
    }
    if (del) {
      // DEL HW
      this.hwList.splice(
        this.hwList.findIndex((h) => h.id === neu.id),
        1
      );
    } else {
      // HW-Aenderung
      const hw = this.addOrChangeHw(neu);
      // wenn zugeordnet, bei AP eintragen/updaten
      if (hw.apId) {
        this.updateApHw(hw.apId);
      } else {
        this.prepareHw(hw);
      }
    }
  }

  /**
   * Hardware beim AP neu eintragen bei Aenderung HW-Daten
   *
   * @param apId - der Arbeitsplatz
   * @param delHwId - wenn > 0, die zu entfernende HW
   * @private
   */
  private updateApHw(apId: number, delHwId: number = 0): void {
    const aphw: Hardware[] = [];
    const ap = this.apList.find((a) => a.apId === apId);
    ap.hw.forEach((h) => {
      if (h.id !== delHwId) {
        aphw.push(h);
      }
    });
    this.prepareAp(ap);
    aphw.forEach((h) => this.prepareHw(h));
    this.apSortHw(ap);
  }

  private newAp(id: number): Arbeitsplatz {
    const ap: Arbeitsplatz = {
      apKatBezeichnung: "",
      apKatFlag: 0,
      apKatId: 0,
      apTypBezeichnung: "",
      apTypFlag: 0,
      apTypId: 0,
      apname: "",
      bemerkung: "",
      bezeichnung: "",
      hw: [],
      hwStr: "",
      // hwTypStr: "",
      ipStr: "",
      macStr: "",
      macsearch: "",
      oe: undefined,
      oeId: 0,
      sonstHwStr: "",
      tags: [],
      verantwOe: undefined,
      verantwOeId: 0,
      vlanStr: "",
      apId: id,
    };
    this.apList.push(ap);
    return ap;
  }

  private addOrChangeHw(nhw: Hardware): Hardware {
    let hw = this.hwList.find((h) => h.id === nhw.id);
    if (!hw) {
      // neue HW (sollte nur fuer fremde HW vorkommen)
      hw = new Hardware();
      hw.id = nhw.id;
      this.hwList.push(hw);
    }
    hw.vlans = nhw.vlans;
    hw.apId = nhw.apId;
    hw.bemerkung = nhw.bemerkung;
    hw.wartungFa = nhw.wartungFa;
    hw.smbiosgiud = nhw.smbiosgiud;
    hw.anschWert = nhw.anschWert;
    hw.anschDat = nhw.anschDat;
    hw.invNr = nhw.invNr;
    hw.sernr = nhw.sernr;
    hw.pri = nhw.pri;
    hw.hwKonfigId = nhw.hwKonfigId;
    return hw;
  }

  private sortAP(ap: Arbeitsplatz) {
    ap.tags.sort((a, b) => {
      if (a.flag === b.flag) {
        return this.collator.compare(a.bezeichnung, b.bezeichnung);
      } else {
        return a.flag & DataService.BOOL_TAG_FLAG ? -1 : 1;
      }
    });
  }

  private apSortHw(ap: Arbeitsplatz): void {
    ap.hw.sort((a, b) => {
      if (a.pri) {
        return -1;
      } else if (b.pri) {
        return 1;
      } else {
        return this.collator.compare(
          a.hwKonfig.hwTypBezeichnung + a.hwKonfig.hersteller + a.hwKonfig.bezeichnung + a.sernr,
          b.hwKonfig.hwTypBezeichnung + b.hwKonfig.hersteller + b.hwKonfig.bezeichnung + b.sernr
        );
      }
    });
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, ` + `body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError("Something bad happened; please try again later.");
  };
}
