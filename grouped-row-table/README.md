# Grouped row table

A table where rows are grouped together into categories.

### General table settings

- `graphicDataURL`: Path to the data file used by the table.
  - Usually a CSV file.
  - Example: `"data.csv"`
- `colTypes`: Defines the type of each data column (excluding the row label column). NB. currently includes sparklines etc but will be changing.
  - Supported values:
    - `t` = text
    - `n` = number
    - `d` = date
    - `h` = HTML
- `nullText`: Text displayed when a value is null, missing or invalid.
- `numberFormat`: Default D3 number format applied to numeric columns.
- `tableDescription`: Screen reader description of the table. Should explain the purpose and content of the table.
- `sourceText`: Source displayed beneath the table.
- `minColWidth`: Minimum column width in pixels.
- `maxColWidth`: Maximum column width in pixels.

### Category icons

- `categoryIcons.enabled`: Enables category icon rendering.
- `categoryIcons.columns`: Array of columns that should be rendered as 
- `categoryIcons.circleRadius`: Diameter of each category icon circle in pixels.
- `categoryIcons.colourPalette`: Colour palette used for category values.
- `categoryIcons.legend`: Controls legend behaviour.
  - `false` = no legend.
  - `"auto"` = automatically generate legend entries from category values.
  - `"custom"` = use the entries defined in `legendText`.
- `categoryIcons.legendText`: Custom legend definitions used when `legend` is set to `"custom"`. Each item must contain:
    - `value` = category name.
    - `description` = explanatory text.

### Arrow icons

- `arrowIcons.enabled`: Enables arrow icon rendering.
- `arrowIcons.columns`: Columns that should display arrows. Should be numeric values.
- `arrowIcons.colourPalette`: Array containing colours for:
    - Positive values.
    - Negative values.
    - Zero values.
- `arrowIcons.numFormat`: D3 format applied to displayed values.
- `arrowIcons.suffixText`: Text appended after the formatted value.

### Sparklines

- `sparklines.enabled`: Enables sparkline rendering.
- `sparklines.columns`: Inclusive start and end column names used to create each sparkline. All columns within the specified range are combined into a single sparkline column.
- `sparklines.title`: Header shown above the sparkline column.
- `sparklines.colourPalette`: Colour palette used when rendering sparklines.
- `sparklines.yAxisRange`: Controls the Y-axis scale.
  - `"auto"` = calculate from the data.
  - `[min, max]` = use a fixed scale.
- `sparklines.drawZero`: When `true`, draws a horizontal zero reference line and fills with a shaded area

### Bars 

- `bars.enabled`: Enables mini bar chart rendering.
- `bars.columns`: Array of columns to render as bar charts.
- `bars.xAxisRange`: Controls the bar chart scale.
  - `"auto"` = calculate range from the data.
  - `[min, max]` = use a fixed range.
- `bars.dataLabels`: When `true`, displays formatted values as labels on the bars.
- `bars.numFormat`: D3 number format used for bar labels.
- `bars.colourPalette`: Array containing colours for:
    - Positive values.
    - Negative values.
    - Zero values.

### Freeze first row

- `freezeFirstColumn.enabled`: Keeps the first column fixed while horizontally scrolling.
- `freezeFirstColumn.firstColWidth`: Width of the frozen first column in pixels.

### Pagination

- `pagination.enabled`: Set to true to enable pagination. Set to false to display all rows in the table.
- `pagination.numRows`: Sets the number of data rows to display on each page when pagination is enabled.

## Features not yet implemented but coming soon

* Option to bold format some rows
* Option to force same height across all rows
* Filters
* Search

## Accessibility

* Formal accessibility tested still to be carried out.
* Based on Example 2 in [this guide](https://www.w3.org/WAI/tutorials/tables/multi-level/), using the `headers` attribute to properly associated headers with the data cell.

