/**
 * Aktueller und alle gespeicherten Filter fuer die Ausgabe in die Benutzereinstellungen
 */
import { TransportFilter } from "./transport-filter";

export interface TransportFilters {
  stdFilter: boolean;
  filters: TransportFilter[];
}
