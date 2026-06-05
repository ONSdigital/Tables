config = {
	"graphicDataURL": "data.csv",
	"colTypes": "nnn", // d = date, n = number, t = text, h = html (not including group and name)
	"nullText": "-",
	//"numberFormat": ",.0f",
	"numberFormat": [",.0f", ",.0f", ",.1f"],
	"freezeFirstColumn": false, 
	"firstColWidth": 150, // only applied if freeze true
	"tableDescription": "The main message is summarised by the table title and the data behind the table is available to download below.", // Must update for screenreaders
	"sourceText": "Labour Force Survey from the Office for National Statistics",
	"minColWidth": 40,
	"maxColWidth": 180
}