import { Injectable } from "@angular/core";
import { ConfigService } from "../shared/config/config.service";
import { UserSession } from "../shared/config/user.session";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  public userSettings: UserSession;

  constructor(public configService: ConfigService) {
    console.debug("c'tor AdminService");
    this.userSettings = configService.getUser();
  }
}
