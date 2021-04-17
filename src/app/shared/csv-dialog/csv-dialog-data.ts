import { SbsdbColumn } from "../table/sbsdb-column";

export interface CsvDialogData {
  all: boolean;
  resultList: SbsdbColumn<unknown, unknown>[];
  fields: SbsdbColumn<unknown, unknown>[];
}
