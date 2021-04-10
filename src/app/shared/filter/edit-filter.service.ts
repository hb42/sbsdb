import { Injectable } from "@angular/core";
import { BaseFilterService } from "./base-filter-service";

@Injectable({
  providedIn: "root",
})
export class EditFilterService {
  public filterService: BaseFilterService;

  public setFilterService(svc: BaseFilterService): void {
    this.filterService = svc;
  }
}
