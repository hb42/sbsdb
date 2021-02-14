import { Component, Input } from "@angular/core";

import { Element } from "../../shared/filter/element";
import { ApFilterService } from "../ap-filter.service";

@Component({
  selector: "sbsdb-ap-filter-element",
  templateUrl: "./ap-filter-element.component.html",
  styleUrls: ["./ap-filter-element.component.scss"],
})
export class ApFilterElementComponent {
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
}
