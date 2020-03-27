import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSortHeader } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { debounceTime } from "rxjs/operators";
import { ColumnFilter } from "../shared/config/column-filter";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { Bracket } from "../shared/filter/bracket";
import { LogicalAnd } from "../shared/filter/logical-and";
import { RelOp } from "../shared/filter/rel-op.enum";
import { KeyboardService } from "../shared/keyboard.service";
import { ApColumn } from "./ap-column";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { OeTreeItem } from "./model/oe.tree.item";

@Injectable({ providedIn: "root" })
export class ArbeitsplatzService {
  public treeControl = new NestedTreeControl<OeTreeItem>((node) => node.children);
  public dataSource = new MatTreeNestedDataSource<OeTreeItem>();

  private oeTree: OeTreeItem[];
  public selected: OeTreeItem;
  public urlParams: any;

  public apDataSource: MatTableDataSource<Arbeitsplatz> = new MatTableDataSource<Arbeitsplatz>();

  public filterExpression = new Bracket(null);

  public expandedRow: Arbeitsplatz;

  // DEBUG Zeilenumbruch in den Tabellenzellen (drin lassen??)
  public tableWrapCell = false;
  // DEBUG Klick auf Zeile zeigt Details (nach Entscheidung festnageln und var raus)
  public clickForDetails = false;
  // DEBUG Linkfarben (nach Entscheidung festnageln und vars raus)
  public linkcolor = "primary";
  public linkcolor2 = true;

  // Text fuer Statuszeile
  public statusText = "";

  public userSettings: UserSession;
  public loading = false;
  // public typtagSelect: TypTag[];

  /* fuer select list: Liste ohne Duplikate fuer ein Feld (nicht bei allen sinnvoll -> aptyp, oe, voe, tags, hwtyp, vlan(?))
    new Set() -> nur eindeutige - ... -> zu Array
    -> https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array#9229932
    die beiden folgenden Arrays brauchen ca. 0.005 - 0.008 Sekunden => Listen bei Bedarf erzeugen
 const uniq1 = [ ...new Set(this.apDataSource.data.filter((a) => !!a.hwTypStr).map((a2) => a2.hwTypStr)) ].sort();
 const uniq2 = [ ...new Set(this.apDataSource.data.map((a) => a.oesearch)) ].sort();
  */

  public columns: ApColumn[] = [];
  public displayedColumns: string[];
  public extFilterColumns: ApColumn[];

  // Web-API calls
  private readonly oeTreeUrl: string;
  private readonly allApsUrl: string;
  private readonly pageApsUrl: string;
  private readonly singleApUrl: string;

  // case insensitive alpha sort
  // deutlich schneller als String.localeCompare()
  //  -> result = this.collator.compare(a, b)
  private collator = new Intl.Collator("de", {
    numeric: true,
    sensitivity: "base",
  });

  private buildColumns() {
    this.columns.push(
      new ApColumn(
        this, // hat typ [dropdown], hat typ nicht [dropdown]
        "aptyp",
        () => "Typ",
        () => "aptyp",
        () => "aptyp",
        "t",
        true,
        ApColumn.LCASE,
        [RelOp.inlist, RelOp.notinlist],
        () => [...new Set(this.apDataSource.data.map((a) => a.aptyp))].sort()
      )
    );
    this.columns.push(
      new ApColumn(
        this, // beginnt, endet, enthaelt, enthaelt nicht
        "apname",
        () => "AP-Name",
        () => "apname",
        () => "apname",
        "n",
        true,
        ApColumn.LCASE,
        [RelOp.startswith, RelOp.endswith, RelOp.like, RelOp.notlike],
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // BST extra? / string beginnt, endet, enthaelt, enthaelt nicht / dropdown?
        "betrst",
        () => (this.userSettings.showStandort ? "Standort" : "Verantw. OE"),
        () => (this.userSettings.showStandort ? "oesearch" : "voesearch"),
        () => (this.userSettings.showStandort ? "oesort" : "voesort"),
        "o",
        true,
        ApColumn.LCASE,
        [RelOp.inlist, RelOp.notinlist, RelOp.like, RelOp.notlike],
        () =>
          [
            ...new Set(
              this.apDataSource.data.map((a) =>
                this.userSettings.showStandort ? a.verantwOe.betriebsstelle : a.oe.betriebsstelle
              )
            ),
          ].sort()
      )
    );
    this.columns.push(
      new ApColumn(
        this, // enthaelt, enthaelt nicht
        "bezeichnung",
        () => "Bezeichnung",
        () => "bezeichnung",
        () => "bezeichnung",
        "b",
        true,
        ApColumn.LCASE,
        null,
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // IP/MAC enthaelt, enthaelt nicht, IP beginnt mit, IP endet mit, IP enthaelt, dto. MAC
        // dropdown VLAN?
        "ip",
        () => "IP/MAC",
        () => "ipsearch",
        () => "vlan",
        "i",
        true,
        ApColumn.IP,
        null,
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this, // enthaelt, enthaelt nicht/ Hersteller|Typenbezeichnung|SerNr enthaelt, enthaelt nicht, start,end
        // hersteller + bezeichnung evtl dropdown
        "hardware",
        () => "Hardware",
        () => (this.userSettings.searchSonstHw ? "sonstHwStr" : "hwStr"),
        () => "hwStr",
        "w",
        true,
        ApColumn.LCASE,
        null,
        null
      )
    );
    this.columns.push(
      new ApColumn(
        this,
        "menu",
        () => null,
        () => null,
        null,
        "",
        true,
        -1,
        null,
        null
      )
    );
    // + cols bemerkung -> enthaelt
    //        tags -> hat tag [dropdown], hat tag nicht [dropdown], enthaelt (text aller tags)

    this.displayedColumns = this.columns.filter((c) => c.show).map((col) => col.columnName);
    this.extFilterColumns = this.columns.filter((c) => c.operators);
  }

  public getColumnIndex(name: string): number {
    return this.columns.findIndex((c) => c.columnName === name);
  }

  public getColumn(name: string): ApColumn {
    const idx = this.getColumnIndex(name);
    if (idx >= 0 && idx < this.columns.length) {
      return this.columns[idx];
    } else {
      return null;
    }
  }

  /* TODO AP-TABLE-LOAD
   Fuer erweiterte Filter muessen alle Daten in der gesamten Tabelle vorliegen.
   Das wird dann aber wieder langsam beim Laden. Moeglicher Ausweg:
   Liste in Teilen laden (analog Paging), dann ist zumindest schon mal was zu sehen.
   Zu testen (u.a.): Wie sieht's bei vorhandenem Filter/Sort aus.
   Wenn's klappt koennte evtl. der Standard-Filter fuer HW auf die gesamte HW-Liste
   ausgedehnt werden.
 */

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private keyboardService: KeyboardService
  ) {
    console.debug("c'tor ArbeitsplatzService");
    this.oeTreeUrl = this.configService.webservice + "/tree/oe";
    this.allApsUrl = this.configService.webservice + "/ap/all";
    this.pageApsUrl = this.configService.webservice + "/ap/page/";
    this.singleApUrl = this.configService.webservice + "/ap/id/";
    // this.getOeTree();
    this.userSettings = configService.getUser();
    this.buildColumns();
    // Filtereingaben bremsen
    const keyDebounce = 500;

    // Aenderung an Filter-Feldern in den Benutzereinstellungen speichern
    // und Filter triggern

    this.columns.forEach((c, idx) => {
      if (c.filterControl) {
        c.filterControl.valueChanges // FormControl
          .pipe(debounceTime(keyDebounce))
          .subscribe((text) => {
            const filtervalue: ColumnFilter = c.valueChange(text);
            // FIXME speichern der Filter ist vom Index der Spalte abhaengig, das koennte
            //       noch Aerger machen (ausserdem ist noch zu klären, wie ext.Filter in den
            //       userSettings gespeichert wird)
            this.userSettings.setApFilter(idx, filtervalue);
            this.filterExpression.reset();
            this.buildFilterExpression();
            console.debug(this.filterExpression.toString());
            // .filter muass geandert werden, damit MatTable den Filter ausfuehrt
            // this.apDataSource.filter = JSON.stringify(this.userSettings);
            this.apDataSource.filter = this.getFilterString();
          });
      }
    });

    // AP-Daten vom Server holen
    setTimeout(() => {
      this.getAps();
    }, 0);
  }

  /**
   * Tooltip mit dem vollstaendigen Text anzeigen, wenn der Text
   * mittels ellipsis abgeschnitten ist.
   * (scheint mit <span> nicht zu funktionieren)
   * ->
   * https://stackoverflow.com/questions/5474871/html-how-can-i-show-tooltip-only-when-ellipsis-is-activated
   *
   * @param evt - Mouseevent
   */
  public tooltipOnEllipsis(evt) {
    // fkt. nicht mit span
    if (evt.target.offsetWidth < evt.target.scrollWidth && !evt.target.title) {
      evt.target.title = evt.target.innerText;
    }
  }

  // APs aus der DB holen
  public async getAps() {
    this.loading = true;
    console.debug("### getAps() 1 - " + this.userSettings.showStandort);

    // this.typtagSelect = await this.http.get<TypTag[]>(this.typtagUrl).toPromise();
    // this.typtagSelect.forEach((t) => t.select = t.apkategorie + ": " + t.tagTyp);

    const pagesize: number = await this.configService.getConfig(ConfigService.AP_PAGE_SIZE);
    const defaultpagesize = 100;
    let page = 0;

    // TODO AP-TABLE-LOAD
    // const data = await this.http.get<Arbeitsplatz[]>(this.allApsUrl).toPromise();  // alle, aber nicht alle Daten
    const data = await this.http.get<Arbeitsplatz[]>(this.pageApsUrl + page).toPromise(); // 1. Teil, vollstaendiger record
    data.forEach((ap) => {
      this.prepAP(ap);
    });
    this.apDataSource.data = data;
    this.loading = false;

    // liefert Daten fuer internen sort in mat-table -> z.B. immer lowercase vergleichen
    this.apDataSource.sortingDataAccessor = (ap: Arbeitsplatz, id: string) => {
      const col = this.getColumn(id);
      if (col) {
        return col.sortString(ap);
      } else {
        return "";
      }
    };

    // eigener Filter
    this.apDataSource.filterPredicate = (ap: Arbeitsplatz, filter: string) => {
      return this.filterExpression.validate(ap);
    };

    this.applyUserSettings();

    // TODO AP-TABLE-LOAD
    this.fetchPage(++page, pagesize || defaultpagesize); // Rest holen
  }

  // TODO AP-TABLE-LOAD
  private fetchPage(page: number, size: number) {
    console.debug("load page " + page + ", size " + size);
    this.http
      .get<Arbeitsplatz[]>(this.pageApsUrl + page)
      .toPromise()
      .then((dat) => {
        dat.forEach((ap) => {
          this.prepAP(ap);
        });
        this.apDataSource.data = [...this.apDataSource.data, ...dat];
        if (dat.length === size) {
          this.fetchPage(++page, size); // recursion!
        }
      });
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
        const sortheader = this.apDataSource.sort.sortables.get(
          this.userSettings.apSortColumn
        ) as MatSortHeader;
        // this.sort.sort(sortheader);
        // FIXME Hack -> ApComponent#handleSort
        sortheader._handleClick();
      }
      // this.changeBetrst();
      // this.changeHw();
      this.initializeFilters();
    }
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
    // TODO AP-TABLE-LOAD
    // if (this.expandedRow === ap) {
    //   this.expandedRow = null;
    // } else {
    //   const apdata: Arbeitsplatz = await this.http.get<Arbeitsplatz>(this.singleApUrl + ap.apId).toPromise();
    //   // const rec: Arbeitsplatz = this.apDataSource.data.find((a => a.apId === ap.apId));
    //   // console.dir(rec);
    //   if (apdata) {
    //     ap.verantwOe = apdata.verantwOe;
    //     ap.oe = apdata.oe;
    //     ap.hw = apdata.hw;
    //     ap.bezeichnung = apdata.bezeichnung;
    //     ap.apname = apdata.apname;
    //     ap.aptyp = apdata.aptyp;
    //     ap.bemerkung = apdata.bemerkung;
    //     ap.tags = apdata.tags;
    //     ap.vlan = apdata.vlan;
    //     this.sortAP(ap);
    //     this.prepAP(ap);
    //     this.expandedRow = ap;
    //   } else {
    //     console.error("Fehler beim Laden der Details fuer AP #" + ap.apId);
    //   }
    // }
    this.expandedRow = this.expandedRow === ap ? null : ap;
    event.stopPropagation();
  }

  // // Wechsel Standort <-> verantw. OE
  // public changeBetrst() {
  //   const col = this.getColumn("betrst");
  //   col.displayName = this.bstDisplayName();
  //   col.fieldName = this.bstFieldName();
  // }
  // // Wechsel search pri HW <-> all HW
  // public changeHw() {
  //   const col = this.getColumn("hardware");
  //   col.fieldName = this.hwFieldName();
  // }

  public bstTooltip(ap: Arbeitsplatz): string {
    return (
      "OE: " +
      ap.oe.bstNr +
      "\n\n" +
      (ap.oe.strasse ? ap.oe.strasse + " " + (ap.oe.hausnr ? ap.oe.hausnr : "") + "\n" : "") +
      (ap.oe.plz ? ap.oe.plz + " " + (ap.oe.ort ? ap.oe.ort : "") + "\n" : "") +
      (ap.oe.oeff ? "\n" + ap.oe.oeff : "")
    );
  }

  public testApMenu(ap: Arbeitsplatz) {
    // console.debug("DEBUG AP-Menue fuer " + ap.apname);
    // const uniq1 = [...new Set(this.apDataSource.data.filter((a) => !!a.hwTypStr).map((a2) => a2.hwTypStr))].sort();
    // const uniq2 = [...new Set(this.apDataSource.data.map((a) => a.oesearch))].sort();
    // console.debug("DEBUG end uniq hw+oe");
    // console.dir(uniq1);
    // console.dir(uniq2);
    console.debug("### DEBUG filter columns");
    this.extFilterColumns.forEach((col) => {
      console.debug("Filter-Column: " + col.displayName);
      console.dir(col.selectList);
    });
  }

  // --- filter ---

  public initializeFilters() {
    this.columns.forEach((c, idx) => {
      if (c.filterControl) {
        const filt = this.userSettings.getApFilter(idx);
        if (filt.text) {
          c.filterControl.setValue((filt.inc ? "" : "!") + filt.text);
          c.filterControl.markAsDirty();
        }
      }
    });
  }

  public resetFilters() {
    this.columns.forEach((c, idx) => {
      if (c.filterControl) {
        c.filterControl.reset();
      }
    });
  }

  private buildFilterExpression() {
    const and = new LogicalAnd();
    this.columns.forEach((col, idx) => {
      if (col.filterControl) {
        const filtervalue: ColumnFilter = this.userSettings.getApFilter(idx);
        const colExpr = col.getFilterExpression(filtervalue);
        if (colExpr) {
          this.filterExpression.addElement(and, colExpr);
        }
      }
    });
  }

  public filterByAptyp(ap: Arbeitsplatz, event: Event) {
    const col = this.getColumn("aptyp");
    col.filterControl.setValue(ap.aptyp);
    col.filterControl.markAsDirty();
    event.stopPropagation();
  }

  public filterByBetrst(ap: Arbeitsplatz, event: Event) {
    const col = this.getColumn("betrst");
    col.filterControl.setValue(ap[col.sortFieldName]);
    col.filterControl.markAsDirty();
    event.stopPropagation();
  }

  /*
     static fn kann nicht in template verwendet werden, deshalb der accessor
   */
  // public getColumn(name: string): ApColumn {
  //   return this.getColumn(name);
  // }

  // // OE-Name abhaengig von gewaehlter Anzeige
  // // (Standort || verantwortliche OE)
  // public getBetrst(ap: Arbeitsplatz): string {
  //   if (this.userSettings.showStandort) {
  //     return ap.oe.betriebsstelle;
  //   } else {
  //     if (ap.verantwOe) {
  //       return ap.verantwOe.betriebsstelle;
  //     } else {
  //       return ap.oe.betriebsstelle;
  //     }
  //   }
  // }

  // eindeutiger String fuer alle Filter -> apDataSource.filter
  private getFilterString(): string {
    let s = "";
    for (let i = 0; i < this.userSettings.apFiltersCount(); i++) {
      const filt = this.userSettings.getApFilter(i);
      s += filt.text + filt.inc;
    }
    return s;
  }

  // --- ---

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

  private sortAP(ap: Arbeitsplatz) {
    ap.tags.sort((a, b) => {
      if (a.flag === b.flag) {
        return this.collator.compare(a.bezeichnung, b.bezeichnung);
      } else {
        return a.flag === 1 ? -1 : 1;
      }
    });
    ap.hw.sort((a, b) => {
      if (a.pri) {
        return -1;
      } else if (b.pri) {
        return 1;
      } else {
        return this.collator.compare(
          a.hwtyp + a.hersteller + a.bezeichnung + a.sernr,
          b.hwtyp + b.hersteller + b.bezeichnung + b.sernr
        );
      }
    });
  }

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
      }
      // fuer die Suche
      ap.sonstHwStr =
        ap.sonstHwStr +
        " " +
        h.hersteller +
        " " +
        h.bezeichnung +
        (h.sernr && h.hwtypFlag !== 1 ? " " + h.sernr : "");
    });

    if (ap.vlan && ap.vlan[0]) {
      ap.ipStr = this.getIpString(ap.vlan[0].vlan + ap.vlan[0].ip);
      ap.macStr = this.getMacString(ap.vlan[0].mac);
      ap.ipsearch = ap.ipStr + " " + ap.vlan[0].mac;
    } else {
      ap.ipStr = "";
      ap.macStr = "";
      ap.ipsearch = "";
    }
    // das spart den null-check
    if (!ap.verantwOe) {
      ap.verantwOe = ap.oe;
    }
    ap.oesearch = ("00" + ap.oe.bstNr).slice(-3) + " " + ap.oe.betriebsstelle; // .toLowerCase();
    ap.oesort = ap.oe.betriebsstelle; // .toLowerCase();
    // if (ap.verantwOe) {
    ap.voesearch = ("00" + ap.verantwOe.bstNr).slice(-3) + " " + ap.verantwOe.betriebsstelle; // .toLowerCase();
    ap.voesort = ap.verantwOe.betriebsstelle; // .toLowerCase();
    // } else {
    //   ap.voesearch = ap.oesearch;
    //   ap.voesort = ap.oesort;
    // }
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
