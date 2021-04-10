import { RelOp } from "./rel-op.enum";

/**
 * Expression-Daten fürs Speichern in den Benutzereinstellungen
 */
export class TransportExpression {
  constructor(
    public fName: string | string[], // Feldname
    public dName: string, // Anzeigename des Felds
    // public cName: string, // Spaltenname
    public type: number, // Datentyp
    public op: RelOp, // relationaler Operator
    public comp: string | number | Date // Vergleichstring
  ) {}
}
