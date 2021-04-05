import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { BaseFilterService } from "../shared/filter/base-filter-service";
import { TransportFilters } from "../shared/filter/transport-filters";
import { DataService } from "../shared/data.service";

@Injectable({ providedIn: "root" })
export class ApFilterService extends BaseFilterService {
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
    return this.userSettings.latestApFilter;
  }
  public getUserFilterList(): TransportFilters {
    return this.userSettings.apFilter;
  }
  public setLatestUserStdFilter(std: boolean): void {
    this.userSettings.apStdFilter = std;
  }
  public getGlobalFiltersName(): string {
    return ConfigService.AP_FILTERS;
  }
}
