config = {
	"graphicDataURL": "data.csv",
	"colTypes": "nnnnnnnnnnnn", // d = date, n = number, t = text, h = html (not including name)
	"nullText": "-",
	"firstColHeader": null, // Top left column name, blank by default
	"freezeFirstColumn": true, 
	"firstColWidth": 100, // only applied if freeze true
	"numberFormat": ",.0f",
	// "numberFormat": [",.0f", ",.0f", ",.1f"], if 3 cols and diff
	"tableDescription": "The main message is summarised by the table title and the data behind the table is available to download below.", // Must update for screenreaders
	"sourceText": "Office for National Statistics",
	"minColWidth": 40,
	"maxColWidth": 180
}