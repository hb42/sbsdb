import { Component, Inject, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { TransportFilter } from "../transport-filter";
import { FilterEditListData } from "./filter-edit-list-data";

@Component({
  selector: "sbsdb-filter-edit-list",
  templateUrl: "./filter-edit-list.component.html",
  styleUrls: ["./filter-edit-list.component.scss"],
})
export class FilterEditListComponent implements OnInit {
  public formcontrol: FormControl = new FormControl();
  public filteredOptions: Observable<TransportFilter[]>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: FilterEditListData) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
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
