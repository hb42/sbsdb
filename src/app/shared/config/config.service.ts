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

  // // Pfad zur Web-API
  // public get webservice(): string {
  //   return this.websvc;
  // }

  public get getConfUrl(): string {
    return `${this.websvc}/config/get`;
  }
  public get setConfUrl(): string {
    return `${this.websvc}/config/set`;
  }
  public get delConfUrl(): string {
    return `${this.websvc}/config/del`;
  }
  public get getUserConfUrl(): string {
    return `${this.websvc}/user/get`;
  }
  public get setUserConfUrl(): string {
    return `${this.websvc}/user/set`;
  }
  public get getVersionUrl(): string {
    return `${this.websvc}/config/version`;
  }
  public get oeTreeUrl(): string {
    return `${this.websvc}/tree/oe`;
  }
  public get allApsUrl(): string {
    return `${this.websvc}/ap/all`;
  }
  public get pageApsUrl(): string {
    return `${this.websvc}/ap/page/`;
  }
  public get singleApUrl(): string {
    return `${this.websvc}/ap/id/`;
  }
  public get countApUrl(): string {
    return `${this.websvc}/ap/count`;
  }
  public get allBstUrl(): string {
    return `${this.websvc}/betrst/all`;
  }
  public get changeOeUrl(): string {
    return `${this.websvc}/betrst/change`;
  }
  public get allHwUrl(): string {
    return `${this.websvc}/hw/all`;
  }
  public get pageHwUrl(): string {
    return `${this.websvc}/hw/page/`;
  }
  public get countHwUrl(): string {
    return `${this.websvc}/hw/count`;
  }
  public get allHwKonfig(): string {
    return `${this.websvc}/hwkonfig/all`;
  }
  public get allTagTypesUrl(): string {
    return `${this.websvc}/svz/tagtyp/all`;
  }
  public get changeTagtypUrl(): string {
    return `${this.websvc}/svz/tagtyp/change`;
  }
  public get allVlansUrl(): string {
    return `${this.websvc}/svz/vlan/all`;
  }
  public get changeVlanUrl(): string {
    return `${this.websvc}/svz/vlan/change`;
  }
  public get allApTypUrl(): string {
    return `${this.websvc}/svz/aptyp/all`;
  }
  public get changeAptypUrl(): string {
    return `${this.websvc}/svz/aptyp/change`;
  }
  public get allApKatUrl(): string {
    return `${this.websvc}/svz/apkategorie/all`;
  }
  public get changeApKatUrl(): string {
    return `${this.websvc}/svz/apkategorie/change`;
  }
  public get allHwTypUrl(): string {
    return `${this.websvc}/svz/hwtyp/all`;
  }
  public get changeHwtypUrl(): string {
    return `${this.websvc}/svz/hwtyp/change`;
  }
  public get allAdresseUrl(): string {
    return `${this.websvc}/betrst/adressen`;
  }
  public get changeAdresseUrl(): string {
    return `${this.websvc}/betrst/chgadresse`;
  }
  public get changeApUrl(): string {
    return `${this.websvc}/ap/changeap`;
  }
  public get changeApMultiUrl(): string {
    return `${this.websvc}/ap/changeapmulti`;
  }
  public get changeApMoveUrl(): string {
    return `${this.websvc}/ap/changeapmove`;
  }
  public get changeApAptypUrl(): string {
    return `${this.websvc}/ap/changeaptyp`;
  }
  public get changeHwUrl(): string {
    return `${this.websvc}/hw/changehw`;
  }
  public get changeHwMultiUrl(): string {
    return `${this.websvc}/hw/changehwmulti`;
  }
  public get addHwUrl(): string {
    return `${this.websvc}/hw/addhw`;
  }
  public get changeKonfigUrl(): string {
    return `${this.websvc}/hwkonfig/changekonfig`;
  }
  public get delHwKonfigUrl(): string {
    return `${this.websvc}/hwkonfig/delkonfig`;
  }
  public get hwKonfigInAussondUrl(): string {
    return `${this.websvc}/hwkonfig/hwkonfiginaussond`;
  }
  public get hwHistoryUrl(): string {
    return `${this.websvc}/hw/hwhistoryfor`;
  }
  public get extProgUrl(): string {
    return `${this.websvc}/svz/extprog/all`;
  }
  public get changeExtprogUrl(): string {
    return `${this.websvc}/svz/extprog/change`;
  }
  public get aussListUrl(): string {
    return `${this.websvc}/hw/ausslist`;
  }
  public get aussDetailsUrl(): string {
    return `${this.websvc}/hw/aussdetails`;
  }
  public get aussondUrl(): string {
    return `${this.websvc}/hw/aussond`;
  }
  public get importTcLogUrl(): string {
    return `${this.websvc}/external/gettclogs`;
  }
  public get notificationUrl(): string {
    return `${this.websvc}/notification`;
  }

  // Notifications
  public readonly notificationApchange = "apchange";
  public readonly notificationApchangemulti = "apchangemulti";
  public readonly notificationApchangemove = "apchangemove";
  public readonly notificationApchangeaptyp = "apchangeaptyp";
  public readonly notificationHwchange = "hwchange";
  public readonly notificationHwchangemulti = "hwchangemulti";
  public readonly notificationAddhw = "addhw";
  public readonly notificationKonfigchange = "konfigchange";
  public readonly notificationKonfigdel = "konfigdel";
  public readonly notificationExtprogchange = "extprogchange";
  public readonly notificationApkategoriechange = "apkategoriechange";
  public readonly notificationAptypchange = "aptypchange";
  public readonly notificationOechange = "oechange";
  public readonly notificationAdressechange = "adressechange";
  public readonly notificationHwtypchange = "hwtypchange";
  public readonly notificationVlanchange = "vlanchange";
  public readonly notificationTagtypchange = "tagtypchange";

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
