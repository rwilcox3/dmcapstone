// https://observablehq.com/@nitaku/similarity-matrix@117
import define1 from "./5225fc5540935a85@33.js";
import define2 from "./f282d43301046ae1@355.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Similarity Matrix`
)});
  main.variable(observer("distance")).define("distance", ["d3"], function(d3){return(
(a, b) => d3.sum(a.map((d, i) => a[i] != b[i] ? 1 : 0))
)});
  main.variable(observer("similarities")).define("similarities", ["data","distance"], function(data,distance){return(
data.map(a => data.map(b => (a.length - distance(a,b))/a.length))
)});
  main.variable(observer()).define(["matrix","similarities","rows_header","d3"], function(matrix,similarities,rows_header,d3){return(
matrix({data: similarities, row_array: rows_header.map(d => ({id: d, label: d})), column_array: rows_header.map(d => ({id: d, label: d})), width: 500, label_width: 400, label_height: 140, cell_tooltip: (d => `${d3.format('.0%')(d[0])} features in common` ), title: 'The Simpsons characters', subtitle: 'similarities according to a subset of features'})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Dependencies`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3-array', 'd3-format')
)});
  const child1 = runtime.module(define1);
  main.import("data", child1);
  main.import("rows_header", child1);
  const child2 = runtime.module(define2);
  main.import("matrix", child2);
  main.import("selection", child2);
  return main;
}
