config = {
	"graphicDataURL": "data.csv",
	"colTypes": "tth", // d = date, n = number, t = text, h = html (not including name)
	"iconColumn": ["Quality", "Level"],
	"circleRadius": 14, // diameter of circle in px
	"colourPalette": ONSpalette,
	"legend": "custom", // false = no legend, "auto" for just category names
	"legendText": [
		{ value: "Very Low", description: ": Lowest ranked items" },
		{ value: "Low", description: ": Next lowest ranked items" },
		{ value: "Medium", description: " is the middle value " },
		{ value: "High", description: ": Highest ranked items" },
	], // Only used if "legend": "custom"
	"nullText": "-",
	"firstColHeader": null, // Top left column name, blank by default
	"freezeFirstColumn": true, 
	"firstColWidth": 100, // only applied if freeze true
	"numberFormat": [",.0f", ",.0f", ",.1f"], //"numberFormat": ",.0f",
	"tableDescription": "The main message is summarised by the table title and the data behind the table is available to download below.", // Must update for screenreaders
	"sourceText": "Office for National Statistics",
	"minColWidth": 40,
	"maxColWidth": 180
}