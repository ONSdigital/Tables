import { addSource } from "../lib/helpers.js";

let container = d3.select("#table-container");
let tableData;
let pymChild = null;

/* =========================================================
   MAIN RENDER FUNCTION
   ========================================================= */
function drawTable() {

    container.html("");

    const categoryColumn = config.categoryColumn;
    const categoryColumns = Array.isArray(categoryColumn)
        ? categoryColumn
        : [categoryColumn];

    const legendMode = config.legend ?? "auto";

    let categoryScale = null;
    let categories = [];
    let legendItemsData = [];

    /* =========================================================
       CATEGORY + LEGEND DATA PREP
    ========================================================= */
    if (categoryColumn) {

        const rawCategories = Array.from(
            new Set(
                tableData.flatMap(d =>
                    categoryColumns
                        .map(col => (d[col] ?? "").toString().trim())
                        .filter(v => v !== "")
                )
            )
        );

        if (legendMode === "custom" && Array.isArray(config.legendText)) {
            legendItemsData = config.legendText;
            categories = legendItemsData.map(d => d.value);
        } else {
            categories = rawCategories;
            legendItemsData = categories;
        }

        categoryScale = d3.scaleOrdinal()
            .domain(categories)
            .range(config.colourPalette);
    }


    /* ---------------------------------------------
       NORMALISE COLUMN TYPES + NUMBER FORMATTERS
    --------------------------------------------- */
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
       LEGEND
    ========================================================= */
    if (categoryColumn && legendMode !== false && legendItemsData.length) {

        const legend = container.append("div")
            .attr("class", "table-legend");

        const legendItems = legend.selectAll(".legend-item")
            .data(legendItemsData)
            .enter()
            .append("div")
            .attr("class", "legend-item");

        legendItems.append("span")
            .style("width", config.circleRadius + "px")
            .style("height", config.circleRadius + "px")
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
                        ? `${d.value}: ${d.description}`
                        : d.value;
                }
                return d;
            });
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
       COLUMN STRUCTURE
    ========================================================= */
    const allColumns = tableData.columns;

    const nameColumn = "name";
    const valueColumns = allColumns.filter(c => c !== nameColumn);

    /* =========================================================
       COLGROUP
    ========================================================= */
    const colgroup = table.append("colgroup");
    colgroup.append("col").attr("class", "col--text");

    valueColumns.forEach((_, i) => {
        const typeChar = colTypes[i];
        const typeClass =
            typeChar === "n" ? "col--number" :
                typeChar === "d" ? "col--date" :
                    typeChar === "h" ? "col--text" :
                        "col--text";

        colgroup.append("col").attr("class", typeClass);
    });

    /* =========================================================
       THEAD (UNCHANGED)
    ========================================================= */
    const thead = table.append("thead");
    const headerRow = thead.append("tr");

    headerRow
        .append("td");

    headerRow.selectAll("th")
        .data(valueColumns.map((col, i) => ({
            col,
            type: colTypes[i]
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
       TBODY (UNCHANGED EXCEPT CATEGORY DOT)
    ========================================================= */
    const tbody = table.append("tbody");

    tableData.forEach((row, index) => {
        const rowId = `r${index + 1}`;
        const tr = tbody.append("tr");

        tr.append("th")
            .attr("id", rowId)
            .attr("scope", "row")
            .attr("class", "col--text")
            .text(row[nameColumn]);

        tr.selectAll("td")
            .data(valueColumns.map((col, i) => ({
                col,
                value: row[col],
                type: colTypes[i],
                i
            })))
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
                const raw = (d.value ?? "").toString().trim();

                if (raw === "") {
                    cell.text(config.nullText);
                    return;
                }

                if (categoryColumn && categoryColumns.includes(d.col)) {

                    const wrapper = cell.append("span")
                        .style("display", "inline-flex")
                        .style("align-items", "center");

                    wrapper.append("span")
                        .style("width", config.circleRadius + "px")
                        .style("height", config.circleRadius + "px")
                        .style("border-radius", "50%")
                        .style("display", "inline-block")
                        .style("margin-right", "6px")
                        .style("background-color", categoryScale(raw));

                    wrapper.append("span")
                        .text(raw);

                    return;
                }

                if (d.type === "h") {
                    cell.html(raw);
                    return;
                }



                if (d.type === "n" && !isNaN(raw) && numberFormatters[d.i]) {
                    cell.text(numberFormatters[d.i](+raw));
                    return;
                }

                cell.text(raw);
            });
    });

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
