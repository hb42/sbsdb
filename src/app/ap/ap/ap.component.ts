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

  // @ViewChild("pagInsert", { read: TemplateRef }) pagInsert: TemplateRef<Element>;
  // @ViewChild(MatPaginator, { read: ElementRef }) pagElement: ElementRef<Element>;

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
    });

    // Keyboard handling
    let listener: KeyboardListener = { trigger: new EventEmitter<void>(), key: KEY_FIRST_FILTER };
    this.keyboardService.register(listener);
    listener.trigger.subscribe(() => this.focusFirstFilter());
    this.keyboardEvents.push(listener);

    this.apService.columns.forEach((c) => {
      if (c.accelerator) {
        listener = { trigger: new EventEmitter<void>(), key: c.accelerator };
        listener.trigger.subscribe(() => this.sort.sort(this.sort.sortables.get(c.columnName)));
        this.keyboardService.register(listener);
        this.keyboardEvents.push(listener);
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
