import { Injectable } from "@angular/core";
import { ArbeitsplatzService } from "./arbeitsplatz.service";

@Injectable({
              providedIn: "root"
            })
export class ApFilterServiceService {

  constructor(public apService: ArbeitsplatzService) {
  }


}
