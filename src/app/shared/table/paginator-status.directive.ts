import { AfterViewInit, Directive, ElementRef, Input } from "@angular/core";
import { environment } from "../../../environments/environment";

/**
 * sbsdbPaginatorStatus-Directive
 *
 * Die Directive wird an Mat-Paginator gehaengt und bekommt als Parameter den den Namen
 * eines HTML-Elements (z.B. div) uebergeben:
 *    [sbsdbPaginatorStatus]="pagInsert"
 *    ...
 *    <div #pagInsert>
 *
 * Das Element wird dann in den Paginator in den freien Raum links von der Seiten-Anzeige
 * eingefuegt.
 */
@Directive({
  selector: "[sbsdbPaginatorStatus]",
})
export class PaginatorStatusDirective implements AfterViewInit {
  @Input() public sbsdbPaginatorStatus: Element;

  constructor(private paginator: ElementRef<Element>) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
  public ngAfterViewInit(): void {
    const at = this.paginator.nativeElement.getElementsByClassName("mat-paginator-container");
    const before = this.paginator.nativeElement.getElementsByClassName("mat-paginator-page-size");
    if (this.sbsdbPaginatorStatus) {
      if (at && at.length === 1 && before && before.length === 1) {
        setTimeout(() => {
          // notwendige style-Atribute, damit die Anzeige passt
          this.sbsdbPaginatorStatus.setAttribute(
            "style",
            "display: flex; flex: auto; margin-left: 10px"
          );
          at[0].insertBefore(this.sbsdbPaginatorStatus, before[0]);
        }, 0);
      } else {
        console.error(
          "PaginatorStatusDirective: Error accessing mat-paginator (directive on wrong component?)!"
        );
      }
    } else {
      console.error("PaginatorStatusDirective: Element to insert not found!");
    }
  }
}
