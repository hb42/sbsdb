import {
  AfterViewInit,
  Component,
  HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ConfigService } from "../../shared/config/config.service";
import { GetColumn } from "../../shared/helper";
import { HeaderCellComponent } from "../../shared/table/header-cell/header-cell.component";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { ApService } from "../ap.service";

@Component({
  selector: "sbsdb-ap",
  templateUrl: "./ap.component.html",
  styleUrls: ["./ap.component.scss"],
})
export class ApComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  @ViewChild(MatSort, { static: true }) public sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild("firstfilter") public firstFilter: HeaderCellComponent; //ElementRef<HTMLInputElement>;
  @ViewChild("lastfilter") public lastFilter: HeaderCellComponent;

  // @ViewChild("pagInsert", { read: TemplateRef }) pagInsert: TemplateRef<Element>;
  // @ViewChild(MatPaginator, { read: ElementRef }) pagElement: ElementRef<Element>;

  public subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private config: ConfigService,
    public apService: ApService,
    public dialog: MatDialog
  ) {
    console.debug("c'tor ApComponent");
    this.apService.editFilterService.setFilterService(this.apService.filterService);
  }

  // focus first filter
  @HostListener("document:keydown.alt.f", ["$event"])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    this.focusFirstFilter();
    event.preventDefault();
    event.stopPropagation();
  }

  // Spalten via Keyboard sortieren
  @HostListener("document:keydown", ["$event"])
  public handleApKeys(event: KeyboardEvent): void {
    if (event.altKey && !event.shiftKey && !event.ctrlKey) {
      // Extended Filter => alt-e
      if (event.key === "e") {
        this.apService.filterService.toggleExtendedFilter();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key == "l") {
        this.apService.filterService.resetFilters();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key == "x") {
        this.apService.filterService.toCsv();
        event.preventDefault();
        event.stopPropagation();
      } else {
        const colIdx = this.apService.columns.findIndex(
          (c) => c.accelerator && c.accelerator === event.key
        );
        if (colIdx >= 0) {
          // FIXME MatSort.sort sortiert zwar, aktualisiert aber nicht den Pfeil, der die Sort-Richtung anzeigt
          //       das funktioniert z.Zt. nur ueber einen Hack (interne fn _handleClick())
          //       -> https://github.com/angular/components/issues/10242
          //       angular v11.2.5: scheint endlich zu funktionieren (beobachten!)
          this.sort.sort(this.sort.sortables.get(this.apService.columns[colIdx].columnName));
          // const sortHeader = this.sort.sortables.get(
          //   this.apService.columns[colIdx].columnName
          // ) as MatSortHeader;
          // // eslint-disable-next-line no-underscore-dangle
          // sortHeader._handleClick();
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  }

  public ngOnInit(): void {
    // const par = this.route.snapshot.params["tree"];
    // console.debug("onInit ApComponent par=" + par);

    /*  verschiedene parameter
    https://stackoverflow.com/questions/49738911/angular-5-routing-to-same-component-but-different-param-not-working
     */
    // TODO ActivatedRoute ist nur in der jeweiligen component sinnvoll
    //      d.h. je comp. in der das gebraucht wird .params.subscribe und das Handling an den Service delegieren
    //      (evtl. NaviagatonService ??)
    this.route.paramMap.subscribe((params) => {
      // check params
      let encFilter: string = null;
      if (params) {
        if (params.has("filt")) {
          encFilter = params.get("filt");
          this.config.getUser().latestApFilter = encFilter;
          this.apService.filterService.filterFromNavigation(encFilter);
        } else if (params.has("apid")) {
          // FIXME das hier hat den Nachteil, dass so zwei Eintraege in der History eingetragen werden:
          //       (1) /ap;apid=xx und vom Filter (2) /ap;filt=xxx
          //       besser direkt ueber apService aufrufen
          // FIXME funktioniert nicht wenn die Anwendung hiermit gestartet wird. Dann wird in filterFor
          //       auf noch nicht initialisierte Columns zugegriffen. Da waere eine Verzoegerung noetig
          //       bis filterService.dataReady. Sieht momentan nach Henne-Ei-Problem aus ...
          //       => wenn mal Zeit ist
          // this.apService.filterService.filterFor("apid", Number.parseInt(params.get("apid"), 10));
        }
      } else {
        if (this.config.getUser().latestApFilter) {
          encFilter = this.config.getUser().latestApFilter;
          this.apService.filterService.nav2filter(encFilter);
        }
      }

      // URL /ap;id=11;tree=bst -> {id: 11, tree: 'bst'}
      // als zweiter Navigationsparameter:
      //   this.router.navigate(['/ap', { id: 11, tree: 'bst' }]);
      //   <a [routerLink]="['/ap', { id: 11, tree: 'bst' }]">test</a>

      // this.apService.urlParams = {
      //   tree: params.tree,
      //   id: Number.parseInt(params.id, 10),
      // };
      // if (params.tree && params.tree === "oe") {
      //   // this.apService.expandTree(this.apService.urlParams.id);
      // }
    });
  }

  public ngAfterViewInit(): void {
    // 1. ViewChild-Elemente erst in afterViewInit sicher greifbar
    // 2. in setTimeout verpacken sonst stoert das hier die Angular change detection

    setTimeout(() => {
      // Benutzereinstellungen setzen
      this.apService.setViewParams(this.sort, this.paginator);
      this.focusFirstFilter();

      //   const at = this.pagElement.nativeElement.getElementsByClassName("mat-paginator-container");
      //   const before = this.pagElement.nativeElement.getElementsByClassName(
      //     "mat-paginator-page-size"
      //   );
      //   at[0].insertBefore(this.pagInsert.elementRef.nativeElement, before[0]);
    }, 0);
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      console.debug("ApComponent - subscription.unsubscribe");
      this.subscription.unsubscribe();
    }
  }

  public focusFirstFilter(): void {
    if (this.firstFilter) {
      this.firstFilter.focus();
    }
  }

  public focusLastFilter(): void {
    if (this.lastFilter) {
      this.lastFilter.focus();
    }
  }

  public sortHeading(column: string): string {
    const col = GetColumn(column, this.apService.columns);
    if (col) {
      return col.displayName;
    } else {
      return "";
    }
  }

  public sortAccel(column: string): string {
    const col = GetColumn(column, this.apService.columns);
    if (col) {
      return col.accelerator;
    } else {
      return "";
    }
  }

  public getColumn(name: string): SbsdbColumn<unknown, unknown> {
    return GetColumn(name, this.apService.columns);
  }
}
