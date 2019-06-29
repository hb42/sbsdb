import { FormControl } from "@angular/forms";
import { ColumnFilter } from "../shared/config/column-filter";
import { Arbeitsplatz } from "./model/arbeitsplatz";

export interface ApColumn {
  name: string;
  sort?: {
    text: string;  // Sort-Heading
    key: string;   // Accelerator (alt-key)
    sortString(ap: Arbeitsplatz): string | number;  // String fuer den Vergleich
  };
  filter?: {
    filter: FormControl;  // Filter-Feld
    valueChange(text: string): ColumnFilter;  // Filter in UserSession speichern
    predicate(ap: Arbeitsplatz): boolean;  // Vergleich fuer den Filter
  };
}
