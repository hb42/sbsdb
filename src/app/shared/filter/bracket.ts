import { Element } from "./element";
import { Expression } from "./expression";
import { LogicalOperator } from "./logical-operator";
import { Term } from "./term";

/**
 * Klammerausdruck in einem Filter
 *
 *   Term LO Term ...
 *
 * Term := Klammerausdruck {@link Bracket} oder einzelner Ausdruck {@link Expression}
 * LO := logischer Operator (AND, OR)
 */
export class Bracket implements Term {
  private elements: Element[] = [];
  private brLeft = "(";
  private brRight = ")";

  constructor(private up: Bracket | null) {
    if (up === null) {
      this.brLeft = this.brRight = "";
    }
  }

  public toString(): string {
    const rc = this.elements.reduce((prev, curr) => {
      return curr.operator
        ? prev +
            " " +
            curr.operator.toString() +
            " " +
            curr.term.toString() +
            "#" +
            curr.count +
            "#"
        : prev + " " + curr.term.toString() + "#" + curr.count + "#";
    }, this.brLeft);
    return rc + this.brRight;
  }

  public validate(record: Object): boolean {
    return this.elements.reduce((prev, curr) => {
      return curr.operator
        ? curr.operator.execute(prev, curr.term.validate(record))
        : curr.term.validate(record);
    }, true);
  }

  public isTop(): boolean {
    return this.up !== null;
  }

  // TODO evtl. Zugriff einschraenken
  public getElements() {
    return this.elements;
  }

  public reset() {
    this.elements = [];
  }

  public addElement(op: LogicalOperator, term: Term) {
    // TODO .up fuer Bracket hier einsetzen??
    if (this.elements.length > 0) {
      this.elements.push(new Element(op, term));
    } else {
      this.elements.push(new Element(null, term));
    }
  }

  public removeElement(el: Element) {
    // TODO das ist erstmal ein Platzhalter
    //      vermutlich muss ueber Term gesucht werden, ausserdem ist offen ob auch rekursiv
    //      gesucht werden muesste und ob ein Vergleich elements[i].term == term funktioniert
    this.elements.splice(this.elements.indexOf(el), 1);
  }

  isBracket(): boolean {
    return true;
  }
}
