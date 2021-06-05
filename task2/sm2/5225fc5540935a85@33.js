// https://observablehq.com/@nitaku/biadjacency-matrix@33
import define1 from "./f282d43301046ae1@355.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Biadjacency Matrix`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`An example of a [biadjacency matrix](https://en.wikipedia.org/wiki/Adjacency_matrix#Of_a_bipartite_graph), a rectangular matrix that defines a bipartite graph. A typical adjacency matrix would be a less efficient representation, because it would contain a large number of zeroes (in a bipartite graph, nodes of a type are never connected with nodes of the same type).

In this particular case, the two types of nodes are elements (characters from *The Simpsons*) belonging to sets (representing a character's features)`
)});
  main.variable(observer()).define(["matrix","data","rows_header","columns_header"], function(matrix,data,rows_header,columns_header){return(
matrix({data, row_array: rows_header.map(d => ({id: d, label: d})), column_array: columns_header.map(d => ({id: d, label: d})), width: 100, label_width: 200, label_height: 100})
)});
  main.variable(observer("mat")).define("mat", ["d3"], function(d3){return(
d =>
  d3.dsvFormat(' ')
    .parseRows(String(d).trim())
    .map(r => r.map(c => isNaN(c) ? c : +c))
)});
  main.variable(observer("data")).define("data", ["mat"], function(mat){return(
mat`
1 0 0 0 0 0
1 0 0 0 1 0
0 0 1 0 1 1
0 1 0 0 0 0
0 0 0 0 0 0
0 0 1 0 1 0
0 0 0 1 1 1
0 0 1 0 1 0
0 0 0 0 1 0
1 1 0 0 1 0
0 0 0 0 1 0
0 0 1 1 1 0
0 0 0 1 1 1
1 0 0 0 1 0
0 0 0 1 1 0
0 0 0 0 1 0
0 0 0 1 1 0
0 1 0 0 0 0
0 0 0 0 0 0
0 0 0 0 0 0
0 0 1 0 1 1
0 0 1 0 1 1
1 0 0 1 1 0
1 0 0 0 1 0
`
)});
  main.variable(observer("rows_header")).define("rows_header", function(){return(
['Lisa','Bart','Homer','Marge','Maggie','Barney','Mr. Burns','Mo','Ned','Milhouse','Grampa','Krusty','Smithers','Ralph','Sideshow Bob','Kent Brockman','Fat Tony','Jacqueline Bouvier','Patty Bouvier','Selma Bouvier','Lenny Leonard','Carl Carlson','Nelson','Martin Prince']
)});
  main.variable(observer("columns_header")).define("columns_header", function(){return(
['School','Blue Hair','Duff Fan','Evil','Male','Power Plant']
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Dependencies`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3-dsv')
)});
  const child1 = runtime.module(define1);
  main.import("matrix", child1);
  return main;
}
