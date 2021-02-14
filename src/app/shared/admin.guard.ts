import { Injectable } from "@angular/core";
import { CanActivate, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { ConfigService } from "./config/config.service";
import { UserSession } from "./config/user.session";

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  private userSettings: UserSession;

  constructor(private configService: ConfigService) {
    this.userSettings = configService.getUser();
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userSettings.isAdmin;
  }
}
