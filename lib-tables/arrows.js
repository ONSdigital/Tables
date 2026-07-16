/**
 * Draw an arrow indicator inside a table cell.
 *
 * Displays an up/down arrow with optional formatted value, coloured
 * background and descriptive text based on whether the value is
 * positive, negative or zero.
 *
 * @param {Object} params Function parameters.
 * @param {d3.Selection} params.cell D3 selection of the target table cell.
 * @param {Object} params.d Column definition object.
 * @param {*} params.d.value Value to display.
 * @param {Object} params.config Table configuration object.
 * @returns {void}
 */
export function addArrows({
    cell,
    d,
    config
}) {
    const raw = (d.value ?? "").toString().trim();
    const numVal = raw === "" ? NaN : +raw;

    const changeText =
        numVal < 0 ? "lower" :
            numVal > 0 ? "higher" :
                "No change";

    const arrowColour =
        numVal < 0 ? config.arrowIcons.colourPalette[0] :
            numVal > 0 ? config.arrowIcons.colourPalette[1] :
                config.arrowIcons.colourPalette[2];

    const arrowSymbol =
        numVal > 0 ? "<img src='../lib-tables/uparrow.svg' alt='Arrow pointing up' width='12' height='14'>" :
            numVal < 0 ? "<img src='../lib-tables/downarrow.svg' alt='Arrow pointing down' width='12' height='14'>" :
                ""

    const formattedValue = d3.format(config.arrowIcons.numFormat)(Math.abs(numVal));

    const wrapper = cell.append("span")
        .style("display", "inline-flex")
        .style("align-items", "center")
        .style("gap", "4px")
        .style(
            "background-color",
            d3.color(arrowColour).copy({ opacity: 0.3 })
        )
        .style("padding", "8px");

    wrapper.append("span")
        .attr("class", "arrow-icon")
        .attr("aria-hidden", "true")
        .html(arrowSymbol);

    if (numVal !== 0) {
        wrapper.append("span")
            .style("font-weight", "bold")
            .text(formattedValue + config.arrowIcons.suffixText);
    }

    wrapper.append("span")
        .text(changeText);
}