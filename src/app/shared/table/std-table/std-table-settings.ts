import { TransportElement } from "../../filter/transport-element";

export interface StdTableSettings {
  sortColumn: string;
  sortDirection: string;
  filter: TransportElement[];
}
