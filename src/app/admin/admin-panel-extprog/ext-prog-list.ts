export interface ExtProgList {
  program: string;
  bezeichnung: string;
  param: string;
  flag: number;
  types: { id: number; aptypid: number; aptyp: string }[];
}
