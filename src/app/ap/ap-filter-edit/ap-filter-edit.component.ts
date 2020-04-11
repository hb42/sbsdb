import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Field } from "../../shared/filter/field";
import { RelOp } from "../../shared/filter/rel-op.enum";
import { ApColumn } from "../ap-column";
import { ArbeitsplatzService } from "../arbeitsplatz.service";

@Component({
  selector: "sbsdb-ap-filter-edit",
  templateUrl: "./ap-filter-edit.component.html",
  styleUrls: ["./ap-filter-edit.component.scss"],
})
export class ApFilterEditComponent implements OnInit {
  public get selectedField(): ApColumn {
    return this.data.f
      ? this.apService.extFilterColumns.find((col) => col.displayName === this.data.f.displayName)
      : null;
  }
  public set selectedField(col) {
    if (this.data.f) {
      if (this.data.f.displayName !== col.displayName) {
        this.data.o = null;
        this.data.c = null;
      }
      this.data.f.displayName = col.displayName;
      this.data.f.fieldName = col.fieldName;
    } else {
      this.data.f = new Field(col.fieldName, col.displayName);
    }
  }

  // public selectedField: FormControl;

  constructor(public apService: ArbeitsplatzService, @Inject(MAT_DIALOG_DATA) public data) {
    console.debug("c'tor ApFilterEditComponent");
  }

  ngOnInit(): void {}

  public compareAsList(): boolean {
    return this.data.o && (this.data.o === RelOp.inlist || this.data.o === RelOp.notinlist);
  }
}
