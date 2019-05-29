import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";

@Injectable({providedIn: "root"})
export class KeyboardService {

  constructor(@Inject(DOCUMENT) doc: any) {
    // doc.addEventListener("keydown", (event) => {
    //   if (event.altKey && event.key === "a") {
    //     console.debug("KEYBOARD EVENT altA");
    //     event.preventDefault();
    //     event.stopPropagation();
    //   }
    // });
  }

}
