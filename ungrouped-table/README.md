# Icon Table

A table where one column has icons before the category labels.

## Config options

* `graphicDataURL`: the file path to the data.
    * the first column must be called `name` and provides the row headers.  
    * the remaining columns contain the table data.
* `colTypes`: character string defining the column types (excluding the `name` column), e.g. `"nnnn"` where `d = date`, `n = number`, `t = text`, and `h = html`.  
    * this controls alignment and formatting for each column.  
    * the order must match the data columns exactly.
* `iconColumn`: the name of the column that contains category values.  
    * this column will display a coloured circle alongside the text.  
    * values in this column are used to generate the colour scale and legend (if enabled).
* `circleRadius`: diameter of the category indicator circle in pixels.  
    * applied consistently to both table cells and legend items.
* `colourPalette`: array of colours used for category values.  
    * colours are assigned in order to each unique category value.  
    * should contain at least as many colours as there are categories.
* `legend`: controls legend behaviour.  
    * `"auto"` (default): uses category values directly as legend items.  
    * `"custom"`: uses `legendText` to define order and descriptions.  
    * `false`: disables the legend entirely (circles remain in table).
* `legendText`: array defining legend items when `legend` is set to `"custom"`.  
    * each item must include:  
        * `value`: category value (must match the data exactly)  
        * `description`: optional explanatory text  
    * the order of this array controls the legend order.
* `nullText`: the text to display for empty or missing values.
* `firstColHeader`: the label to place in the top left cell. `null` by default since most category names don't need a label.
* `numberFormat`: defines how numeric columns are formatted.  
    * can be a single format string (applied to all numeric columns), or  
    * an array of format strings matching each column in `colTypes`.
* `tableDescription`: Table description to be added to caption.
* `sourceText`: the source text (not including *Source: *).
* `minColWidth`: minimum column width in pixels, across all columns.
* `maxColWidth`: maximum column width in pixels, across all columns.

