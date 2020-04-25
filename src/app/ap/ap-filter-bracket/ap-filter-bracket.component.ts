import { Component, Input, OnInit } from "@angular/core";
import { Bracket } from "../../shared/filter/bracket";
import { Element } from "../../shared/filter/element";
import { ApFilterService } from "../ap-filter.service";

@Component({
  selector: "sbsdb-ap-filter-bracket",
  templateUrl: "./ap-filter-bracket.component.html",
  styleUrls: ["./ap-filter-bracket.component.scss"],
})
export class ApFilterBracketComponent implements OnInit {
  @Input() public element: Element;

  public highlight = false;
  private menuopen = false;

  constructor(private apFilterService: ApFilterService) {}

  public ngOnInit() {}

  public menuOpen() {
    this.menuopen = true;
    this.highlight = true;
  }
  public menuClose() {
    this.menuopen = false;
    this.highlight = false;
  }
  public mouseIn() {
    this.highlight = true;
  }
  public mouseOut() {
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
