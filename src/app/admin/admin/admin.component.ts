import { Component, HostBinding, OnInit } from "@angular/core";

@Component({
  selector: "sbsdb-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {
  @HostBinding("attr.class") public cssClass = "flex-panel flex-content-fix";

  constructor() {}

  ngOnInit() {}
}
