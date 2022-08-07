import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { debounceTime } from "rxjs/operators";
import { ConfigService } from "../../config/config.service";
import { UserSession } from "../../config/user.session";
import { DataService } from "../../data.service";
import { BaseFilterService } from "../../filter/base-filter-service";
import { Bracket } from "../../filter/bracket";
import { Expression } from "../../filter/expression";
import { LogicalAnd } from "../../filter/logical-and";
import { RelOp } from "../../filter/rel-op.enum";
import { GetColumn, OutputToCsv, ParseBracket, StringifyBracket } from "../../helper";
import { BaseTableRow } from "../../model/base-table-row";
import { SbsdbColumn } from "../sbsdb-column";
import { StdTableSettings } from "./std-table-settings";

@Component({
  selector: "sbsdb-std-table",
  templateUrl: "./std-table.component.html",
  styleUrls: ["./std-table.component.scss"],
})
export class StdTableComponent implements OnInit, AfterViewInit {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";
  @Input() public columns: SbsdbColumn<unknown, unknown>[];
  @Input() public dataSource: MatTableDataSource<unknown>;
  @Input() public recordName: string;
  @Input() public csvEvent: EventEmitter<void>;
  @Input() public newEvent: EventEmitter<void>;
  @Input() public chgEvent: EventEmitter<unknown>;
  @Input() public delEvent: EventEmitter<unknown>;
  @Input() public sortColumn: string;
  @Input() public refreshTableEvent: EventEmitter<boolean>;
  @Input() public multiline = false;
  @Input() public pagename: string;

  @ViewChild(MatSort, { static: true }) public sort: MatSort;

  public displayedColumns: string[];
  public textColumns: string[];
  public userSettings: UserSession;
  public filterExpression = new Bracket();
  private filterChanged = 1;
  private tableSettingsMap: Map<string, StdTableSettings>;
  private tableSettings: StdTableSettings;

  constructor(
    private configService: ConfigService,
    private dataService: DataService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor StdTableComponent ");
    this.userSettings = configService.getUser();
  }

  public ngOnInit() {
    this.getSettings();

    const menuCol = "menu";
    this.textColumns = this.columns
      .filter((c) => c.show && c.columnName !== menuCol)
      .map((col) => col.columnName);
    if (this.columns.findIndex((c) => c.columnName === menuCol) === -1) {
      this.columns.push(
        new SbsdbColumn<unknown, unknown>(
          this,
          menuCol,
          () => null,
          () => null,
          () => null,
          () => null,
          "",
          true,
          this.textColumns.length,
          -1,
          null,
          null,
          false
        )
      );
    }
    this.displayedColumns = this.columns.filter((c) => c.show).map((col) => col.columnName);
  }

  public ngAfterViewInit(): void {
    console.debug("### StdTable pagename=" + this.pagename);
    // 1. ViewChild-Elemente erst in afterViewInit sicher greifbar
    // 2. in setTimeout verpacken sonst stoert das hier die Angular change detection

    if (this.csvEvent) {
      this.csvEvent.subscribe(() => void this.csvOutput());
    } else {
      console.error("StdTable: Input csvEvent ist undefined");
    }

    // Tabelle updaten
    // Falls eine Spalte "id" existiert, wird sie abhaengig vom Parameter
    // this.debug ein- oder ausgeblendet.
    if (this.refreshTableEvent) {
      this.refreshTableEvent.subscribe(() => {
        this.checkIdColumn();
        this.triggerFilter();
      });
    }

    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (row: unknown, id: string) => {
        const col = GetColumn(id, this.columns);
        if (col) {
          return col.sortString(row);
        } else {
          return "";
        }
      };
      if (this.tableSettings.sortColumn) {
        this.sortColumn = this.tableSettings.sortColumn;
      }
      if (this.sortColumn) {
        this.dataSource.sort.active = this.sortColumn;
        this.dataSource.sort.direction = "";
        const sortheader = this.dataSource.sort.sortables.get(this.sortColumn) as MatSortHeader;
        this.dataSource.sort.sort(sortheader);
      }
      if (this.tableSettings.filter) {
        ParseBracket(this.filterExpression, this.tableSettings.filter);
        this.setColumnFilters();
      }
      this.dataSource.filterPredicate = (row: unknown): boolean => {
        const valid = this.filterExpression.validate(
          row as Record<string, string | Array<string> | number | Date>
        );
        row["selected"] = valid;
        // if (!valid) {
        //   row["selected"] = false;
        //   // console.debug("## ausgefiltert ##");
        // }
        return valid;
      };
      this.checkIdColumn();
      this.triggerFilter();

      // Filter triggern
      this.columns.forEach((c) => {
        if (c.filterControl) {
          c.filterControl.valueChanges // FormControl
            .pipe(debounceTime(500))
            .subscribe(() => {
              this.buildStdFilterExpression();
              this.triggerFilter();
              this.tableSettings.filter = StringifyBracket(this.filterExpression);
              this.saveSettings();
            });
        }
      });
    }, 0);
  }

  public onSort(event: Sort): void {
    this.tableSettings.sortColumn = event.active;
    this.tableSettings.sortDirection = event.direction;
    this.saveSettings();
  }

  public getColumn(name: string): SbsdbColumn<unknown, unknown> {
    return GetColumn(name, this.columns);
  }

  public newRecord(): void {
    this.newEvent.emit();
  }
  public chgRecord(row: unknown): void {
    this.chgEvent.emit(row);
  }
  public delRecord(row: unknown): void {
    this.delEvent.emit(row);
  }

  public expandRow(row: BaseTableRow, evt: Event): void {
    row.expanded = !row.expanded;
    evt.stopPropagation();
  }

  public isExpanded(row: BaseTableRow): boolean {
    return this.multiline || row.expanded;
  }

  private async csvOutput(): Promise<void> {
    const separator: string =
      ((await this.configService.getConfig(ConfigService.CSV_SEPARATOR)) as string) ??
      BaseFilterService.DEFAULT_CSV_SEPARATOR;

    OutputToCsv(this.columns, this.dataSource, separator, this.dialog);
  }

  private buildStdFilterExpression() {
    this.filterExpression.reset();
    const and = new LogicalAnd();
    this.columns.forEach((col) => {
      if (col.filterControl) {
        const colExpr = col.getFilterExpression();
        if (colExpr) {
          this.filterExpression.addElement(and, colExpr);
        }
      }
    });
  }

  private triggerFilter(): void {
    this.dataSource.filter = `${this.filterChanged++}`;
  }

  private checkIdColumn() {
    const idCol = this.columns.find((c) => c.columnName === "id");
    if (idCol) {
      idCol.show = this.userSettings.debug;
      this.displayedColumns = this.columns.filter((c) => c.show).map((col) => col.columnName);
    }
  }

  private setColumnFilters() {
    if (this.columns) {
      const cols: Array<{
        col: SbsdbColumn<unknown, unknown>;
        val: string | null;
      }> = this.columns
        .filter((c) => {
          return !!c.filterControl;
        })
        .map((cc) => {
          return { col: cc, val: null };
        });
      this.filterExpression.elements.forEach((el) => {
        if (!el.term.isBracket()) {
          const exp = el.term as Expression;
          const feld = exp.field.fieldName; // string | string[] !!
          cols.forEach((c) => {
            // string[]-Vergleich
            if (!Array.isArray(feld)) {
              // Feldnamen als Array sollten hier nicht vorkommen
              // string-Vergleich fuer Feld-Namen
              if (c.col.fieldName === feld) {
                const not = exp.operator.op === RelOp.notlike ? "!" : "";
                c.val = not + (exp.compare as string);
              }
            }
          });
        }
      });
      cols.forEach((c) => {
        if (c.col.filterControl.value != c.val) {
          c.col.filterControl.setValue(c.val, { emitEvent: false });
        }
      });
    }
  }

  // Map kann nicht per JSON.stringify() konvertiert werden,
  // deshalb muss ein Zwischenschritt eingebaut werden.
  // Schreiben:
  //   vorher in Array umwandeln:       out: Array<string, any> = [...Map];
  //   und dann das Array konvertieren: result: string = JSON.stringify(out);
  // Lesen:
  //   zu Array einlesen:  in: Array<string, any> = JSON.parse(input);
  //   Array zu Map:       map: Map<string, any> = new Map(in);
  private getSettings() {
    try {
      this.tableSettingsMap = new Map(
        JSON.parse(this.userSettings.adminTables) as Array<[string, StdTableSettings]>
      );
      this.tableSettings = this.tableSettingsMap.get(this.pagename);
    } catch {
      this.tableSettingsMap = new Map<string, StdTableSettings>();
      this.tableSettings = null;
    }
    if (!this.tableSettings) {
      this.tableSettings = {
        filter: [],
        sortColumn: "",
        sortDirection: "",
      };
      this.tableSettingsMap.set(this.pagename, this.tableSettings);
    }
  }

  private saveSettings() {
    this.userSettings.adminTables = JSON.stringify([...this.tableSettingsMap]);
  }
}
