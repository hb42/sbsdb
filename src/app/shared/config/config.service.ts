import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Version, VersionService } from "@hb42/lib-client";
import { environment } from "../../../environments/environment";
import { UserSession } from "./user.session";

@Injectable({ providedIn: "root" })
export class ConfigService {
  // Name in der Config-DB
  public static AP_PAGE_SIZE = "ap.pagesize";
  public static AP_FILTERS = "ap.filters";

  public version: Version;

  private readonly websvc: string;

  // Pfad zur Web-API
  public get webservice(): string {
    return this.websvc;
  }

  // Web-API calls
  private readonly getConf: string;
  private readonly setConf: string;
  private readonly delConf: string;
  private readonly getUserConf: string;
  private readonly setUserConf: string;
  private readonly getVersion: string;

  private userDataChange: EventEmitter<any> = new EventEmitter();
  private userSession: UserSession;
  private timer: any;

  constructor(
    private http: HttpClient,
    private location: Location,
    private versionService: VersionService
  ) {
    console.debug("c'tor ConfigService");
    // Adresse der Web-API
    this.websvc = location.prepareExternalUrl(environment.webservice);

    this.getConf = this.webservice + "/config/get";
    this.setConf = this.webservice + "/config/set";
    this.delConf = this.webservice + "/config/del";
    this.getUserConf = this.webservice + "/user/get";
    this.setUserConf = this.webservice + "/user/set";
    this.getVersion = this.webservice + "/config/version";

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
  public init(): Promise<any> {
    // SSE init
    // TODO SSE mit .NET Core? Falls ja, gibt's Verwendung dafuer?

    // Benutzerdaten holen
    // Jeder Benutzer wird authorisiert, was er dann sehen darf muss in der
    // Oberflaeche entschiweden werden.
    return (
      this.http
        .get<any>(this.getUserConf)
        .toPromise()
        .then((data) => {
          this.userSession = new UserSession(this.userDataChange, data);
          console.debug(">>> user config done");
          console.dir(data);
          return "OK";
        })
        // Versionen
        .then((rc) => {
          console.debug(">>> getting app meta data");
          return this.versionService.init(this.getVersion).then((ver) => {
            console.debug(">>> meta data done");
            console.log(
              ver.displayname + " v" + ver.version + " " + ver.copyright + " (" + ver.githash + ")"
            );
            console.dir(ver.versions);
            const server = this.versionService.serverVer;
            console.log(
              server.displayname +
                " v" +
                server.version +
                " " +
                server.copyright +
                " (" +
                server.githash +
                ")"
            );
            console.dir(server.versions);
            this.version = ver;
          });
        })
    );
    // what's new holen
    // .then()
  }

  // --- config in der Server-DB ---

  public getConfig(confName: string): Promise<any> {
    return this.http
      .get<string>(this.getConf + "/" + confName)
      .toPromise()
      .then((val) => {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      });
  }

  public saveConfig(confName: string, value: any): Promise<any> {
    if (value === undefined) {
      return;
    }
    if (value === null) {
      return this.deleteConfig(confName);
    }
    const val: string = JSON.stringify(value);
    return this.http
      .post(this.setConf + "/" + confName, val)
      .toPromise()
      .then((rc) => rc);
  }

  public deleteConfig(confName: string): Promise<any> {
    return this.http
      .delete(this.delConf + "/" + confName)
      .toPromise()
      .then((rc) => rc);
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
  private saveUser(user: any) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.http.post<any>(this.setUserConf, user).subscribe((rc) => {
        console.debug("user conf saved");
        console.dir(user);
      });
    }, 3000);
  }
}
