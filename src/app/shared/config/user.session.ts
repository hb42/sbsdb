import { EventEmitter } from "@angular/core";

// dieser Datentyp wird in der DB gespeichert
// -> hb.SbsdbServer.Model.ViewModel.UserSession
class User {
  public UID: string;
  public isAdmin: boolean;
  public isReadonly: boolean;
  public isHotline: boolean;

  public path: string;
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

  constructor(event: EventEmitter<User>, data: User) {
    this.changeEvent = event;
    // defaults
    this.user = data ? data : {
      UID       : "",
      isAdmin   : false,
      isReadonly: false,
      isHotline : false,

      path: "",
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

}
