import { Component, HostBinding, OnInit } from "@angular/core";
import { ArbeitsplatzService } from "../arbeitsplatz.service";

@Component({
  selector: "sbsdb-ap-list",
  templateUrl: "./ap-list.component.html",
  styleUrls: ["./ap-list.component.scss"],
})
export class ApListComponent implements OnInit {
  @HostBinding("attr.class") public cssClass = "flex-content";

  constructor(public apService: ArbeitsplatzService) {}

  // eslint-disable-next-line no-empty, @typescript-eslint/no-empty-function
  public ngOnInit() {}
}
