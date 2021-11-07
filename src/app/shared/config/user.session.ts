import { EventEmitter } from "@angular/core";
import { TransportFilters } from "../filter/transport-filters";
import { User } from "./user";
import { UserSettings } from "./user-settings";

/**
 * Benutzerdaten verwalten
 *
 * Die properties werden mit gettern und settern versehen. Jede Aenderung
 * loesst einen Event aus, der im ConfigService das Speichern der Userdaten
 * anstoesst.
 */
export class UserSession {
  private readonly user: User;
  private changeEvent: EventEmitter<User>;

  // Settings
  private readonly settings: UserSettings;

  constructor(event: EventEmitter<User>, data: User | null) {
    this.changeEvent = event;
    // defaults
    this.user = {
      uid: data && data.uid ? data.uid : "",
      isAdmin: data ? !!data.isAdmin : false,
      isReadonly: data ? !!data.isReadonly : false,
      isHotline: data ? !!data.isHotline : false,
      settings: data && data.settings ? data.settings : "{}",
    };
    try {
      this.settings = JSON.parse(this.user.settings) as UserSettings;
    } catch {
      this.settings = { path: "" };
    }

    // sicherstellen, dass alle Einstellungen definiert sind
    this.settings.path = this.settings.path ?? "";
    this.settings.debug = !!this.settings.debug;
    this.settings.showStandort =
      this.settings.showStandort === undefined ? true : !!this.settings.showStandort;
    this.settings.apColumnFilters = this.settings.apColumnFilters ?? [];
    this.settings.apFilter = this.settings.apFilter ?? { stdFilter: true, filters: [] };
    this.settings.latestApFilter = this.settings.latestApFilter ?? "";
    this.settings.apSortColumn = this.settings.apSortColumn ?? "";
    this.settings.apSortDirection = this.settings.apSortDirection ?? "";
    this.settings.apPageSize = this.settings.apPageSize ?? 100;
    this.settings.searchSonstHw = !!this.settings.searchSonstHw;
    this.settings.hwColumnFilters = this.settings.hwColumnFilters ?? [];
    this.settings.hwFilter = this.settings.hwFilter ?? { stdFilter: true, filters: [] };
    this.settings.latestHwFilter = this.settings.latestHwFilter ?? "";
    this.settings.hwSortColumn = this.settings.hwSortColumn ?? "";
    this.settings.hwSortDirection = this.settings.hwSortDirection ?? "";
    this.settings.hwPageSize = this.settings.hwPageSize ?? 100;
    this.settings.showFremde = !!this.settings.showFremde;
    this.settings.confFilter = this.settings.confFilter ?? { stdFilter: true, filters: [] };
    this.settings.latestConfFilter = this.settings.latestConfFilter ?? "";
    this.settings.confSortColumn = this.settings.confSortColumn ?? "";
    this.settings.confSortDirection = this.settings.confSortDirection ?? "";
    this.settings.confPageSize = this.settings.confPageSize ?? 100;
    this.settings.showEmptyConfig = !!this.settings.showEmptyConfig;
  }

  // Benutzerrechte sind R/O
  public get isAdmin(): boolean {
    return this.user.isAdmin;
  }

  public get isReadonly(): boolean {
    return this.user.isReadonly;
  }

  public get isHotline(): boolean {
    return this.user.isHotline;
  }

  public get path(): string {
    return this.settings.path;
  }
  public set path(p: string) {
    this.settings.path = p;
    this.change();
  }

  public get debug(): boolean {
    return this.settings.debug;
  }
  public set debug(d: boolean) {
    this.settings.debug = d;
    this.change();
  }

  // AP

  public get showStandort(): boolean {
    return this.settings.showStandort;
  }

  public set showStandort(o: boolean) {
    this.settings.showStandort = o;
    this.change();
  }

  public get searchSonstHw(): boolean {
    return this.settings.searchSonstHw;
  }

  public set searchSonstHw(sh: boolean) {
    this.settings.searchSonstHw = sh;
    this.change();
  }

  public get apSortColumn(): string {
    return this.settings.apSortColumn;
  }

  public set apSortColumn(col: string) {
    this.settings.apSortColumn = col;
    this.change();
  }

  public get apSortDirection(): string {
    return this.settings.apSortDirection;
  }

  public set apSortDirection(dir: string) {
    this.settings.apSortDirection = dir;
    this.change();
  }

  public get apPageSize(): number {
    return this.settings.apPageSize;
  }

  public set apPageSize(pg: number) {
    this.settings.apPageSize = pg;
    this.change();
  }

  // AP Filter

  public get apFilter(): TransportFilters {
    return this.settings.apFilter;
  }

  public set apFilter(filt: TransportFilters) {
    this.settings.apFilter = filt;
    this.change();
  }

  public get latestApFilter(): string {
    return this.settings.latestApFilter;
  }

  public set latestApFilter(filt: string) {
    this.settings.latestApFilter = filt;
    this.change();
  }

  public get apStdFilter(): boolean {
    return this.settings.apFilter.stdFilter;
  }

  public set apStdFilter(ex: boolean) {
    this.settings.apFilter.stdFilter = ex;
    this.change();
  }

  // HW

  public get hwSortColumn(): string {
    return this.settings.hwSortColumn;
  }

  public set hwSortColumn(col: string) {
    this.settings.hwSortColumn = col;
    this.change();
  }

  public get hwSortDirection(): string {
    return this.settings.hwSortDirection;
  }

  public set hwSortDirection(dir: string) {
    this.settings.hwSortDirection = dir;
    this.change();
  }

  public get hwPageSize(): number {
    return this.settings.hwPageSize;
  }

  public set hwPageSize(pg: number) {
    this.settings.hwPageSize = pg;
    this.change();
  }

  public get showFremde(): boolean {
    return this.settings.showFremde;
  }

  public set showFremde(o: boolean) {
    this.settings.showFremde = o;
    this.change();
  }

  // HW Filter

  public get hwFilter(): TransportFilters {
    return this.settings.hwFilter;
  }

  public set hwFilter(filt: TransportFilters) {
    this.settings.hwFilter = filt;
    this.change();
  }

  public get latestHwFilter(): string {
    return this.settings.latestHwFilter;
  }

  public set latestHwFilter(filt: string) {
    this.settings.latestHwFilter = filt;
    this.change();
  }

  public get hwStdFilter(): boolean {
    return this.settings.hwFilter.stdFilter;
  }

  public set hwStdFilter(ex: boolean) {
    this.settings.hwFilter.stdFilter = ex;
    this.change();
  }

  // Conf

  public get confSortColumn(): string {
    return this.settings.confSortColumn;
  }

  public set confSortColumn(col: string) {
    this.settings.confSortColumn = col;
    this.change();
  }

  public get confSortDirection(): string {
    return this.settings.confSortDirection;
  }

  public set confSortDirection(dir: string) {
    this.settings.confSortDirection = dir;
    this.change();
  }

  public get confPageSize(): number {
    return this.settings.confPageSize;
  }

  public set confPageSize(pg: number) {
    this.settings.confPageSize = pg;
    this.change();
  }

  public get showEmptyConfig(): boolean {
    return this.settings.showEmptyConfig;
  }

  public set showEmptyConfig(e: boolean) {
    this.settings.showEmptyConfig = e;
    this.change();
  }

  // Conf-Filter

  public get confFilter(): TransportFilters {
    return this.settings.confFilter;
  }

  public set confFilter(filt: TransportFilters) {
    this.settings.confFilter = filt;
    this.change();
  }

  public get latestConfFilter(): string {
    return this.settings.latestConfFilter;
  }

  public set latestConfFilter(filt: string) {
    this.settings.latestConfFilter = filt;
    this.change();
  }

  public get confStdFilter(): boolean {
    return this.settings.confFilter.stdFilter;
  }

  public set confStdFilter(ex: boolean) {
    this.settings.confFilter.stdFilter = ex;
    this.change();
  }

  private change() {
    this.user.settings = JSON.stringify(this.settings);
    this.changeEvent.emit(this.user);
  }
}
