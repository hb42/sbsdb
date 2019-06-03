export class OeTreeItem {

  public children: OeTreeItem[];

  public id: number;
  public parentId: number;
  public ap: boolean;
  public betriebsstelle: string;
  public bst: number;
  public fax: string;
  public oeff: string;
  public tel: string;
  public adresseId?: number;
  public hausnr?: string;
  public ort?: string;
  public plz?: string;
  public strasse?: string;

  public leaf: boolean;

}
