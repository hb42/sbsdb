import { Injectable } from "@angular/core";
import { ConfigService } from "../shared/config/config.service";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(public configService: ConfigService) {}

  // public async getConfig(conf: string, dflt: string) {
  //   const c: string = await this.configService.getConfig(conf);
  //   return c; // ?? dflt;
  // }
}
