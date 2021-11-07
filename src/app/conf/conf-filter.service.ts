import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CONF_PATH } from "../app-routing-const";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { BaseFilterService } from "../shared/filter/base-filter-service";
import { TransportFilters } from "../shared/filter/transport-filters";
import { HwKonfig } from "../shared/model/hw-konfig";
import { NavigationService } from "../shared/navigation.service";

@Injectable({
  providedIn: "root",
})
export class ConfFilterService extends BaseFilterService {
  public userSettings: UserSession;

  constructor(
    public configService: ConfigService,
    public dataService: DataService,
    public navigationService: NavigationService,
    public dialog: MatDialog
  ) {
    super(configService, dataService, navigationService, dialog);
    console.debug("c'tor ConfFilterService");
    this.userSettings = configService.getUser();
  }

  getGlobalFiltersName(): string {
    return ConfigService.CONF_FILTERS;
  }

  getLatestUserFilter(): string {
    return this.userSettings.latestConfFilter;
  }

  getUrl(): string {
    return "/" + CONF_PATH;
  }

  getUserFilterList(): TransportFilters {
    return this.userSettings.confFilter;
  }

  setLatestUserStdFilter(std: boolean): void {
    this.userSettings.confStdFilter = std;
  }

  tableFilter(row: unknown): boolean {
    if (this.userSettings.showEmptyConfig) {
      return true;
    }
    const conf = row as HwKonfig;
    return conf.devices > 0;
  }
}
