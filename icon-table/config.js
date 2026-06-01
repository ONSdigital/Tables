config = {
	"graphicDataURL": "data.csv",
	"colTypes": "tt", // d = date, n = number, t = text (not including group and name)
	"categoryColumn": "Category",
	"circleRadius": 14, // diameter of circle in px
	"colourPalette": ONSpalette,
	"legend": "custom", // false = no legend, "auto" for just category names
	"legendText": [
		{ value: "Low", description: "Lowest ranked items" },
		{ value: "Medium", description: "Middle " },
		{ value: "High", description: "Highest ranked items" },
	], // Only used if "legend": "custom"
	"nullText": "-",
	//"numberFormat": ",.0f",
	"numberFormat": [",.0f", ",.0f", ",.1f"],
	"titleText": "Table 1: Title text",
	"subtitleText": "Subtitle text",
	"sourceText": "Office for National Statistics",
	"minColWidth": 40,
	"maxColWidth": 180
}