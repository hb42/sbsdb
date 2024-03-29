import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../environments/environment";
import { HW_PATH } from "../const";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { BaseFilterService } from "../shared/filter/base-filter-service";
import { TransportFilters } from "../shared/filter/transport-filters";
import { Hardware } from "../shared/model/hardware";
import { NavigationService } from "../shared/navigation.service";
import { HwService } from "./hw.service";

@Injectable({
  providedIn: "root",
})
export class HwFilterService extends BaseFilterService<HwService, Hardware> {
  public userSettings: UserSession;

  constructor(
    public configService: ConfigService,
    public dataService: DataService,
    public navigationService: NavigationService,
    public dialog: MatDialog
  ) {
    super(configService, dataService, navigationService, dialog);
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    this.userSettings = configService.getUser();
  }

  public zugeordneteHw(): string {
    let aps = 0;
    let free = 0;
    if (this.dataReady) {
      this.dataTable.filteredData.forEach((row: Hardware) => (row.ap ? aps++ : free++));
    }
    return `Geräte zugewiesen ${aps}, frei ${free}`;
  }

  public tableFilter(row: unknown): boolean {
    if (this.userSettings.showFremde) {
      return true;
    }
    const hw = row as Hardware;
    return !this.dataService.isFremdeHardware(hw);
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
  public getUrl(): string {
    return "/" + HW_PATH;
  }
}
