import { Arbeitsplatz } from "./arbeitsplatz";
import { Hardware } from "./hardware";

export interface ApHw {
  ap: Arbeitsplatz;
  hw: Hardware[];
  delApId: number; // >0 -> DEL AP (.ap == null)
}
