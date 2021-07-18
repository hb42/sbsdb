export interface ApChange {
  apid: number; // 0 -> NEW
  apname?: string;
  standortId?: number;
  verantwId?: number | null;
  bezeichnung?: string;
  bemnerkung?: string;
  apTypId?: number; // NEW
}
