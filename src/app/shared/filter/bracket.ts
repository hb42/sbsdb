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
  public up: Bracket | null;
  public elements: Element[] = [];
  private brLeft = this.up ? "(" : "{";
  private brRight = this.up ? ")" : "}";

  constructor() {
    // nop
  }

  public toString(): string {
    const rc = this.elements.reduce((prev, curr) => {
      return curr.operator
        ? prev + " " + curr.operator.toString() + " " + curr.term.toString()
        : prev + " " + curr.term.toString();
    }, this.brLeft);
    return rc + this.brRight;
  }

  public validate(record: object): boolean {
    return this.elements.reduce((prev, curr) => {
      return curr.operator
        ? curr.operator.execute(prev, curr.term.validate(record))
        : curr.term.validate(record);
    }, true);
  }

  public isTop(): boolean {
    return this.up !== null;
  }

  public reset() {
    this.elements = [];
  }

  public addElement(op: LogicalOperator, term: Term) {
    term.up = this;
    if (this.elements.length > 0) {
      this.elements.push(new Element(op, term));
    } else {
      this.elements.push(new Element(null, term));
    }
  }

  public addElementAt(after: Element, op: LogicalOperator, term: Term) {
    let idx = this.elements.indexOf(after);
    if (idx >= 0) {
      term.up = this;
      this.elements.splice(++idx, 0, new Element(op, term));
    }
  }

  public removeElement(el: Element) {
    const index = this.elements.indexOf(el);
    this.elements.splice(index, 1);
    // wenn das erste Element entfernt wurde, muss bei der neuen Nr. 1
    // der Operator entfernt werden.
    if (index === 0 && this.elements.length > 0) {
      this.elements[0].operator = null;
    }
  }

  public isBracket(): boolean {
    return true;
  }
}
