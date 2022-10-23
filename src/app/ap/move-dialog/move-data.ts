import { Arbeitsplatz } from "../../shared/model/arbeitsplatz";

export interface MoveData {
  ap: Arbeitsplatz;
  target?: Arbeitsplatz;
  what?: number; // 1 - HW, 2 - TAGs, 3 - HW+TAGs
}
