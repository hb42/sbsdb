import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ActivatedRoute } from "@angular/router";
import { KEY_FIRST_FILTER } from "../../const";
import { ConfigService } from "../../shared/config/config.service";
import { GetColumn } from "../../shared/helper";
import { KeyboardListener } from "../../shared/keyboard-listener";
import { KeyboardService } from "../../shared/keyboard.service";
import { HeaderCellComponent } from "../../shared/table/header-cell/header-cell.component";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { HwService } from "../hw.service";

@Component({
  selector: "sbsdb-hw",
  templateUrl: "./hw.component.html",
  styleUrls: ["./hw.component.scss"],
})
export class HwComponent implements AfterViewInit, OnInit, OnDestroy {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  @ViewChild(MatSort, { static: true }) public sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild("firstfilter") public firstFilter: HeaderCellComponent;
  @ViewChild("lastfilter") public lastFilter: HeaderCellComponent;
  @ViewChild("newHwMenuBtn") public newHwMenuBtn: MatMenuTrigger;

  private keyboardEvents: KeyboardListener[] = [];

  constructor(
    private route: ActivatedRoute,
    private config: ConfigService,
    public dialog: MatDialog,
    public hwService: HwService,
    private cdRef: ChangeDetectorRef,
    private keyboardService: KeyboardService
  ) {
    console.debug("c'tor HwComponent");
    this.hwService.editFilterService.setFilterService(this.hwService.hwFilterService);
  }

  public ngAfterViewInit(): void {
    // 1. ViewChild-Elemente erst in afterViewInit sicher greifbar
    // 2. in setTimeout verpacken sonst stoert das hier die Angular change detection
    setTimeout(() => {
      // Benutzereinstellungen setzen
      this.hwService.setViewParams(this.sort, this.paginator);
      this.focusFirstFilter();
    }, 0);
    // Benutzer-Eingaben auf der AP-Seite koennen Aenderungen auf der HW-Seite ausloesen,
    // und das triggert beim Wechsel zu HW u.U. *ExpressionChangedAfterItHasBeenCheckedError*.
    // Das folgende verhindert diesen Fehler.
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      let encFilter: string = null;
      if (params) {
        if (params.has("filt")) {
          // .../hw;filt=xxx
          // Base64-codierter Filter, nutzt Anwendung intern
          encFilter = params.get("filt");
          this.config.getUser().latestHwFilter = encFilter;
          this.hwService.hwFilterService.filterFromNavigation(encFilter);
        } else if (params.has("id")) {
          // .../hw;id=xxx
          // HW ueber Datenbank-Index aufrufen
          this.hwService.hwFilterService.navigationFromExtParam(
            ["id"],
            Number.parseInt(params.get("id"), 10)
          );
        } else if (params.has("sernr")) {
          // .../hw;sernr=xxx
          // HW ueber Serien-Nr. suchen (like)
          this.hwService.hwFilterService.navigationFromExtParam(["sernr"], params.get("sernr"));
        } else if (params.has("find")) {
          // .../hw;find=xxx
          // HW ueber Hersteller, Bezeichnung, Serien-Nr. suchen (like)
          this.hwService.hwFilterService.navigationFromExtParam(
            ["konfiguration", "sernr"],
            params.get("find")
          );
        }
      } else {
        if (this.config.getUser().latestHwFilter) {
          encFilter = this.config.getUser().latestHwFilter;
          this.hwService.hwFilterService.nav2filter(encFilter);
        }
      }
    });

    // Keyboard handling
    let listener: KeyboardListener = { trigger: new EventEmitter<void>(), key: KEY_FIRST_FILTER };
    this.keyboardService.register(listener);
    listener.trigger.subscribe(() => this.focusFirstFilter());
    this.keyboardEvents.push(listener);

    this.hwService.columns.forEach((c) => {
      if (c.accelerator) {
        listener = { trigger: new EventEmitter<void>(), key: c.accelerator };
        listener.trigger.subscribe(() => this.sort.sort(this.sort.sortables.get(c.columnName)));
        this.keyboardService.register(listener);
        this.keyboardEvents.push(listener);
      }
    });
  }

  public ngOnDestroy(): void {
    this.keyboardEvents.forEach((evt) => {
      this.keyboardService.unregister(evt.key);
      evt.trigger.unsubscribe();
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
