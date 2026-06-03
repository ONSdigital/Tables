import { addSource } from "../lib/helpers.js";

let container = d3.select('#table-container');
let tableData;

/* =========================================================
   MAIN RENDER FUNCTION
   ========================================================= */
function drawTable() {

    container.html("");

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
       TITLE + SUBTITLE
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
    const dataColumns = allColumns.filter(c => c !== groupColumn);
    const nameColumn = dataColumns[0];
    const valueColumns = dataColumns.slice(1);

    const grouped = d3.group(tableData, d => d[groupColumn]);

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
                .text(d => {
                    const raw = (d.value ?? "").toString().trim();
                    if (raw === "") return config.nullText;

                    if (d.type === "n" && !isNaN(raw) && numberFormatters[d.i]) {
                        return numberFormatters[d.i](+raw);
                    }

                    return raw;
                });
        });
    }

    for (const [groupName, rows] of grouped) {
        if (!groupName || groupName.trim() === "") continue;

        const groupId = groupName.toLowerCase().replace(/\s+/g, "");

        tbody.append("tr")
            .append("th")
            .attr("id", groupId)
            .attr("scope", "colgroup")
            .attr("colspan", colSpan)
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
                .data(valueColumns.map((col, i) => ({
                    col,
                    value: row[col],
                    type: colTypes[i],
                    i
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
                    const raw = (d.value ?? "").toString().trim();
                    if (raw === "") return config.nullText;

                    if (d.type === "n" && !isNaN(raw) && numberFormatters[d.i]) {
                        return numberFormatters[d.i](+raw);
                    }

                    return raw;
                });
        });
    }

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