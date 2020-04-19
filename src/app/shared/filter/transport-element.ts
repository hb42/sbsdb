import { TransportExpression } from "./transport-expression";

/**
 * Element-Daten fürs Speichern in den Benutzereinstellungen
 */
export class TransportElement {
  constructor(
    public op: number, // logischer Operator: keiner == -1 / UND == 1 / ODER == 0
    public elem: TransportElement[] | TransportExpression // Ausdruck bzw. Klammer
  ) {}
}
