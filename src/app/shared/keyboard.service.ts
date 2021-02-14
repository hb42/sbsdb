import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class KeyboardService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(@Inject(DOCUMENT) doc: unknown) {
    // doc.addEventListener("keydown", (event) => {
    //   if (event.altKey && event.key === "a") {
    //     console.debug("KEYBOARD EVENT altA");
    //     event.preventDefault();
    //     event.stopPropagation();
    //   }
    // });
  }
}
