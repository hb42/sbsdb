import {
  AfterViewInit,
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
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { KEY_FIRST_FILTER } from "../../const";
import { ConfigService } from "../../shared/config/config.service";
import { GetColumn } from "../../shared/helper";
import { KeyboardListener } from "../../shared/keyboard-listener";
import { KeyboardService } from "../../shared/keyboard.service";
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

  public subscription: Subscription;

  private keyboardEvents: KeyboardListener[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private config: ConfigService,
    public apService: ApService,
    public dialog: MatDialog,
    private keyboardService: KeyboardService
  ) {
    console.debug("c'tor ApComponent");
    this.apService.editFilterService.setFilterService(this.apService.filterService);
  }

  public ngOnInit(): void {
    // Keyboard handling
    let listener: KeyboardListener = { trigger: new EventEmitter<void>(), key: KEY_FIRST_FILTER };
    this.keyboardService.register(listener);
    listener.trigger.subscribe(() => this.focusFirstFilter());
    this.keyboardEvents.push(listener);

    this.apService.columns.forEach((col) => {
      if (col.accelerator) {
        listener = { trigger: new EventEmitter<void>(), key: col.accelerator };
        listener.trigger.subscribe(() => this.sort.sort(this.sort.sortables.get(col.columnName)));
        this.keyboardService.register(listener);
        this.keyboardEvents.push(listener);
      }
    });

    // ActivatedRoute ist nur in der jeweiligen component sinnvoll
    this.route.paramMap.subscribe((params) => {
      // check params
      let encFilter: string = null;
      if (params) {
        if (params.has("filt")) {
          // .../ap;filt=xxx
          // Base64-codierter Filter, nutzt Anwendung intern
          encFilter = params.get("filt");
          this.config.getUser().latestApFilter = encFilter;
          this.apService.filterService.filterFromNavigation(encFilter);
        } else if (params.has("apfilter")) {
          // .../ap;apfilter=xxx
          // Suche aus globalem Suchfeld
          encFilter = params.get("apfilter");
          this.config.getUser().latestApFilter = encFilter;
          this.apService.filterService.filterApfilter(encFilter);
        } else if (params.has("id")) {
          // .../ap;id=xxx
          // AP ueber Datenbank-Index aufrufen
          this.apService.filterService.navigationFromExtParam(
            ["id"],
            Number.parseInt(params.get("id"), 10)
          );
        } else if (params.has("name")) {
          // .../ap;name=xxx
          // AP ueber AP-Namen suchen (like)
          this.apService.filterService.navigationFromExtParam(["apname"], params.get("name"));
        } else if (params.has("find")) {
          // .../ap;find=xxx
          // in den Felder AP-Name, OE, verantw.OE, Bezeichnung (like)
          this.apService.filterService.navigationFromExtParam(
            ["apname", "betrst", "betrstExt", "bezeichnung"],
            params.get("find")
          );
        }
      } else {
        if (this.config.getUser().latestApFilter) {
          encFilter = this.config.getUser().latestApFilter;
          if (this.apService.filterService.isEncodedFilter(encFilter)) {
            this.apService.filterService.nav2filter(encFilter);
          } else {
            // AP-Filter
            this.apService.filterService.nav2Apfilter(encFilter);
          }
        }
      }
    });
  }

  public ngAfterViewInit(): void {
    // 1. ViewChild-Elemente erst in afterViewInit sicher greifbar
    // 2. in setTimeout verpacken sonst stoert das hier die Angular change detection
    setTimeout(() => {
      // Benutzereinstellungen setzen
      this.apService.setViewParams(this.sort, this.paginator);
      this.focusFirstFilter();
    }, 0);
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    return GetColumn(name, this.apService.columns);
  }
}
