import {NestedTreeControl} from "@angular/cdk/tree";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {FormControl} from "@angular/forms";
import {MatTableDataSource, MatTreeNestedDataSource} from "@angular/material";
import {ConfigService} from "../shared/config/config.service";
import {Arbeitsplatz} from "./model/arbeitsplatz";
import {OeTreeItem} from "./model/oe.tree.item";

@Injectable({providedIn: "root"})
export class ArbeitsplatzService {


  public treeControl = new NestedTreeControl<OeTreeItem>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<OeTreeItem>();

  private oeTree: OeTreeItem[];
  public selected: OeTreeItem;
  public urlParams: any;

  public apDataSource: MatTableDataSource<Arbeitsplatz> = new MatTableDataSource<Arbeitsplatz>(); // Arbeitsplatz[] =
                                                                                                  // [];
  public displayedColumns: string[] = ["aptyp", "apname", "betrst", "bezeichnung", "ip", "hardware", "menu"];

  public expandedRow: Arbeitsplatz;

  // Zeilenumbruch in den Tabellenzellen
  public tableWrapCell = false;
  // Klick auf Zeile zeigt Details
  public clickForDetails = true;

  // Filter
  public typFilter = new FormControl("");
  public nameFilter = new FormControl("");
  public bstFilter = new FormControl("");
  public bezFilter = new FormControl("");
  public ipFilter = new FormControl("");
  public hwFilter = new FormControl("");
  // Inhalte aller Filter -> Profil | URL ??
  filterValues = {
    aptyp      : "", // [],
    apname     : "",
    betrst     : "",
    bezeichnung: "",
    ip         : "",
    hardware   : "",
  };
  public loading = false;
  // public typtagSelect: TypTag[];

  // Web-API calls
  private readonly oeTreeUrl: string;
  private readonly allApsUrl: string;
  private readonly pageApsUrl: string;
  private readonly typtagUrl: string;
  private readonly singleApUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.oeTreeUrl = this.configService.webservice + "/tree/oe";
    this.allApsUrl = this.configService.webservice + "/ap/all";
    this.pageApsUrl = this.configService.webservice + "/ap/page";
    this.pageApsUrl = this.configService.webservice + "/ap/page";
    this.typtagUrl = this.configService.webservice + "/ap/typtags";
    this.singleApUrl = this.configService.webservice + "/ap/id/";
    // this.getOeTree();

    // Filter-Felder
    this.typFilter.valueChanges
        .subscribe(
            text => {
              this.filterValues.aptyp = text ? text.toLowerCase() : "";
              // this.filterValues.aptyp = arr ? arr : [];
              this.apDataSource.filter = JSON.stringify(this.filterValues);
            }
        );
    this.nameFilter.valueChanges
        .subscribe(
            text => {
              this.filterValues.apname = text ? text.toLowerCase() : "";
              this.apDataSource.filter = JSON.stringify(this.filterValues);
            }
        );
    this.bstFilter.valueChanges
        .subscribe(
            text => {
              this.filterValues.betrst = text ? text.toLowerCase() : "";
              this.apDataSource.filter = JSON.stringify(this.filterValues);
            }
        );
    this.bezFilter.valueChanges
        .subscribe(
            text => {
              this.filterValues.bezeichnung = text ? text.toLowerCase() : "";
              this.apDataSource.filter = JSON.stringify(this.filterValues);
            }
        );
    this.ipFilter.valueChanges
        .subscribe(
            text => {
              this.filterValues.ip = text ? text.replace(/-/g, "").replace(/:/g, "").toUpperCase() : "";
              this.apDataSource.filter = JSON.stringify(this.filterValues);
            }
        );
    this.hwFilter.valueChanges
        .subscribe(
            text => {
              this.filterValues.hardware = text ? text.toLowerCase() : "";
              this.apDataSource.filter = JSON.stringify(this.filterValues);
            }
        );
    // DEBUG
    setTimeout(() => {
      this.getAps();
    }, 0)
  }

  // APs aus der DB holen
  public async getAps() {
    this.loading = true;

    // this.typtagSelect = await this.http.get<TypTag[]>(this.typtagUrl).toPromise();
    // this.typtagSelect.forEach((t) => t.select = t.apkategorie + ": " + t.tagTyp);

    const pagesize: number = await this.configService.getConfig(ConfigService.AP_PAGE_SIZE);

    const data = await this.http.get<Arbeitsplatz[]>(this.allApsUrl).toPromise();
    console.debug("prepare data");
      data.forEach((ap) => {
        ap.tags.sort((a, b) => {  // FIXME nur fuer full record
          if (a.flag === b.flag) {
            return a.bezeichnung.localeCompare(b.bezeichnung)
          } else {
            return (a.flag === 1 ? -1 : 1);
          }
        });
        ap.hw.sort((a, b) => { // FIXME nur fuer full record
          if (a.pri) {
            return -1;
          } else if (b.pri) {
            return 1;
          } else {
            return (a.hwtyp + a.hersteller + a.bezeichnung + a.sernr).toLowerCase()
                .localeCompare((b.hwtyp + b.hersteller + b.bezeichnung + b.sernr).toLowerCase());
          }
        });
        ap.hwStr = ""; // keine undef Felder!
        ap.hw.forEach((h) => {
          if (h.pri) {
            ap.hwStr = h.hersteller + " - " + h.bezeichnung
                + (h.sernr && h.hwtypFlag !== 1 ? " [" + h.sernr + "]" : "");
          }
        });
        if (ap.vlan && ap.vlan[0]) {
          ap.ipStr = this.getIpString(ap.vlan[0].vlan + ap.vlan[0].ip);
          ap.macStr = this.getMacString(ap.vlan[0].mac);
          ap.ipsearch = ap.ipStr + ap.vlan[0].mac;
        } else {
          ap.ipStr = "";
          ap.macStr = "";
          ap.ipsearch = "";
        }
      });
    this.apDataSource.data = data;
    console.debug("prepare data end");
      this.loading = false;

    // liefert Daten fuer sort -> immer lowercase vergleichen
    this.apDataSource.sortingDataAccessor = (ap: Arbeitsplatz, id: string) => {
      switch (id) {
        case "aptyp":
          return ap.aptyp.toLowerCase();
        case "apname":
          return ap.apname.toLowerCase();
        case "betrst":
          return ap.oe.betriebsstelle.toLowerCase();
        case "bezeichnung":
          return ap.bezeichnung.toLowerCase();
        case "ip":
          return (ap.vlan && ap.vlan[0]) ? ap.vlan[0].vlan + ap.vlan[0].ip : 0;
        case "hardware":
          return ap.hwStr.toLowerCase();
        default:
          return 0;
      }
    };

    // eigener Filter
    this.apDataSource.filterPredicate = (ap: Arbeitsplatz, filter: string) => {
      const searchTerms = JSON.parse(filter);
      return ap.aptyp.toLowerCase().indexOf(searchTerms.aptyp) !== -1
          // (searchTerms.aptyp.length === 0 ||
          //     ap.tags.reduce((prev, cur) => prev || searchTerms.aptyp.indexOf(cur.tagId) !== -1, false)
          // )
          && ap.apname.toString().toLowerCase().indexOf(searchTerms.apname) !== -1
          && (ap.oe.bstNr + ap.oe.betriebsstelle.toLowerCase()).indexOf(searchTerms.betrst) !== -1
          && ap.bezeichnung.toLowerCase().indexOf(searchTerms.bezeichnung) !== -1
          && ap.ipsearch.indexOf(searchTerms.ip) !== -1
          && ap.hwStr.toLowerCase().indexOf(searchTerms.hardware) !== -1;
    };
  }

  public resetFilters() {
    this.typFilter.reset();
    this.nameFilter.reset();
    this.bstFilter.reset();
    this.bezFilter.reset();
    this.ipFilter.reset();
    this.hwFilter.reset();
  }

  public async expandApRow(ap: Arbeitsplatz, event: Event) {
    if (this.expandedRow === ap) {
      this.expandedRow = null;
    } else {
      const apdata: Arbeitsplatz[] = await this.http.get<Arbeitsplatz[]>(this.singleApUrl + ap.apId).toPromise();
      if (apdata && apdata.length === 1) {
        ap.verantwOe = apdata[0].verantwOe;
        ap.oe = apdata[0].oe;
        ap.hw = apdata[0].hw;
        ap.bezeichnung = apdata[0].bezeichnung;
        ap.apname = apdata[0].apname;
        ap.aptyp = apdata[0].aptyp;
        ap.bemerkung = apdata[0].bemerkung;
        ap.tags = apdata[0].tags;
        ap.vlan = apdata[0].vlan;
        // TODO hwStr etc. neu aufbauen
      }
      this.expandedRow = ap;
    }
    // this.expandedRow = this.expandedRow === ap ? null : ap;
    event.stopPropagation();
  }

  public filterByAptyp(ap: Arbeitsplatz, event: Event) {
    this.typFilter.setValue(ap.aptyp);
    this.typFilter.markAsDirty();
    event.stopPropagation()
  }

  public filterByBetrst(ap: Arbeitsplatz, event: Event) {
    this.resetFilters();
    this.bstFilter.setValue(ap.oe.betriebsstelle);
    this.bstFilter.markAsDirty();
    event.stopPropagation()
  }

  public bstTooltip(ap: Arbeitsplatz): string {
    return "OE: " + ap.oe.bstNr + "\n\n"
        + (ap.oe.strasse ? ap.oe.strasse + " " + (ap.oe.hausnr ? ap.oe.hausnr : "") + "\n" : "")
        + (ap.oe.plz ? ap.oe.plz + " " + (ap.oe.ort ? ap.oe.ort : "") + "\n" : "")
        + (ap.oe.oeff ? "\n" + ap.oe.oeff : "");
  }

  public testApMenu(ap: Arbeitsplatz) {
    console.debug("DEBUG AP-Menue fuer " + ap.apname);
  }

  public getMacString(mac: string) {
    // kein match => Eingabe-String
    return mac.replace(/^(.{2})(.{2})(.{2})(.{2})(.{2})(.{2})$/, "$1:$2:$3:$4:$5:$6").toUpperCase();
  }

  public getIpString(ip: number) {
    // tslint:disable:no-bitwise
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

  // byte hat Wertebereich -127 bis 128! das funktioniert nivht fuer IPs
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


  /* TODO kann raus, wenn Tree definitiv draussen ist */
  public async getOeTree() {
    this.oeTree = await this.http.get<OeTreeItem[]>(this.oeTreeUrl).toPromise();
    this.dataSource.data = this.oeTree;
    console.debug("get OE-Tree");
    console.dir(this.oeTree);
  }

  public expandTree(id: number) {
    if (!this.oeTree || (!!this.selected && this.selected.id === id)) {
      return;
    }
    if (this.expandTreeRecurse(id, this.oeTree)) {
      setTimeout(() => {
        document.getElementById("tree" + id).scrollIntoView(false);
      }, 0);
    }
  }

  private expandTreeRecurse(id: number, oes: OeTreeItem[]): boolean {
    if (!!oes && oes.length > 0) {
      return oes.some((oe) => {
        console.debug("recurse " + oe.betriebsstelle + " /" + oe.id);
        if (oe.id === id) {
          console.debug("found ");
          this.selected = oe;
          return true;
        } else {
          console.debug("recurse OEs for " + oe.betriebsstelle);
          if (this.expandTreeRecurse(id, oe.children)) {
            console.debug("expand OE " + oe.betriebsstelle);
            this.treeControl.expand(oe);
            return true;
          } else {
            return false;
          }
        }
      });
    } else {
      return false;
    }
  }

}
