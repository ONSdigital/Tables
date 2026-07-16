
/**
 * Draw a sparkline inside a table cell.
 *
 * Creates a sparkline from the columns specified in `d.cols`, optionally
 * shading the area back to zero and adding a screen-reader-only description.
 *
 * @param {Object} params Function parameters.
 * @param {d3.Selection} params.cell D3 selection of the target table cell.
 * @param {Object} params.row Row data object.
 * @param {Object} params.d Sparkline column definition.
 * @param {string[]} params.d.cols Columns to include in the sparkline series.
 * @param {string} params.d.title Accessible label used for screen readers.
 * @param {Object} params.config Table configuration object.
 * @param {string} params.config.nullText Text displayed when no valid data exists.
 * @param {Object} params.config.sparklines Sparkline configuration.
 * @param {boolean} params.config.sparklines.drawZero Whether to draw a zero line and shaded area.
 * @param {string[]} params.config.sparklines.colourPalette Colour palette for sparkline rendering.
 * @param {Object} params.sparklineScales Precomputed sparkline scales.
 * @param {number} params.sparklineScales.width SVG width.
 * @param {number} params.sparklineScales.height SVG height.
 * @param {d3.ScalePoint} params.sparklineScales.x X scale.
 * @param {d3.ScaleLinear} params.sparklineScales.y Y scale.
 * @returns {void}
 */
export function addSparkline({
    cell,
    row,
    d,
    config,
    sparklineScales
}) {
    const series = d.cols
        .map(col => {
            const raw = (row[col] ?? "").toString().trim();
            return {
                col,
                value: raw === "" ? null : +raw
            };
        })
        .filter(p => p.value !== null && !isNaN(p.value));

    if (!series.length) {
        cell.text(config.nullText);
        return;
    }

    const svg = cell.append("svg")
        .attr("width", sparklineScales.width)
        .attr("height", sparklineScales.height)
        .attr("aria-hidden", "true");

    const line = d3.line()
        .x(d => sparklineScales.x(d.col))
        .y(d => sparklineScales.y(d.value));

    if (config.sparklines.drawZero) {
        const zeroY = sparklineScales.y(0);

        const area = d3.area()
            .x(d => sparklineScales.x(d.col))
            .y0(zeroY)
            .y1(d => sparklineScales.y(d.value));

        svg.append("path")
            .datum(series)
            .attr("fill", config.sparklines.colourPalette[0])
            .attr("fill-opacity", 0.2)
            .attr("d", area);

        svg.append("line")
            .attr("x1", sparklineScales.x.range()[0])
            .attr("x2", sparklineScales.x.range()[1])
            .attr("y1", zeroY)
            .attr("y2", zeroY)
            .attr("stroke", ONScolours.grey40)
            .attr("stroke-width", 1);
    }

    svg.append("path")
        .datum(series)
        .attr("fill", "none")
        .attr("stroke", config.sparklines.colourPalette[0])
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", line);

    const descriptionText = series
        .map(v => `${v.col}: ${v.value !== null && !isNaN(v.value) ? v.value : config.nullText}`)
        .join(", ");

    cell.append("span")
        .attr("class", "visually-hidden")
        .text(`${d.title} — ${descriptionText}`);
}