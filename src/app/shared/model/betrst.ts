export class Betrst {
  public bstId: number;
  public betriebsstelle: string;
  public bstNr: number;
  public fax: string;
  public tel: string;
  public oeff: string;
  public ap: boolean;
  public parentId?: number;
  public plz: string;
  public ort: string;
  public strasse: string;
  public hausnr: string;

  public fullname: string; // incl. BST-Nr.
  public hierarchy: string; // Pfad der Ueberstellung (parent1/parent2/this), jew. fullname
  public parent?: Betrst;
  public children: Betrst[] = [];
}
