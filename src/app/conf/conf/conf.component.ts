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
import { ConfService } from "../conf.service";

@Component({
  selector: "sbsdb-conf",
  templateUrl: "./conf.component.html",
  styleUrls: ["./conf.component.scss"],
})
export class ConfComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  @ViewChild(MatSort, { static: true }) public sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild("firstfilter") public firstFilter: HeaderCellComponent;
  @ViewChild("lastfilter") public lastFilter: HeaderCellComponent;

  private keyboardEvents: KeyboardListener[] = [];

  constructor(
    private route: ActivatedRoute,
    private config: ConfigService,
    public dialog: MatDialog,
    public confService: ConfService,
    private cdRef: ChangeDetectorRef,
    private keyboardService: KeyboardService
  ) {
    console.debug("c'tor ConfComponent");
    this.confService.editFilterService.setFilterService(this.confService.confFilterService);
  }

  public ngAfterViewInit(): void {
    // 1. ViewChild-Elemente erst in afterViewInit sicher greifbar
    // 2. in setTimeout verpacken sonst stoert das hier die Angular change detection
    setTimeout(() => {
      // Benutzereinstellungen setzen
      this.confService.setViewParams(this.sort, this.paginator);
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
          // .../conf;filt=xxx
          // Base64-codierter Filter, nutzt Anwendung intern
          encFilter = params.get("filt");
          this.config.getUser().latestConfFilter = encFilter;
          this.confService.confFilterService.filterFromNavigation(encFilter);
        } else if (params.has("id")) {
          // .../conf;id=xxx
          // Konfig ueber Datenbank-Index aufrufen
          this.confService.confFilterService.navigationFromExtParam(
            ["id"],
            Number.parseInt(params.get("id"), 10)
          );
        } else if (params.has("find")) {
          // .../conf;find=xxx
          // Konfig ueber Kategorie, Typ, Hersteller, Bezeichnung suchen (like)
          this.confService.confFilterService.navigationFromExtParam(
            ["konfiguration"],
            params.get("find")
          );
        }
      } else {
        if (this.config.getUser().latestConfFilter) {
          encFilter = this.config.getUser().latestConfFilter;
          this.confService.confFilterService.nav2filter(encFilter);
        }
      }
    });

    // Keyboard handling
    let listener: KeyboardListener = { trigger: new EventEmitter<void>(), key: KEY_FIRST_FILTER };
    this.keyboardService.register(listener);
    listener.trigger.subscribe(() => this.focusFirstFilter());
    this.keyboardEvents.push(listener);

    this.confService.columns.forEach((co) => {
      if (co.accelerator) {
        listener = { trigger: new EventEmitter<void>(), key: co.accelerator };
        listener.trigger.subscribe(() => this.sort.sort(this.sort.sortables.get(co.columnName)));
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
    return GetColumn(name, this.confService.columns);
  }
}
