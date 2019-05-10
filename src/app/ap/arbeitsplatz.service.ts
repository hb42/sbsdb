import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatTableDataSource, MatTreeNestedDataSource } from "@angular/material";
import { ConfigService } from "../shared/config/config.service";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { OeTreeItem } from "./model/oe.tree.item";
import { TypTag } from "./model/typtag";

@Injectable({providedIn: "root"})
export class ArbeitsplatzService {


  public treeControl = new NestedTreeControl<OeTreeItem>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<OeTreeItem>();

  private oeTree: OeTreeItem[];
  public selected: OeTreeItem;
  public urlParams: any;

  public apDataSource: MatTableDataSource<Arbeitsplatz> = new MatTableDataSource<Arbeitsplatz>(); // Arbeitsplatz[] =
                                                                                                  // [];
  public displayedColumns: string[] = ["aptyp", "apname", "betrst", "bezeichnung", "hardware"];

  // Filter
  public typFilter = new FormControl("");
  public nameFilter = new FormControl("");
  public bstFilter = new FormControl("");
  public bezFilter = new FormControl("");
  public hwFilter = new FormControl("");
  // Inhalte aller Filter -> Profil | URL ??
  filterValues = {
    aptyp      : [],
    apname     : "",
    betrst     : "",
    bezeichnung: "",
    hardware   : "",
  };
  public loading = false;
  public typtagSelect: TypTag[];

  // Web-API calls
  private readonly oeTreeUrl: string;
  private readonly allApsUrl: string;
  private readonly pageApsUrl: string;
  private readonly typtagUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.oeTreeUrl = this.configService.webservice + "/tree/oe";
    this.allApsUrl = this.configService.webservice + "/ap/all";
    this.pageApsUrl = this.configService.webservice + "/ap/page";
    this.pageApsUrl = this.configService.webservice + "/ap/page";
    this.typtagUrl = this.configService.webservice + "/ap/typtags";
    // this.getOeTree();

    // Filter-Felder
    this.typFilter.valueChanges
        .subscribe(
            arr => {
              // this.filterValues.aptyp = text ? text.toLowerCase() : "";
              this.filterValues.aptyp = arr ? arr : [];
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

  // APs aus der DB holen  TODO ist das hier richtig?
  public async getAps() {
    this.loading = true;

    this.typtagSelect = await this.http.get<TypTag[]>(this.typtagUrl).toPromise();
    this.typtagSelect.forEach((t) => t.select = t.apTyp + ": " + t.tagTyp);

    const pagesize: number = await this.configService.getConfig(ConfigService.AP_PAGE_SIZE);

    // let data: Arbeitsplatz[];
    // let page = 0;
    // do {
    //   data = await this.http.get<Arbeitsplatz[]>(this.pageApsUrl + "/" + page++).toPromise();
    const data = await this.http.get<Arbeitsplatz[]>(this.allApsUrl).toPromise();
      data.forEach((ap) => {
        let typ = "";
        let tag = "";
        ap.tags.sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung));
        ap.tags.forEach((t) => {
          if (t.flag === 1) {
            typ += t.bezeichnung + " ";
          } else {
            tag += t.bezeichnung + "=" + t.text + " ";
          }
        });
        ap.typTagsStr = typ;
        ap.tagsStr = tag;
        ap.hwStr = ""; // keine undef Felder!
        ap.hw.forEach((h) => {
          if (h.pri) {
            ap.hwStr = h.hersteller + " - " + h.bezeichnung + " [" + h.sernr + "]";
          }
        });
      });
    this.apDataSource.data = data;
      this.loading = false;
    //   this.apDataSource.data = this.apDataSource.data.concat(data);
    //   this.loading = false;
    // } while (data.length);

    // liefert Daten fuer sort -> immer lowercase vergleichen
    this.apDataSource.sortingDataAccessor = (ap: Arbeitsplatz, id: string) => {
      switch (id) {
        case "aptyp":
          return (ap.aptyp + ap.typTagsStr).toLowerCase();
        case "apname":
          return ap.apname.toLowerCase();
        case "betrst":
          return ap.oe.betriebsstelle.toLowerCase();
        case "bezeichnung":
          return ap.bezeichnung.toLowerCase();
        case "hardware":
          return ap.hwStr.toLowerCase();
        default:
          return 0;
      }
    };

    // eigner Filter
    this.apDataSource.filterPredicate = (ap: Arbeitsplatz, filter: string) => {
      const searchTerms = JSON.parse(filter);
      return (searchTerms.aptyp.length === 0 ||
              ap.tags.reduce((prev, cur) => prev || searchTerms.aptyp.indexOf(cur.tagId) !== -1, false)
          )
          && ap.apname.toString().toLowerCase().indexOf(searchTerms.apname) !== -1
          && ap.oe.betriebsstelle.toLowerCase().indexOf(searchTerms.betrst) !== -1
          && ap.bezeichnung.toLowerCase().indexOf(searchTerms.bezeichnung) !== -1
          && ap.hwStr.toLowerCase().indexOf(searchTerms.hardware) !== -1;
    };
  }

  public getBstData

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
