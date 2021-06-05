// https://observablehq.com/@meetamit/matrix-multiplication@708
import define1 from "./7cb74a9f46b5207e@416.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`
# Matrix Multiplication

This is an interactive illustration of matrix multiplication. The aim is to demonstrate — and strengthen intuition about — the relationship between the mutiplied and resulting matrices.

If ${tex`\bm{A}`} is an ${tex`n × m`} matrix and ${tex`\bm{B}`} is an ${tex`m × p`} matrix, the *matrix product* ${tex`\bm{AB}`} is defined to be the ${tex`n × p`} matrix ${tex`\bm{C}`} such that 

> ${tex`c_{ij} = a_{i1}b_{1j} +\cdots + a_{im}b_{mj}= \displaystyle\sum_{k=1}^m a_{ik}b_{kj},`}

for ${tex`i = 1, ..., n`} and ${tex`j = 1, ..., p`}.

That is, the entry ${tex`c_{ij}`} of the product is obtained by multiplying term-by-term the entries of the ${tex`i`}th row of ${tex`\bm{A}`} and the ${tex`j`}th column of ${tex`\bm{B}`}, and summing these ${tex`m`} products. In other words, ${tex`c_{ij}`} is the [dot product](https://en.wikipedia.org/wiki/Dot_product) of the ${tex`i`}th row of ${tex`\bm{A}`} and the ${tex`j`}th column of ${tex`\bm{B}`}.`
)});
  main.variable(observer("result")).define("result", ["md","tex","illustrateMatMult","mat"], function(md,tex,illustrateMatMult,mat){return(
md`## Illustration

*Hint: rollover the entries of matrix ${tex`\bm{C}`}.*

${illustrateMatMult(mat)}`
)});
  main.variable(observer("mat")).define("mat", ["Matrix","mat_mult"], function(Matrix,mat_mult)
{
  const A = new Matrix([5, 4], [
    1,  2,  3,  0,
    4,  5,  6,  1,
    1,  0,  1,  1,
    1,  1,  1,  1,
    7,  8,  9,  2
  ])
  const B = new Matrix([4, 3], [
    .1, .2,  1,
    .4, .5,  1,
    .7, .8,  1,
     1,  1,  1
  ])
  return { A, B, C: mat_mult(A, B) }
}
);
  main.variable(observer("illustrateMatMult")).define("illustrateMatMult", ["d3","html","renderMatrix","tex","inspect","mutable inspect","kSumEq","abSumEq","valSumEq"], function(d3,html,renderMatrix,tex,inspect,$0,kSumEq,abSumEq,valSumEq){return(
function ({A, B, C}) {
  const color = d3.scaleSequential(d3.interpolateWarm).domain([0, A.ncol])
  const gradient = function (c) {
    const c0 = d3.lab(c).brighter(2).toString()
    const c1 = d3.lab(c).darker(.5).toString()
    return `radial-gradient(closest-side circle at center, ${c0} 20%, ${c1} 200%)`
  }
  return html`
    ${renderMatrix(A.ncol, A.vals, {
      title: tex`\bm{A}_{${A.nrow}×${A.ncol}}`,
      background: (d, i, j) => i === inspect[0] ? gradient(color(j)) : '',
    })}
    <span class=operator>${tex`×`}</span>
    ${renderMatrix(B.ncol, B.vals, {
      title: tex`\bm{B}_{${B.nrow}×${B.ncol}}`,
      background: (d, i, j) => j === inspect[1] ? gradient(color(i)) : '',
    })}
    <span class=operator>${tex`=`}</span>
    ${renderMatrix(C.ncol, C.vals, {
      title: tex`\bm{C}_{${C.nrow}×${C.ncol}}`,
      background: (d, i, j) => i === inspect[0] && j === inspect[1] ? gradient('#ccc') : '',
      hover: (d, i, j) => 
        i !== inspect[0] || j !== inspect[1] ? $0.value = [i, j] : null,
    })}
    <div class='equation' >${  kSumEq(A.ncol, inspect[0], inspect[1])}</div>
    <div class='equation' >${ abSumEq(A.ncol, inspect[0], inspect[1])}</div>
    <div class='equation' >${valSumEq(A.ncol, inspect[0], inspect[1], A, B, C)}</div>
  `
}
)});
  main.variable(observer("renderMatrix")).define("renderMatrix", ["d3","html"], function(d3,html){return(
function renderMatrix(width, values, {title, format, each, background, hover}={}) {
  values = Array.from(values)
  const color = d3.scaleSequential(d3.interpolateGreens).domain([-.3, 1]||[0,1.3])
  format = format || d3.format('.1f')
  const div = html`<div class=annotated-matrix >
    <div class=matrix-title>${title}</div>
    <div class=matrix>
      ${values.map( (v, i) =>
        `<span class=matrix-cell>${format(v)}</span>${i % width === width - 1 ? '<br>' : ''}`
      )}
    </div>
  </div>`
  
  const noOp = () => {}  
  const apply_dijw = (fn=noOp) => function (d,i) {
    return fn.call(this, d, Math.floor(i/width), i % width, width)
  }

  d3.select(div).selectAll('.matrix-cell')
  	.data(values)
    .style('background', apply_dijw(background))
    .on('mouseover', apply_dijw(hover))
    .each(apply_dijw(each))
  return div
}
)});
  main.variable(observer("kSumEq")).define("kSumEq", ["tex"], function(tex){return(
(m, i, j) => tex`c_{${i+1}${j+1}} = \displaystyle\sum_{k=1}^${m+1} a_{${i+1}k} \cdot b_{k${j+1}}`
)});
  main.variable(observer("abSumEq")).define("abSumEq", ["d3","componentEq"], function(d3,componentEq){return(
(m, i, j) => {
  const color =  d3.scaleSequential(d3.interpolateWarm).domain([0, m])
  return d3.range(0, m).map(k => 
    componentEq(
      m, k, color(k), 
      `c_{${i+1}${j+1}}`, 
      `a_{${i+1}${k+1}}`, 
      `b_{${k+1}${j+1}}`
    )
  )
}
)});
  main.variable(observer("valSumEq")).define("valSumEq", ["d3","componentEq"], function(d3,componentEq){return(
(m, i, j, A, B, C) => {
  const color =  d3.scaleSequential(d3.interpolateWarm).domain([0, m])
  const format = d3.format('.1f')
  return d3.range(0, m).map(k => 
    componentEq(
      m, k, color(k), 
      `c_{${i+1}${j+1}}`,
      format(A.get(i,k)), 
      format(B.get(k,j)), 
      format(C.get(i,j))
    )
  )
}
)});
  main.variable(observer("componentEq")).define("componentEq", ["html","tex"], function(html,tex){return(
(m, k, color, c, a, b, d) => html`<span>
    ${k === 0 ? html`<span><span style=color:transparent>${tex`${c}`}</span>&nbsp;${tex` = `}&nbsp;</span>` : ``}
    <span style="color:${color}">${tex`${a} \cdot ${b}`}</span>
    ${k < m-1 ? html`<span>${tex`+`}</span>` : d ? html`<span>${tex`=${d}`}</span>` : ``}
  </span>`
)});
  main.define("initial inspect", function(){return(
[1, 2]
)});
  main.variable(observer("mutable inspect")).define("mutable inspect", ["Mutable", "initial inspect"], (M, _) => new M(_));
  main.variable(observer("inspect")).define("inspect", ["mutable inspect"], _ => _.generator);
  main.variable(observer("style")).define("style", ["html"], function(html){return(
html`<style>
  .annotated-matrix { display: inline-block; vertical-align: middle; margin:0 4px 20px 4px; }
  .annotated-matrix .matrix-title { text-align: center; line-height: 40px; }
  .matrix { position: relative; display: inline-block; }
  .matrix::before, .matrix::after {
    content:''; position: absolute; border:2px solid; width: .33em; bottom: -2px; top: -2px;
  }
  .matrix::before { left: -2px;  border-right: none; }
  .matrix::after  { right: -2px; border-left:  none; }
  
  .matrix-cell {
    cursor: default;
    width: 32px;
    height: 32px;
    line-height: 32px;
    font-size:.9em;
    text-align: center;
    letter-spacing: -.05em;
    display: inline-block;
    font-weight: 600;
    vertical-align: middle; 
    box-sizing: border-box;
    margin: 1px;
    position: relative;
  }
  .matrix-cell.highlighted {
    font-size: .95em;
  }

  .operator { display: inline-block; vertical-align: middle; padding-top: 20px; }
  .equation { padding: 0 0 1em 0; }
</style>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
# Dependencies

Aside from d3, this illustration uses [@nstrayer's](//@nstrayer) implementation of a \`Matrix\` class and \`mat_mult()\`, a method for matrix multiplication.
`
)});
  const child1 = runtime.module(define1);
  main.import("Matrix", child1);
  main.import("mat_mult", child1);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("https://d3js.org/d3.v5.min.js")
)});
  return main;
}
