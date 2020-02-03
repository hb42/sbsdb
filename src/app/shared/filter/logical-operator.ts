/**
 * Logischer Operator fuer einen Filter
 * AND bzw. OR
 */
export interface LogicalOperator {
  // Operator fuert die beiden Ausdruecke ausfuehren
  execute(left: boolean, right: boolean): boolean;

  // Textausgabe
  toString(): string;
}
