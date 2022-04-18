import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AP_PATH } from "../const";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { BaseFilterService } from "../shared/filter/base-filter-service";
import { TransportFilters } from "../shared/filter/transport-filters";
import { NavigationService } from "../shared/navigation.service";

@Injectable({ providedIn: "root" })
export class ApFilterService extends BaseFilterService {
  public userSettings: UserSession;

  constructor(
    public configService: ConfigService,
    public dataService: DataService,
    public navigationService: NavigationService,
    public dialog: MatDialog
  ) {
    super(configService, dataService, navigationService, dialog);
    console.debug("c'tor ApFilterService");
    this.userSettings = configService.getUser();
  }

  public tableFilter(row: unknown): boolean {
    return true;
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
  public getUrl(): string {
    return "/" + AP_PATH;
  }
}
