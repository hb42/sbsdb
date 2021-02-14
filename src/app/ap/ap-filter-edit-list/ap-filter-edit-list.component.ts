import { Component, Inject, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { TransportFilter } from "../../shared/filter/transport-filter";
import { ApFilterEditListData } from "./ap-filter-edit-list-data";

@Component({
  selector: "sbsdb-ap-filter-edit-list",
  templateUrl: "./ap-filter-edit-list.component.html",
  styleUrls: ["./ap-filter-edit-list.component.scss"],
})
export class ApFilterEditListComponent implements OnInit {
  public formcontrol: FormControl = new FormControl();
  public filteredOptions: Observable<TransportFilter[]>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ApFilterEditListData) {
    console.debug("c'tor ApFilterEditListComponent");
  }

  ngOnInit(): void {
    this.filteredOptions = this.formcontrol.valueChanges.pipe(
      startWith(""),
      map((value) => {
        if (typeof value === "string") {
          const filterValue = value.toLowerCase();
          return this.data.list.filter((filt) => filt.name.toLowerCase().includes(filterValue));
        } else {
          return [];
        }
      })
    );
  }

  public displayEntry(filt?: TransportFilter): string | undefined {
    return filt ? filt.name : undefined;
  }
}
