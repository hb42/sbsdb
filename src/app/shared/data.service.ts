import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Betrst } from "./model/betrst";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { Hardware } from "./model/hardware";
import { HwKonfig } from "./model/hw-konfig";
import { ConfigService } from "./config/config.service";

@Injectable({
  providedIn: "root",
})
export class DataService {
  public static defaultpageSize = 200;
  public static TAG_DISPLAY_NAME = "TAG";
  public static BOOL_TAG_FLAG = 1;
  public static FREMDE_HW_FLAG = 1;

  public apList: Arbeitsplatz[] = [];
  public bstList: Betrst[] = [];
  public hwList: Hardware[] = [];
  public hwKonfigList: HwKonfig[] = [];

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
  }

  public get(url: string): Observable<unknown> {
    return this.http.get(url);
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
}
