import { addSource } from "../lib/helpers.js";

let container = d3.select('#table-container');
let tableData;

/* =========================================================
   MAIN RENDER FUNCTION
   ========================================================= */
function drawTable() {


    const numberFormatter = d3.format(config.numberFormat);


    container.html("");

    /* =========================================================
       TITLE + SUBTITLE (visible, not scrolling)
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
       SCROLL WRAPPER
       ========================================================= */
    const scrollWrapper = container.append("div")
        .attr("class", "table-scroll")
        .style("--min-col-width", config.minColWidth + "px")
        .style("--max-col-width", config.maxColWidth + "px");

    const table = scrollWrapper.append("table");

    /* =========================================================
       ACCESSIBLE CAPTION (screen readers only)
       ========================================================= */
    table.append("caption")
        .attr("class", "visually-hidden")
        .text(
            config.subtitleText
                ? `${config.titleText} – ${config.subtitleText}`
                : config.titleText
        );

    /* =========================================================
       COLUMN STRUCTURE
       ========================================================= */
    const allColumns = tableData.columns;
    const groupColumn = "group";

    // All non-group columns
    const dataColumns = allColumns.filter(c => c !== groupColumn);

    // FIRST column = row header column ("name")
    const nameColumn = dataColumns[0];

    // Remaining = data value columns
    const valueColumns = dataColumns.slice(1);

    // colTypes corresponds ONLY to valueColumns now
    const colTypes = config.colTypes.split("");

    // Group rows by group name
    const grouped = d3.group(tableData, d => d[groupColumn]);

    /* =========================================================
       COLGROUP (for width + alignment)
       ========================================================= */
    const colgroup = table.append("colgroup");

    // name column (row header)
    colgroup.append("col").attr("class", "col--text");

    // value columns
    valueColumns.forEach((col, i) => {
        const typeChar = colTypes[i];
        const typeClass =
            typeChar === "n" ? "col--number" :
                typeChar === "d" ? "col--date" :
                    "col--text";

        colgroup.append("col").attr("class", typeClass);
    });

    /* =========================================================
       THEAD (ONLY value columns have headers)
       ========================================================= */
    const thead = table.append("thead");
    const headerRow = thead.append("tr");

    // blank corner for row headers
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

    const colSpan = valueColumns.length + 1; // name column + data columns

    /* =========================================================
       UNGROUPED ROWS FIRST (group column empty)
       ========================================================= */
    const ungroupedRows = [...grouped].find(([g]) => !g || g.trim() === "");

    if (ungroupedRows) {
        const [_, rows] = ungroupedRows;

        rows.forEach((row, index) => {
            const rowId = `ungrouped-r${index + 1}`;
            const tr = tbody.append("tr");

            // row header
            tr.append("th")
                .attr("id", rowId)
                .attr("scope", "row")
                .attr("class", "col--text")
                .text(row[nameColumn]);

            // value columns only
            tr.selectAll("td")
                .data(valueColumns.map((col, i) => ({
                    col,
                    value: row[col],
                    type: colTypes[i]
                })))
                .enter()
                .append("td")
                .attr("headers", d => `${rowId} ${d.col}`)
                .attr("class", d =>
                    d.type === "n" ? "col--number" :
                        d.type === "d" ? "col--date" :
                            "col--text"
                )
                .text(d => {
                    if (d.value === "" || d.value == null) {
                        return config.nullText;
                    }

                    // number formatting if type = n
                    if (d.type === "n") {
                        return numberFormatter(+d.value);
                    }

                    // fall back to raw value for text/date
                    return d.value;
                });
        });
    }

    /* =========================================================
       GROUPED ROWS (skip empty-group after handling above)
       ========================================================= */
    for (const [groupName, rows] of grouped) {

        if (!groupName || groupName.trim() === "") continue;

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

            // row heading
            tr.append("th")
                .attr("id", rowId)
                .attr("scope", "row")
                .attr("headers", groupId)
                .attr("class", "col--text")
                .text(row[nameColumn]);

            // value columns
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
                .text(d => {

                    // NORMALISE FIRST
                    const raw = (d.value || "").toString().trim();

                    // 1. If empty after trimming → null text
                    if (raw === "") {
                        return config.nullText;
                    }

                    // 2. Numeric formatting ONLY if type is numeric AND raw is a valid number
                    if (d.type === "n" && !isNaN(raw)) {
                        return numberFormatter(+raw);
                    }

                    // 3. Otherwise return raw value
                    return raw;
                });


        });
    }

    /* Footer source */
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