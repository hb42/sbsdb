import { TransportFilters } from "../filter/transport-filters";
import { ColumnFilter } from "./column-filter";

export interface UserSettings {
  path: string;
  debug?: boolean;
  showNavMenu?: boolean;
  cellLineBreak?: boolean;

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
  // HW-Page
  hwColumnFilters?: ColumnFilter[];
  hwExtFilter?: string;
  hwFilter?: TransportFilters;
  latestHwFilter?: string;
  hwSortColumn?: string;
  hwSortDirection?: string;
  hwPageSize?: number;
  showFremde?: boolean;
  // Conf-Page
  latestConfFilter?: string;
  confFilter?: TransportFilters;
  confSortColumn?: string;
  confSortDirection?: string;
  confPageSize?: number;
  showEmptyConfig?: boolean;
  // Admin-Page
  adminpath?: string;
  admintables?: string; //Map<string, StdTableSettings>;
}
