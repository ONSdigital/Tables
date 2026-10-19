# Tables

Templates for tables created by the data visualisation team, including static, interactive, and chables.

This repository is a work-in-progress. It currently contains two table templates (ungrouped and grouped row) which defines the structure of the table.

* Ungrouped: rectangular table with no merged cells or grouping.
* Grouped row: where sets of rows belong to the some categories. Structure based on <https://www.w3.org/WAI/tutorials/tables/multi-level/#table-with-three-headers-related-to-each-data-cell>.

The following features have or will be available for each table template and can be switched on in the config files. The default is that all of these options (besides numbers and text) are switched off.

|                          | Ungrouped | Grouped row | Notes                    |
|--------------------------|-----------|-------------|--------------------------|
| **Visual features**      |           |             |                          |
| Numbers                  | Yes       | Yes         | Right aligned            |
| Text                     | Yes       | Yes         | Left aligned             |
| HTML Text                | Yes       | Yes         | Left aligned (or right)  |
| Category icons           | Yes       | Yes         |                          |
| Arrow icons              | Yes       | Yes         |                          |
| Sparklines               | Yes       | Yes         |                          |
| Bars                     | Yes       | Yes         |                          |
| Top left column title    | Yes       | No          |                          |
| Striped rows             | Yes       | Yes         |                          |
| **Interactive features** |           |             |                          |
| Pagination               | Yes       | Yes         | Default 10 rows per page |
| Freeze first column      | Yes       | Yes         |                          |
| Filtering                | Yes       | Yes         |                          |
| Sorting                  | Yes       | No          |                          |
| Search                   | Yes       | Yes         |                          |

## Usage notes

* When using these in a publication, the table title should begin with "Table X: ..." not "Figure X: ...".
* Modify the width of individual columns with CSS if required, e.g., to set the maximum width of the second column:

```css
table td:nth-child(2), table th:nth-child(2) {
    max-width: 100px !important;
}
```

## Other links

* ONS Design System Tables: [service-manual.ons.gov.uk/design-system/components/table](https://service-manual.ons.gov.uk/design-system/components/table)
* Formatting datasets: [service-manual.ons.gov.uk/content/content-types/datasets](https://service-manual.ons.gov.uk/content/content-types/datasets)

## Other templates

* Charts: [github.com/ONSdigital/Charts](https://github.com/ONSdigital/Charts)
* Maps: [github.com/ONSdigital/Maps](https://github.com/ONSdigital/Maps)
