import { Component, HostBinding, OnInit } from "@angular/core";
import { ApFilterService } from "../../ap/ap-filter.service";

@Component({
  selector: "sbsdb-admin-list-ap-filter",
  templateUrl: "./admin-list-ap-filter.component.html",
  styleUrls: ["./admin-list-ap-filter.component.scss"],
})
export class AdminListApFilterComponent implements OnInit {
  @HostBinding("attr.class") public cssClass = "flex-content";
  constructor(public apFilter: ApFilterService) {}

  ngOnInit(): void {}
}
