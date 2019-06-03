import {EventEmitter} from "@angular/core";
import {ColumnFilter} from "./column-filter";

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
  aptypFilter: ColumnFilter;
  apnameFilter: ColumnFilter;
  betrstFilter: ColumnFilter;
  bezFilter: ColumnFilter;
  ipFilter: ColumnFilter;
  hwFilter: ColumnFilter;
  apSortColumn: string;
  apSortDirection: string;
  apPageSize: number;
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
      uid       : data && data.uid ? data.uid : "",
      isAdmin   : data && data.isAdmin ? data.isAdmin : false,
      isReadonly: data && data.isReadonly ? data.isReadonly : false,
      isHotline : data && data.isHotline ? data.isHotline : false,

      path: data && data.path ? data.path : "",

      showStandort   : data && data.showStandort ? data.showStandort : true,
      apnameFilter   : data && data.apnameFilter ? data.apnameFilter : {text: "", inc: true},
      aptypFilter    : data && data.aptypFilter ? data.aptypFilter : {text: "", inc: true},
      betrstFilter   : data && data.betrstFilter ? data.betrstFilter : {text: "", inc: true},
      bezFilter      : data && data.bezFilter ? data.bezFilter : {text: "", inc: true},
      ipFilter       : data && data.ipFilter ? data.ipFilter : {text: "", inc: true},
      hwFilter       : data && data.hwFilter ? data.hwFilter : {text: "", inc: true},
      apSortColumn   : data && data.apSortColumn ? data.apSortColumn : "",
      apSortDirection: data && data.apSortDirection ? data.apSortDirection : "",
      apPageSize     : data && data.apPageSize ? data.apPageSize : 100,
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

  public get apnameFilter(): ColumnFilter {
    return this.user.apnameFilter;
  }

  public set apnameFilter(filt: ColumnFilter) {
    this.user.apnameFilter = filt;
    this.changeEvent.emit(this.user);
  }

  public get aptypFilter(): ColumnFilter {
    return this.user.aptypFilter;
  }

  public set aptypFilter(filt: ColumnFilter) {
    this.user.aptypFilter = filt;
    this.changeEvent.emit(this.user);
  }

  public get betrstFilter(): ColumnFilter {
    return this.user.betrstFilter;
  }

  public set betrstFilter(filt: ColumnFilter) {
    this.user.betrstFilter = filt;
    this.changeEvent.emit(this.user);
  }

  public get bezFilter(): ColumnFilter {
    return this.user.bezFilter;
  }

  public set bezFilter(filt: ColumnFilter) {
    this.user.bezFilter = filt;
    this.changeEvent.emit(this.user);
  }

  public get ipFilter(): ColumnFilter {
    return this.user.ipFilter;
  }

  public set ipFilter(filt: ColumnFilter) {
    this.user.ipFilter = filt;
    this.changeEvent.emit(this.user);
  }

  public get hwFilter(): ColumnFilter {
    return this.user.hwFilter;
  }

  public set hwFilter(filt: ColumnFilter) {
    this.user.hwFilter = filt;
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

}
