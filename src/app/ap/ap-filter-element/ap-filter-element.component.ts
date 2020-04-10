import { Component, Input, OnInit } from "@angular/core";

import { Element } from "../../shared/filter/element";

@Component({
  selector: "sbsdb-ap-filter-element",
  templateUrl: "./ap-filter-element.component.html",
  styleUrls: ["./ap-filter-element.component.scss"],
})
export class ApFilterElementComponent implements OnInit {
  @Input() public element: Element;

  // tslint:disable-next-line:no-empty
  constructor() {}

  // tslint:disable-next-line:no-empty
  public ngOnInit() {}

  public edit(el: Element) {
    console.debug("EDIT " + el.term.toString());
    console.dir(el);
    if (el.term.up) {
      const me = el.term.up.getElements().indexOf(el);
      console.debug("Index = " + me);
    }
  }
}
