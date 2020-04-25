import { TransportElement } from "./transport-element";

/**
 * Map-Entry fuer den JSON-Export
 */
export class TransportFilter {
  constructor(
    public key: number,
    public name: string,
    public filter: TransportElement[],
    public type?: number
  ) {
    this.key = key ?? 0;
    this.name = name ?? "";
    this.filter = filter ?? [];
    this.type = type ?? 0; // 0 == userdefined, 1 == global filter
  }
}
