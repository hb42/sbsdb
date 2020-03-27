import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";

@Injectable()
export class MatPaginatorIntlDe extends MatPaginatorIntl {
  public itemsPerPageLabel = "Zeilen pro Seite";
  public nextPageLabel = "Nächste Seite";
  public previousPageLabel = "Vorherige Seite";
  public lastPageLabel = "Letzte Seite";
  public firstPageLabel = "Erste Seite";

  public getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) {
      return ` Seite ${page + 1} (0 von ${length})`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return ` Seite ${page + 1} (${startIndex + 1} - ${endIndex} von ${length})`;
  };
}
