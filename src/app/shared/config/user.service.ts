import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "./config.service";
import { UserSession } from "./user.session";

@Injectable({providedIn: "root"})
export class UserService {

  private user: UserSession;

  private restApi: string;
  private timer: any;

  constructor(private http: HttpClient, private config: ConfigService) {
    console.debug("c'tor UserService");
    this.restApi = config.webservice + "/user/get";
  }

  public init() {
    return this.http.get<UserSession>(this.restApi).toPromise()
        .then(data => {
          this.user = data;
          console.debug("got user");
          console.dir(this.user);
        });
  }

  public set path(p: string) {
    this.user.path = p;
    this.save();
  }

  public get path(): string {
    return this.user.path;
  }

  private save() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.http.post<UserSession>(this.restApi, this.user).subscribe((rc) => {
        console.debug("user conf saved");
      });
    }, 3000);

  }
}
