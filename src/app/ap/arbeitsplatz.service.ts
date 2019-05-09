import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatTableDataSource, MatTreeNestedDataSource } from "@angular/material";
import { ConfigService } from "../shared/config/config.service";
import { Arbeitsplatz } from "./model/arbeitsplatz";
import { OeTreeItem } from "./model/oe.tree.item";

@Injectable({providedIn: "root"})
export class ArbeitsplatzService {


  public treeControl = new NestedTreeControl<OeTreeItem>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<OeTreeItem>();

  private oeTree: OeTreeItem[];
  public selected: OeTreeItem;
  public urlParams: any;

  public apDataSource: MatTableDataSource<Arbeitsplatz> = new MatTableDataSource<Arbeitsplatz>(); // Arbeitsplatz[] =
                                                                                                  // [];
  public displayedColumns: string[] = ["aptyp", "apname", "betrst", "bezeichnung"];

  // Filter
  public typFilter = new FormControl("");
  public nameFilter = new FormControl("");
  public bstFilter = new FormControl("");
  public bezFilter = new FormControl("");
  // Inhalte aller Filter -> Profil | URL ??
  filterValues = {
    aptyp      : "",
    apname     : "",
    betrst     : "",
    bezeichnung: "",
  };
  public loading = false;

  // Web-API calls
  private readonly oeTreeUrl: string;
  private readonly allApsUrl: string;
  private readonly pageApsUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.oeTreeUrl = this.configService.webservice + "/tree/oe";
    this.allApsUrl = this.configService.webservice + "/ap/all";
    this.pageApsUrl = this.configService.webservice + "/ap/page";
    // this.getOeTree();

    // Filter-Felder
    this.typFilter.valueChanges
        .subscribe(
            text => {
              this.filterValues.aptyp = text ? text.toLowerCase() : "";
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
  }

  // APs aus der DB holen  TODO ist das hier richtig?
  public async getAps() {
    this.loading = true;
    const pagesize: number = await this.configService.getConfig(ConfigService.AP_PAGE_SIZE);
    let data: Arbeitsplatz[];
    let page = 0;
    do {
      data = await this.http.get<Arbeitsplatz[]>(this.pageApsUrl + "/" + page++).toPromise();
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
      });
      this.apDataSource.data = this.apDataSource.data.concat(data);
      this.loading = false;
    } while (data.length);

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
        default:
          return 0;
      }
    }

    // eigner Filter
    this.apDataSource.filterPredicate = (ap: Arbeitsplatz, filter: string) => {
      const searchTerms = JSON.parse(filter);
      return (ap.aptyp + ap.typTagsStr).toLowerCase().indexOf(searchTerms.aptyp) !== -1
          && ap.apname.toString().toLowerCase().indexOf(searchTerms.apname) !== -1
          && ap.oe.betriebsstelle.toLowerCase().indexOf(searchTerms.betrst) !== -1
          && ap.bezeichnung.toLowerCase().indexOf(searchTerms.bezeichnung) !== -1;
    };
  }

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
