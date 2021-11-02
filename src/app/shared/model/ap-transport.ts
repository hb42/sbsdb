import { Arbeitsplatz } from "./arbeitsplatz";
import { Hardware } from "./hardware";

export interface ApTransport {
  ap: Arbeitsplatz;
  hw: Hardware[];
  delApId: number; // >0 -> DEL AP (.ap == null)
}
