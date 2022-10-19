export class Vlan {
  id: number;
  ip: number;
  netmask: number;
  bezeichnung: string;
  // berechnet
  public inUse?: number;
  public ipStr?: string;
  public nmStr?: string;
}
