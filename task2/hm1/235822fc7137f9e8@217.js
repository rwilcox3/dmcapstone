// https://observablehq.com/@mutsimo/untitled@217
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md `## HEATMAP`
)});
  main.variable(observer("chart")).define("chart", ["d3","DOM","w","h","days","gridSize","margin","hours","data","colors","colorScale"], function(d3,DOM,w,h,days,gridSize,margin,hours,data,colors,colorScale)
{
  const svg = d3.select(DOM.svg(w, h))
  
  const dayLabels = svg.selectAll(".dayLabel")
						          .data(days)
						          .enter().append("text")
						            .text(function (d) { return d; })
						            .attr("x", 0)
						            .attr("y", function (d, i) { return i * gridSize; })
  .attr("font-size", "9pt")
  .attr("fill", "#aaa")
						            .attr("transform", "translate(0," + (margin.left+ gridSize / 1.5)  + ")")
.attr("class", "dayLabel mono axis");
  
  const timeLabels = svg.selectAll(".timeLabel")
			          .data(hours)
			          .enter().append("text")
			            .text(function(d) { return d; })
			            .attr("x", function(d, i) { return i * gridSize; })
			            .attr("y", 0)
			            .style("text-anchor", "middle")
			            .attr("transform", "translate(" + (80 + gridSize / 2) + ", 12)")
  //.attr("font-size", "9pt")
  //.attr("fill", "#aaa")
 .attr("class", "timeLabel mono axis");
  
  const cards = svg.selectAll(".hour")
			              .data(data, function(d) {return d.reservation_hour+':'+d.index;});
    
  
  const cardsEnter = cards.enter().append("rect")
			              .attr("x", function(d) { return (d.reservation_hour) * gridSize; })
			              .attr("y", function(d) { return (d.index) * gridSize; })
  .attr("transform", "translate(80,20)")
			              .attr("rx", 4)
			              .attr("ry", 4)
			              .attr("class", "hour bordered")
			              .attr("width", gridSize)
			              .attr("height", gridSize)
			              .style("fill", colors[0]);
  
  cardsEnter.append("title");
  
   cardsEnter.transition().duration(1000)
			              .style("fill", function(d) { return colorScale(d.revenue); });

			          cardsEnter.select("title").text(function(d) { return d.revenue; });
			          
			          cards.exit().remove();
  return svg.node();
}
);
  main.variable(observer("style")).define("style", ["html"], function(html){return(
html`<style>
      rect.bordered {
        stroke: #F7F7F7;
        stroke-width:2px;   
      }

      text.mono {
        font-size: 9pt;
        font-family: Consolas, courier;
        fill: #aaa;
      }

      text.mono2 {
        font-size: 10pt;
        font-family: Consolas, courier;
        fill: #111111;
      }

      text.axis-workweek {
        fill: #000;
      }

      text.axis-worktime {
        fill: #000;
      }
    </style>`
)});
  main.variable(observer("colorScale")).define("colorScale", ["d3","data","colors"], function(d3,data,colors){return(
d3.scaleQuantile()
			              .domain([d3.min(data, function (d) { return +d.revenue; }),  d3.max(data, function (d) { return +d.revenue;})])
			              .range(colors)
)});
  main.variable(observer("w")).define("w", ["width","margin"], function(width,margin){return(
width - margin.left - margin.right
)});
  main.variable(observer("h")).define("h", ["days","gridSize","margin"], function(days,gridSize,margin){return(
(days.length * gridSize) + margin.top + margin.bottom
)});
  main.variable(observer("gridSize")).define("gridSize", ["width"], function(width){return(
Math.floor(width / 30)
)});
  main.variable(observer("colors")).define("colors", ["chroma"], function(chroma){return(
chroma.brewer.Blues
)});
  main.variable(observer("chroma")).define("chroma", ["require"], function(require){return(
require('chroma-js')
)});
  main.variable(observer("parseTime")).define("parseTime", ["d3"], function(d3){return(
d3.timeParse("%Y-%m-%d %H:%M:%S +0000")
)});
  main.variable(observer("nested_data_days")).define("nested_data_days", ["d3","data"], function(d3,data){return(
d3.nest()
       								.key( d => d.reservation_date)
       								.rollup(leaves => leaves.length)
       								.entries(data)
)});
  main.variable(observer("nested_data_hours")).define("nested_data_hours", ["d3","data"], function(d3,data){return(
d3.nest()
       								.key(d => +d.reservation_hour).sortKeys(d3.ascending)
       								.rollup(leaves => leaves.length)
       								.entries(data)
)});
  main.variable(observer("legendElementWidth")).define("legendElementWidth", ["gridSize"], function(gridSize){return(
gridSize*2
)});
  main.variable(observer("margin")).define("margin", function(){return(
{ top: 20, right: 20, bottom:20, left: 20 }
)});
  main.variable(observer("data")).define("data", ["d3"], function(d3){return(
d3.csv(`https://gist.githubusercontent.com/mutsimo/2cd8a73f4fef06f6af7ea49604205f43/raw/3317a42a50f72289017a84321f3183ce76754915/data.csv`)
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  main.variable(observer("hours")).define("hours", function(){return(
["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
)});
  main.variable(observer("days")).define("days", ["nested_data_days","format","parseTime"], function(nested_data_days,format,parseTime){return(
nested_data_days.map(d => format(parseTime(d.key)))
)});
  main.variable(observer("format")).define("format", ["d3"], function(d3){return(
d3.timeFormat("%d %b, %a")
)});
  return main;
}
