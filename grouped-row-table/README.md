# Grouped Simple Table

A table where rows are grouped together into categories.

## Config options

* `graphicDataURL`: the file path to the data.
    * the first column should be called `group` and provides the row group variables.
    * the second column should be called `name` and provides the (nested) row headers.
    * the remaining columns are the data columns.
* `colTypes`: character string defining the column types e.g. `"nnnn"` where `d = date`, `n = number`, `t = text`, and `h = html`. The `name` column is not included here as it is always left aligned.
* `nullText`: the text to display for empty or missing values.
* `numberFormat`: defines how numeric columns are formatted.  
    * can be a single format string (applied to all numeric columns), or  
    * an array of format strings matching each column in `colTypes`.
* `tableDescription`: Table description to be added to caption.
* `sourceText`: the source text (not including *Source: *).
* `minColWidth`: minimum column width in pixels, across all columns.
* `maxColWidth`: maximum column width in pixels, across all columns.

## Accessibility

* Formal accessibility tested still to be carried out.
* Based on Example 2 in [this guide](https://www.w3.org/WAI/tutorials/tables/multi-level/), using the `headers` attribute to properly associated headers with the data cell.
* Table title and subtitle are implemented as text so that they do not scroll with the title. However, the content is repeated and visually hidden as a `caption` so that screenreaders can access the table more easily.
