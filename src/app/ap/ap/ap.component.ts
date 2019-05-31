import {animate, state, style, transition, trigger} from "@angular/animations";
import {AfterViewInit, Component, HostBinding, HostListener, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort, MatSortHeader, SortDirection} from "@angular/material/sort";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {ConfigService} from "../../shared/config/config.service";
import {ArbeitsplatzService} from "../arbeitsplatz.service";

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

  // sort via shortcut
  @HostListener("document:keydown.alt.t", ["$event"])
  handleTypSort(event: KeyboardEvent) {
    this.sortColumn("aptyp", event);
  }

  @HostListener("document:keydown.alt.n", ["$event"])
  handleNameSort(event: KeyboardEvent) {
    this.sortColumn("apname", event);
  }
  @HostListener("document:keydown.alt.o", ["$event"])
  handleBetrstSort(event: KeyboardEvent) {
    this.sortColumn("betrst", event);
  }
  @HostListener("document:keydown.alt.b", ["$event"])
  handleBezSort(event: KeyboardEvent) {
    this.sortColumn("bezeichnung", event);
  }
  @HostListener("document:keydown.alt.i", ["$event"])
  handleIpSort(event: KeyboardEvent) {
    this.sortColumn("ip", event);
  }
  @HostListener("document:keydown.alt.w", ["$event"])
  handleHwSort(event: KeyboardEvent) {
    this.sortColumn("hardware", event);
  }

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild("firstfilter", {static: false}) firstFilter;
  @ViewChild("lastfilter", {static: false}) lastFilter;

  public subscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private config: ConfigService,
              public apService: ArbeitsplatzService
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

    this.paginator.pageSize = this.apService.userSettings.apPageSize;
    if (this.apService.userSettings.apSortColumn) {
      this.sort.active = this.apService.userSettings.apSortColumn;
      this.sort.direction = this.apService.userSettings.apSortDirection as SortDirection;
    }
  }

  public ngAfterViewInit(): void {
    // 1. das Input-Element ist fruehestens in afterViewInit sichtbar
    // 2. in setTimeout verpacken sonst stoert das hier die Angular change detection
    setTimeout(() => {
      // if column && direct
      // s = sort.sortable.get(column)
      // s.start = dirct
      // sort(s)
      this.sort.sort({id    : this.apService.userSettings.apSortColumn,
                       start: this.apService.userSettings.apSortDirection as "asc" | "desc"
                     });
      this.apService.initializeFilters();
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

  private sortColumn(col: string, event: KeyboardEvent) {
    // FIXME MatSort.sort sortiert zwar, aktualisiert aber nicht den Pfeil, der die Sort-Richtung anzeigt
    //       das funktioniert z.Zt. nur ueber einen Hack (interne fn _handleClick())
    //       -> https://github.com/angular/components/issues/10242
    // this.sort.sort(this.sort.sortables.get(col));
    const sortHeader = this.sort.sortables.get(col) as MatSortHeader;
    sortHeader._handleClick();
    event.preventDefault();
    event.stopPropagation();
  }

}
