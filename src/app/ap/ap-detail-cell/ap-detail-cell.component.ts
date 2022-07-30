import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, Input } from "@angular/core";
import { DataService } from "../../shared/data.service";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { ApService } from "../ap.service";

@Component({
  selector: "sbsdb-ap-detail-cell",
  templateUrl: "./ap-detail-cell.component.html",
  styleUrls: ["./ap-detail-cell.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0", display: "none" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
  ],
})
export class ApDetailCellComponent {
  @Input() public element: Arbeitsplatz;

  public readonly pathseparator = " " + String.fromCharCode(187) + " ";

  constructor(public apService: ApService) {
    // noop
  }

  public isBoolTag(flag: number): boolean {
    return (flag & DataService.BOOL_TAG_FLAG) !== 0;
  }
}
