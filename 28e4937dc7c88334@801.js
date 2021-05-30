// https://observablehq.com/@dizdata/radial-dendrogram-topic-modeling-visualization@801
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["reviews_all.json",new URL("./files/67cebbb634791510ef141f08c1f57d00353aa2e0d0b3a6bc80264d294dea38a0e4c2537dd9b90c58079135aa1123fa247c9fd34ff35942f4241887e600cb579c",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Radial Dendrogram - Topic Modeling Visualization

This is a Radial Dendropgram based on [Fork of Radial Dendrogram (circus data)
2](https://observablehq.com/@icima/radial-dendrogram-circus-data). 

It is created as a visulization of results of Topic Modeling. Sizes of the circles are defined by the weights of the words contributing to the corresponding topics. Opacities of the circles can also be defined by the weights.

The data adopted is a part of [Yelp Dataset](https://www.kaggle.com/yelp-dataset/yelp-dataset?select=yelp_academic_dataset_review.json). The tutorial to create the json data file for this dendrogram from scratch using python can be found from the article here.`
)});
  main.variable(observer("chart")).define("chart", ["tree","d3","data","setColor","color","CirSize","autoBox"], function(tree,d3,data,setColor,color,CirSize,autoBox)
{

  const root = tree(d3.hierarchy(data)
     //Sorting of words. Uncomment the adopted one.
                    
     //the following line is for sorting the topic words by alphabetical order. 
     //.sort((a, b) => a.data.name.toLowerCase().localeCompare (b.data.name.toLowerCase()))
                    
     //the following line is for sorting the topic words by their weightings. 
     .sort((a, b) => d3.descending(a.data.value, b.data.value))
     );

  setColor(root);
  
  const svg = d3.create("svg");

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "grey")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .join("path")
      .attr("d", d3.linkRadial()
          .angle(d => d.x)
          .radius(d => d.y))
    .each(function(d) { d.target.linkNode = this; })
    .attr("stroke", d => d.target.color);
  
  svg.append("g")
    .selectAll("circle")
    .data(root.descendants())
    .join("circle")
      .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `)
      .attr("fill", d => d.children ? color(d.data.name) : color(d.data.group))
      //uncomment the following line to show circles with different opacities
      //.attr("fill-opacity", d => d.children ? 1 : CircleAlpha(d.data.value))
      .attr("r", d => d.children ? 4 : CirSize(d.data.value));

  svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
    .selectAll("text")
    .data(root.descendants())
    .join("text")
      .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0) 
        rotate(${d.x >= Math.PI ? 180 : 0})
      `)
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .text(d => d.data.name)
    .clone(true).lower()
      .attr("stroke", "white");

  return svg.attr("viewBox", autoBox).node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md `## Radial Dendrogram Color Setting
Contents of the domain part of "color" variables are the names of topics. There are 16 topics and this is the domain of the following cell is "Topic 00" to "Topic 15".`
)});
  main.variable(observer("toppicData")).define("toppicData", ["data"], function(data){return(
data.children.map(d => d.name)
)});
  main.variable(observer("color")).define("color", ["d3","toppicData"], function(d3,toppicData){return(
d3.scaleOrdinal()
    .domain(toppicData)
    .range(d3.schemeCategory10)
)});
  main.variable(observer("setColor")).define("setColor", ["color"], function(color){return(
function setColor(d) {
  var name = d.data.name;
  d.color = color.domain().indexOf(name) >= 0 ? color(name) : d.parent ? d.parent.color : null;
  if (d.children) d.children.forEach(setColor);
}
)});
  main.variable(observer("autoBox")).define("autoBox", function(){return(
function autoBox() {
  document.body.appendChild(this);
  const {x, y, width, height} = this.getBBox();
  document.body.removeChild(this);
  return [x, y, width, height];
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Data File for the Radial Dendrogram
The data file is in json format. The json file can be generated by following the python tutorial introduced in the introduction of this radial dendrogram.`
)});
  main.variable(observer("data")).define("data", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("reviews_all.json").json()
)});
  main.variable(observer("getMinMaxvalues")).define("getMinMaxvalues", ["data","d3"], function(data,d3){return(
function getMinMaxvalues() {
    let mappedData = data.children.map(d => d.children)
    var allthedata = []
    for (let i = 0; i < mappedData.length; i++) {
    let j = i * 2;
    allthedata[j] = d3.min(mappedData[i].map(v => v.value));
    allthedata[j+1] = d3.max(mappedData[i].map(v => v.value));
  }
  return allthedata;
}
)});
  main.variable(observer("CirSize")).define("CirSize", ["d3","getMinMaxvalues"], function(d3,getMinMaxvalues){return(
d3.scaleSqrt().domain([d3.min(getMinMaxvalues()),d3.max(getMinMaxvalues())]).range([1,8])
)});
  main.variable(observer("CircleAlpha")).define("CircleAlpha", ["d3","getMinMaxvalues"], function(d3,getMinMaxvalues){return(
d3.scaleLinear().domain([d3.min(getMinMaxvalues()),d3.max(getMinMaxvalues())]).range([0.3,1])
)});
  main.variable(observer("width")).define("width", function(){return(
975
)});
  main.variable(observer("radius")).define("radius", ["width"], function(width){return(
width / 2
)});
  main.variable(observer("tree")).define("tree", ["d3","radius"], function(d3,radius){return(
d3.cluster().size([2 * Math.PI, radius - 100])
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
