import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { BaseFilterService } from "../shared/filter/base-filter-service";
import { TransportFilters } from "../shared/filter/transport-filters";

@Injectable({
  providedIn: "root",
})
export class HwFilterService extends BaseFilterService {
  public userSettings: UserSession;

  constructor(
    public configService: ConfigService,
    public dataService: DataService,
    public dialog: MatDialog
  ) {
    super(configService, dataService, dialog);
    console.debug("c'tor ApFilterService");
    this.userSettings = configService.getUser();
  }

  public getLatestUserFilter(): string {
    return this.userSettings.latestHwFilter;
  }
  public getUserFilterList(): TransportFilters {
    return this.userSettings.hwFilter;
  }
  public setLatestUserStdFilter(std: boolean): void {
    this.userSettings.hwStdFilter = std;
  }
  public getGlobalFiltersName(): string {
    return ConfigService.HW_FILTERS;
  }
}
