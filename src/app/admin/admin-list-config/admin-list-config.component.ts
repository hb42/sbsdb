import { Component, HostBinding, OnInit } from "@angular/core";

@Component({
  selector: "sbsdb-admin-list-config",
  templateUrl: "./admin-list-config.component.html",
  styleUrls: ["./admin-list-config.component.scss"],
})
export class AdminListConfigComponent implements OnInit {
  @HostBinding("attr.class") public cssClass = "flex-content";
  constructor() {}

  ngOnInit(): void {}
}
