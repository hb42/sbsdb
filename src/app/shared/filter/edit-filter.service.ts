import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { BaseFilterService } from "./base-filter-service";

@Injectable({
  providedIn: "root",
})
export class EditFilterService {
  public filterService: BaseFilterService<unknown, unknown>;

  constructor() {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public setFilterService(svc: BaseFilterService<unknown, unknown>): void {
    this.filterService = svc;
  }
}
