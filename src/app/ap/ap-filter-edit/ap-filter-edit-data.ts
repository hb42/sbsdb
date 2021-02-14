import { Field } from "../../shared/filter/field";
import { RelOp } from "../../shared/filter/rel-op.enum";
import { ApColumn } from "../ap-column";

export interface ApFilterEditData {
  f: Field | null;
  o: RelOp | null;
  c: string | null;
  columns: ApColumn[];
}
