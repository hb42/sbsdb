import { animate, state, style, transition, trigger } from "@angular/animations";
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ConfigService } from "../../shared/config/config.service";
import { ArbeitsplatzService } from "../arbeitsplatz.service";
import { DataService } from "../../shared/data.service";

@Component({
  selector: "sbsdb-ap",
  templateUrl: "./ap.component.html",
  styleUrls: ["./ap.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0", display: "none" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
  ],
})
export class ApComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  @ViewChild(MatSort, { static: true }) public sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild("firstfilter") public firstFilter: ElementRef<HTMLInputElement>;
  @ViewChild("lastfilter") public lastFilter: ElementRef<HTMLInputElement>;

  @ViewChild("pagInsert", { read: ElementRef }) pagInsert: ElementRef<Element>;
  @ViewChild(MatPaginator, { read: ElementRef }) pagElement: ElementRef<Element>;

  public subscription: Subscription;

  // const importieren
  public fremdeHwFlag = DataService.FREMDE_HW_FLAG;
  public aptypeFlag = DataService.BOOL_TAG_FLAG;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private config: ConfigService,
    private dataService: DataService,
    public apService: ArbeitsplatzService,
    public dialog: MatDialog
  ) {
    console.debug("c'tor ApComponent");
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
      } else {
        const colIdx = this.apService.columns.findIndex(
          (c) => c.accelerator && c.accelerator === event.key
        );
        if (colIdx >= 0) {
          // FIXME MatSort.sort sortiert zwar, aktualisiert aber nicht den Pfeil, der die Sort-Richtung anzeigt
          //       das funktioniert z.Zt. nur ueber einen Hack (interne fn _handleClick())
          //       -> https://github.com/angular/components/issues/10242
          // this.sort.sort(this.sort.sortables.get(this.apService.columns[colIdx].name));
          const sortHeader = this.sort.sortables.get(
            this.apService.columns[colIdx].columnName
          ) as MatSortHeader;
          // eslint-disable-next-line no-underscore-dangle
          sortHeader._handleClick();
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
      if (params && params.has("filt")) {
        encFilter = params.get("filt");
        // weitere Parameter muessten hier behandelt werden
        // FIXME (*)
      } else {
        // keine Parameter -> letzten gesicherten nehmen
        // (Unterstellung: interne Navigation von z.B. HW-Seite)
        // TODO evtl. filter doch noch in userConf, was ist, wenn letzte URL
        //      vor Prog-Ende HWpage? Dann wuerde der letzte Filter verloren
        //      gehen. Evtl. encoded wg. Platz. Filter aus conf wuerde dann nur
        //      lateestUrlParams geladen, das sollte reichen um doppelte
        //      Ausfuehrung beim Start zu verhindern.
        if (this.config.getUser().latestApFilter) {
          encFilter = this.config.getUser().latestApFilter;
          this.apService.nav2filter(encFilter);
        }
      }
      // FIXME die folgenden Zeilen in den ersten Teil des if (*) ??
      // param merken
      if (encFilter) {
        this.config.getUser().latestApFilter = encFilter;
      }
      this.apService.filterFromNavigation(encFilter);
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

      const at = this.pagElement.nativeElement.getElementsByClassName("mat-paginator-container");
      const before = this.pagElement.nativeElement.getElementsByClassName(
        "mat-paginator-page-size"
      );
      at[0].insertBefore(this.pagInsert.nativeElement, before[0]);
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
      this.firstFilter.nativeElement.focus();
    }
  }

  public focusLastFilter(): void {
    if (this.lastFilter) {
      this.lastFilter.nativeElement.focus();
    }
  }

  public sortHeading(column: string): string {
    const col = this.apService.getColumn(column);
    if (col) {
      return col.displayName;
    } else {
      return "";
    }
  }

  public sortAccel(column: string): string {
    const col = this.apService.getColumn(column);
    if (col) {
      return col.accelerator;
    } else {
      return "";
    }
  }
}
