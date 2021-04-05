import { Component, Input } from "@angular/core";
import { EditFilterService } from "../edit-filter.service";
import { Element } from "../element";

@Component({
  selector: "sbsdb-filter-element",
  templateUrl: "./filter-element.component.html",
  styleUrls: ["./filter-element.component.scss"],
})
export class FilterElementComponent {
  @Input() public element: Element;

  public highlight = false;
  private menuopen = false;

  constructor(public editFilter: EditFilterService) {}

  public menuOpen(): void {
    this.menuopen = true;
    this.highlight = true;
  }
  public menuClose(): void {
    this.menuopen = false;
    this.highlight = false;
  }
  public mouseIn(): void {
    this.highlight = true;
  }
  public mouseOut(): void {
    this.highlight = this.menuopen;
  }
}
