import { Component, HostBinding, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { HwService } from "../hw.service";

@Component({
  selector: "sbsdb-hw",
  templateUrl: "./hw.component.html",
  styleUrls: ["./hw.component.scss"],
})
export class HwComponent {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  constructor(public dialog: MatDialog, public hwService: HwService) {
    console.debug("c'tor HwComponent");
  }
}
