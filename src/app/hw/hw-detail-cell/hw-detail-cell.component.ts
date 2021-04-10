import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, Input } from "@angular/core";
import { Hardware } from "../../shared/model/hardware";
import { HwService } from "../hw.service";

@Component({
  selector: "sbsdb-hw-detail-cell",
  templateUrl: "./hw-detail-cell.component.html",
  styleUrls: ["./hw-detail-cell.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0", display: "none" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
  ],
})
export class HwDetailCellComponent {
  @Input() public element: Hardware;

  constructor(hwService: HwService) {}
}
