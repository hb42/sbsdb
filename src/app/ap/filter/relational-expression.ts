import { Expression } from "./expression";
import { RelationalOperator } from "./relational-operator";

export interface RelationalExpression<T> extends Expression<T> {
  display: string;  // Anzeige
  left: string;     // Feldname
  op: RelationalOperator;
  right: string;
}
