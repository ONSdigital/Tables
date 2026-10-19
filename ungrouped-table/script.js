import { addSource, getTextColorFromBackground } from "../lib/helpers.js";
import { addBars } from "../lib-tables/bars.js";
import { addSparkline } from "../lib-tables/sparklines.js";
import { addArrows } from "../lib-tables/arrows.js";

let container = d3.select("#table-container");
let tableData;
let pymChild = null;

let currentPage = 1;

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

    /* =========================================================
       NORMALISE COLUMN TYPES + NUMBER FORMATTERS
    ========================================================= */
    const colTypes = config.colTypes.split("");

    const numberFormatters = (() => {
        if (typeof config.numberFormat === "string") {
            return colTypes.map(t =>
                t === "n" ? d3.format(config.numberFormat) : null
            );
        }

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
    const nameColumn = "name";
    const valueColumns = allColumns.filter(c => c !== nameColumn);

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

    // Legend
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

    if (config.sparklines.enabled) {
        if (Array.isArray(config.sparklines.columns) && config.sparklines.columns.length === 2) {
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

    if (sparklineRange) {

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

    const corner = headerRow.append("th")
        .attr("scope", "col")
        .attr("class", "col--text corner-cell")
        .attr("id", "corner");

    if (config.firstColHeader) {
        corner.text(config.firstColHeader);
    }

    headerRow.selectAll("th.data-col")
        .data(columnBlocks.map(d => ({
            col: d.kind === "sparkline" ? d.title : d.col,
            id: d.kind === "sparkline" ? d.title : d.col,
            type: d.kind === "sparkline" ? "h" : d.type
        })))
        .enter()
        .append("th")
        .attr("scope", "col")
        .attr("id", d => d.id)
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

    /* =========================================================
       PAGINATION CONTAINER
    ========================================================= */
    const paginationEnabled = config.pagination?.enabled === true;
    const numRows = Math.max(1, +config.pagination?.numRows || 10);

    const pagination = paginationEnabled
        ? container.append("nav")
            .attr("class", "pagination")
            .attr("aria-label", "Table pagination")
        : null;

    function renderPagination(start, end, totalRows, totalPages) {
        if (!paginationEnabled) {
            return;
        }

        pagination.html("");

        const statusText = totalRows === 0
            ? "0 of 0 rows"
            : `${start + 1}–${end} of ${totalRows} rows`;

        if (config.pagination) {
            pagination.append("div")
                .attr("class", "pagination-status")
                .attr("role", "status")
                .attr("aria-live", "polite")
                .attr("aria-atomic", "true")
                .text(statusText);

        }

        if (totalPages <= 1 || totalRows === 0) {
            return;
        }

        const controls = pagination.append("div")
            .attr("class", "pagination-controls");

        function addButton(label, page, disabled = false, active = false) {
            const ariaLabel = typeof label === "number"
                ? active
                    ? `Page ${label}, current page`
                    : `Go to page ${label}`
                : `${label} page`;

            controls.append("button")
                .attr("type", "button")
                .classed("active", active)
                .attr("disabled", disabled ? true : null)
                .attr("aria-current", active ? "page" : null)
                .attr("aria-label", ariaLabel)
                .attr("data-pagination-control", label)
                .text(label)
                .on("click", () => {
                    renderPage(page, label);
                })
                .on("keydown", event => {
                    if (
                        event.key === "ArrowRight" &&
                        currentPage < totalPages
                    ) {
                        event.preventDefault();
                        renderPage(currentPage + 1, label);
                    }

                    if (
                        event.key === "ArrowLeft" &&
                        currentPage > 1
                    ) {
                        event.preventDefault();
                        renderPage(currentPage - 1, label);
                    }
                });
        }

        addButton("Previous", currentPage - 1, currentPage === 1);

        let pages = [];

        if (totalPages <= 7) {
            pages = d3.range(1, totalPages + 1);
        } else {
            pages = [1];

            if (currentPage > 3) {
                pages.push("...");
            }

            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
            ) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }

            pages.push(totalPages);
        }

        pages.forEach(p => {
            if (p === "...") {
                controls.append("span")
                    .attr("class", "ellipsis")
                    .attr("aria-hidden", "true")
                    .text("...");
            } else {
                addButton(p, p, false, p === currentPage);
            }
        });

        addButton("Next", currentPage + 1, currentPage === totalPages);
    }

    function renderPage(page, focusControl = null) {
        const totalRows = tableData.length;

        const totalPages = paginationEnabled
            ? Math.max(1, Math.ceil(totalRows / numRows))
            : 1;

        currentPage = Math.min(Math.max(1, page), totalPages);

        tbody.html("");

        const start = paginationEnabled
            ? (currentPage - 1) * numRows
            : 0;

        const end = paginationEnabled
            ? Math.min(start + numRows, totalRows)
            : totalRows;

        const pageData = tableData.slice(start, end);

        pageData.forEach((row, index) => {
            const rowId = `r${start + index + 1}`;
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
                    if (config.sparklines.enabled && d.kind === "sparkline") {

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

                    // Deal with null values
                    const raw = (d.value ?? "").toString().trim();

                    if (raw === "") {
                        cell.text(config.nullText);
                        return;
                    }

                    /* ---------------------------------------------
                    DRAW CATEGORY ICONS
                    --------------------------------------------- */
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

        renderPagination(start, end, totalRows, totalPages);

        if (focusControl !== null) {
            pagination
                .select(`[data-pagination-control="${focusControl}"]`)
                .node()
                ?.focus();
        }

        if (pymChild) {
            setTimeout(() => pymChild.sendHeight(), 0);
        }
    }

    renderPage(currentPage);

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