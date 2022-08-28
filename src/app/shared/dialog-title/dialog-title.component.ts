import { Component, Input } from "@angular/core";
import { environment } from "../../../environments/environment";

@Component({
  selector: "sbsdb-dialog-title",
  templateUrl: "./dialog-title.component.html",
  styleUrls: ["./dialog-title.component.scss"],
})
export class DialogTitleComponent {
  @Input() dialogTitle: string;

  constructor() {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
