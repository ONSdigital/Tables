import { addSource } from "../lib/helpers.js";
import { addBars } from "../lib-tables/bars.js";
import { addSparkline } from "../lib-tables/sparklines.js";
import { addArrows } from "../lib-tables/arrows.js";

let container = d3.select('#table-container');
let tableData;
let pymChild = null;

/* =========================================================
   MAIN RENDER FUNCTION
   ========================================================= */
function drawTable() {

    container.html("");

    // Category icons
    let categoryColumns = Array.isArray(config.categoryIcons.columns) ? config.categoryIcons.columns : [config.categoryIcons.columns];
    let legendMode = config.categoryIcons.legend ?? "auto";
    let categoryScale = null;
    let categories = [];
    let legendItemsData = [];

    /* ---------------------------------------------
   NORMALISE COLUMN TYPES + NUMBER FORMATTERS
   --------------------------------------------- */
    const colTypes = config.colTypes.split("");

    const numberFormatters = (() => {
        // single format → apply to all numeric columns
        if (typeof config.numberFormat === "string") {
            return colTypes.map(t =>
                t === "n" ? d3.format(config.numberFormat) : null
            );
        }

        // array of formats → per column
        if (Array.isArray(config.numberFormat)) {
            return colTypes.map((t, i) => {
                const fmt = config.numberFormat[i];
                return (t === "n" && fmt) ? d3.format(fmt) : null;
            });
        }

        return [];
    })();


    /* =========================================================
       COLUMN STRUCTURE
       ========================================================= */
    const allColumns = tableData.columns;
    const groupColumn = config.groupCol;
    const dataColumns = allColumns.filter(c => c !== groupColumn);
    const nameColumn = dataColumns[0];
    const valueColumns = dataColumns.slice(1);
    const grouped = d3.group(tableData, d => d[groupColumn]);


    /* =========================================================
       CATEGORY + LEGEND DATA PREP
    ========================================================= */
    if (config.categoryIcons.enabled) {

        const rawCategories = Array.from(
            new Set(
                tableData.flatMap(d =>
                    categoryColumns
                        .map(col => (d[col] ?? "").toString().trim())
                        .filter(v => v !== "")
                )
            )
        );

        if (legendMode === "custom" && Array.isArray(config.categoryIcons.legendText)) {
            legendItemsData = config.categoryIcons.legendText;
            categories = legendItemsData.map(d => d.value);
        } else {
            categories = rawCategories;
            legendItemsData = categories;
        }

        categoryScale = d3.scaleOrdinal()
            .domain(categories)
            .range(config.categoryIcons.colourPalette);
    }

    if (config.categoryIcons.enabled && legendMode !== false && legendItemsData.length) {

        const legend = container.append("div")
            .attr("class", "table-legend");

        const legendItems = legend.selectAll(".legend-item")
            .data(legendItemsData)
            .enter()
            .append("div")
            .attr("class", "legend-item");

        legendItems.append("span")
            .style("width", config.categoryIcons.circleRadius + "px")
            .style("height", config.categoryIcons.circleRadius + "px")
            .style("border-radius", "50%")
            .style("display", "inline-block")
            .style("margin-right", "6px")
            .style("background-color", d =>
                legendMode === "custom" ? categoryScale(d.value) : categoryScale(d)
            );

        legendItems.append("span")
            .attr("class", "legend--text")
            .text(d => {
                if (legendMode === "custom") {
                    return d.description
                        ? `${d.value}${d.description}`
                        : d.value;
                }
                return d;
            });
    }

    /* ---------------------------------------------
BAR SETUP
Renders configured columns as small horizontal bars.
--------------------------------------------- */
    let barColumns = [];
    let barScales = null;
    const barWidth = 150;
    const barHeight = 28;
    const barPad = 10;

    if (
        config.bars.enabled &&
        Array.isArray(config.bars.columns) &&
        config.bars.columns.length
    ) {
        barColumns = config.bars.columns;

        const allBarValues = tableData.flatMap(row =>
            barColumns.map(col => {
                const raw = (row[col] ?? "").toString().trim();
                return raw === "" ? null : +raw;
            })
        ).filter(v => v !== null && !isNaN(v));

        let xDomain;

        if (
            Array.isArray(config.bars.xAxisRange) &&
            config.bars.xAxisRange.length === 2
        ) {
            xDomain = config.bars.xAxisRange.map(Number);
        } else {
            xDomain = allBarValues.length
                ? d3.extent(allBarValues)
                : [0, 1];

            xDomain[0] = Math.min(xDomain[0], 0);
            xDomain[1] = Math.max(xDomain[1], 0);

            if (xDomain[0] === xDomain[1]) {
                xDomain[0] -= 1;
                xDomain[1] += 1;
            }
        }



        barScales = {
            width: barWidth,
            height: barHeight,
            pad: barPad,
            x: d3.scaleLinear()
                .domain(xDomain)
                .range([barPad, barWidth - barPad])
        };

    }

    /* ---------------------------------------------
   SPARKLINE SETUP
   --------------------------------------------- */

    let sparklineRange = null;

    if (config.sparklines.enabled && Array.isArray(config.sparklines.columns) && config.sparklines.columns.length === 2) {
        const startIdx = valueColumns.indexOf(config.sparklines.columns[0]);
        const endIdx = valueColumns.indexOf(config.sparklines.columns[1]);

        if (startIdx !== -1 && endIdx !== -1) {
            const lo = Math.min(startIdx, endIdx);
            const hi = Math.max(startIdx, endIdx);
            sparklineRange = {
                startIdx: lo,
                endIdx: hi,
                cols: valueColumns.slice(lo, hi + 1)
            };
        }
    }

    const sparklineColTitle = config.sparklines.title || "Trend";

    // columnBlocks: the list of "columns" actually rendered in the
    // table — a normal value column, or (where applicable) a single
    // block representing the whole sparkline range.
    const columnBlocks = [];

    for (let i = 0; i < valueColumns.length; i++) {
        if (sparklineRange && i === sparklineRange.startIdx) {
            columnBlocks.push({
                kind: "sparkline",
                cols: sparklineRange.cols,
                title: sparklineColTitle
            });
            i = sparklineRange.endIdx;
            continue;
        }

        if (barColumns.includes(valueColumns[i])) {
            columnBlocks.push({
                kind: "bar",
                col: valueColumns[i],
                type: colTypes[i],
                i
            });
            continue;
        }

        columnBlocks.push({
            kind: "value",
            col: valueColumns[i],
            type: colTypes[i],
            i
        });
    }

    const sparklineSvgWidth = 150;
    const sparklineSvgHeight = 70;
    const sparklinePad = 6;

    let sparklineScales = null;

    if (config.sparklines.enabled && sparklineRange) {

        const allSparklineValues = tableData.flatMap(row =>
            sparklineRange.cols.map(col => {
                const raw = (row[col] ?? "").toString().trim();
                return raw === "" ? null : +raw;
            })
        ).filter(v => v !== null && !isNaN(v));

        let yDomain;

        if (
            Array.isArray(config.sparklines.yAxisRange) &&
            config.sparklines.yAxisRange.length === 2 &&
            config.sparklines.yAxisRange.every(v => !isNaN(+v))
        ) {
            yDomain = config.sparklines.yAxisRange.map(Number);
        } else {
            yDomain = allSparklineValues.length
                ? d3.extent(allSparklineValues)
                : [0, 1];

            if (config.sparklines.drawZero) {
                yDomain[0] = Math.min(yDomain[0], 0);
                yDomain[1] = Math.max(yDomain[1], 0);
            }
        }

        if (yDomain[0] === yDomain[1]) {
            yDomain[0] -= 1;
            yDomain[1] += 1;
        }

        sparklineScales = {
            width: sparklineSvgWidth,
            height: sparklineSvgHeight,
            x: d3.scalePoint()
                .domain(sparklineRange.cols)
                .range([sparklinePad, sparklineSvgWidth - sparklinePad]),
            y: d3.scaleLinear()
                .domain(yDomain)
                .range([sparklineSvgHeight - sparklinePad, sparklinePad])
        };
    }









    /* =========================================================
       SCROLL WRAPPER
       ========================================================= */
    const scrollWrapper = container.append("div")
        .attr("class", "table-scroll")
        .style("--min-col-width", config.minColWidth + "px")
        .style("--max-col-width", config.maxColWidth + "px");

    const table = scrollWrapper.append("table");

    table.append("caption")
        .attr("class", "visually-hidden")
        .text(config.tableDescription);


    /* =========================================================
       COLGROUP
       ========================================================= */
    const colgroup = table.append("colgroup");
    colgroup.append("col").attr("class", "col--text");

    columnBlocks.forEach(d => {
        const typeChar = d.kind === "sparkline" ? "h" : d.type;
        const typeClass =
            typeChar === "n" ? "col--number" :
                typeChar === "d" ? "col--date" :
                    typeChar === "h" ? "col--text" :
                        "col--text";

        colgroup.append("col").attr("class", typeClass);
    });

    /* =========================================================
       THEAD
       ========================================================= */
    const thead = table.append("thead");
    const headerRow = thead.append("tr");
    headerRow.append("td");

    headerRow.selectAll("th")
        .data(columnBlocks.map(d => ({
            col: d.kind === "sparkline" ? d.title : d.col,
            id: d.kind === "sparkline" ? d.title : d.col,
            type: d.kind === "sparkline" ? "h" : d.type
        })))
        .enter()
        .append("th")
        .attr("scope", "col")
        .attr("id", d => d.col)
        .attr("class", d =>
            d.type === "n" ? "col--number" :
                d.type === "d" ? "col--date" :
                    "col--text"
        )
        .text(d => d.col);

    /* =========================================================
       TBODY
       ========================================================= */
    const tbody = table.append("tbody");
    const colSpan = valueColumns.length + 1;

    const ungroupedRows = [...grouped].find(([g]) => !g || g.trim() === "");

    if (ungroupedRows) {
        const [, rows] = ungroupedRows;

        rows.forEach((row, index) => {
            const rowId = `ungrouped-r${index + 1}`;
            const tr = tbody.append("tr");

            tr.append("th")
                .attr("id", rowId)
                .attr("scope", "row")
                .attr("class", "col--text")
                .text(row[nameColumn]);

            tr.selectAll("td")
                .data(columnBlocks.map(d => {
                    if (d.kind === "sparkline") {
                        return {
                            kind: "sparkline",
                            cols: d.cols,
                            col: d.title,
                            value: null,
                            type: "h",
                            i: null
                        };
                    }

                    if (d.kind === "bar") {
                        return {
                            kind: "bar",
                            col: d.col,
                            value: row[d.col],
                            type: d.type,
                            i: d.i
                        };
                    }

                    return {
                        kind: "value",
                        col: d.col,
                        value: row[d.col],
                        type: d.type,
                        i: d.i
                    };
                }))
                .enter()
                .append("td")
                .attr("headers", d => `${rowId} ${d.col}`)
                .attr("class", d =>
                    d.type === "n" ? "col--number" :
                        d.type === "d" ? "col--date" :
                            "col--text"
                )



                .each(function (d) {
                    const cell = d3.select(this);


                    /* ---------------------------------------------
                    DRAW SPARKLINES
                    --------------------------------------------- */
                    if (config.sparklines.enabled &&d.kind === "sparkline") {

                        addSparkline({
                            cell,
                            row,
                            d,
                            config,
                            sparklineScales,
                            ONScolours
                        });

                        return;
                    }


                    /* ---------------------------------------------
                    DRAW BARS
                    --------------------------------------------- */
                    if (d.kind === "bar") {

                        addBars({
                            cell,
                            row,
                            d,
                            config,
                            barScales,
                            barHeight
                        });

                        return;
                    }


                    /* ---------------------------------------------
                    DRAW ARROWS
                    --------------------------------------------- */
                    if (config.arrowIcons.enabled && config.arrowIcons.columns.includes(d.col)) {
                        addArrows({
                            cell,
                            d,
                            config
                        });

                        return;
                    }


                    /* ---------------------------------------------
                    DRAW CATEGORY ICONS
                    --------------------------------------------- */
                    const raw = (d.value ?? "").toString().trim();
                    if (raw === "") {
                        cell.text(config.nullText);
                        return;
                    }

                    if (config.categoryIcons.enabled && categoryColumns.includes(d.col)) {

                        const wrapper = cell.append("span")
                            .style("display", "inline-flex")
                            .style("align-items", "center");

                        wrapper.append("span")
                            .style("width", config.categoryIcons.circleRadius + "px")
                            .style("height", config.categoryIcons.circleRadius + "px")
                            .style("border-radius", "50%")
                            .style("display", "inline-block")
                            .style("margin-right", "6px")
                            .style("background-color", categoryScale(raw));

                        wrapper.append("span")
                            .text(raw);

                        return;
                    }

                    /* ---------------------------------------------
                    PROCESS HTML COLUMNS
                    --------------------------------------------- */
                    if (d.type === "h") {
                        cell.html(raw);
                        return;
                    }


                    /* ---------------------------------------------
                    PROCESS NUMBER COLUMNS
                    --------------------------------------------- */
                    if (d.type === "n" && !isNaN(raw) && numberFormatters[d.i]) {
                        cell.text(numberFormatters[d.i](raw));
                        return;
                    }

                    /* ---------------------------------------------
                    ALL OTHER COLUMNS
                    --------------------------------------------- */
                    cell.text(raw);
                });





        });
    }

    for (const [groupName, rows] of grouped) {
        if (!groupName || groupName.trim() === "") continue;

        const groupId = groupName.toLowerCase().replace(/\s+/g, "");


        const groupTh = tbody.append("tr")
            .append("th")
            .attr("id", groupId)
            .attr("scope", "colgroup")
            .attr("colspan", colSpan)
            .classed("colgroup-header", true);

        groupTh.append("span")
            .attr("class", "sticky-first-col")
            .style("min-width", (config.firstColWidth || 150) + "px")
            .text(groupName);


        rows.forEach((row, index) => {
            const rowId = `${groupId}-r${index + 1}`;
            const tr = tbody.append("tr");

            tr.append("th")
                .attr("id", rowId)
                .attr("scope", "row")
                .attr("headers", groupId)
                .attr("class", "col--text")
                .text(row[nameColumn]);

            tr.selectAll("td")
                .data(columnBlocks.map(d => {
                    if (config.sparklines.enabled &&d.kind === "sparkline") {
                        return {
                            kind: "sparkline",
                            cols: d.cols,
                            col: d.title,
                            value: null,
                            type: "h",
                            i: null
                        };
                    }

                    if (d.kind === "bar") {
                        return {
                            kind: "bar",
                            col: d.col,
                            value: row[d.col],
                            type: d.type,
                            i: d.i
                        };
                    }

                    return {
                        kind: "value",
                        col: d.col,
                        value: row[d.col],
                        type: d.type,
                        i: d.i
                    };
                }))
                .enter()
                .append("td")
                .attr("headers", d => `${rowId} ${d.col}`)
                .attr("class", d =>
                    d.type === "n" ? "col--number" :
                        d.type === "d" ? "col--date" :
                            "col--text"
                )


                .each(function (d) {
                    const cell = d3.select(this);


                    /* ---------------------------------------------
                    DRAW SPARKLINES
                    --------------------------------------------- */
                    if (config.sparklines.enabled &&d.kind === "sparkline") {

                        addSparkline({
                            cell,
                            row,
                            d,
                            config,
                            sparklineScales,
                            ONScolours
                        });

                        return;
                    }


                    /* ---------------------------------------------
                    DRAW BARS
                    --------------------------------------------- */
                    if (d.kind === "bar") {

                        addBars({
                            cell,
                            row,
                            d,
                            config,
                            barScales,
                            barHeight
                        });

                        return;
                    }

                    /* ---------------------------------------------
                    DRAW ARROWS
                    --------------------------------------------- */
                    if (config.arrowIcons.enabled && config.arrowIcons.columns.includes(d.col)) {
                        addArrows({
                            cell,
                            d,
                            config
                        });

                        return;
                    }


                    /* ---------------------------------------------
                    DRAW CATEGORY ICONS
                    --------------------------------------------- */
                    const raw = (d.value ?? "").toString().trim();
                    if (raw === "") {
                        cell.text(config.nullText);
                        return;
                    }
                    if (config.categoryIcons.enabled && categoryColumns.includes(d.col)) {

                        const wrapper = cell.append("span")
                            .style("display", "inline-flex")
                            .style("align-items", "center");

                        wrapper.append("span")
                            .style("width", config.categoryIcons.circleRadius + "px")
                            .style("height", config.categoryIcons.circleRadius + "px")
                            .style("border-radius", "50%")
                            .style("display", "inline-block")
                            .style("margin-right", "6px")
                            .style("background-color", categoryScale(raw));

                        wrapper.append("span")
                            .text(raw);

                        return;
                    }

                    /* ---------------------------------------------
                    PROCESS HTML COLUMNS
                    --------------------------------------------- */
                    if (d.type === "h") {
                        cell.html(raw);
                        return;
                    }


                    /* ---------------------------------------------
                    PROCESS NUMBER COLUMNS
                    --------------------------------------------- */
                    if (d.type === "n" && !isNaN(raw) && numberFormatters[d.i]) {
                        cell.text(numberFormatters[d.i](raw));
                        return;
                    }

                    /* ---------------------------------------------
                    ALL OTHER COLUMNS
                    --------------------------------------------- */
                    cell.text(raw);
                });



        });
    }


    /* ---------------------------------------------
        FREEZE FIRST COLUMN
        --------------------------------------------- */
    if (config.freezeFirstColumn.enabled) {
        scrollWrapper.classed("freeze-first-col", true);

        colgroup.select("col:first-child")
            .style("width", config.freezeFirstColumn.firstColWidth + "px" || "150px");

    }

    addSource("source", config.sourceText);

    if (pymChild) {
        pymChild.sendHeight();
    }

}

/* =========================================================
   LOAD DATA AND RENDER
   ========================================================= */
d3.csv(config.graphicDataURL).then(rawData => {
    tableData = rawData.map(d => ({ ...d }));
    tableData.columns = rawData.columns;
    pymChild = new pym.Child({
        renderCallback: drawTable
    });
});
