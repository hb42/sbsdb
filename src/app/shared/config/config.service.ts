import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { Version } from "../version";
import { VersionService } from "../version.service";
import { User } from "./user";
import { UserSession } from "./user.session";

@Injectable({ providedIn: "root" })
export class ConfigService {
  // Name in der Config-DB
  public static AP_PAGE_SIZE = "ap.pagesize";
  public static AP_FILTERS = "ap.filters";
  public static HW_FILTERS = "hw.filters";
  public static CONF_FILTERS = "conf.filters";
  public static CSV_SEPARATOR = "csvseparator";

  public version: Version;

  private readonly websvc: string;

  // Pfad zur Web-API
  public get webservice(): string {
    return this.websvc;
  }

  // Web-API calls
  private readonly getConfUrl: string;
  private readonly setConfUrl: string;
  private readonly delConfUrl: string;
  private readonly getUserConfUrl: string;
  private readonly setUserConfUrl: string;
  private readonly getVersionUrl: string;

  private userDataChange: EventEmitter<User> = new EventEmitter() as EventEmitter<User>;
  private userSession: UserSession;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private timer: NodeJS.Timeout;
  private readonly saveTimeoutMS = 3000;

  constructor(
    private http: HttpClient,
    private location: Location,
    private versionService: VersionService
  ) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
    // Adresse der Web-API
    this.websvc = location.prepareExternalUrl(environment.webservice);

    this.getConfUrl = this.webservice + "/config/get";
    this.setConfUrl = this.webservice + "/config/set";
    this.delConfUrl = this.webservice + "/config/del";
    this.getUserConfUrl = this.webservice + "/user/get";
    this.setUserConfUrl = this.webservice + "/user/set";
    this.getVersionUrl = this.webservice + "/config/version";

    // in den Event fuer Benutzer-Config-Aenderungen einklinken
    this.userDataChange.subscribe((user) => {
      this.saveUser(user);
    });
  }

  /**
   * Config initialisieren
   *
   * User-Daten aus der DB holen, Version aus package.json auslesen.
   *
   * Die fn wird beim Modulstart aufgerufen, damit die Config-Daten
   * verfuegbar sind, wenn die Anwendung initialisiert wird.
   *
   * Wird in app.modules wie folgt aufgerufen:
   *
   * // fn , die fn liefert, die ein Promise liefert
   * export function initConf(configService: ConfigService) {
   *  return () => configService.init();
   * }
   * ...
   *
   * @NgModule(
   *   ...
   *   providers   : [
   *     ...
   *    {
   *      provide   : APP_INITIALIZER,
   *      useFactory: initConf,
   *      deps      : [ConfigService],
   *      multi     : true
   *    },
   */
  public init(): Promise<void | Version> {
    // Benutzerdaten holen
    // Jeder Benutzer wird authorisiert, was er dann sehen darf muss in der
    // Oberflaeche entschiweden werden.
    return (
      firstValueFrom(this.http.get<User>(this.getUserConfUrl))
        .then((data) => {
          this.userSession = new UserSession(this.userDataChange, data);
          if (!environment.production) console.debug(">>> user config done");
          return "OK";
        })
        // Versionen
        .then(() => {
          if (!environment.production) console.debug(">>> getting app meta data");
          return this.versionService.init(this.getVersionUrl).then((ver) => {
            if (!environment.production) console.debug(">>> meta data done");
            console.info(ver.displayname + " v" + ver.version + " " + ver.copyright);
            if (!environment.production) console.dir(ver.versions);
            const server = this.versionService.serverVer;
            console.info(server.displayname + " v" + server.version + " " + server.copyright);
            if (!environment.production) console.dir(server.versions);
            this.version = ver;
          });
        })
    );
  }

  // --- config in der Server-DB ---

  public getConfig(confName: string): Promise<unknown> {
    return firstValueFrom(this.http.get<string>(this.getConfUrl + "/" + confName)).then((val) => {
      try {
        return JSON.parse(val) as unknown;
      } catch {
        return val;
      }
    });
  }

  public saveConfig(confName: string, value: unknown): Promise<unknown> {
    if (value === undefined) {
      return;
    }
    if (value === null) {
      return this.deleteConfig(confName);
    }
    const val: string = JSON.stringify(value);
    return firstValueFrom(this.http.post(this.setConfUrl + "/" + confName, val)).then((rc) => rc);
  }

  public deleteConfig(confName: string): Promise<unknown> {
    return firstValueFrom(this.http.delete(this.delConfUrl + "/" + confName)).then((rc) => rc);
  }

  // --- Benutzer-Config ---

  public getUser(): UserSession {
    return this.userSession;
  }

  /**
   * User-Daten speichern
   *
   * Damit sich die Netzwerkzugriffe in Grenzen halten, wird das Schreiben
   * verzoegert.
   */
  private saveUser(user: User) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.http.post<User>(this.setUserConfUrl, user).subscribe(() => {
        if (!environment.production) {
          console.debug("user conf saved");
          console.dir(user);
        }
      });
    }, this.saveTimeoutMS);
  }
}
