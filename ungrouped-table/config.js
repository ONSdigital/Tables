config = {
	// general table settings
	"graphicDataURL": "data.csv",
	"colTypes": "tth", // d = date, n = number, t = text, h = html (not including name)
	"nullText": "-",
	"firstColHeader": null, // Top left column name, blank by default
	"numberFormat": [",.0f", ",.0f", ",.1f"], //"numberFormat": ",.0f",
	"tableDescription": "The main message is summarised by the table title and the data behind the table is available to download below.", // Must update for screenreaders
	"sourceText": "Office for National Statistics",
	"minColWidth": 40,
	"maxColWidth": 180,
	////// Visual settings //////
	// category icons
	"categoryIcons": {
		"enabled": true,
		"columns": ["Quality", "Level"],
		"circleRadius": 14, // diameter of circle in px
		"colourPalette": ONSpalette,
		"legend": "custom", // false = no legend, "auto" for just category names
		"legendText": [
			{ value: "Very Low", description: ": Lowest ranked items" },
			{ value: "Low", description: ": Next lowest ranked items" },
			{ value: "Medium", description: " is the middle value " },
			{ value: "High", description: ": Highest ranked items" },
		], // Only used if "legend": "custom"
	},
	// arrow icons
	"arrowIcons": {
		"enabled": true,
		"columns": ["Value"],
		"colourPalette": ONSpalette
	},
	// sparklines 
	"sparklines": {
		"enabled": true,
		"columns": ["2016", "2024"], // either null, or an array of 2 column names e.g. ["2020", "2023"] giving the inclusive range of columns to render as a single sparkline column instead of printed values
		"title": "2014-2024 trend", // header title for the sparkline column. 
		"colourPalette": ONSpalette
	},
	// bars
	"bars": {
		"enabled": true,
		"columns": ["2024 value"], // either null, or an array of column names
		"title": "2014-2024 trend", // header title for the sparkline column. 
		"colourPalette": ONSpalette
	},
	////// Interactive settings //////
	// Freeze first column
	"freezeFirstColumn": {
		"enabled": true,
		"firstColWidth": 100
	},
	// pagination
	"pagination": {
		"enabled": true,
		"numRows": 10, // number of data rows shown per page when paginate is true
	},
	// filters
	"filters": ["Income"],
	// sorting
	// search
}