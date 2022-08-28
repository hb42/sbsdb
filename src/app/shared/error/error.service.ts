import { ErrorHandler, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ERROR_PATH } from "../../const";
import { NavigationService } from "../navigation.service";

@Injectable({
  providedIn: "root",
})
export class ErrorService implements ErrorHandler {
  constructor(private navigationService: NavigationService) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }

  public handleError(error: unknown): void {
    if (typeof error === "string") {
      this.navigationService.lastError = new Error(error);
    } else if (error instanceof Error) {
      this.navigationService.lastError = error;
    } else {
      this.navigationService.lastError = new Error("Unbekannter Fehler");
    }
    console.error("ErrorHandler with error:");
    console.dir(error);
    this.navigationService.navigateByUrl("/" + ERROR_PATH);
  }
}
