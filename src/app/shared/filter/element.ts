import { environment } from "../../../environments/environment";
import { LogicalOperator } from "./logical-operator";
import { Term } from "./term";

/**
 * Teil ein eines Filter-Ausdrucks
 *
 * Jeweils der logische Operator und der rechte Teil des logischen Ausdrucks.
 * Fuer den ersten Ausdruck der Kette ist der operator null.
 */
export class Element {
  constructor(public operator: LogicalOperator | null, public term: Term) {
    if (!environment.production) console.debug(`c'tor ${this.constructor.name}`);
  }
}
