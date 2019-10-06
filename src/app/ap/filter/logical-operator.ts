export interface LogicalOperator {
  display: string;

  run(left: boolean, right: boolean): boolean;
}
