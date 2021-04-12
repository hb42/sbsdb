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

  private nativeElement: HTMLElement;
  private input: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    // nop
  }

  public ngAfterViewInit(): void {
    this.nativeElement = this.elementRef.nativeElement as HTMLElement;
    if (this.column.isDropdown()) {
      this.input = this.nativeElement.querySelector("mat-select");
    } else {
      this.input = this.nativeElement.querySelector("input");
    }
  }

  /**
   * Focus auf das Eingabefeld setzen
   */
  public focus(): void {
    if (this.input) {
      this.input.focus();
    }
  }
  /**
   * class fuer das Eingabefeld
   */
  public fieldClass(): string {
    this.size = this.size ?? "S";
    switch (this.size.toUpperCase()) {
      case "XS":
        return "filter-xs";
      case "M":
        return "filter-m";
      default:
        return "filter-s";
    }
  }
}
