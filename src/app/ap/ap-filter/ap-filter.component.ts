import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Bracket } from "../../shared/filter/bracket";
import { Element } from "../../shared/filter/element";
import { Term } from "../../shared/filter/term";
import { ArbeitsplatzService } from "../arbeitsplatz.service";

@Component({
  selector: "sbsdb-ap-filter",
  templateUrl: "./ap-filter.component.html",
  styleUrls: ["./ap-filter.component.scss"],
})
export class ApFilterComponent implements OnInit {
  constructor(
    public apService: ArbeitsplatzService,
    public dialogRef: MatDialogRef<ApFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Bracket
  ) {
    console.debug("c'tor ApFilterComponent");
  }

  ngOnInit() {}

  public getBracketElements(t: Term): Element[] {
    if (t.isBracket()) {
      return (t as Bracket).getElements();
    } else {
      return [new Element(null, t)];
    }
  }
}
