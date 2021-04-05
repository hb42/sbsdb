import { Field } from "../field";
import { RelOp } from "../rel-op.enum";
import { SbsdbColumn } from "../../table/sbsdb-column";

export interface FilterEditData {
  f: Field | null;
  o: RelOp | null;
  c: string | number | Date | null;
  columns: SbsdbColumn<unknown, unknown>[];
}
