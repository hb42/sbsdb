import { Component, Input } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { EditFilterService } from "../edit-filter.service";
import { Element } from "../element";

@Component({
  selector: "sbsdb-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
})
export class FilterComponent {
  @Input() data: Element;

  constructor(public editFilter: EditFilterService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
