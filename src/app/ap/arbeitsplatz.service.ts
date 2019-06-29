import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSortHeader } from "@angular/material";
import { MatTableDataSource } from "@angular/material/table";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { debounceTime } from "rxjs/operators";
import { ColumnFilter } from "../shared/config/column-filter";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { KeyboardService } from "../shared/keyboard.service";
import { ApColumn } from "./ap-column";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { OeTreeItem } from "./model/oe.tree.item";

@Injectable({providedIn: "root"})
export class ArbeitsplatzService {


  public treeControl = new NestedTreeControl<OeTreeItem>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<OeTreeItem>();

  private oeTree: OeTreeItem[];
  public selected: OeTreeItem;
  public urlParams: any;

  public apDataSource: MatTableDataSource<Arbeitsplatz> = new MatTableDataSource<Arbeitsplatz>();

  public columns: ApColumn[] = [
    {
      name  : "aptyp",
      sort  : {
        text      : "&Typ",
        key       : "t",
        sortString: (ap: Arbeitsplatz) => ap.aptyp.toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(0);
          return ap.aptyp.toLowerCase().includes(filter.text) === filter.inc;
        },
      },
    },
    {
      name  : "apname",
      sort  : {
        text      : "AP-&Name",
        key       : "n",
        sortString: (ap: Arbeitsplatz) => ap.apname.toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(1);
          return ap.apname.toLowerCase().includes(filter.text) === filter.inc;
        },
      },
    },
    {
      name  : "betrst",
      sort  : {
        text      : "Stand&ort", // TODO Wechsel "Verantw. OE" ???
        key       : "o",
        sortString: (ap: Arbeitsplatz) => this.getBetrst(ap).toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(2);
          return ((this.userSettings.showStandort
                  && ap.oesarch.includes(filter.text) === filter.inc)
              || (!this.userSettings.showStandort
                  && ap.voesarch.includes(filter.text) === filter.inc)
          );
        },
      },
    },
    {
      name  : "bezeichnung",
      sort  : {
        text      : "&Bezeichnung",
        key       : "b",
        sortString: (ap: Arbeitsplatz) => ap.bezeichnung.toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(3);
          return ap.bezeichnung.toLowerCase().includes(filter.text) === filter.inc;
        },
      },
    },
    {
      name  : "ip",
      sort  : {
        text      : "&IP",
        key       : "i",
        sortString: (ap: Arbeitsplatz) => (ap.vlan && ap.vlan[0]) ? ap.vlan[0].vlan + ap.vlan[0].ip : 0,
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => {
          const t = this.checkSearchString(text);
          t.text = t.text.replace(/-/g, "").replace(/:/g, "").toUpperCase();
          return t;
        },
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(4);
          return ap.ipsearch.toLowerCase().includes(filter.text) === filter.inc;
        },
      },
    },
    {
      name  : "hardware",
      sort  : {
        text      : "Hard&ware",
        key       : "w",
        sortString: (ap: Arbeitsplatz) => ap.hwStr.toLowerCase(),
      },
      filter: {
        filter     : new FormControl(""),
        valueChange: (text: string) => this.checkSearchString(text),
        predicate  : (ap: Arbeitsplatz) => {
          const filter = this.userSettings.getApFilter(5);
          return ap.hwStr.toLowerCase().includes(filter.text) === filter.inc;
        },
      },
    },
    {name: "menu"}
  ];
  public displayedColumns: string[] = this.columns.map((c) => c.name);

  public expandedRow: Arbeitsplatz;

  // Zeilenumbruch in den Tabellenzellen
  public tableWrapCell = false;
  // Klick auf Zeile zeigt Details
  public clickForDetails = false;
  // Standort oder verantw. OE
//  public showStandort = true;
  public linkcolor = "primary";
  public linkcolor2 = true;

  // Text fuer Statuszeile
  public statusText = "";

  // Filter
  // public typFilter = new FormControl("");
  // public nameFilter = new FormControl("");
  // public bstFilter = new FormControl("");
  // public bezFilter = new FormControl("");
  // public ipFilter = new FormControl("");
  // public hwFilter = new FormControl("");

  public userSettings: UserSession;
  public loading = false;
  // public typtagSelect: TypTag[];

  // Web-API calls
  private readonly oeTreeUrl: string;
  private readonly allApsUrl: string;
  private readonly pageApsUrl: string;
  private readonly singleApUrl: string;

  // case insensitive alpha sort
  // deutlich schneller als String.localeCompare()
  //  -> result = this.collator.compare(a, b)
  private collator = new Intl.Collator("de", {
    numeric    : true,
    sensitivity: "base"
  });

  constructor(private http: HttpClient, private configService: ConfigService, private keyboardService: KeyboardService) {
    this.oeTreeUrl = this.configService.webservice + "/tree/oe";
    this.allApsUrl = this.configService.webservice + "/ap/all";
    this.pageApsUrl = this.configService.webservice + "/ap/page";
    this.singleApUrl = this.configService.webservice + "/ap/id/";
    // this.getOeTree();
    this.userSettings = configService.getUser();

    // Filtereingaben bremsen
    const keyDebounce = 500;

    // Aenderung an Filter-Feldern in den Benutzereinstellungen speichern
    // und Filter triggern
    this.columns.forEach((c, idx) => {
      if (c.filter) {
        c.filter.filter.valueChanges
            .pipe(debounceTime(keyDebounce))
            .subscribe((text) => {
              this.userSettings.setApFilter(idx, c.filter.valueChange(text));
              // .filter muass geandert werden, damit MatTable den Filter ausfuehrt
              // this.apDataSource.filter = JSON.stringify(this.userSettings);
              this.apDataSource.filter = this.filterString();
            });
      }
    });
    /*
    // Filter-Felder
    this.typFilter.valueChanges
        .pipe(debounceTime(keyDebounce))
        .subscribe(
            text => {
              console.debug("typFilter text=" + text);
              this.userSettings.aptypFilter = this.checkSearchString(text);
              // .filter muass geandert werden, damit MatTable den Filter ausfuehrt
              // this.apDataSource.filter = JSON.stringify(this.userSettings);
              this.apDataSource.filter = this.filterString();
            }
        );
    this.nameFilter.valueChanges
        .pipe(debounceTime(keyDebounce))
        .subscribe(
            text => {
              this.userSettings.apnameFilter = this.checkSearchString(text);
              this.apDataSource.filter = this.filterString();
            }
        );
    this.bstFilter.valueChanges
        .pipe(debounceTime(keyDebounce))
        .subscribe(
            text => {
              this.userSettings.betrstFilter = this.checkSearchString(text);
              this.apDataSource.filter = this.filterString();
            }
        );
    this.bezFilter.valueChanges
        .pipe(debounceTime(keyDebounce))
        .subscribe(
            text => {
              this.userSettings.bezFilter = this.checkSearchString(text);
              this.apDataSource.filter = this.filterString();
            }
        );
    this.ipFilter.valueChanges
        .pipe(debounceTime(keyDebounce))
        .subscribe(
            text => {
              const t = this.checkSearchString(text);
              t.text = t.text.replace(/-/g, "").replace(/:/g, "").toUpperCase();
              this.userSettings.ipFilter = t;
              this.apDataSource.filter = this.filterString();
            }
        );
    this.hwFilter.valueChanges
        .pipe(debounceTime(keyDebounce))
        .subscribe(
            text => {
              this.userSettings.hwFilter = this.checkSearchString(text);
              this.apDataSource.filter = this.filterString();
            }
        );
*/
    // AP-Daten vom Server holen
    setTimeout(() => {
      this.getAps();
    }, 0)
  }

  public test(evt) {
    console.debug("keyup");
    console.dir(evt);
  }

  // APs aus der DB holen
  public async getAps() {
    this.loading = true;

    // this.typtagSelect = await this.http.get<TypTag[]>(this.typtagUrl).toPromise();
    // this.typtagSelect.forEach((t) => t.select = t.apkategorie + ": " + t.tagTyp);

    const pagesize: number = await this.configService.getConfig(ConfigService.AP_PAGE_SIZE);

    const data = await this.http.get<Arbeitsplatz[]>(this.allApsUrl).toPromise();
    data.forEach((ap) => {
      this.prepAP(ap);
    });
    this.apDataSource.data = data;
    this.loading = false;

    // liefert Daten fuer internen sort in mat-table -> z.B. immer lowercase vergleichen
    this.apDataSource.sortingDataAccessor = (ap: Arbeitsplatz, id: string) => {
      const col = this.getColumn(id);
      if (col) {
        return col.sort.sortString(ap);
      } else {
        return "";
      }
    };

    // eigener Filter
    this.apDataSource.filterPredicate =
        (ap: Arbeitsplatz, filter: string) => {
          return this.columns.reduce((prev: boolean, cur: ApColumn) => {
            if (prev) {
              if (cur.filter) {
                return cur.filter.predicate(ap);
              } else {
                return true;
              }
            } else {  // ein Filter ist bereits false -> Rest ueberspringen
              return false;
            }
          }, true);
          // // const searchTerms = JSON.parse(filter);
          // return ap.aptyp.toLowerCase().includes(this.userSettings.aptypFilter.text) === this.userSettings.aptypFilter.inc
          //     && ap.apname.toLowerCase().includes(this.userSettings.apnameFilter.text) === this.userSettings.apnameFilter.inc
          //     && ((this.userSettings.showStandort
          //             && ap.oesarch.includes(this.userSettings.betrstFilter.text) === this.userSettings.betrstFilter.inc)
          //         || (!this.userSettings.showStandort
          //             && ap.voesarch.includes(this.userSettings.betrstFilter.text) === this.userSettings.betrstFilter.inc)
          //     )
          //     && ap.bezeichnung.toLowerCase().includes(this.userSettings.bezFilter.text) === this.userSettings.bezFilter.inc
          //     && ap.ipsearch.includes(this.userSettings.ipFilter.text) === this.userSettings.ipFilter.inc
          //     && ap.hwStr.toLowerCase().includes(this.userSettings.hwFilter.text) === this.userSettings.hwFilter.inc;
        };

    this.applyUserSettings();
  }

  public applyUserSettings() {
    // Nur ausfuehren, wenn AP-Daten schon geladen (= nur AP-Component wurde neu erstellt)
    // Beim Start des Service wird diese fn in getAps() aufgerufen, weil die Component evtl.
    // schon fertig ist bevor alle Daten geladen wurden, dann wird der Aufruf aus der Component
    // ignoriert.
    if (this.apDataSource.data) {
      this.apDataSource.paginator.pageSize = this.userSettings.apPageSize;
      if (this.userSettings.apSortColumn && this.userSettings.apSortDirection) {
        this.apDataSource.sort.active = this.userSettings.apSortColumn;
        this.apDataSource.sort.direction = this.userSettings.apSortDirection === "asc" ? "" : "asc";
        const sortheader = this.apDataSource.sort.sortables.get(this.userSettings.apSortColumn) as MatSortHeader;
        // this.sort.sort(sortheader);
        // FIXME Hack -> ApComponent#handleSort
        sortheader._handleClick();
      }
      this.changeBetrst();
      this.initializeFilters();

    }

  }

  public initializeFilters() {
    this.columns.forEach((c, idx) => {
      if (c.filter) {
        const filt = this.userSettings.getApFilter(idx);
        if (filt.text) {
          c.filter.filter.setValue((filt.inc ? "" : "!") + filt.text);
          c.filter.filter.markAsDirty();
        }
      }
    });
    // if (this.userSettings.aptypFilter.text) {
    //   this.typFilter.setValue((this.userSettings.aptypFilter.inc ? "" : "!") + this.userSettings.aptypFilter.text);
    //   this.typFilter.markAsDirty()
    // }
    // if (this.userSettings.apnameFilter.text) {
    //   this.nameFilter.setValue((this.userSettings.apnameFilter.inc ? "" : "!") + this.userSettings.apnameFilter.text);
    //   this.nameFilter.markAsDirty()
    // }
    // if (this.userSettings.betrstFilter.text) {
    //   this.bstFilter.setValue((this.userSettings.betrstFilter.inc ? "" : "!") + this.userSettings.betrstFilter.text);
    //   this.bstFilter.markAsDirty()
    // }
    // if (this.userSettings.bezFilter.text) {
    //   this.bezFilter.setValue((this.userSettings.bezFilter.inc ? "" : "!") + this.userSettings.bezFilter.text);
    //   this.bezFilter.markAsDirty()
    // }
    // if (this.userSettings.ipFilter.text) {
    //   this.ipFilter.setValue((this.userSettings.ipFilter.inc ? "" : "!") + this.userSettings.ipFilter.text);
    //   this.ipFilter.markAsDirty()
    // }
    // if (this.userSettings.hwFilter.text) {
    //   this.hwFilter.setValue((this.userSettings.hwFilter.inc ? "" : "!") + this.userSettings.hwFilter.text);
    //   this.hwFilter.markAsDirty()
    // }
  }
  public resetFilters() {
    this.columns.forEach((c, idx) => {
      if (c.filter) {
        c.filter.filter.reset();
      }
    });
    // this.typFilter.reset();
    // this.nameFilter.reset();
    // this.bstFilter.reset();
    // this.bezFilter.reset();
    // this.ipFilter.reset();
    // this.hwFilter.reset();
  }

  public onSort(event) {
    this.userSettings.apSortColumn = event.active;
    this.userSettings.apSortDirection = event.direction;
  }

  public onPage(event) {
    if (event.pageSize !== this.userSettings.apPageSize) {
      this.userSettings.apPageSize = event.pageSize;
    }
  }

  public async expandApRow(ap: Arbeitsplatz, event: Event) {
    if (this.expandedRow === ap) {
      this.expandedRow = null;
    } else {
      const apdata: Arbeitsplatz = await this.http.get<Arbeitsplatz>(this.singleApUrl + ap.apId).toPromise();
      // const rec: Arbeitsplatz = this.apDataSource.data.find((a => a.apId === ap.apId));
      // console.dir(rec);
      if (apdata) {
        ap.verantwOe = apdata.verantwOe;
        ap.oe = apdata.oe;
        ap.hw = apdata.hw;
        ap.bezeichnung = apdata.bezeichnung;
        ap.apname = apdata.apname;
        ap.aptyp = apdata.aptyp;
        ap.bemerkung = apdata.bemerkung;
        ap.tags = apdata.tags;
        ap.vlan = apdata.vlan;
        this.sortAP(ap);
        this.prepAP(ap);
        this.expandedRow = ap;
      } else {
        console.error("Fehler beim Laden der Details fuer AP #" + ap.apId);
      }
    }
    // this.expandedRow = this.expandedRow === ap ? null : ap;
    event.stopPropagation();
  }

  public filterByAptyp(ap: Arbeitsplatz, event: Event) {
    const col = this.getColumn("aptyp");
    col.filter.filter.setValue(ap.aptyp);
    col.filter.filter.markAsDirty();
    // this.typFilter.setValue(ap.aptyp);
    // this.typFilter.markAsDirty();
    event.stopPropagation()
  }

  public filterByBetrst(ap: Arbeitsplatz, event: Event) {
    const col = this.getColumn("betrst");
    this.resetFilters();
    col.filter.filter.setValue(this.getBetrst(ap));
    col.filter.filter.markAsDirty();
    // this.bstFilter.setValue(this.getBetrst(ap));
    // this.bstFilter.markAsDirty();
    event.stopPropagation()
  }

  public getColumnIndex(name: string): number {
    return this.columns.findIndex((c) => c.name && c.name === name);
  }

  public getColumn(name: string): ApColumn {
    const idx = this.getColumnIndex(name);
    if (idx >= 0) {
      return this.columns[idx];
    } else {
      return null;
    }
  }

  // OE-Name abhaengig von gewaehlter Anzeige
  // (Standort || verantwortliche OE)
  public getBetrst(ap: Arbeitsplatz): string {
    if (this.userSettings.showStandort) {
      return ap.oe.betriebsstelle;
    } else {
      if (ap.verantwOe) {
        return ap.verantwOe.betriebsstelle;
      } else {
        return ap.oe.betriebsstelle;
      }
    }
  }

  // Wechsel Standort <-> verantw. OE
  public changeBetrst() {
    const bstcol = this.getColumn("betrst");
    if (this.userSettings.showStandort) {
      bstcol.sort.text = "Stand&ort";
    } else {
      bstcol.sort.text = "Verantwortliche &OE";
    }
    this.getColumn("betrst").filter.filter.reset();
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

  /**
   * Filter-String
   *
   * Fuehrendes ! negiert den Filter (=enthaelt nicht).
   * Filtertext wird als lowerCase geliefert.
   *
   * @param text
   */
  private checkSearchString(text: string): ColumnFilter {
    let str = text ? text.toLowerCase() : "";
    let inc = true;
    if (str.startsWith("!")) {
      str = str.slice(1);
      inc = false
    }
    return {text: str, inc: inc};
  }

  // eindeutiger String fuer alle Filter -> apDataSource.filter
  private filterString(): string {
    let s;
    for (let i = 0; i < this.userSettings.apFiltersCount(); i++) {
      const filt = this.userSettings.getApFilter(i);
      s += filt.text + filt.inc;
    }
    return s;
    // return this.userSettings.aptypFilter.text + this.userSettings.aptypFilter.inc +
    //     this.userSettings.hwFilter.text + this.userSettings.hwFilter.inc +
    //     this.userSettings.ipFilter.text + this.userSettings.ipFilter.inc +
    //     this.userSettings.bezFilter.text + this.userSettings.bezFilter.inc +
    //     this.userSettings.betrstFilter.text + this.userSettings.betrstFilter.inc +
    //     this.userSettings.apnameFilter.text + this.userSettings.apnameFilter.inc;
  }

  private sortAP(ap: Arbeitsplatz) {
    ap.tags.sort((a, b) => {
      if (a.flag === b.flag) {
        return this.collator.compare(a.bezeichnung, b.bezeichnung)
      } else {
        return (a.flag === 1 ? -1 : 1);
      }
    });
    ap.hw.sort((a, b) => {
      if (a.pri) {
        return -1;
      } else if (b.pri) {
        return 1;
      } else {
        return this.collator.compare(a.hwtyp + a.hersteller + a.bezeichnung + a.sernr,
                                     b.hwtyp + b.hersteller + b.bezeichnung + b.sernr);
      }
    });
  }

  private prepAP(ap: Arbeitsplatz) {
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
    ap.oesarch = ("00" + ap.oe.bstNr).slice(-3) + ap.oe.betriebsstelle.toLowerCase();
    if (ap.verantwOe) {
      ap.voesarch = ("00" + ap.verantwOe.bstNr).slice(-3) + ap.verantwOe.betriebsstelle.toLowerCase();
    } else {
      ap.voesarch = ap.oesarch;
    }
  }


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
