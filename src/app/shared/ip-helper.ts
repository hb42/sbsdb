export class IpHelper {
  public static NULL_MAC = "000000000000";

  private static macString = /^(.{2})(.{2})(.{2})(.{2})(.{2})(.{2})$/;
  private static macCheck =
    /^\s*([0-9a-fA-F]{2})[-:.]?([0-9a-fA-F]{2})[-:.]?([0-9a-fA-F]{2})[-:.]?([0-9a-fA-F]{2})[-:.]?([0-9a-fA-F]{2})[-:.]?([0-9a-fA-F]{2})\s*$/;
  private static ipString =
    /^\s*(\d|[01]?\d\d|2[0-4]\d|25[0-5])\.(\d|[01]?\d\d|2[0-4]\d|25[0-5])\.(\d|[01]?\d\d|2[0-4]\d|25[0-5])\.(\d|[01]?\d\d|2[0-4]\d|25[0-5])\s*$/;
  private static ipStringPart =
    /^\s*(\d|[01]?\d\d|2[0-4]\d|25[0-5])(?:\.(\d|[01]?\d\d|2[0-4]\d|25[0-5]))?(?:\.(\d|[01]?\d\d|2[0-4]\d|25[0-5]))?(?:\.(\d|[01]?\d\d|2[0-4]\d|25[0-5]))?\s*$/;

  /**
   * IP-String in die numerische Darstellung umrechnen
   *
   * @param ip
   */
  public static getIp(ip: string): number | null {
    return this.getIpNumber(ip, this.ipString);
  }

  /**
   * Teil-IP-String in die numerische Darstellung umrechnen
   * (fuer Host-Teil, wenn netmask < 24,
   *  z.B. "2.13" = 2*256 + 13 = 525)
   *
   * @param ip
   */
  public static getIpPartial(ip: string): number | null {
    return this.getIpNumber(ip, this.ipStringPart);
  }

  private static getIpNumber(ip: string, regex: RegExp): number | null {
    const nums: number[] = [];
    const ips = regex.exec(ip);
    if (ips) {
      for (let i = 4; i > 0; i--) {
        if (ips[i] !== undefined) {
          nums.push(Number.parseInt(ips[i], 10));
        }
      }
      return nums.reduce((prev, n, idx) => (prev += n * 256 ** idx), 0);
    } else {
      return null;
    }
  }

  /**
   * MAC-String aus DB fuer die Darstellung aufbereiten
   *
   * @param mac
   */
  public static getMacString(mac: string): string {
    // kein match => Eingabe-String
    return mac.replace(this.macString, "$1:$2:$3:$4:$5:$6").toUpperCase();
  }

  /**
   * Eingegebene MAC-Adresse ueberpruefen und bei Erfolg ohne Sonderzeichen
   * (':', '-', '.') zuruecklieferen. Im Fehlerfall wird null geliefert.
   *
   * @param mac
   */
  public static checkMacString(mac: string): string | null {
    if (mac == null || mac === "0") {
      return IpHelper.NULL_MAC;
    }
    if (this.macCheck.test(mac)) {
      return mac.replace(this.macCheck, "$1$2$3$4$5$6").toUpperCase();
    } else {
      return null;
    }
  }

  /**
   * IP aus 32bit-Int in Stringdarstellung umrechnen
   *
   * @param ip
   */
  public static getIpString(ip: number): string {
    return IpHelper.getPartialIpString(ip, 4);
  }

  /**
   * Teil der IP-Adresse in Stringdarstellung umwandeln
   *
   * @param ip
   * @param bytes
   */
  public static getPartialIpString(ip: number, bytes: number): string {
    let rc: string;
    for (let i = bytes; i > 0; i--) {
      const ipbyte = ip & 0xff;
      ip = ip >>> 8;
      rc = rc ? `${ipbyte}.${rc}` : `${ipbyte}`;
    }
    return rc;
  }

  /**
   * Netmask als 32bit-Integer
   *
   * @param netmask
   */
  public static getNetmask(netmask: number): number {
    if (netmask <= 32) {
      const host = 32 - netmask;
      const low = host ** 2 - 1;
      return 0xffff_ffff ^ low;
    } else {
      return netmask;
    }
  }

  /**
   * Signifikante Bits der Netmask
   * (z.B. 255.255.255.0 -> 24)
   * Fuer eine ungueltige Netmask wird 0 geliefert.
   *
   * @param netmask
   */
  public static getNetmaskBits(netmask: number): number {
    const bits = IpHelper.getHostBits(netmask);
    return bits ? 32 - bits : 0;
  }

  /**
   * Signifikante Bits des Hostteils der Netmask
   * (32 - NetmaskBits)
   * Fuer eine ungueltige Netmask wird 0 geliefert.
   *
   * @param netmask
   */
  public static getHostBits(netmask: number): number {
    if (netmask <= 32) {
      return netmask;
    } else {
      const bits = Math.log2(~netmask + 1);
      return Number.isInteger(bits) ? bits : 0;
    }
  }

  /**
   * Bytes fuer den Host-Teil
   * (fuer netmasks < 24)
   *
   * @param netmask
   */
  public static getHostBytes(netmask: number): number {
    const bits = IpHelper.getHostBits(netmask);
    return Math.trunc((bits - 1) / 8) + 1;
  }

  /**
   * Minimaler Wert fuer den Hostteil der IP-Adresse
   * (fuer die erste gueltige Adresse 1 addieren)
   *
   * @param net
   * @param netmask
   */
  public static getHostIpMin(net: number, netmask: number): number {
    const bytes = IpHelper.getHostBytes(netmask);
    const mask = 256 ** bytes - 1;
    return net & mask;
  }

  /**
   * Maximaler Wert fuer den Hostteil der IP-Adresse
   * (fuer die letzte gueltige Adresse 1 subtrahieren)
   *
   * @param net
   * @param netmask
   */
  public static getHostIpMax(net: number, netmask: number): number {
    const hostbits = this.getHostBits(netmask);
    const min = IpHelper.getHostIpMin(net, netmask);
    return 2 ** hostbits - 1 + min;
  }

  /**
   * Host-Teil der Adresse als int
   *  z.B. 5.77.42.120/24  -> 120 (Netz: 5.77.42.0)
   *       5.77.200.45/25  -> 25  (Netz: 5.77.200.0)
   *       5.77.200.129/25 -> 1   (Netz: 5.77.200.128)
   *  => die vollstaendige Adresse ist die Addition von Netz- und Host-Teil
   *
   * @param host
   * @param netmask
   */
  public static getHostIp(host: number, netmask: number): number {
    netmask = IpHelper.getNetmask(netmask); // falls nur die Bit-Zahl geliefert wird
    return host & ~netmask;
  }
}
