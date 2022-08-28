import { Component, Input } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { BaseFilterService } from "../base-filter-service";

@Component({
  selector: "sbsdb-expand-header",
  templateUrl: "./expand-header.component.html",
  styleUrls: ["./expand-header.component.scss"],
})
export class ExpandHeaderComponent {
  @Input() public filterService: BaseFilterService;

  constructor() {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
