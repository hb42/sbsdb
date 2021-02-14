import { TransportFilters } from "../filter/transport-filters";
import { ColumnFilter } from "./column-filter";

export interface UserSettings {
  path: string;

  // AP-Page
  showStandort?: boolean;
  apColumnFilters?: ColumnFilter[];
  apExtFilter?: string;
  apFilter?: TransportFilters;
  latestApFilter?: string;
  apSortColumn?: string;
  apSortDirection?: string;
  apPageSize?: number;
  searchSonstHw?: boolean;
}
