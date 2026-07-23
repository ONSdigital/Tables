config = {
	// general table settings
	"graphicDataURL": "data.csv",
	"colTypes": "tnnnnnnnnnh", // d = date, n = number, t = text, h = html (not including name)
	"nullText": "-",
	"firstColHeader": null, // Top left column name, blank by default
	"numberFormat": ".2f", //"numberFormat": ",.0f",
	"tableDescription": "The main message is summarised by the table title and the data behind the table is available to download below.", // Must update for screenreaders
	"sourceText": "Office for National Statistics",
	"minColWidth": 40,
	"maxColWidth": 200,
	// "boldRows": null,
	// "fixRowHeight": false, // all rows as tall as largest row
	////// Visual settings //////
	// category icons
	"categoryIcons": {
		"enabled": false,
		"columns": ["Quality"],
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
		"enabled": false,
		"columns": ["Change"],
		"colourPalette": [ONScolours.positive, ONScolours.negative, ONScolours.grey50], // [positive, negative, neutral]
		"numFormat": ".1f",
		"suffixText": "pp"
	},
	// sparklines 
	"sparklines": {
		"enabled": false,
		"columns": ["2019", "2024"], // either null, or an array of 2 column names e.g. ["2020", "2023"] giving the inclusive range of columns to render as a single sparkline column instead of printed values
		"title": "2019-2024", // header title for the sparkline column. 
		"colourPalette": [ONScolours.oceanBlue],
		"yAxisRange": "auto", // "auto" or [min, max] e.g. [-1, 1]
		"drawZero": true
	},
	// bars
	"bars": {
		"enabled": false,
		"columns": ["Value 2"],
		"xAxisRange": "auto", // "auto" or [min, max] e.g. [-1, 1]
		"dataLabels": true, // show data labels on bars
		"numFormat": ".0f",
		"colourPalette": [ONScolours.positive, ONScolours.negative, ONScolours.grey50],
	},
	////// Interactive settings //////
	// Freeze first column
	"freezeFirstColumn": {
		"enabled": true,
		"firstColWidth": 100
	} //,
	// // pagination
	// "pagination": {
	// 	"enabled": true,
	// 	"numRows": 10, // number of data rows shown per page when paginate is true
	// },
	// // filters
	// "filters": ["Income"],
	// sorting
	// search
}