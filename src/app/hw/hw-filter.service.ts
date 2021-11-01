import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { HW_PATH } from "../app-routing-const";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";
import { DataService } from "../shared/data.service";
import { BaseFilterService } from "../shared/filter/base-filter-service";
import { TransportFilters } from "../shared/filter/transport-filters";
import { Hardware } from "../shared/model/hardware";
import { NavigationService } from "../shared/navigation.service";

@Injectable({
  providedIn: "root",
})
export class HwFilterService extends BaseFilterService {
  public userSettings: UserSession;

  constructor(
    public configService: ConfigService,
    public dataService: DataService,
    public navigationService: NavigationService,
    public dialog: MatDialog
  ) {
    super(configService, dataService, navigationService, dialog);
    console.debug("c'tor HwFilterService");
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
    return !this.isFremdeHw(hw);
    // return (hw.hwKonfig.hwTypFlag & DataService.FREMDE_HW_FLAG) === 0;
  }

  public isFremdeHw(hw: Hardware): boolean {
    return (hw.hwKonfig.hwTypFlag & DataService.FREMDE_HW_FLAG) !== 0;
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
