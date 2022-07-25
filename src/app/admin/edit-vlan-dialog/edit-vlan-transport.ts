import { Vlan } from "../../shared/model/vlan";

export interface EditVlanTransport {
  del: boolean;
  vlan: Vlan;
}
