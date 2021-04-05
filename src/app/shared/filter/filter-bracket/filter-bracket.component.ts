import { Component, Input } from "@angular/core";
import { Bracket } from "../bracket";
import { EditFilterService } from "../edit-filter.service";
import { Element } from "../element";

@Component({
  selector: "sbsdb-filter-bracket",
  templateUrl: "./filter-bracket.component.html",
  styleUrls: ["./filter-bracket.component.scss"],
})
export class FilterBracketComponent {
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

  public getElements(): Element[] {
    if (this.element.term.isBracket()) {
      return (this.element.term as Bracket).elements;
    } else {
      return [];
    }
  }
}
