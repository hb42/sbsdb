import { AfterViewInit, Component, Input, ViewChild } from "@angular/core";
import { MatMenuTrigger } from "@angular/material/menu";
import { environment } from "../../../../environments/environment";
import { Bracket } from "../bracket";
import { EditFilterService } from "../edit-filter.service";
import { Element } from "../element";

@Component({
  selector: "sbsdb-filter-bracket",
  templateUrl: "./filter-bracket.component.html",
  styleUrls: ["./filter-bracket.component.scss"],
})
export class FilterBracketComponent implements AfterViewInit {
  @Input() public element: Element;

  @ViewChild("newMenuBtn") newMenuBtn: MatMenuTrigger;

  public highlight = false;
  private menuopen = false;

  constructor(public editFilter: EditFilterService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.newMenuBtn) {
        this.newMenuBtn.openMenu();
      }
    }, 0);
  }

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
