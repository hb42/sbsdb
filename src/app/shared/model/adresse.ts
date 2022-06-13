export class Adresse {
  public id: number;
  public plz: string;
  public ort: string;
  public strasse: string;
  public hausnr: string;
  // berechnet
  public inUse?: number;
}
