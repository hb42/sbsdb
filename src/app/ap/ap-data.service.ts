import { EventEmitter, Injectable } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ConfigService } from "../shared/config/config.service";
import { DataService } from "../shared/data.service";
import { Arbeitsplatz } from "./model/arbeitsplatz";

@Injectable({
  providedIn: "root",
})
export class ApDataService {
  public static defaultpageSize = 199;

  // Daten fuer MatTable
  public apDataSource: MatTableDataSource<Arbeitsplatz> = new MatTableDataSource<Arbeitsplatz>();
  // AP-Datensaetze je GET

  // Web-API calls
  private readonly oeTreeUrl: string;
  private readonly allApsUrl: string;
  private readonly pageApsUrl: string;
  private readonly singleApUrl: string;
  private readonly countUrl: string;

  constructor(private dataService: DataService, private configService: ConfigService) {
    console.debug("c'tor ApDataService");
    this.oeTreeUrl = this.configService.webservice + "/tree/oe";
    this.allApsUrl = this.configService.webservice + "/ap/all";
    this.pageApsUrl = this.configService.webservice + "/ap/page/";
    this.singleApUrl = this.configService.webservice + "/ap/id/";
    this.countUrl = this.configService.webservice + "/ap/count";
    this.apDataSource.data = [];
  }

  /**
   * Arbeitsplaetze parallel, in Bloecken von ConfigService.AP_PAGE_SIZE holen.
   *
   * @param each - callback wenn alle Bloecke fertig ist
   * @param ready - event nach dem letzten Block
   */
  public async getAPs(each: () => void, ready: EventEmitter<any>) {
    // Groesse der einzelnen Bloecke
    const pageSize =
      Number(await this.configService.getConfig(ConfigService.AP_PAGE_SIZE)) ??
      ApDataService.defaultpageSize;
    // Anzahl der Datensaetze
    const recs = await this.dataService.get(this.countUrl).toPromise();
    // zu holende Seiten
    const count = Math.ceil(recs / pageSize);
    let fetched = 0;
    for (let page = 0; page < count; page++) {
      this.dataService.get(this.pageApsUrl + page + "/" + pageSize).subscribe(
        (aps: Arbeitsplatz[]) => {
          console.debug("fetch page #" + page + " size=" + aps.length);
          aps.forEach((ap) => this.prepAP(ap));
          this.apDataSource.data = [...this.apDataSource.data, ...aps];
        },
        (err) => {
          console.error("ERROR loading AP-Data " + err);
        },
        () => {
          each();
          fetched++;
          if (fetched === count) {
            console.debug("fetch page READY");
            ready.emit();
            // this.onDataReady();
          }
        }
      );
    }

    // const data = await this.http.get<Arbeitsplatz[]>(this.pageApsUrl + page).toPromise(); // 1. Teil, vollstaendiger record
    // this.dataService.get(this.allApsUrl).subscribe(
    //   (next) => {},
    //   (err) => {},
    //   () => {}
    // );

    // const calls: Array<Observable<Array<Arbeitsplatz>>> = [];
    // for (let page = 0; page < count; page++) {
    //   calls.push(this.dataService.get(this.pageApsUrl + page));
    // }
    // return forkJoin(calls);

    // return this.dataService.get(this.pageApsUrl + page);
  }

  public getMacString(mac: string) {
    // kein match => Eingabe-String
    return mac.replace(/^(.{2})(.{2})(.{2})(.{2})(.{2})(.{2})$/, "$1:$2:$3:$4:$5:$6").toUpperCase();
  }

  public getIpString(ip: number) {
    /* eslint-disable no-bitwise */
    const ip4 = ip & 0xff;
    ip = ip >> 8;
    const ip3 = ip & 0xff;
    ip = ip >> 8;
    const ip2 = ip & 0xff;
    ip = ip >> 8;
    const ip1 = ip & 0xff;

    return "" + ip1 + "." + ip2 + "." + ip3 + "." + ip4;
  }

  /* IP-Addr in Java
   public static String getIpString(long ip) {
    long ip1,ip2,ip3,ip4;

    ip4 = ip & 0xff;
    ip = ip >> 8;
    ip3 = ip & 0xff;
    ip = ip >> 8;
    ip2 = ip & 0xff;
    ip = ip >> 8;
    ip1 = ip & 0xff;

    return "" + ip1 + "." + ip2 + "." + ip3 + "." + ip4;
  }

  public static long getIpValue(String ip) {
    long ipv = 0;
    String[] ips = ip.split("\\.");
    long ip1,ip2,ip3,ip4;
    ip1 = Long.parseLong(ips[0]);
    ip2 = Long.parseLong(ips[1]);
    ip3 = Long.parseLong(ips[2]);
    ip4 = Long.parseLong(ips[3]);
    if (ip1 < 0 || ip1 > 255 || ip2 < 0 || ip2 > 255 || ip3 < 0 || ip3 > 255 || ip4 < 0 || ip4 > 255)
      throw new RuntimeException("Ungültige IP-Adresse");
    ipv = (ip1 << 24) + (ip2 << 16) + (ip3 << 8) + ip4;
    return ipv;
  }

  public static long getIpHost(long ip, long netmask) {
    return ip - (ip & netmask);
  }

  public static long getIpSegment(long ip, long netmask) {
    return ip & netmask;
  }

  public static long getNotNetmask(long netmask) {
    return (~netmask) & 0xffffffffL;
  }

  public static long getLastOctet(long ip) {
    return ip & 0xffL;
  }

  // byte hat Wertebereich -127 bis 128! das funktioniert nicht fuer IPs
  public static int[] getIpBytes(long ip) {
    int[] ret = new int[4];
    ret[3] = (int)(ip & 0xff);
    ip = ip >> 8;
    ret[2] = (int)(ip & 0xff);
    ip = ip >> 8;
    ret[1] = (int)(ip & 0xff);
    ip = ip >> 8;
    ret[0] = (int)ip;
    return ret;
  }

   */

  private prepAP(ap: Arbeitsplatz) {
    ap.hwStr = ""; // keine undef Felder!
    ap.sonstHwStr = ""; // keine undef Felder!
    ap.hw.forEach((h) => {
      if (h.pri) {
        if (h.hwtypFlag !== 1) {
          ap.hwTypStr = h.hersteller + " - " + h.bezeichnung;
        }
        ap.hwStr =
          h.hersteller +
          " - " +
          h.bezeichnung +
          (h.sernr && h.hwtypFlag !== 1 ? " [" + h.sernr + "]" : "");
      } else {
        // fuer die Suche in sonstiger HW
        ap.sonstHwStr +=
          " " +
          h.hersteller +
          " " +
          h.bezeichnung +
          (h.sernr && h.hwtypFlag !== 1 ? " " + h.sernr : "");
      }
    });

    ap.ipStr = "";
    ap.macStr = "";
    ap.vlanStr = "";
    if (ap.vlan && ap.vlan[0]) {
      let msearch = "";
      ap.vlan.forEach((v) => {
        let dhcp = v.ip === 0 ? " (DHCP)" : "";
        if (ap.ipStr) {
          ap.ipStr += "/ " + this.getIpString(v.vlan + v.ip) + dhcp;
        } else {
          ap.ipStr = this.getIpString(v.vlan + v.ip) + dhcp;
        }
        if (ap.macStr) {
          ap.macStr += "/ " + this.getMacString(v.mac);
        } else {
          ap.macStr = this.getMacString(v.mac);
        }
        if (ap.vlanStr) {
          ap.vlanStr += "/ " + v.bezeichnung;
        } else {
          ap.vlanStr = v.bezeichnung;
        }
        msearch += v.mac;
      });
      ap.ipsearch = ap.ipStr + " " + msearch;
    }
    // das spart den null-check
    if (!ap.verantwOe) {
      ap.verantwOe = ap.oe;
    }
    ap.oesearch = ("00" + ap.oe.bstNr).slice(-3) + " " + ap.oe.betriebsstelle; // .toLowerCase();
    ap.oesort = ap.oe.betriebsstelle; // .toLowerCase();
    ap.voesearch = ("00" + ap.verantwOe.bstNr).slice(-3) + " " + ap.verantwOe.betriebsstelle; // .toLowerCase();
    ap.voesort = ap.verantwOe.betriebsstelle; // .toLowerCase();

    ap.subTypes = [];
    ap.tags.forEach((tag) => {
      if (tag.flag === 1) {
        ap.subTypes.push(tag.bezeichnung);
      } else {
        ap["TAG: " + tag.bezeichnung] = tag.text;
      }
    });
  }
}
