export interface TagChange {
  apId: number;
  tagId: number | null; // null -> DEL
  apTagId: number | null; // null -> NEW
  text: string;
}
