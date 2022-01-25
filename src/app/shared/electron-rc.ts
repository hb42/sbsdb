/**
 * Fuer Rueckmeldung aus der electron runtime
 *
 * rc: 1 = info, 2 = warn, 3 = error
 */
export interface ElectronRc {
  rc: number;
  info: string;
}
