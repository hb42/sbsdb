import { FormControl } from "@angular/forms";
import { ColumnFilter } from "../shared/config/column-filter";
import { Bracket } from "../shared/filter/bracket";
import { Expression } from "../shared/filter/expression";
// import { ApRelationalExpression } from "./filter/ap-relational-expression";
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
    // predicate(ap: Arbeitsplatz): boolean;  // Vergleich-Funktion fuer den Filter
    // predicate(ap: Arbeitsplatz): Expression;  // Vergleich-Funktion fuer den Filter
    predicate(ap: Arbeitsplatz): Bracket;  // Vergleich-Funktion fuer den Filter FIXME auf Expressen zurueck
  };
}
