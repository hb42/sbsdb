import { Component, Input, OnInit } from "@angular/core";
import { Bracket } from "../../shared/filter/bracket";
import { LogicalOperator } from "../../shared/filter/logical-operator";

@Component({
             selector   : "sbsdb-ap-filter-bracket",
             templateUrl: "./ap-filter-bracket.component.html",
             styleUrls  : ["./ap-filter-bracket.component.scss"]
           })
export class ApFilterBracketComponent implements OnInit {
  @Input() bracket: Bracket;
  @Input() operator: LogicalOperator;

  public menuopen = false;

  constructor() {
  }

  ngOnInit() {
  }


  public insert(b: Bracket) {
    console.debug("INSERT " + b.toString());
  }

  public menuOpen() {
    console.debug("MENU OPEN");
    this.menuopen = true;
  }

  public menuClose() {
    console.debug("MENU CLOSE");
    this.menuopen = false;
  }

  // @HostListener("mouseover") mouseOver() {
  //   console.debug("MOUSEOVER " + this.bracket.toString());
  // }
}
