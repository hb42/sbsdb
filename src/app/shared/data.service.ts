import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Betrst } from "./model/betrst";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { Hardware } from "./model/hardware";
import { HwKonfig } from "./model/hw-konfig";
import { ConfigService } from "./config/config.service";
import { TagTyp } from "./model/tagTyp";
import { Vlan } from "./model/vlan";

@Injectable({
  providedIn: "root",
})
export class DataService {
  public static defaultpageSize = 200;
  public static TAG_DISPLAY_NAME = "TAG";
  public static BOOL_TAG_FLAG = 1;
  public static FREMDE_HW_FLAG = 1;
  public static PERIPHERIE_FLAG = 1;

  public apList: Arbeitsplatz[] = [];
  public bstList: Betrst[] = [];
  public hwList: Hardware[] = [];
  public hwKonfigList: HwKonfig[] = [];
  public tagTypList: TagTyp[] = [];
  public vlanList: Vlan[] = [];

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
  public readonly changeApUrl: string;

  // case insensitive alpha sort
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

  constructor(private http: HttpClient, private configService: ConfigService) {
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
    this.changeApUrl = this.configService.webservice + "/ap/changeap";

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

    this.fetchTagTypList();
    this.fetchVlanList();
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

  public getMacString(mac: string): string {
    // kein match => Eingabe-String
    return mac.replace(/^(.{2})(.{2})(.{2})(.{2})(.{2})(.{2})$/, "$1:$2:$3:$4:$5:$6").toUpperCase();
  }

  public getIpString(ip: number): string {
    /* eslint-disable no-bitwise */
    const ip4 = ip & 0xff;
    ip = ip >> 8;
    const ip3 = ip & 0xff;
    ip = ip >> 8;
    const ip2 = ip & 0xff;
    ip = ip >> 8;
    const ip1 = ip & 0xff;

    return `${ip1}.${ip2}.${ip3}.${ip4}`;
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

  public updateAp(neu: Arbeitsplatz, neuHw: Hardware[]): void {
    const ap = this.apList.find((a) => a.apId === neu.apId);
    if (!ap) {
      console.error("updateAp() AP not found. New:");
      console.dir(neu);
      return;
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
    ap.apKatId = neu.apKatId;
    ap.apKatBezeichnung = neu.apKatBezeichnung;
    ap.apKatFlag = neu.apKatFlag;
    ap.apTypId = neu.apTypId;
    ap.apTypBezeichnung = neu.apTypBezeichnung;
    ap.apTypFlag = neu.apTypFlag;
    ap.bemerkung = neu.bemerkung;
    this.prepareAP(ap);
    ap.hw.forEach((hw) => {
      hw.apId = null;
      if (hw.vlans) {
        hw.vlans.forEach((v) => {
          v.ip = null;
          v.vlanId = null;
          v.bezeichnung = "";
          v.netmask = null;
          v.vlan = null;
        });
      }
      this.prepareHw(hw);
    });
    neuHw.forEach((nhw) => {
      const hw = this.hwList.find((h) => h.id === nhw.id);
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
      this.prepareHw(hw);
    });
    this.apSortHw(ap);
  }

  public prepareAP(ap: Arbeitsplatz): void {
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
      tag.text = tag.flag === DataService.BOOL_TAG_FLAG ? "1" : tag.text;
      ap[this.tagFieldName(tag.bezeichnung)] = tag.text;
    });
    this.sortAP(ap);
  }

  private sortAP(ap: Arbeitsplatz) {
    ap.tags.sort((a, b) => {
      if (a.flag === b.flag) {
        return this.collator.compare(a.bezeichnung, b.bezeichnung);
      } else {
        return a.flag === DataService.BOOL_TAG_FLAG ? -1 : 1;
      }
    });
  }

  public tagFieldName(tag: string): string {
    // alles ausser Buchstaben (a-z) und Ziffern aus der TAG-Bezeichnung entfernen
    // fuer die Verwendung als Feldname im Arbeitsplatz.Object
    const name = tag.replace(/[^\w^\d]/g, "");
    return `${DataService.TAG_DISPLAY_NAME}${name}`;
  }

  public prepareHw(hw: Hardware): void {
    hw.hwKonfig = this.hwKonfigList.find((h) => h.id === hw.hwKonfigId);
    let macsearch = "";
    hw.ipStr = "";
    hw.macStr = "";
    hw.vlanStr = "";
    hw.konfiguration = hw.hwKonfig.hersteller + " - " + hw.hwKonfig.bezeichnung;
    // hw.apKatBezeichnung = hw.hwKonfig.apKatBezeichnung;
    // hw.hwTypBezeichnung = hw.hwKonfig.hwTypBezeichnung;
    hw.anschDat = new Date(hw.anschDat);
    if (hw.vlans && hw.vlans[0]) {
      hw.vlans.forEach((v) => {
        const dhcp = v.ip === 0 ? " (DHCP)" : "";
        v.ipStr = v.vlan ? this.getIpString(v.vlan + v.ip) + dhcp : "";
        v.macStr = this.getMacString(v.mac);
        hw.ipStr += hw.ipStr ? "/ " + v.ipStr : v.ipStr;
        hw.macStr += hw.macStr ? "/ " + v.macStr : v.macStr;
        hw.vlanStr += hw.vlanStr ? "/ " + v.bezeichnung : v.bezeichnung;
        macsearch += v.mac;
      });
    }

    if (hw.apId) {
      const ap = this.apList.find((a) => a.apId === hw.apId);
      if (ap) {
        hw.ap = ap;
        hw.apStr = ap.apname + " | " + ap.oe.betriebsstelle + " | " + ap.bezeichnung;
        ap.hw.push(hw);
        ap.macsearch = macsearch;
        if (hw.pri) {
          if (hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG) {
            ap.hwTypStr = hw.konfiguration;
          }
          ap.hwStr =
            hw.hwKonfig.hersteller +
            " - " +
            hw.hwKonfig.bezeichnung +
            (hw.sernr && hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG
              ? " [" + hw.sernr + "]"
              : "");
          ap.ipStr += ap.ipStr ? "/ " + hw.ipStr : hw.ipStr;
          ap.macStr += ap.macStr ? "/ " + hw.macStr : hw.macStr;
          ap.vlanStr += ap.vlanStr ? "/ " + hw.vlanStr : hw.vlanStr;
        } else {
          // fuer die Suche in sonstiger HW
          ap.sonstHwStr +=
            (ap.sonstHwStr ? "/" : "") +
            " " +
            hw.hwKonfig.hersteller +
            " " +
            hw.hwKonfig.bezeichnung +
            (hw.sernr && hw.hwKonfig.hwTypFlag !== DataService.FREMDE_HW_FLAG
              ? " " + hw.sernr
              : "");
        }
      }
    }
  }

  public apSortHw(ap: Arbeitsplatz): void {
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
