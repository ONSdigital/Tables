# Grouped Row Table

A table where rows are grouped together into categories.

## Config options

* `graphicDataURL`: the file path to the data.
    * the first column should be called `group` and provides the row group variables.
    * the second column should be called `name` and provides the (nested) row headers.
    * the remaining columns are the data columns.
* `colTypes`: character string defining the column types e.g. `"nnnn"` where `d = date`, `n = number`, and `t = text`. The `group` and `name` columns are not included here as they are always left aligned.
* `titleText`: the text that should appear in the title (including table number).
*  `subtitleText`: the (optional) text that should appear in the subtitle.
* `sourceText`: the source text (not including *Source: *).
* `minColWidth`: minimum column width in pixels, across all columns.
* `maxColWidth`: maximum column width in pixels, across all columns.

## Accessibility

* Formal accessibility tested still to be carried out.
* Based on Example 2 in [this guide](https://www.w3.org/WAI/tutorials/tables/multi-level/), using the `headers` attribute to properly associated headers with the data cell.
* Table title and subtitle are implemented as text so that they do not scroll with the title. However, the content is repeated and visually hidden as a `caption` so that screenreaders can access the table more easily.
