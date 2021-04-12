import { Component, Input } from "@angular/core";
import { BaseTableRow } from "../../model/base-table-row";
import { BaseFilterService } from "../base-filter-service";

@Component({
  selector: "sbsdb-select-row",
  templateUrl: "./select-row.component.html",
  styleUrls: ["./select-row.component.scss"],
})
export class SelectRowComponent {
  @Input() public filterService: BaseFilterService;
  @Input() public row: BaseTableRow;
}
