import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { debounceTime } from "rxjs/operators";
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

  public apFilterControl = new FormControl("");
  public apFilterDirty = false;

  constructor(
    public configService: ConfigService,
    public dataService: DataService,
    public navigationService: NavigationService,
    public dialog: MatDialog
  ) {
    super(configService, dataService, navigationService, dialog);
    console.debug("c'tor ApFilterService");
    this.userSettings = configService.getUser();

    this.apFilterControl.valueChanges // FormControl
      .pipe(debounceTime(this.keyDebounce))
      .subscribe(() => {
        this.apFilterDirty = true;
      });
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

  /**
   * Trigger APFilter
   *
   * @param filtStr
   */
  public nav2Apfilter(filtStr: string): void {
    this.navigationService.navigateByCmd([this.getUrl(), { apfilter: filtStr }]);
  }

  /**
   * APFilter setzen
   *
   * Suchstring in AP-Name oder Standort|verantwortlicheOE oder Bezeichnung suchen
   *
   * @param filt
   */
  public filterApfilter(filt: string): void {
    this.resetStdFilters(false);
    this.filterFor(["apname", "betrst", "bezeichnung"], filt, false);
    this.stdFilter = true;
  }

  public triggerApfilter(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.apFilterDirty = false;
    this.nav2Apfilter(this.apFilterControl.value);
  }
  public restApfilter(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.apFilterControl.reset();
    this.stdFilter = false;
    this.resetFilters();
  }
}
