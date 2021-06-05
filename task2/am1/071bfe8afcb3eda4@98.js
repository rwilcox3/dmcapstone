// https://observablehq.com/@jannespeeters/chord-ribbon-diagram@98
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Chord Ribbon Diagram`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `The chord ribbon diagram is generated based on a random adjacency matrix. You can play around with the slider below to change the matrix size (and thus the amount of nodes). A completely different visualization will appear every time the slider is changed. You can make the tradeoff between functionality and beauty of the chart for yourself.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Matrix size`
)});
  main.variable(observer("viewof size")).define("viewof size", ["html"], function(html){return(
html`<input type=range min="4" max="26" value="7">`
)});
  main.variable(observer("size")).define("size", ["Generators", "viewof size"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","size","adjacencyMatrix","height","margin","width","opacity","highlightRibbon","fade","highlightNode","headers"], function(d3,size,adjacencyMatrix,height,margin,width,opacity,highlightRibbon,fade,highlightNode,headers)
{
  const padAngleScale = d3.scaleLog().domain([4,26]).range([.3,.005]);
  const chord = d3.chord().padAngle(padAngleScale(size));
  const chords = chord(adjacencyMatrix);

  const radius = height/2 - margin/2;
  const ribbon = d3.ribbon().radius(radius);

  const color = d3.scaleSequential(d3.interpolateRainbow)
          .domain([0,adjacencyMatrix.length]);

  const svg = d3.create("svg").attr("width", width).attr("height", height);
  const chart = svg.append("g").attr("transform", `translate(${width/2 + margin/4}, ${height/2 + margin/4})`);

  chart.selectAll("path.ribbon")
      .data(chords)
      .join("path")
      .attr("class", "ribbon")
      .attr("d", ribbon)
      .style("opacity", opacity.highlighted)
      .style("fill", d => color(d.source.index))
      .on("mouseover", highlightRibbon)
      .on("mouseout", fade);

  const arc = d3.arc().innerRadius(radius+2).outerRadius(radius+30);
  chart.selectAll("path.arc")
      .data(chords.groups)
      .join("path")
      .attr("class", "arc")
      .attr("d", arc)
      .style("fill", d => color(d.index))
      .style("opacity", opacity.highlighted)
      .on("mouseover", highlightNode)
      .on("mouseout", fade);

  chart.selectAll("text")
      .data(chords.groups)
      .join("text")
      .attr("x", d => arc.centroid(d)[0])
      .attr("y", d => arc.centroid(d)[1])
      .text(d => headers[d.index])
      .attr("transform", d => `rotate(${(arc.endAngle()(d) + arc.startAngle()(d)) * 90/Math.PI}, ${arc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("alignment-baseline", "middle")
      .style("font-family", "Arial, sans-serif")
      .style("font-weight", 600);
 
  return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## Data`
)});
  main.variable(observer("adjacencyMatrix")).define("adjacencyMatrix", ["size"], function(size)
{
  let matrix = [];
  for (let j = 0; j < size; j++) {
      let Arr = [];
      for (let i = 0; i < size; i++) {
          Arr.push(Math.floor(Math.random() * 10 + 1))
      }
      matrix.push(Arr)
  }
  for (let i = 0; i < size; i++) {
      matrix[i][i] = 0;
  }
  return matrix;
}
);
  main.variable(observer("headers")).define("headers", function(){return(
['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Functions`
)});
  main.variable(observer("highlightNode")).define("highlightNode", ["d3","opacity"], function(d3,opacity){return(
node => {
  node = node.target.__data__;
    d3.selectAll("path.arc").filter(d => !(d === node)).style("opacity", opacity.faded);
    d3.selectAll("path.ribbon").filter(d => !(d.source.index === node.index || d.target.index === node.index)).style("opacity", opacity.faded);
}
)});
  main.variable(observer("highlightRibbon")).define("highlightRibbon", ["d3","opacity"], function(d3,opacity){return(
edge => {
  edge = edge.target.__data__;
    d3.selectAll("path.arc").filter(node => !(node.index === edge.source.index || node.index === edge.target.index)).style("opacity", opacity.faded);
    d3.selectAll("path.ribbon").filter(d => !(d === edge)).style("opacity", opacity.faded);
}
)});
  main.variable(observer("fade")).define("fade", ["d3","opacity"], function(d3,opacity){return(
node => {
  d3.selectAll("path").style("opacity", opacity.highlighted);
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Constants`
)});
  main.variable(observer("width")).define("width", function(){return(
900
)});
  main.variable(observer("height")).define("height", function(){return(
800
)});
  main.variable(observer("margin")).define("margin", function(){return(
120
)});
  main.variable(observer("opacity")).define("opacity", function(){return(
{ highlighted: .7, faded: .2 }
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@v6")
)});
  return main;
}
