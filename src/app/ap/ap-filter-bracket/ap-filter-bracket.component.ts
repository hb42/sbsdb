import { Component, Input } from "@angular/core";
import { Bracket } from "../../shared/filter/bracket";
import { Element } from "../../shared/filter/element";
import { ApFilterService } from "../ap-filter.service";

@Component({
  selector: "sbsdb-ap-filter-bracket",
  templateUrl: "./ap-filter-bracket.component.html",
  styleUrls: ["./ap-filter-bracket.component.scss"],
})
export class ApFilterBracketComponent {
  @Input() public element: Element;

  public highlight = false;
  private menuopen = false;

  constructor(public apFilterService: ApFilterService) {}

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
