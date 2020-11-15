import { Component, Input } from "@angular/core";
import { Element } from "../../shared/filter/element";
import { ApFilterService } from "../ap-filter.service";

@Component({
  selector: "sbsdb-ap-filter",
  templateUrl: "./ap-filter.component.html",
  styleUrls: ["./ap-filter.component.scss"],
})
export class ApFilterComponent {
  @Input() data: Element;

  constructor(public apFilter: ApFilterService) {
    console.debug("c'tor ApFilterComponent");
  }
}
