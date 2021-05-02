import { TagChange } from "../edit-tags/tag-change";

export interface EditApTransport {
  id: number;
  tags: TagChange[] | null;
}
