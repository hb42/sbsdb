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
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { debounceTime } from "rxjs/operators";
import { ConfigService } from "../../config/config.service";
import { UserSession } from "../../config/user.session";
import { DataService } from "../../data.service";
import { BaseFilterService } from "../../filter/base-filter-service";
import { Bracket } from "../../filter/bracket";
import { LogicalAnd } from "../../filter/logical-and";
import { GetColumn, OutputToCsv } from "../../helper";
import { BaseTableRow } from "../../model/base-table-row";
import { SbsdbColumn } from "../sbsdb-column";

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

  @ViewChild(MatSort, { static: true }) public sort: MatSort;

  public displayedColumns: string[];
  public textColumns: string[];
  public userSettings: UserSession;
  public filterExpression = new Bracket();
  private filterChanged = 1;

  constructor(
    private configService: ConfigService,
    private dataService: DataService,
    protected dialog: MatDialog
  ) {
    console.debug("c'tor StdTableComponent");
    this.userSettings = configService.getUser();
  }

  public ngOnInit() {
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
      if (this.sortColumn) {
        this.dataSource.sort.active = this.sortColumn;
        this.dataSource.sort.direction = "";
        const sortheader = this.dataSource.sort.sortables.get(this.sortColumn) as MatSortHeader;
        this.dataSource.sort.sort(sortheader);
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
            });
        }
      });
    }, 0);
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

  public testclick(row: unknown): void {
    // TODO das hier muss in die aufrufende component
    console.debug("### test click");
    console.dir(row);
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
}
