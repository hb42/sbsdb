import { LogicalOperator } from "./logical-operator";
import { Term } from "./term";

/**
 * Teil ein eines Filter-Ausdrucks
 *
 * Jeweils der logische Operator und der rechte Teil des logischen Ausdrucks.
 * Fuer den ersten Ausdruck der Kette ist der operator null.
 */
export class Element {
  private static counter = 0;
  private cnt: number;

  public get count(): number {
    return this.cnt;
  }

  constructor(public operator: LogicalOperator | null, public term: Term) {
    this.cnt = Element.counter++;
  }
}
