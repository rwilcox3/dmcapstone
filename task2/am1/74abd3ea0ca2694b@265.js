// https://observablehq.com/@jannespeeters/adjacency-matrix-brush@265
import define1 from "./071bfe8afcb3eda4@98.js";
import define2 from "./5d9438419769b8b8@233.js";
import define3 from "./a6c00de7c09bdfa1@149.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Adjacency Matrix Brush`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `A major problem within network visualization is the occurance of hairball like graphs, from which no information at all can be extracted. This module allows to brush through the adjacency matrix of the network to visualize smaller sub-graphs of the network, allowing the user to gain more insight in specific parts of the network. The network visualization is a tweeked version of the [Force-Directed Graph](https://observablehq.com/@d3/force-directed-graph) by Mike Bostock. The data is a random generated adjacency matrix of an undirected network.`
)});
  main.variable(observer("chart")).define("chart", ["adjacencyMatrix","width","margin","height","labels","inputMatrix","color","d3","drag"], function(adjacencyMatrix,width,margin,height,labels,inputMatrix,color,d3,drag)
{
  
  const matrixLayout = adjacencyMatrix()
        .size([width/2 - margin,height-margin]);

  const data = matrixLayout(labels, inputMatrix);
  let dataFiltered = data;

  color.domain([0, d3.max(data, d => d.value)]);

  const svg = d3.create("svg").attr("width",width).attr("height",height);
  const chart_adj = svg.append("g").attr("transform", `translate(${[margin/2,margin/2]})`);
  const chart_graph = svg.append("g").attr("transform", `translate(${[width/2 + margin/2, margin/2]})`);
  drawNetwork(data);
  
  const brush = d3.brush().on("brush end", detail);
  
  const innerChart = chart_adj.append('g').attr('class','innerChart');
  const cell = innerChart
          .selectAll("g.cell")
          .data(data).join("g")
          .attr("class", "cell")
          .attr("transform", d => `translate(${[d.x,d.y]})`);
  
  cell.append("rect")
          .attr("height", d => d.h*.95)
          .attr("width", d => d.w*.95)
          .attr("rx",d => d.w/4)
          .attr("ry", d => d.h/4)
          .style("fill", d => d.value ? color(d.value) : 'white');

  chart_adj.append('g').attr('class', 'labels')
          .selectAll('text.source')
          .data(data.filter(d => d.x == 0))
          .enter()
          .append("text").attr("class",'source')
          .attr("y", d => d.y + d.h/2)      // using d.y and d.h
          .attr("x", -15)
          .text((d,i) => labels[i]);

  chart_adj.append('g').attr('class', 'labels')
          .selectAll('text.target')
          .data(data.filter(d => d.y == 0))
          .enter()
          .append("text").attr("class",'target')
          .attr("x", d => d.x + d.w/2)          // using d.x and d.w
          .attr("y", -10)
          .text((d,i) => labels[i]);
           
  chart_adj.selectAll("text")
          .style("font-family", "Arial, sans-serif")
          .style("text-anchor", "middle")
          .style("alignment-baseline", "middle");
  
  innerChart.call(brush);
  
  // Brush
  function detail({selection}) {
    if (selection) { 
      const [[x0, y0], [x1, y1]] = selection;
      dataFiltered = data.filter(d => x0 <= d.x && d.x < x1 && y0 <= d.y && d.y < y1 || x0 <= (d.x + d.w) && d.x < x1 && y0 <= (d.y + d.h) && d.y < y1);
      cell.filter(d => !(x0 <= d.x && d.x < x1 && y0 <= d.y && d.y < y1 || x0 <= (d.x + d.w) && d.x < x1 && y0 <= (d.y + d.h) && d.y < y1)).style("opacity", .3);
      cell.filter(d => x0 <= d.x && d.x < x1 && y0 <= d.y && d.y < y1 || x0 <= (d.x + d.w) && d.x < x1 && y0 <= (d.y + d.h) && d.y < y1).style("opacity", 1);
    } else { 
      dataFiltered = data;
      cell.style("opacity", 1);
    }
    drawNetwork(dataFiltered);
  }
  
  
  function drawNetwork(data) {
    // clear svg
    chart_graph.selectAll('g').remove();
    // Transform data
    const links_temp = data.filter(r => r.source);
    const nodes_temp = data.map(d => d.source).concat(data.map(d => d.target)).filter((v, i, a) => a.indexOf(v) === i).filter(r => r);
    let nodes_temp2 = [];
    for (let i = 0; i < nodes_temp.length; i++) {
      nodes_temp2.push({node: nodes_temp[i]});
    }
    const networkData = {nodes: nodes_temp2, links: links_temp}

    const links = networkData.links.map(d => Object.create(d));
    const nodes = networkData.nodes.map(d => Object.create(d));
    
    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.node).distance(250))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width/4 - margin/2, height/ 2 - margin/2));
  
    const link = chart_graph.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", d => color(d.value))
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = chart_graph.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", 8)
        .attr("fill", d3.color("#343434"))
        .call(drag(sim));

    node.append("title")
        .text(d => d.node);

    sim.on("tick", () => {
      link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    });
    
  }
     
  // Return SVG
  return svg.node();
  
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## Data`
)});
  main.variable(observer("inputMatrix")).define("inputMatrix", ["size"], function(size)
{
  let matrix = [];
  for (let j = 0; j < size; j++) {
      let Arr = [];
      for (let i = 0; i < (j + 1); i++) {
          Arr.push(Math.floor(Math.random() * 10 + 1))
      }
      matrix.push(Arr)
  }
  for (let i = 0; i < size; i++) {
      matrix[i][i] = 0;
  }
  for (let j = 0; j < size; j++) {
    for (let i = j+1; i <size; i++) {
      matrix[j].push(matrix[i][j]);
    }   
  }
  return matrix;
}
);
  const child1 = runtime.module(define1);
  main.import("headers", "labels", child1);
  main.variable(observer()).define(["labels"], function(labels){return(
labels
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Functions`
)});
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
d3.scaleSequential(d3.interpolateBlues)
)});
  const child2 = runtime.module(define2);
  main.import("adjacencyMatrix", child2);
  const child3 = runtime.module(define3);
  main.import("drag", child3);
  main.variable(observer()).define(["md"], function(md){return(
md`## Constants`
)});
  main.variable(observer("width")).define("width", function(){return(
1000
)});
  main.variable(observer("height")).define("height", function(){return(
500
)});
  main.variable(observer("margin")).define("margin", function(){return(
100
)});
  main.variable(observer("size")).define("size", function(){return(
26
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@v6")
)});
  return main;
}
