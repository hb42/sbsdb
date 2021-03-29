import { Injectable } from "@angular/core";
import { DataService } from "../shared/data.service";

@Injectable({
              providedIn: "root"
            })
export class HwService {
  constructor(public dataService: DataService) {
    console.debug("c'tor HwService");
    setTimeout(() => {
      this.init();
    }, 0);
  }

  private init(): void {
    // fetch KW-Konfig-Table + HW-Table
  }
}
