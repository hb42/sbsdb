import { Component, Input, OnInit } from "@angular/core";

import { Element } from "../../shared/filter/element";

@Component({
  selector: "sbsdb-ap-filter-element",
  templateUrl: "./ap-filter-element.component.html",
  styleUrls: ["./ap-filter-element.component.scss"],
})
export class ApFilterElementComponent implements OnInit {
  @Input() element: Element;

  constructor() {}

  ngOnInit() {}

  public edit(el: Element) {
    console.debug("EDIT " + el.term.toString());
  }
}
