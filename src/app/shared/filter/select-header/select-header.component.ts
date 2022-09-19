import { Component, EventEmitter, Input } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { BaseFilterService } from "../base-filter-service";

@Component({
  selector: "sbsdb-select-header",
  templateUrl: "./select-header.component.html",
  styleUrls: ["./select-header.component.scss"],
})
export class SelectHeaderComponent {
  @Input() public filterService: BaseFilterService<unknown, unknown>;
  @Input() public changeSelected: EventEmitter<void>;

  constructor() {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public editSelected(): void {
    if (this.changeSelected) {
      this.changeSelected.emit();
    }
  }
}
