export enum RelOp {
  nop = "N/A",
  like = "ENTHÄLT", // string
  notlike = "ENTHÄLT NICHT", // string
  equal = "GLEICH", // string, number, date
  notequal = "UNGLEICH", // string, number, date
  inlist = "IST GLEICH", // analog equal f. Listen
  notinlist = "IST UNGLEICCH", // analog equal f. Listen
  startswith = "BEGINNT MIT", // string
  endswith = "ENDED MIT", // string
  exist = "VORHANDEN", // alle
  notexist = "NICHT VORHANDEN", // alle
  gtNum = "GRÖSSER ALS", // number, date
  ltNum = "KLEINER ALS", // number, date
}
