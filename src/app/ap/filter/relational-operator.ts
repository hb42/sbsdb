export interface RelationalOperator {
  display: string;

  run(left: string, right: string): boolean;
}
