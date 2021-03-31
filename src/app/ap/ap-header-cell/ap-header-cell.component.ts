import { AfterViewInit, Component, ElementRef, Input, OnInit } from "@angular/core";
import { ApColumn } from "../ap-column";

/**
 * header cell fuer MatTable mit Sort-Indikator und
 * Eingabefeld fuer Spaltenfilter
 */
@Component({
  selector: "sbsdb-ap-header-cell",
  templateUrl: "./ap-header-cell.component.html",
  styleUrls: ["./ap-header-cell.component.scss"],
})
export class ApHeaderCellComponent implements AfterViewInit {
  /**
   * Daten der Spalte incl. FormControll fuer Input
   */
  @Input() public column: ApColumn;
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
   * Tab-Index des Feldes
   */
  @Input() public tabindex: number;
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
    this.input = this.nativeElement.querySelector("input");
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
