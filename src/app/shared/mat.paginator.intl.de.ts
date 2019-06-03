import { MatPaginatorIntl } from "@angular/material/paginator";

export class MatPaginatorIntlDe extends MatPaginatorIntl {
  itemsPerPageLabel = "Zeilen pro Seite";
  nextPageLabel = "Nächste Seite";
  previousPageLabel = "Vorherige Seite";
  lastPageLabel = "Letzte Seite";
  firstPageLabel = "Erste Seite";

  getRangeLabel = function (page, pageSize, length) {
    if (length === 0 || pageSize === 0) {
      return ` Seite ${page + 1} (0 von ${length})`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
    return ` Seite ${page + 1} (${startIndex + 1} - ${endIndex} von ${length})`;
  };

}
