import { Component, Input } from "@angular/core";
import { BaseFilterService } from "../base-filter-service";

@Component({
  selector: "sbsdb-expand-header",
  templateUrl: "./expand-header.component.html",
  styleUrls: ["./expand-header.component.scss"],
})
export class ExpandHeaderComponent {
  @Input() public filterService: BaseFilterService;
}
