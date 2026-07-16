import { getTextColorFromBackground } from "../lib/helpers.js";

/**
 * Adds a value label to a mini horizontal bar chart.
 *
 * The label is positioned either inside or outside the bar depending on
 * the available bar width. Labels inside the bar use a contrast colour
 * based on the supplied bar colour. Labels outside the bar use dark grey.
 *
 * @param {Object} params - Function parameters.
 * @param {d3.Selection} params.svg - The SVG container to append the label to.
 * @param {number} params.value - The numeric value represented by the bar.
 * @param {Function} params.xScale - D3 linear scale used to position the bar on the x-axis.
 * @param {number} params.width - Width of the SVG.
 * @param {number} params.height - Height of the SVG.
 * @param {number} params.pad - Padding inside the SVG.
 * @param {string} params.barColour - Fill colour of the bar.
 * @param {string} params.numberFormat - D3 number format string used for the label.
 *
 * @returns {void}
 */
export function addMiniBarLabel({
    svg,
    value,
    xScale,
    width,
    height,
    pad,
    barColour,
    numberFormat
}) {
    const x0 = xScale(0);
    const valueX = xScale(value);

    const barStart = Math.min(x0, valueX);
    const barEnd = Math.max(x0, valueX);

    const padding = 4;
    const threshold = (width - (pad * 2)) / 7;
    const isSmall = Math.abs(valueX - x0) < threshold;

    const formattedValue = d3.format(numberFormat)(value);

    let x;
    let textAnchor;
    let fill;

    if (value === 0 || isSmall) {
        x = value >= 0 ? barEnd + padding : barStart - padding;
        textAnchor = value >= 0 ? "start" : "end";
        fill = "#414042";
    } else {
        x = value > 0 ? barEnd - padding : barStart + padding;
        textAnchor = value > 0 ? "end" : "start";
        fill = getTextColorFromBackground(barColour);
    }

    const label = svg.append("text")
        .attr("class", "dataLabels")
        .attr("x", x)
        .attr("y", height / 2)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", textAnchor)
        .style("font-size", "14px")
        .attr("fill", fill)
        .text(formattedValue);

    const bbox = label.node().getBBox();

    if ((bbox.x < pad || bbox.x + bbox.width > width - pad) && value !== 0) {
        label
            .attr("x", value > 0 ? barEnd - padding : barStart + padding)
            .attr("text-anchor", value > 0 ? "end" : "start")
            .attr("fill", getTextColorFromBackground(barColour));
    }
}



/**
 * Draw a miniature horizontal bar chart inside a table cell.
 *
 * Creates a single-value bar centred on zero, including a background range
 * bar, zero line, optional data label and screen-reader-only text.
 *
 * @param {Object} params Function parameters.
 * @param {d3.Selection} params.cell D3 selection of the target table cell.
 * @param {Object} params.row Row data object.
 * @param {Object} params.d Bar column definition.
 * @param {string} params.d.col Source column containing the bar value.
 * @param {Object} params.config Table configuration object.
 * @param {Object} params.barScales Precomputed bar chart scales.
 * @param {number} params.barHeight Height of the bar.
 * @returns {void}
 */
export function addBars({
    cell,
    row,
    d,
    config,
    barScales,
    barHeight
}) {
    const raw = (row[d.col] ?? "").toString().trim();

    if (raw === "" || isNaN(+raw)) {
        cell.text(config.nullText);
        return;
    }

    const numVal = +raw;
    const formattedValue = d3.format(config.bars.numFormat)(Math.abs(numVal));

    const zeroX = barScales.x(0);
    const valueX = barScales.x(numVal);

    const barColour =
        numVal > 0
            ? config.bars.colourPalette[0]
            : numVal < 0
                ? config.bars.colourPalette[1]
                : config.bars.colourPalette[2];

    const svg = cell.append("svg")
        .attr("width", barScales.width)
        .attr("height", barScales.height)
        .attr("aria-hidden", "true");

    svg.append("rect")
        .attr("x", barScales.x.range()[0])
        .attr("y", 0)
        .attr("width", barScales.x.range()[1] - barScales.x.range()[0])
        .attr("height", barHeight)
        .attr("fill", ONScolours.grey10);

    svg.append("rect")
        .attr("x", Math.min(zeroX, valueX))
        .attr("y", 0)
        .attr("width", Math.abs(valueX - zeroX))
        .attr("height", barHeight)
        .attr("fill", barColour);

    svg.append("line")
        .attr("x1", zeroX)
        .attr("x2", zeroX)
        .attr("y1", 0)
        .attr("y2", barHeight)
        .attr("stroke-width", 1)
        .attr("stroke", ONScolours.grey100);

    if (config.bars.dataLabels) {
        addMiniBarLabel({
            svg,
            value: numVal,
            xScale: barScales.x,
            width: barScales.width,
            height: barScales.height,
            pad: barScales.pad,
            barColour,
            numberFormat: config.bars.numFormat
        });
    }

    cell.append("span")
        .attr("class", "visually-hidden")
        .text(formattedValue);
}