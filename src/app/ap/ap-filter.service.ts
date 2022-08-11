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
    const filter = this.userSettings.latestApFilter;
    if (this.isEncodedFilter(filter)) {
      return filter;
    } else {
      this.filterApfilter(filter);
      return null;
    }
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
    if (this.columns) {
      super.resetStdFilters(false);
      this.apFilterControl.setValue(filt, { emitEvent: false });
      this.filterFor(["apname", "betrst", "bezeichnung"], filt, false);
      this.stdFilter = true;
    }
  }

  public triggerApfilter(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.apFilterDirty = false;
    this.nav2Apfilter(this.apFilterControl.value);
  }
  public resetApfilter(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.resetFilters();
  }

  public resetStdFilters(emitevent: boolean = true) {
    if (this.apFilterControl.value) {
      this.apFilterControl.reset();
      this.filterExpression.reset();
      this.triggerFilter();
    } else {
      super.resetStdFilters(emitevent);
    }
  }

  // public resetFilters() {
  //   super.resetFilters();
  // }
  //
  // public toggleExtendedFilter() {
  //   if (this.apFilterControl.value) {
  //     this.apFilterControl.reset();
  //   }
  //   super.toggleExtendedFilter();
  // }

  protected buildStdFilterExpression() {
    this.apFilterControl.reset();
    super.buildStdFilterExpression();
  }
}
