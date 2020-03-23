import { EventEmitter } from "@angular/core";
import { ColumnFilter } from "./column-filter";

// dieser Datentyp wird in der DB gespeichert
// -> hb.SbsdbServer.Model.ViewModel.UserSession
class User {
  public uid: string;
  public isAdmin: boolean;
  public isReadonly: boolean;
  public isHotline: boolean;

  public path: string;

  // AP-Page
  showStandort: boolean;
  apColumnFilters: ColumnFilter[];
  apExtFilter: string;
  apSortColumn: string;
  apSortDirection: string;
  apPageSize: number;
  searchSonstHw: boolean;
}

/**
 * Benutzerdaten verwalten
 *
 * Die properties werden mit gettern und settern versehen. Jede Aenderung
 * loesst einen Event aus, der im ConfigService das Speichern der Userdaten
 * anstoesst.
 */
export class UserSession {
  private user: User;
  private changeEvent: EventEmitter<User>;

  constructor(event: EventEmitter<User>, data: User | null) {
    this.changeEvent = event;
    // defaults
    this.user = {
      uid: data && data.uid ? data.uid : "",
      isAdmin: data ? !!data.isAdmin : false,
      isReadonly: data ? !!data.isReadonly : false,
      isHotline: data ? !!data.isHotline : false,

      path: data && data.path ? data.path : "",

      showStandort: data ? !!data.showStandort : true,
      apColumnFilters: data && data.apColumnFilters ? data.apColumnFilters : [],
      apExtFilter: data && data.apExtFilter ? data.apExtFilter : "",
      apSortColumn: data && data.apSortColumn ? data.apSortColumn : "",
      apSortDirection: data && data.apSortDirection ? data.apSortDirection : "",
      apPageSize: data && data.apPageSize ? data.apPageSize : 100,
      searchSonstHw: data ? !!data.searchSonstHw : false,
    };
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
    return this.user.path;
  }
  public set path(p: string) {
    this.user.path = p;
    this.changeEvent.emit(this.user);
  }

  public get showStandort(): boolean {
    return this.user.showStandort;
  }

  public set showStandort(o: boolean) {
    this.user.showStandort = o;
    this.changeEvent.emit(this.user);
  }

  public get apSortColumn(): string {
    return this.user.apSortColumn;
  }

  public set apSortColumn(col: string) {
    this.user.apSortColumn = col;
    this.changeEvent.emit(this.user);
  }

  public get apSortDirection(): string {
    return this.user.apSortDirection;
  }

  public set apSortDirection(dir: string) {
    this.user.apSortDirection = dir;
    this.changeEvent.emit(this.user);
  }

  public get apPageSize(): number {
    return this.user.apPageSize;
  }

  public set apPageSize(pg: number) {
    this.user.apPageSize = pg;
    this.changeEvent.emit(this.user);
  }

  // AP Filter
  public apFiltersCount(): number {
    return this.user.apColumnFilters.length;
  }

  public getApFilter(nr: number): ColumnFilter {
    if (nr >= this.user.apColumnFilters.length) {
      return { text: "", inc: true };
    }
    return this.user.apColumnFilters[nr]
      ? this.user.apColumnFilters[nr]
      : { text: "", inc: true };
  }

  public setApFilter(nr: number, filt: ColumnFilter) {
    if (nr >= this.user.apColumnFilters.length) {
      for (let i = this.user.apColumnFilters.length; i <= nr; i++) {
        this.user.apColumnFilters.push({ text: "", inc: true });
      }
    }
    this.user.apColumnFilters[nr] = filt;
    this.changeEvent.emit(this.user);
  }

  public get apExtFilter(): string {
    return this.user.apExtFilter;
  }

  public set apExtFilter(filt: string) {
    this.user.apExtFilter = filt;
    this.changeEvent.emit(this.user);
  }

  public get searchSonstHw(): boolean {
    return this.user.searchSonstHw;
  }

  public set searchSonstHw(sh: boolean) {
    this.user.searchSonstHw = sh;
    this.changeEvent.emit(this.user);
  }
}
