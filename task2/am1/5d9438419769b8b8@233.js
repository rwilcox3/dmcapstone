// https://observablehq.com/@jannespeeters/simple-adjacency-matrix@233
import define1 from "./071bfe8afcb3eda4@98.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Simple Adjacency matrix`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`A directed adjacency matrix based on random numbers. When you hover over the matrix, the edge weight is displayed, and all other edges corresponding to the involved vertices are highlighted.`
)});
  main.variable(observer("chart")).define("chart", ["adjacencyMatrix","width","margin","height","labels","matrix","color","d3","highlight","fade"], function(adjacencyMatrix,width,margin,height,labels,matrix,color,d3,highlight,fade)
{
  
  const matrixLayout = adjacencyMatrix()
        .size([width-margin,height-margin]);

  const data = matrixLayout(labels, matrix);
  console.log(data);

  color.domain([0, d3.max(data, d => d.value)]);

  const svg = d3.create("svg").attr("width",width).attr("height",height);
  const chart = svg.append("g").attr("transform", `translate(${[margin/2,margin/2]})`);
  
  const cell = chart.selectAll("g.cell")
          .data(data).join("g")
          .attr("class", "cell")
          .attr("transform", d => `translate(${[d.x,d.y]})`)
          .on("mouseover", highlight)
          .on("mouseout", fade);
  
  cell.append("rect")
          .attr("height", d => d.h*.95)
          .attr("width", d => d.w*.95)
          .attr("rx",d => d.w/4)
          .attr("ry", d => d.h/4)
          .style("fill", d => d.value ? color(d.value) : 'white');

  chart.selectAll('text.source')
          .data(data.filter(d => d.x == 0))
          .enter()
          .append("text").attr("class",'source')
          .attr("y", d => d.y + d.h/2)      // using d.y and d.h
          .attr("x", -15)
          .text((d,i) => labels[i]);

  chart.selectAll('text.target')
          .data(data.filter(d => d.y == 0))
          .enter()
          .append("text").attr("class",'target')
          .attr("x", d => d.x + d.w/2)          // using d.x and d.w
          .attr("y", -10)
          .text((d,i) => labels[i]);

  chart.append("text")
          .attr("transform",`rotate(-90,${[0,height/2 - margin/2]}) translate(${[0, height/2 - margin/2 - 40]})`)
          .text("FROM")
          .style("font-weight", "bold");
  chart.append("text")
          .attr("transform",`translate(${[width/2 - margin/2, -40]})`)
          .text("TO")
          .style("font-weight", "bold");
  
  // Tooltip
  const tooltip = chart.append("g")
            .attr("class",'tooltip')
            .style("opacity", 0)
            .style("pointer-events", 'none');

  tooltip.append("rect")
            .style("fill", 'white')
            .style("stroke", 'black');
  tooltip.append("text");
            
  
  chart.selectAll("text")
          .style("font-family", "Arial, sans-serif")
          .style("text-anchor", "middle")
          .style("alignment-baseline", "middle");
   
  // Return SVG
  return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md `## Data`
)});
  const child1 = runtime.module(define1).derive([{name: "value", alias: "size"}], main);
  main.import("adjacencyMatrix", "matrix", child1);
  main.import("headers", "labels", child1);
  main.variable(observer()).define(["matrix"], function(matrix){return(
matrix
)});
  main.variable(observer()).define(["labels"], function(labels){return(
labels
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Functions`
)});
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
d3.scaleSequential(d3.interpolateOranges)
)});
  main.variable(observer("adjacencyMatrix")).define("adjacencyMatrix", function(){return(
() => {
  let w = 1, h = 1, value = 1;

  function layout(nodes, sourceMatrix) {

    const len = nodes.length;

    const resultMatrix = [];
    for(let s = 0; s < sourceMatrix.length; s++) {
      for(let t = 0; t < sourceMatrix.length; t++) {
        const v = +sourceMatrix[s][t];
        const rect = {x: t * w/len, y: s * h/len, w: w/len, h: h/len};
        if(v > 0) {
          const edge = {source: nodes[s], target: nodes[t], value: value = v};
          resultMatrix.push(Object.assign(edge, rect));
        } else {
          resultMatrix.push(Object.assign({}, rect));
        }
      }
    }
    return resultMatrix;
  }

  layout.size = function(array) {
    return arguments.length ? (w = +array[0], h = +array[1], layout) : [w, h];
  }

  return layout;
}
)});
  main.variable(observer("highlight")).define("highlight", ["d3","color"], function(d3,color){return(
d => {
  d = d.target.__data__;
  d3.selectAll('.cell').filter(k => !(k.x == d.x || k.y == d.y)).style("opacity", .3);
  d3.selectAll('.cell').filter(k => k.x == d.x || k.y == d.y).style("stroke", "black").style("stroke-width", 1);
  
  d3.select('.tooltip').select("text")
                 .attr("x", d.w * .625)
                 .attr("y", d.h * .625)
                 .text(d.value ? d.value : 0);

            d3.select('.tooltip')
                .attr("transform", `translate(${[d.x -d.w/8, d.y -d.h/8]})`)
                .style("opacity", 1)

                .select("rect")
                    .style("stroke-width", 3)
                    .attr("rx", d.w/8)
                    .attr("ry", d.h/8)
                    .style("fill", d.value ? color(d.value) : 'white')
                    .attr("width", 1.25 * d.w)
                    .attr("height", 1.25 * d.w)
  }
)});
  main.variable(observer("fade")).define("fade", ["d3"], function(d3){return(
d => {
  d3.selectAll(".cell, text.source, text.target").style("opacity", 1).style("font-weight", "normal").style("font-size", "100%").style("stroke-width", 0);
  d3.select('.tooltip').style("opacity", 0);
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Constants`
)});
  main.variable(observer("value")).define("value", function(){return(
26
)});
  main.variable(observer("width")).define("width", function(){return(
700
)});
  main.variable(observer("height")).define("height", function(){return(
700
)});
  main.variable(observer("margin")).define("margin", function(){return(
100
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@v6")
)});
  return main;
}
