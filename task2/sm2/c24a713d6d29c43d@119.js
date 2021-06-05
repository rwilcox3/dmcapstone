// https://observablehq.com/@nitaku/sugar-strings@119
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Sugar strings`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`**Sugar strings** is a small experimental module to enhance ES6 string interpolation syntax adding tests and loops. This could be useful to remove lots of syntax when using the HTML template literal here on Observable.`
)});
  main.variable(observer("data")).define("data", function(){return(
['apples', 'oranges', 'lemons', 'pears']
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Examples:`
)});
  main.variable(observer()).define(["html","data"], function(html,data){return(
html`I really like <b>${data[0]}</b>`
)});
  main.variable(observer()).define(["html","$each","data"], function(html,$each,data){return(
html`<ul>${ $each(data)`<li>${(d) => d.toUpperCase()}</li>` }</ul>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Public functions`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### $if
\`$if(test) : String\``
)});
  main.variable(observer("$if")).define("$if", ["_funtag"], function(_funtag){return(
(test) => (literals, ...substitutions) => test ? _funtag(literals, substitutions)() : ''
)});
  main.variable(observer()).define(["md"], function(md){return(
md`**$if** Outputs the template string only if the provided test is truthy:`
)});
  main.variable(observer()).define(["$if"], function($if){return(
$if(4%2 == 0)`Even!`
)});
  main.variable(observer()).define(["$if"], function($if){return(
$if(5%2 == 0)`Even!`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`*(You can use the ternary operator instead if you want an else branch)*`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### $each
\`$each(data, separator='') : String\``
)});
  main.variable(observer("$each")).define("$each", ["_funtag"], function(_funtag){return(
(data, separator='') => (literals, ...substitutions) => data.map(_funtag(literals, substitutions)).join(separator)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`**$each** repeates the template string for each element in the given array:`
)});
  main.variable(observer()).define(["$each","data"], function($each,data){return(
$each(data)`<A fruit!>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`You can join the strings with a custom separator if you pass it as a second parameter:`
)});
  main.variable(observer()).define(["$each","data"], function($each,data){return(
$each(data,' ')`<A fruit!>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`String interpolation also accepts a function, which is called for each datum in the array`
)});
  main.variable(observer()).define(["$each","data"], function($each,data){return(
$each(data,' ')`<Wow, ${(d) => d.toUpperCase()}!>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`You can use **$each** with the HTML template literal:`
)});
  main.variable(observer()).define(["html","$each","data"], function(html,$each,data){return(
html`
<ol>
  ${$each(data)`<li>Test: ${(d) => d}</li>`}
</ol>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Internal functions
This is an implementation of a "passthrough" tag function modified to also accept functions of a datum as substitutions (see: https://leanpub.com/understandinges6/read#defining-tags):`
)});
  main.variable(observer("_funtag")).define("_funtag", function(){return(
(literals, substitutions) => function(d, index) {
  let result = ""

  // run the loop only for the substitution count
  for (let i = 0; i < substitutions.length; i++) {
    result += literals[i]
    result += typeof substitutions[i] === "function" ? substitutions[i](d, index) : substitutions[i]
  }

  // add the last literal
  result += literals[literals.length - 1]

  return result
}
)});
  return main;
}
