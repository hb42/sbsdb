export interface Expression<T> {
  runExpression(record: T): boolean;
}
