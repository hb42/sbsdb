import { animate, state, style, transition, trigger } from "@angular/animations";
import { AfterViewInit, Component, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ConfigService } from "../../shared/config/config.service";
import { ApFilterComponent } from "../ap-filter/ap-filter.component";
import { ArbeitsplatzService } from "../arbeitsplatz.service";

@Component({
             selector   : "sbsdb-ap",
             templateUrl: "./ap.component.html",
             styleUrls  : ["./ap.component.scss"],
             animations : [
               trigger("detailExpand", [
                 state("collapsed", style({height: "0px", minHeight: "0", display: "none"})),
                 state("expanded", style({height: "*"})),
                 transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
               ])
             ],
           })
export class ApComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  // focus first filter
  @HostListener("document:keydown.alt.f", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.focusFirstFilter();
    event.preventDefault();
    event.stopPropagation();
  }

  // Spalten via Keyboard sortieren
  @HostListener("document:keydown", ["$event"])
  handleSort(event: KeyboardEvent) {
    if (event.altKey && !event.shiftKey && !event.ctrlKey) {
      const colIdx = this.apService.columns.findIndex((c) => c.sort && c.sort.key && c.sort.key === event.key);
      if (colIdx >= 0) {
        // FIXME MatSort.sort sortiert zwar, aktualisiert aber nicht den Pfeil, der die Sort-Richtung anzeigt
        //       das funktioniert z.Zt. nur ueber einen Hack (interne fn _handleClick())
        //       -> https://github.com/angular/components/issues/10242
        // this.sort.sort(this.sort.sortables.get(this.apService.columns[colIdx].name));
        const sortHeader = this.sort.sortables.get(this.apService.columns[colIdx].name) as MatSortHeader;
        sortHeader._handleClick();
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild("firstfilter") firstFilter;
  @ViewChild("lastfilter") lastFilter;

  public subscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private config: ConfigService,
              public apService: ArbeitsplatzService,
              public dialog: MatDialog
  ) {
    console.debug("c'tor ApComponent");
  }

  public async ngOnInit() {
    // const par = this.route.snapshot.params["tree"];
    // console.debug("onInit ApComponent par=" + par);

    /*  verschiedene parameter
    https://stackoverflow.com/questions/49738911/angular-5-routing-to-same-component-but-different-param-not-working
     */
    // TODO ActivatedRoute ist nur in der jeweiligen component sinnvoll
    //      d.h. je comp. in der das gebraucht wird .params.subscribe und das Handling an den Service delegieren
    //      (evtl. NaviagatonService ??)
    this.route.params.subscribe((params) => {
      console.debug("## route params changed");
      console.dir(params);
      // URL /ap;id=11;tree=bst -> {id: 11, tree: 'bst'}
      // als zweiter Navigationsparameter:
      //   this.router.navigate(['/ap', { id: 11, tree: 'bst' }]);
      //   <a [routerLink]="['/ap', { id: 11, tree: 'bst' }]">test</a>
      this.apService.urlParams = {
        tree: params.tree,
        id  : Number.parseInt(params.id, 10)
      };
      if (params.tree && params.tree === "oe") {
        this.apService.expandTree(this.apService.urlParams.id);
      }
    });

    // await this.apService.getAps();
    this.apService.apDataSource.sort = this.sort;
    this.apService.apDataSource.paginator = this.paginator;

  }

  public ngAfterViewInit(): void {
    // 1. ViewChild-Elemente erst in afterViewInit sicher greifbar
    // 2. in setTimeout verpacken sonst stoert das hier die Angular change detection
    setTimeout(() => {
      // Benutzereinstellungen setzen
      this.apService.applyUserSettings();

      this.focusFirstFilter();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      console.debug("ApComponent - subscription.unsubscribe");
      this.subscription.unsubscribe();
    }
  }

  public focusFirstFilter() {
    this.firstFilter.nativeElement.focus();
  }

  public focusLastFilter() {
    this.lastFilter.nativeElement.focus();
  }

  public textForSort(column: string): string {
    const col = this.apService.getColumn(column);
    if (col) {
      return col.sort.text;
    } else {
      return "";
    }
  }

  public extendedFilter() {
    const dialogRef = this.dialog.open(ApFilterComponent, {
      // height: "300px",
      // width: "500px",
      // maxWidth: "600px",
      disableClose: true,
      data        : this.apService.filterExpression,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.debug("The dialog was closed");
        console.dir(result);
      }
    });

  }

}
