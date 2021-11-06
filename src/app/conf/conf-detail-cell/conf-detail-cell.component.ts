import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, Input } from "@angular/core";
import { HwKonfig } from "../../shared/model/hw-konfig";
import { ConfService } from "../conf.service";

@Component({
  selector: "sbsdb-conf-detail-cell",
  templateUrl: "./conf-detail-cell.component.html",
  styleUrls: ["./conf-detail-cell.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0", display: "none" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
  ],
})
export class ConfDetailCellComponent {
  @Input() public element: HwKonfig;

  constructor(public confService: ConfService) {
    // noop
  }
}
