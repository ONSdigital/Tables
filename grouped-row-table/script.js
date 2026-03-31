import { addSource } from "../lib/helpers.js";

let container = d3.select('#table-container');
let tableData;

/* =========================================================
   MAIN RENDER FUNCTION
   ========================================================= */
function drawTable() {

    container.html("");

    /* =========================================================
       TITLE + SUBTITLE (visible, non-scrolling)
       ========================================================= */
    if (config.titleText) {
        container.append("div")
            .attr("class", "table-title")
            .text(config.titleText);
    }

    if (config.subtitleText) {
        container.append("div")
            .attr("class", "table-subtitle")
            .text(config.subtitleText);
    }

    /* =========================================================
       SCROLL WRAPPER (table scrolls, titles do NOT)
       ========================================================= */
    const scrollWrapper = container.append("div")
        .attr("class", "table-scroll")
        .style("--min-col-width", config.minColWidth + "px")
        .style("--max-col-width", config.maxColWidth + "px");

    const table = scrollWrapper.append("table");

    /* =========================================================
       ACCESSIBLE CAPTION (screen-reader only)
       ========================================================= */
    table.append("caption")
        .attr("class", "visually-hidden")
        .text(
            config.subtitleText
                ? `${config.titleText} – ${config.subtitleText}`
                : config.titleText
        );

    /* ---------------------------------------------------------
       COLUMN STRUCTURE
       --------------------------------------------------------- */
    const allColumns = tableData.columns;
    const groupColumn = "group";

    // All non-group columns
    const dataColumns = allColumns.filter(d => d !== groupColumn);

    // Row header column (name)
    const nameColumn = dataColumns[0];

    // The rest are the value columns
    const valueColumns = dataColumns.slice(1);

    // colTypes corresponds ONLY to valueColumns
    const colTypes = config.colTypes.split("");

    // group rows by group column
    const grouped = d3.group(tableData, d => d[groupColumn]);

    /* =========================================================
       COLGROUP (column widths + alignment)
       ========================================================= */
    const colgroup = table.append("colgroup");

    // First column = row header (name)
    colgroup.append("col").attr("class", "col--text");

    // Value columns
    valueColumns.forEach((col, i) => {
        const typeChar = colTypes[i];
        const typeClass =
            typeChar === "n" ? "col--number" :
            typeChar === "d" ? "col--date" :
            "col--text";

        colgroup.append("col").attr("class", typeClass);
    });

    /* =========================================================
       THEAD (only value columns!)
       ========================================================= */
    const thead = table.append("thead");
    const headerRow = thead.append("tr");

    // Blank corner for row headers
    headerRow.append("td");

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
       TBODY
       ========================================================= */
    const tbody = table.append("tbody");

    const colSpan = valueColumns.length + 1; // name column + N values

    for (const [groupName, rows] of grouped) {

        const groupId = groupName.toLowerCase().replace(/\s+/g, "");

        /* ----- GROUP HEADER ROW ----- */
        tbody.append("tr")
            .append("th")
            .attr("id", groupId)
            .attr("scope", "colgroup")
            .attr("colspan", colSpan)
            .text(groupName);

        /* ----- DATA ROWS ----- */
        rows.forEach((row, index) => {

            const rowId = `${groupId}-r${index + 1}`;
            const tr = tbody.append("tr");

            // Row header (name column)
            tr.append("th")
                .attr("id", rowId)
                .attr("scope", "row")
                .attr("headers", groupId)
                .attr("class", "col--text")
                .text(row[nameColumn]);

            // Data cells
            tr.selectAll("td")
                .data(valueColumns.map((col, i) => ({
                    col,
                    value: row[col],
                    type: colTypes[i]
                })))
                .enter()
                .append("td")
                .attr("headers", d => `${groupId} ${rowId} ${d.col}`)
                .attr("class", d =>
                    d.type === "n" ? "col--number" :
                    d.type === "d" ? "col--date" :
                    "col--text"
                )
                .text(d => d.value);
        });
    }

    /* Source under table */
    addSource("source", config.sourceText);
}

/* =========================================================
   LOAD DATA AND RENDER
   ========================================================= */
d3.csv(config.graphicDataURL).then(rawData => {
    tableData = rawData.map(d => ({ ...d }));
    tableData.columns = rawData.columns;
    drawTable();
});
