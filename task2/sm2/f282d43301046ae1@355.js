// https://observablehq.com/@nitaku/rectangular-matrix@355
import define1 from "./c24a713d6d29c43d@119.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Rectangular matrix`
)});
  main.variable(observer("mat")).define("mat", ["d3"], function(d3){return(
d =>
  d3.dsvFormat(' ')
    .parseRows(String(d).trim())
    .map(r => r.map(c => isNaN(c) ? c : +c))
)});
  main.variable(observer("m")).define("m", ["mat"], function(mat){return(
mat`
- X Y Z
a 0 0 1
b 2 0 1
c 1 1 3
d 2 0 0
e 2 0 0
f 0 0 1
g 1 2 0
h 0 1 1
i 1 3 1
j 1 2 3
`
)});
  main.variable(observer("column_array")).define("column_array", ["m","d3"], function(m,d3){return(
m[0].slice(1).map((d,j) => ({id: d, label: d, value: d3.sum(m, (r => r[j+1]))}))
)});
  main.variable(observer("row_array")).define("row_array", ["m","d3"], function(m,d3){return(
m.slice(1).map(d => ({id: d[0], label: d[0], value: d3.sum(d.slice(1))}))
)});
  main.variable(observer("data")).define("data", ["m"], function(m){return(
m.slice(1).map(r => r.slice(1)).map(r => r.map(c => [c, 1]))
)});
  main.variable(observer("viewof width")).define("viewof width", ["html"], function(html){return(
html`<input type=range min=1 max=900 value=100>`
)});
  main.variable(observer("width")).define("width", ["Generators", "viewof width"], (G, _) => G.input(_));
  main.variable(observer("viewof label_width")).define("viewof label_width", ["html"], function(html){return(
html`<input type=range min=1 max=900 value=40>`
)});
  main.variable(observer("label_width")).define("label_width", ["Generators", "viewof label_width"], (G, _) => G.input(_));
  main.variable(observer("viewof label_height")).define("viewof label_height", ["html"], function(html){return(
html`<input type=range min=1 max=900 value=40>`
)});
  main.variable(observer("label_height")).define("label_height", ["Generators", "viewof label_height"], (G, _) => G.input(_));
  main.define("initial selection", function(){return(
null
)});
  main.variable(observer("mutable selection")).define("mutable selection", ["Mutable", "initial selection"], (M, _) => new M(_));
  main.variable(observer("selection")).define("selection", ["mutable selection"], _ => _.generator);
  main.variable(observer("matrix")).define("matrix", ["d3","html","$each","mutable selection"], function(d3,html,$each,$0){return(
({data, row_array, column_array, width=300, padding=4, margin=4, label_width=40, label_height=40, bars_height=0, bars_width=0, selection=null, selectable=false, column_header='', row_header='', title='', subtitle='', box_margin=5, cell_tooltip=(c => '['+c.join(', ')+']'), column_bar_tooltip=(d => d.value), row_bar_tooltip=(d => d.value)}) => {
  const ROWS = data.length
  const COLUMNS = data[0].length
  const ASPECT = ROWS/COLUMNS
  let height = width*ASPECT
  
  // support for multivalue cells
  data = data.map(r => r.map(c => c instanceof Array ? c : [c]))
  
  const x = d3.scalePoint()
    .domain(column_array.map(d => d.id))
    .range([0, width])
    .padding(0.5)
  const y = d3.scalePoint()
    .domain(row_array.map(d => d.id))
    .range([0, height])
    .padding(0.5)
  
  const radius = x.step()*0.5
  
  const z = d3.scaleSqrt()
    .domain([0, d3.max(data, r => d3.max(r, c => d3.sum(c)))])
    .range([0, radius])
  
  const zx = d3.scaleLinear()
    .domain([0, d3.max(row_array, d => d.value)])
    .range([0, bars_width])
  const zy = d3.scaleLinear()
    .domain([0, d3.max(column_array, d => d.value)])
    .range([0, bars_height])
  
  const multivalue_color = d3.scaleOrdinal()
    .domain(d3.range(data[0][0].length))
    .range(data[0][0].map((d,i) => d3.interpolateGreys(0.5 + 0.5*i/data[0][0].length)))
  
  const svg = html`
  <svg width="${width+label_width+bars_width+padding+2*margin}" height="${width*ASPECT+label_height+bars_height+padding+2*margin}">
    <style>
      .label {
        font-family: sans-serif;
        font-size: 14px;
      }
      .grid {
        stroke: #EEE;
        fill: none;
      }
      .header {
        font-family: sans-serif;
        font-weight: bold;
        text-anchor: middle;
        alignment-baseline: hanging;
      }
      .title {
        alignment-baseline: baseline;
        font-size: 22px;
      }
      .subtitle {
        font-size: 14px;
        font-weight: normal;
        fill: gray;
      }
      .rows {
        fill: #1775b6;
      }
      .columns {
        fill: #ff7f01;
      }
      a[href]:hover {
        cursor: pointer;
        text-decoration: none;
        font-weight: bold;
      }
      .active {
        cursor: pointer;
      }
    </style>
    
    <g transform="translate(${margin},${margin})">

      <!-- GRID -->
      <g transform="translate(0, ${label_height+bars_height})">
        ${ $each(row_array)`
          <line
            class="grid"
            x1="0"
            y1="${d => y(d.id)+padding}"
            x2="${width+padding}"
            y2="${d => y(d.id)+padding}"
          />
        `}
        ${ $each(column_array)`
          <line
            class="grid"
            x1="${d => x(d.id)}"
            y1="0"
            x2="${d => x(d.id)}"
            y2="${height+padding}"
          />
        `}
      </g>

      <!-- ROW LABELS -->
      <g transform="translate(${width+padding+bars_width}, ${label_height+bars_height+padding})">
        ${ $each(row_array)`
          <a ${d => d.href ? ` href="${d.href}"` : '' }>
            <text
              class="label"
              x="6"
              y="${d => y(d.id)}"
              dy="0.35em">${d => d.label}
              <title>${d => d.description || ''}</title>
            </text>
          </a>
        `}
      </g>

      <!-- COLUMN LABELS -->
      <g>
        ${ $each(column_array)`
          <a ${d => d.href ? ` href="${d.href}"` : '' }>
            <text
              class="label"
              transform="translate(${d => x(d.id)}, ${label_height-6}) rotate(-90)"
              dy="0.35em">${d => d.label}
              <title>${d => d.description || ''}</title>
            </text>
          </a>
        `}
        <text
          class="header columns"
          x="${x.range()[0] + (x.range()[1] - x.range()[0])/2}">
            ${column_header}
        </text>
      </g>

      <!-- ROW BARS -->
      <g transform="translate(${width+padding},${label_height+bars_height+padding})">
        ${ $each(row_array)`
          <rect
            class="mark rows"
            x="0"
            y="${d => y(d.id) - radius*0.9}"
            width="${d => zx(d.value)}"
            height="${radius*1.8}">
            <title>${row_bar_tooltip}</title>
          </rect>
        `}
        <text
          class="header rows"
          transform="translate(${bars_width+label_width}, ${y.range()[0] + (y.range()[1] - y.range()[0])/2}) rotate(90)">
            ${row_header}
        </text>
      </g>

      <!-- COLUMN BARS -->
      <g transform="translate(0,${label_height})">
        ${ $each(column_array)`
          <rect
            class="mark columns"
            x="${d => x(d.id) - radius*0.9}"
            y="${d => bars_height - zy(d.value)}"
            width="${radius*1.8}"
            height="${d => zy(d.value)}">
            <title>${column_bar_tooltip}</title>
          </rect>
        `}
      </g>

      <!-- TITLE -->
      <g transform="translate(${width+padding},0)">
        <rect fill="none" stroke="#DDD" x="${box_margin}" y="${box_margin}" width="${bars_width+label_width-box_margin*2}" height="${bars_height+label_height-box_margin*2}"/>
        <text
          class="header title"
          x="${(bars_width+label_width)/2}"
          y="${(bars_height+label_height)/2}">
            ${title}
        </text>
        <text
          class="header subtitle"
          x="${(bars_width+label_width)/2}"
          y="${(bars_height+label_height)/2}"
          dy="0.6em">
            ${subtitle}
        </text>
      </g>

      <!-- MATRIX -->
      <g transform="translate(0, ${label_height+bars_height+padding})">
        ${ $each(data)`
          ${ (r,i) => $each(r)`
            ${ (c,j) => $each(c)`
              <circle
                class="mark"
                cx="${x(column_array[j].id)}"
                cy="${y(row_array[i].id)}"
                r="${(d,k) => z(d3.sum(c.slice(0, c.length-k)))}"
                fill="${(d,k) => multivalue_color(k)}"
              />
            `}
            <circle
              fill="transparent"
              class="active"
              data-ids="${row_array[i].id},${(c,j) => column_array[j].id}"
              cx="${(c,j) => x(column_array[j].id)}"
              cy="${(c,j) => y(row_array[i].id)}"
              r="${radius}">
              <title>${cell_tooltip}</title>
            </circle>
          `}
        `}
        ${ selection !== null ? `
          <circle
            fill="none"
            stroke="red"
            stroke-width="1.5px"
            cx="${x(selection[1])}"
            cy="${y(selection[0])}"
            r="${radius*1.1}"/>
        ` : ''}
      </g>
    </g>
  </svg>
  `
  
  if(selectable) {
    d3.select(svg).selectAll('.active').on('click', function (d) {
      $0.value = d3.select(this).attr('data-ids').split(',')
    })
  }
  
  return svg
}
)});
  main.variable(observer()).define(["matrix","data","row_array","column_array","width","label_width","label_height","selection"], function(matrix,data,row_array,column_array,width,label_width,label_height,selection){return(
matrix({data, row_array, column_array, width, label_width, label_height, bars_width: 50, bars_height: 50, selection, selectable: true, column_header: 'Set', row_header: 'Element', title: 'Title', subtitle: 'Subtitle'})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Dependencies`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3-selection', 'd3-dsv', 'd3-scale', 'd3-array', 'd3-scale-chromatic')
)});
  const child1 = runtime.module(define1);
  main.import("$each", child1);
  return main;
}
