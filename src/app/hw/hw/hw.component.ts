import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ActivatedRoute } from "@angular/router";
import { ConfigService } from "../../shared/config/config.service";
import { GetColumn } from "../../shared/helper";
import { HeaderCellComponent } from "../../shared/table/header-cell/header-cell.component";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { HwService } from "../hw.service";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "sbsdb-hw",
  templateUrl: "./hw.component.html",
  styleUrls: ["./hw.component.scss"],
})
export class HwComponent implements AfterViewInit, OnInit {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  @ViewChild(MatSort, { static: true }) public sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild("firstfilter") public firstFilter: HeaderCellComponent;
  @ViewChild("lastfilter") public lastFilter: HeaderCellComponent;
  @ViewChild("newHwMenuBtn") public newHwMenuBtn: MatMenuTrigger;

  constructor(
    private route: ActivatedRoute,
    private config: ConfigService,
    public dialog: MatDialog,
    public hwService: HwService,
    private cdRef: ChangeDetectorRef
  ) {
    console.debug("c'tor HwComponent");
    this.hwService.editFilterService.setFilterService(this.hwService.hwFilterService);
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
        this.hwService.hwFilterService.toggleExtendedFilter();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key == "l") {
        this.hwService.hwFilterService.resetFilters();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key == "x") {
        void this.hwService.hwFilterService.toCsv();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key == "n") {
        this.newHwMenuBtn.toggleMenu();
        event.preventDefault();
        event.stopPropagation();
      } else {
        const colIdx = this.hwService.columns.findIndex(
          (c) => c.accelerator && c.accelerator === event.key
        );
        if (colIdx >= 0) {
          this.sort.sort(this.sort.sortables.get(this.hwService.columns[colIdx].columnName));
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  }

  public ngAfterViewInit(): void {
    console.debug("afterViewInit HwComponent");
    // 1. ViewChild-Elemente erst in afterViewInit sicher greifbar
    // 2. in setTimeout verpacken sonst stoert das hier die Angular change detection
    setTimeout(() => {
      // Benutzereinstellungen setzen
      this.hwService.setViewParams(this.sort, this.paginator);
      this.focusFirstFilter();
      //
      // const at = this.pagElement.nativeElement.getElementsByClassName("mat-paginator-container");
      // const before = this.pagElement.nativeElement.getElementsByClassName(
      //   "mat-paginator-page-size"
      // );
      // at[0].insertBefore(this.pagInsert.nativeElement, before[0]);

      //      this.hwService.navigationService.hwLoading = false;
    }, 0);
    // Benutzer-Eingaben auf der AP-Seite koennen Aenderungen auf der HW-Seite ausloesen,
    // und das triggert beim Wechsel zu HW u.U. *ExpressionChangedAfterItHasBeenCheckedError*.
    // Das folgende verhindert diesen Fehler.
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    /*  verschiedene parameter
    https://stackoverflow.com/questions/49738911/angular-5-routing-to-same-component-but-different-param-not-working
     */
    // TODO ActivatedRoute ist nur in der jeweiligen component sinnvoll
    //      d.h. je comp. in der das gebraucht wird .params.subscribe und das Handling an den Service delegieren
    //      (evtl. NavigationService ??)
    this.route.paramMap.subscribe((params) => {
      // check params
      let encFilter: string = null;
      if (params) {
        if (params.has("filt")) {
          encFilter = params.get("filt");
          this.config.getUser().latestHwFilter = encFilter;
          this.hwService.hwFilterService.filterFromNavigation(encFilter);
        } else if (params.has("hwid")) {
          // FIXME das hier hat den Nachteil, dass so zwei Eintraege in der History eingetragen werden:
          //       (1) /ap;apname=xx und vom Filter (2) /ap;filt=xxx
          //       besser direkt ueber apService aufrufen
          // FIXME funktioniert nicht wenn die Anwendung hiermit gestartet wird. Dann wird in filterFor
          //       auf noch nicht initialisierte Columns zugegriffen. Da waere eine Verzoegerung noetig
          //       bis filterService.dataReady. Sieht momentan nach Henne-Ei-Problem aus ...
          //       => wenn mal Zeit ist
          // this.hwService.hwFilterService.filterFor("hwid", Number.parseInt(params.get("hwid"), 10));
        }
      } else {
        if (this.config.getUser().latestApFilter) {
          encFilter = this.config.getUser().latestApFilter;
          this.hwService.hwFilterService.nav2filter(encFilter);
        }
      }
    });
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

  public getColumn(name: string): SbsdbColumn<unknown, unknown> {
    return GetColumn(name, this.hwService.columns);
  }
}
