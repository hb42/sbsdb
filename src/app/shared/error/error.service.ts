import { ErrorHandler, Injectable } from "@angular/core";
import { NavigationService } from "../navigation.service";

@Injectable({
  providedIn: "root",
})
export class ErrorService implements ErrorHandler {
  constructor(private navigationService: NavigationService) {}

  public handleError(error: unknown): void {
    if (typeof error === "string") {
      this.navigationService.lastError = new Error(error);
    } else if (error instanceof Error) {
      this.navigationService.lastError = error;
    } else {
      this.navigationService.lastError = new Error("Unbekannter Fehler");
    }
    console.debug("ErrorHandler with error:");
    console.dir(error);
    this.navigationService.navigateByUrl("/" + NavigationService.errorUrl);
  }
}
