import { EventEmitter } from "@angular/core";
import { TransportElement } from "../filter/transport-element";
import { TransportFilters } from "../filter/transport-filters";
import { ColumnFilter } from "./column-filter";

// dieser Datentyp kommt vom Server
// -> hb.SbsdbServer.Model.ViewModel.UserSession
class User {
  public uid: string;
  public isAdmin: boolean;
  public isReadonly: boolean;
  public isHotline: boolean;

  public settings: string; // JSON-BLOB
  // public path: string;
  //
  // // AP-Page
  // public showStandort: boolean;
  // public apColumnFilters: ColumnFilter[];
  // public apExtFilter: string;
  // public apSortColumn: string;
  // public apSortDirection: string;
  // public apPageSize: number;
  // public searchSonstHw: boolean;
}

/**
 * Benutzerdaten verwalten
 *
 * Die properties werden mit gettern und settern versehen. Jede Aenderung
 * loesst einen Event aus, der im ConfigService das Speichern der Userdaten
 * anstoesst.
 */
// tslint:disable-next-line:max-classes-per-file
export class UserSession {
  private user: User;
  private changeEvent: EventEmitter<User>;

  // Settings
  private settings: any;

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
      this.settings = JSON.parse(this.user.settings);
    } catch {
      this.settings = {};
    }

    // sicherstellen, dass alle Einstellungen definiert sind
    this.settings.path = this.settings.path ?? "";
    this.settings.showStandort = this.settings.showStandort ?? true;
    this.settings.apColumnFilters = this.settings.apColumnFilters ?? [];
    this.settings.apFilter = this.settings.apFilter ?? new TransportFilters();
    this.settings.apSortColumn = this.settings.apSortColumn ?? "";
    this.settings.apSortDirection = this.settings.apSortDirection ?? "";
    this.settings.apPageSize = this.settings.apPageSize ?? 100;
    this.settings.searchSonstHw = this.settings.searchSonstHw ?? false;
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

  public get showStandort(): boolean {
    return this.settings.showStandort;
  }

  public set showStandort(o: boolean) {
    this.settings.showStandort = o;
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

  public get apStdFilter(): boolean {
    return this.settings.apFilter.stdFilter;
  }

  public set apStdFilter(ex: boolean) {
    this.settings.apFilter.stdFilter = ex;
    this.change();
  }

  public get searchSonstHw(): boolean {
    return this.settings.searchSonstHw;
  }

  public set searchSonstHw(sh: boolean) {
    this.settings.searchSonstHw = sh;
    this.change();
  }

  private change() {
    this.user.settings = JSON.stringify(this.settings);
    this.changeEvent.emit(this.user);
  }
}
