import { ChangeDetectorRef, Component, Input } from "@angular/core";
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

  constructor(public editFilter: EditFilterService, private cdRef: ChangeDetectorRef) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public deleteFilter(): void {
    this.editFilter.filterService.deleteFilter();
    // *ExpressionChangedAfterItHasBeenCheckedError* verhindern
    this.cdRef.detectChanges();
  }

  public moveFilter(): void {
    this.editFilter.filterService.moveFilter();
    // *ExpressionChangedAfterItHasBeenCheckedError* verhindern
    this.cdRef.detectChanges();
  }
}
