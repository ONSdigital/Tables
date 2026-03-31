import { addSource } from "../lib/helpers.js";

let container = d3.select('#table-container');
let tableData;

/* =========================================================
   MAIN RENDER FUNCTION
   ========================================================= */
function drawTable() {

    container.html("");

    /* ---------------------------------------------------------
       COLUMN STRUCTURE
       --------------------------------------------------------- */
    const allColumns = tableData.columns;
    const groupColumn = "group";

    // remove group column
    const dataColumns = allColumns.filter(c => c !== groupColumn);

    // FIRST non-group column = row header column (name)
    const nameColumn = dataColumns[0];

    // remaining columns = real data columns
    const valueColumns = dataColumns.slice(1);

    // colTypes applies ONLY to valueColumns
    const colTypes = config.colTypes.split("");

    // group data rows by group label
    const grouped = d3.group(tableData, d => d[groupColumn]);

    /* ---------------------------------------------------------
       BUILD TABLE
       --------------------------------------------------------- */
    const table = container.append("table");

    /* ---------- CAPTION ---------- */
    const caption = table.append("caption");

    caption.append("div")
        .attr("class", "table-title")
        .text(config.titleText);

    if (config.subtitleText) {
        caption.append("div")
            .attr("class", "table-subtitle")
            .text(config.subtitleText);
    }

    addSource("source", config.sourceText);

    /* ---------- COLGROUP ---------- */
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

    /* ---------- THEAD ---------- */
    const thead = table.append("thead");
    const headerRow = thead.append("tr");

    // blank corner (row header column)
    headerRow.append("td");

    // ✅ ONLY VALUE COLUMNS in THEAD
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

    /* ---------- TBODY ---------- */
    const tbody = table.append("tbody");

    // colspan = 1 name column + N value columns
    const colSpan = valueColumns.length + 1;

    for (const [groupName, rows] of grouped) {

        const groupId = groupName.toLowerCase().replace(/\s+/g, "");

        // group row
        tbody.append("tr")
            .append("th")
            .attr("id", groupId)
            .attr("scope", "colgroup")
            .attr("colspan", colSpan)
            .text(groupName);

        // data rows
        rows.forEach((row, index) => {

            const rowId = `${groupId}-r${index + 1}`;
            const tr = tbody.append("tr");

            /* ---- ROW HEADER (name column) ---- */
            tr.append("th")
                .attr("id", rowId)
                .attr("scope", "row")
                .attr("headers", groupId)
                .attr("class", "col--text")
                .text(row[nameColumn]);

            /* ---- VALUE CELLS ---- */
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
}

/* =========================================================
   LOAD DATA
   ========================================================= */
d3.csv(config.graphicDataURL).then(rawData => {
    tableData = rawData.map(d => ({ ...d }));
    tableData.columns = rawData.columns;
    drawTable();
});