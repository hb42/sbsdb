import { AfterViewInit, Component, ElementRef, Input } from "@angular/core";
import { SbsdbColumn } from "../sbsdb-column";

/**
 * header cell fuer MatTable mit Sort-Indikator und
 * Eingabefeld fuer Spaltenfilter
 */
@Component({
  selector: "sbsdb-header-cell",
  templateUrl: "./header-cell.component.html",
  styleUrls: ["./header-cell.component.scss"],
})
export class HeaderCellComponent implements AfterViewInit {
  /**
   * Daten der Spalte incl. FormControll fuer Input
   */
  @Input() public column: SbsdbColumn<unknown, unknown>;
  /**
   * Falls der Ueberschriftentext per Programm geaendert werden soll, kann hier
   * eine boolean-Variable angegeben werden, die die Veraenderung anstoesst
   */
  @Input() public labelChange: boolean;
  /**
   * boolean-Variable, die die Anzeige des Input steuert
   */
  @Input() public showFilter: boolean;
  /**
   * Groesse des Input: XS, S, M
   */
  @Input() public size: string; // "XS", "s", "M"

  public classSbsdbColumnRef = SbsdbColumn;

  constructor(private elementRef: ElementRef) {
    console.debug("c'tor HeadCellComponent");
  }

  ngAfterViewInit(): void {
    // verhindern, dass der SortHeader per TAB erreichbart ist, dafuer gibt's Shortcuts
    const nativeElement = this.elementRef.nativeElement as HTMLElement;
    const sortheader: HTMLDivElement = nativeElement.querySelector(".mat-sort-header-container");
    if (sortheader) {
      sortheader.tabIndex = -1;
    }
  }

  /**
   * Focus auf das Eingabefeld setzen
   */
  public focus(): void {
    const nativeElement = this.elementRef.nativeElement as HTMLElement;
    let input: HTMLElement;
    if (this.column.isDropdown()) {
      input = nativeElement.querySelector("select");
    } else {
      input = nativeElement.querySelector("input");
    }

    if (input) {
      input.focus();
    }
  }
  /**
   * class fuer das Eingabefeld
   */
  public fieldClass(): string {
    this.size = this.size ?? "M";
    switch (this.size.toUpperCase()) {
      case "XXS":
        return "filter-xxs";
      case "XS":
        return "filter-xs";
      case "M":
        return "filter-m";
      case "L":
        return "filter-l";
      default:
        return "filter-s";
    }
  }
}
