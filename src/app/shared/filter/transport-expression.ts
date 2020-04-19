import { RelOp } from "./rel-op.enum";

/**
 * Expression-Daten fürs Speichern in den Benutzereinstellungen
 */
export class TransportExpression {
  constructor(
    public fName: string, // Feldname
    public dName: string, // Anzeigename des Felds
    public op: RelOp, // relationaler Operator
    public comp: string // Vergleichstring
  ) {}
}
