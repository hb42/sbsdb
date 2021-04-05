import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Field } from "../field";
import { RelOp } from "../rel-op.enum";
import { SbsdbColumn } from "../../table/sbsdb-column";
import { FilterEditData } from "./filter-edit-data";

@Component({
  selector: "sbsdb-filter-edit",
  templateUrl: "./filter-edit.component.html",
  styleUrls: ["./filter-edit.component.scss"],
})
export class FilterEditComponent {
  public get selectedField(): SbsdbColumn<unknown, unknown> {
    return this.data.f
      ? this.data.columns.find(
          (col: SbsdbColumn<unknown, unknown>) => col.displayName === this.data.f.displayName
        )
      : null;
  }
  public set selectedField(col: SbsdbColumn<unknown, unknown>) {
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: FilterEditData) {
    console.debug("c'tor ApFilterEditComponent");
  }

  public columnList(): SbsdbColumn<unknown, unknown>[] {
    return this.data.columns.filter((c) => c.operators);
  }

  public compareAsList(): boolean {
    return (
      this.data.o &&
      (this.data.o === RelOp.inlist ||
        this.data.o === RelOp.notinlist ||
        this.data.o === RelOp.inlistA ||
        this.data.o === RelOp.notinlistA)
    );
  }
}
