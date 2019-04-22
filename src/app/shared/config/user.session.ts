// dieser Datentyp wird in der DB gespeichert
import { EventEmitter } from "@angular/core";

class User {
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
      path: "",
    };
  }

  public get path(): string {
    return this.user.path;
  }

  public set path(p: string) {
    this.user.path = p;
    this.changeEvent.emit(this.user);
  }

}
