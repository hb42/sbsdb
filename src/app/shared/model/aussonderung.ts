export interface Aussonderung {
  id: number;
  invNr: string;
  anschDat: Date;
  anschWert: number;
  bezeichnung: string; // concat(hersteller, ' - ', bezeichnung)
  serNr: string;
  aussDat: Date;
  aussGrund: string;
  rewe?: Date;
}
