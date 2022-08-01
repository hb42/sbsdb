import { Adresse } from "./adresse";

export class Betrst {
  public bstId: number;
  public betriebsstelle: string;
  public bstNr: number;
  public tel: string; // wird im Moment nicht genutzt. Bleibt drin, falls doch noch gewuencht.
  public oeff: string;
  public ap: boolean;
  public parentId?: number;
  public adresseId: number;
  // public plz: string;
  // public ort: string;
  // public strasse: string;
  // public hausnr: string;

  public adresse: Adresse;
  public fullname: string; // incl. BST-Nr.
  public hierarchy: string; // Pfad der Ueberstellung (parent1/parent2/this), jew. fullname
  public parent?: Betrst;
  public children: Betrst[] = [];
  // berechnet
  public inUse?: number;
}
