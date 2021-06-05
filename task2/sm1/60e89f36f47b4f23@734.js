// https://observablehq.com/@meetamit/similarity-matrix@734
import define1 from "./7cb74a9f46b5207e@416.js";
import define2 from "./294d0a09926daa60@708.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`
# Similarity Matrix

This is an interactive, in-browser JavaScript notebook. The code is viewable and editable. For example, the next cell creates \`entities\` — the data used in this notebook — consisting of entities **A**, **B**, **C**, **D** **E**, each of which has features *x*, *y*, ahd *z*. You can edit this (TSV) data and everything else in this notebook should update immediately in response.
`
)});
  main.variable(observer("entities")).define("entities", ["d3"], function(d3){return(
d3.tsvParse(`
id	x	y	z
A	0.4	0.0	0.6
B	0.0	0.5	0.5
C	0.0	1.0	0.0
D	0.5	0.5	0.0
E	0.3	0.4	0.3
`.trim(),
  function (entity, i, columns) {
  	// coerce each column's value (except `id`) into Number
  	return columns
  	  .slice(1) // don't coerce `id` column
      .reduce(
      	(s, c) => { s[c] = parseFloat(entity[c]); return s },
      	{ id: entity.id, type: 'entity' }
    )
  }
)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Next, we extract the names of the properties of \`entities\` into \`features\` array`
)});
  main.variable(observer("features")).define("features", ["entities"], function(entities){return(
entities.columns.slice(1).map((id) => ({ type: 'feature', id }))
)});
  main.variable(observer()).define(["md"], function(md){return(
md`It's useful to represent \`entities\` as a matrix, in order to perform matrix operations on it. Here we create \`mat0\`, an instance of a simple \`Matrix\` class:`
)});
  main.variable(observer("mat0")).define("mat0", ["Matrix","entities","features","d3"], function(Matrix,entities,features,d3){return(
new Matrix(
  [entities.length, features.length], 
  d3.merge(entities.map(s => features.map(f => s[f.id])))
)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Next comes a visual representation of that matrix, along with a simple network graph using d3's force simulation. Both the entities and the features are represented as nodes, and the links between them are based on cell values. The links' line thickness is proportional to the value of the cell. Observe how node **C** is connected only to node *y*.

The JavaScript code that renders the next cell generates \`links\` and \`nodes\` from the matrix and passes them into \`renderGraph()\` which is responsible for the visual representation. It also calls \`renderMatrix()\` for the matrix representation. Both of those rendering functions are defined in this notebook, near the bottom.`
)});
  main.variable(observer("result")).define("result", ["html","renderMatrix","mat0","features","entities","d3","renderGraph","width"], function(html,renderMatrix,mat0,features,entities,d3,renderGraph,width){return(
html`
  <div style='display:inline-block; width:39%; vertical-align:top;' >${
    renderMatrix(mat0.ncol, mat0.vals, {
      cols: features.map(({id}) => id),
      rows: entities.map(({id}) => id),
      background: (val) => val === 0 ? 'transparent' : d3.interpolateGreens(val * .66),
    })
  }</div>
  <div style='display:inline-block; width:59%; vertical-align:top;' >${
    renderGraph({
      nodes: [].concat(entities, features),
      links: d3.merge(entities.map((entity,i) => 
        features.map((feature,j) => ({
          source: i, // entity's index within nodes
          target: entities.length + j,
          value: mat0.get(i, j),
        })).filter(d => d.value > 0.)
      ))
    },
    {
      size: [width/2, 400]
    })
  }</div>
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Next, we transform the matrix \`mat0\` into \`mat1\` by reflecting it along a diagonal axis:`
)});
  main.variable(observer("viewof mat1")).define("viewof mat1", ["mat0","Matrix","renderMatrix","entities","features","d3"], function(mat0,Matrix,renderMatrix,entities,features,d3)
{
  const sz = mat0.nrow + mat0.ncol
  const cells = new Array(sz*sz)
  for(let i = 0; i < sz; i++) {
    for(let j = 0; j < sz; j++) {
      cells[i*sz + j] = i < mat0.nrow
        ? j < mat0.nrow ? 0 : mat0.get(i, j - mat0.nrow)
        : j < mat0.nrow ? mat0.get(j, i - mat0.nrow) : 0
    }
  }
  const matrix = new Matrix([sz, sz], cells)
  return Object.assign(renderMatrix(matrix.ncol, matrix.vals, {
    cols: entities.concat(features).map(({id}) => id),
    rows: entities.concat(features).map(({id}) => id),
    background: (val) => val === 0 ? 'transparent' : d3.interpolateGreens(val * .66),
    each: function(d,i,j) {
      d3.select(this)
        .classed('border-bottom-cell', i === entities.length - 1)
        .classed('border-right-cell',  j === entities.length - 1)
    }
  }), { value: matrix })
}
);
  main.variable(observer("mat1")).define("mat1", ["Generators", "viewof mat1"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`Now, by squaring \`mat1\`, we get a matrix of the similarities between entities (and features).`
)});
  main.variable(observer("viewof mat2")).define("viewof mat2", ["mat_mult","mat1","renderMatrix","entities","features","d3"], function(mat_mult,mat1,renderMatrix,entities,features,d3)
{
  const matrix = mat_mult(mat1, mat1)
  return Object.assign(renderMatrix(matrix.ncol, matrix.vals, {
    cols: entities.concat(features).map(({id}) => id),
    rows: entities.concat(features).map(({id}) => id),
    background: (val) => val === 0 ? 'transparent' : d3.interpolateGreens(val * .66),
    each: function(d,i,j) {
      d3.select(this)
        .classed('border-bottom-cell', i === entities.length - 1)
        .classed('border-right-cell',  j === entities.length - 1)
    }
  }), { value: matrix })
}
);
  main.variable(observer("mat2")).define("mat2", ["Generators", "viewof mat2"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`We can represent these similarities as a network graph. But first, let's take a short detour and break down the operation of squaring \`mat1\` to get \`mat2\`. The following graphic is interactive. You can hover over the values of **C** to see how they're related to the rows and cols of **A** and **B**.`
)});
  main.variable(observer()).define(["illustrateMatMult","mat1","mat2"], function(illustrateMatMult,mat1,mat2){return(
illustrateMatMult({ A: mat1, B: mat1, C: mat2 })
)});
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`Note that in the graphic above, matrices **A** and **B** are identical. It is a demonstration of multiplying \`mat1\` by itself. 

Matrix multiplication can be thought of as taking the [dot product](https://en.wikipedia.org/wiki/Dot_product) of the rows and columns of two matrices. Given the form of \`mat1\`, the operation of squaring it is the same as taking the dot product of each and every other entity, i.e: ${tex`\bm{A} \cdot \bm{B}`} and  ${tex`\bm{A} \cdot \bm{C}`} and ${tex`\bm{A} \cdot \bm{D}`} etc...

Dot product is a measure of similarity between vectors. Perpendicular vectors have a dot product of 0. It increases as the vectors become more co-directional. That's *how* the squaring of this particular matrix produces a similarity measurement.

Now, dot product can also be expressed in terms of the cosine between the two vectors:

${tex`\mathbf{a}\cdot\mathbf{b}=\|\mathbf{a}\|\ \|\mathbf{b}\|\cos(\theta)`}

**For this reason, squaring the matrix expectedly produces results that are proportional if not identical to cosine similarity analysis.**`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Finally, we prepare \`mat3\` by retaining the relevant cells of \`mat2\` and visualize it as another network graph:`
)});
  main.variable(observer("mat3")).define("mat3", ["Matrix","entities","d3","mat2"], function(Matrix,entities,d3,mat2){return(
new Matrix(
  [entities.length, entities.length],
  d3.merge(
    mat2.pprint()
    .slice(0, entities.length)
    .map((row, i) => {
      return row
        .slice(0, entities.length)
        .map((value, j) => j >= i ? 0 : value)
    })
  )
)
)});
  main.variable(observer()).define(["html","renderMatrix","mat3","entities","d3","renderGraph","width"], function(html,renderMatrix,mat3,entities,d3,renderGraph,width){return(
html`
  <div style='display:inline-block; width:39%; vertical-align:top;' >${
    renderMatrix(mat3.ncol, mat3.vals, {
      cols: entities.map(({id}) => id),
      rows: entities.map(({id}) => id),
      background: (val) => val === 0 ? 'transparent' : d3.interpolateGreens(val * .66),
    })
  }</div>
  <div style='display:inline-block; width:59%; vertical-align:top;' >${
    renderGraph({
      nodes: [].concat(entities),
      links: d3.merge(entities.map((entity1, i) => 
        entities.map((entity2, j) => ({
          source: i, // entity's indexes within nodes
          target: j,
          value: mat3.get(i, j),
        })).filter(d => d.value > 0)
      )),
      distance: d => 300 * (1-d.value)
    }, { size: [width/2, 400] })
  }</div>
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Functions and Dependencies

Below we define functions (\`renderGraph()\` and \`renderMatrix()\`) and import dependencies (d3, etc) used in the cells above.`
)});
  main.variable(observer("renderGraph")).define("renderGraph", ["width","d3","DOM","drag"], function(width,d3,DOM,drag){return(
function (graph, {size}={}) {
  const w = size && size[0] ? size[0] : width
  const h = size && size[1] ? size[1] : 600
  const links = graph.links.map(d => Object.create(d));
  const nodes = graph.nodes.map(d => Object.create(d));
  
  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).distance(graph.distance || 90)/*.strength(d => d.value/50)*/)
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(w / 2, h / 2))
      .on("tick", ticked);
  
  const svg = d3.select(DOM.svg(w, h));
  
  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter().append("line")
      .attr("stroke-width", d => 10 * d.value)
  
  const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
      .call(drag(simulation))
      .call(node => {
        node.append('circle')
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
	      .attr("r", d => d.type === 'entity' ? 16 : 14)
    	  .attr("fill", d => d.type === 'entity' ? '#333' : '#ccc')
		node.append('text')
          .text(d => d.id)
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .style('font-weight', 'bold')
          .attr('fill', d => d.type === 'entity' ? '#ccc' : '#444')
      })

  function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    
    node
        .attr("transform", d => `translate(${d.x},${d.y})`)
  }
  
  return svg.node();
}
)});
  main.variable(observer("renderMatrix")).define("renderMatrix", ["d3","html"], function(d3,html){return(
function renderMatrix(width, values, {title, format, each, isHighlighted, background, hover, cols, rows}={}) {
  values = Array.from(values)
  const color = d3.scaleSequential(d3.interpolateGreens).domain([-.3, 1]||[0,1.3])
  format = format || d3.format('.1f')
  const div = html`<div class=annotated-matrix >
    ${title ? `<div class=matrix-title>${title}</div>` : ''}
	${cols  ? `<div class=matrix-header>
      ${rows ? '<span class=matrix-cell>&nbsp;</span>' : ''}
      ${cols.map(c => `<span class=matrix-cell>${c}</span>`).join('')}
    </div>` : ''}
	${rows  ? `<div class=matrix-gutter>${rows.map(r => `<span class=matrix-cell>${r}</span><br>`).join('')}</div>` : ''}
    <div class=matrix>
      ${values.map( (v, i) =>
        `<span class=matrix-cell>${format(v)}</span>${i % width === width - 1 ? '<br>' : ''}`
      )}
    </div>
	<style>
      .matrix-gutter {display: inline-block; }
      .border-bottom-cell::after, .border-right-cell::after {
		content: '';
        position: absolute;
        left: -2px; top: -2px; right: -2px; bottom: -2px;
      }
      .border-bottom-cell::after {
        border-bottom: 2px solid #555;
      }
      .border-right-cell::after {
        border-right: 2px solid #555;
      }
    </style>
  </div>`
  
  const noOp = () => {}  
  const apply_dijw = (fn=noOp) => function (d,i) {
    return fn.call(this, d, Math.floor(i/width), i % width, width)
  }

  d3.select(div).select('.matrix').selectAll('.matrix-cell')
  	.data(values)
    .style('background', apply_dijw(background))
    .on('mouseover', apply_dijw(hover))
    .each(apply_dijw(each))
  return div
}
)});
  main.variable(observer("drag")).define("drag", ["d3"], function(d3){return(
simulation => {
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("https://d3js.org/d3.v5.min.js")
)});
  const child1 = runtime.module(define1);
  main.import("Matrix", child1);
  main.import("mat_mult", child1);
  const child2 = runtime.module(define2);
  main.import("illustrateMatMult", child2);
  main.import("style", child2);
  main.variable(observer()).define(["style"], function(style){return(
style
)});
  return main;
}
