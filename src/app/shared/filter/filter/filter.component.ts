import { Component, Input } from "@angular/core";
import { EditFilterService } from "../edit-filter.service";
import { Element } from "../element";

@Component({
  selector: "sbsdb-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
})
export class FilterComponent {
  @Input() data: Element;

  // constructor(public apFilter: ApFilterService) {
  constructor(public editFilter: EditFilterService) {
    console.debug("c'tor ApFilterComponent");
  }
}
