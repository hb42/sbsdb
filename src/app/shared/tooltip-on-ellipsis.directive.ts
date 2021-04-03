import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[sbsdbTooltipOnEllipsis]",
})
export class TooltipOnEllipsisDirective {
  constructor() {}

  /**
   * Tooltip mit dem vollstaendigen Text anzeigen, wenn der Text
   * mittels ellipsis abgeschnitten ist.
   * (scheint mit <span> nicht zu funktionieren)
   * ->
   * https://stackoverflow.com/questions/5474871/html-how-can-i-show-tooltip-only-when-ellipsis-is-activated
   *
   * @param evt - Mouseevent
   */
  @HostListener("mouseenter", ["$event"]) tooltipOnEllipsis(evt: MouseEvent): void {
    const elem: HTMLElement = evt.target as HTMLElement;
    if (elem && elem.offsetWidth < elem.scrollWidth && !elem.title) {
      elem.title = elem.innerText;
    }
  }
}
