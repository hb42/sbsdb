import { Adresse } from "../../shared/model/adresse";

export interface EditAdresseTransport {
  del: boolean;
  adresse: Adresse;
}
