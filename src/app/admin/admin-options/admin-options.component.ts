import { Component, HostBinding, OnInit } from "@angular/core";
import { AppRoutingModule } from "../../app-routing.module";

@Component({
  selector: "sbsdb-admin-options",
  templateUrl: "./admin-options.component.html",
  styleUrls: ["./admin-options.component.scss"],
})
export class AdminOptionsComponent implements OnInit {
  @HostBinding("attr.class") public cssClass = "flex-content";
  public admApFilterPath = "/" + AppRoutingModule.admApfilterPath;
  public admConfig = "/" + AppRoutingModule.admConfig;

  constructor() {}

  ngOnInit(): void {}
}
