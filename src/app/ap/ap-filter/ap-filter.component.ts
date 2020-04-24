import { AfterViewInit, Component, Inject, Input, OnInit } from "@angular/core";
import { Element } from "../../shared/filter/element";
import { ApFilterService } from "../ap-filter.service";

@Component({
  selector: "sbsdb-ap-filter",
  templateUrl: "./ap-filter.component.html",
  styleUrls: ["./ap-filter.component.scss"],
})
export class ApFilterComponent implements OnInit, AfterViewInit {
  @Input() data: Element;

  constructor() {
    console.debug("c'tor ApFilterComponent");
  }

  public ngOnInit() {}

  public ngAfterViewInit(): void {}
}
