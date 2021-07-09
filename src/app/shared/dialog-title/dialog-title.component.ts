import { Component, Input } from "@angular/core";

@Component({
  selector: "sbsdb-dialog-title",
  templateUrl: "./dialog-title.component.html",
  styleUrls: ["./dialog-title.component.scss"],
})
export class DialogTitleComponent {
  @Input() dialogTitle: string;

  constructor() {
    // noop
  }
}
