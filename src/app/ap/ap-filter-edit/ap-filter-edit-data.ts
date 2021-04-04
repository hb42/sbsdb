import { Field } from "../../shared/filter/field";
import { RelOp } from "../../shared/filter/rel-op.enum";
import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";
import { Hardware } from "../../shared/model/hardware";
import { SbsdbColumn } from "../../shared/table/sbsdb-column";
import { ArbeitsplatzService } from "../arbeitsplatz.service";

export interface ApFilterEditData {
  f: Field | null;
  o: RelOp | null;
  c: string | null;
  columns: SbsdbColumn<ArbeitsplatzService, Arbeitsplatz | Hardware>[];
}
