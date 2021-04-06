import {
  AfterViewInit,
  Component,
  HostBinding,
  HostListener,
  Injectable,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { HeaderCellComponent } from "../../shared/table/header-cell/header-cell.component";
import { HwService } from "../hw.service";

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

  constructor(public dialog: MatDialog, public hwService: HwService) {
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
  }

  ngOnInit(): void {
    console.debug("onInit HwComponent");
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
}
