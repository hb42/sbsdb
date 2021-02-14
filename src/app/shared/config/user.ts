// dieser Datentyp kommt vom Server
// -> hb.SbsdbServer.Model.ViewModel.UserSession

export interface User {
  uid: string;
  isAdmin: boolean;
  isReadonly: boolean;
  isHotline: boolean;

  settings: string; // JSON-BLOB
}
