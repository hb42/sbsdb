import { Component, HostListener, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SbsdbColumn } from "../../table/sbsdb-column";
import { Field } from "../field";
import { RelOp } from "../rel-op.enum";
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
      this.data.f.type = col.typeKey;
    } else {
      this.data.f = new Field(col.fieldName, col.displayName, col.typeKey);
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FilterEditData,
    public matDialogRef: MatDialogRef<FilterEditComponent>
  ) {
    console.debug("c'tor ApFilterEditComponent");
  }
  @HostListener("document:keydown.esc", ["$event"])
  public handleEsc(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.matDialogRef.close();
  }
  @HostListener("document:keydown.enter", ["$event"])
  public handleEnter(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.matDialogRef.close(this.data);
  }

  public columnList(): SbsdbColumn<unknown, unknown>[] {
    return this.data.columns.filter((c) => c.operators);
  }

  public compareAsList(): boolean {
    return (
      this.data.o &&
      (this.data.o === RelOp.inlist ||
        this.data.o === RelOp.notinlist ||
        this.data.o === RelOp.inlistlike ||
        this.data.o === RelOp.notinlistlike)
    );
  }
}
