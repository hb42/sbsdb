import { Component, OnInit } from "@angular/core";
import { Bracket } from "../../shared/filter/bracket";
import { Element } from "../../shared/filter/element";
import { Term } from "../../shared/filter/term";
import { ArbeitsplatzService } from "../arbeitsplatz.service";

@Component({
             selector   : "sbsdb-ap-filter",
             templateUrl: "./ap-filter.component.html",
             styleUrls  : ["./ap-filter.component.scss"]
           })
export class ApFilterComponent implements OnInit {
  // @HostBinding("attr.class") cssClass = "flex-panel";

  constructor(public apService: ArbeitsplatzService) {
    console.debug("c'tor ApFilterComponent");
  }

  ngOnInit() {
  }

  public getBracketElements(t: Term): Element[] {
    if (t.isBracket()) {
      return (t as Bracket).getElements();
    } else {
      return [new Element(null, t)];
    }
  }
}
