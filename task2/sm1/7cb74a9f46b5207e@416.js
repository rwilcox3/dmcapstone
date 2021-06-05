// https://observablehq.com/@nstrayer/simple-matrices@416
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Simple Matrices

This is an attempt to build as light-weight of a matrix object in javascript as possible. It uses typed arrays with \`Float32Array\` in an attempt to gain some speed. If you don't need that level or precision try substituting in an [appropriate typed array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) of your choice. 

Also included are a few helper functions for dealing with matrices, these being:

1. \`dot_prod\`: take the dot product of two arrays,
2. \`transpose\`: take the transpose of a matrix oject,
3. \`diag\`: generate a diagonal matrix of a given size with some fill,
4. \`mat_mult\`: multiply two matrices together.

`
)});
  main.variable(observer("Matrix")).define("Matrix", function(){return(
class Matrix {
  constructor(dims, fill = 0){
    this.nrow = dims[0];
    this.ncol = dims[1];
    this.size = this.nrow*this.ncol;
    const vec_fill = fill.length > 1;
    if(vec_fill && (fill.length !== this.nrow*this.ncol)){
      throw(`Expecting a fill vector of length ${this.size} but got a vector of length ${fill.length}`)
    };
    this.vals = Float32Array.from(
      vec_fill ? 
      	fill: 
      	[...(new Array(this.nrow*this.ncol))].map(d => fill)
    );
  }
  
  // internal helper function for finding position in 2d array
  mat_pos(i,j){
    return (this.ncol)*i + j
  }
  
  // given a row and col fill the place with a value, if inplace = false then 
  // returns a new matrix object with the given location filled.
  set(i,j, val, inplace = true){
    if(inplace){
      this.vals[this.mat_pos(i,j)] = val
    } else {
      const newMat = new Matrix([this.nrow, this.ncol], [...this.vals]);
      newMat.set(i,j, val);
      return newMat
    } 
  }
  
  // returns a value at a given location
  get(i,j){
  	return this.vals[this.mat_pos(i,j)]
  }
  
  // gives back a given row
  row(i){
    const row_res = new Float32Array(this.ncol);
    for(let j=0; j<this.ncol; j++) row_res[j] = this.get(i,j);
    return row_res;
  }
  
  // ...and a given column
  col(j){
    const col_res = new Float32Array(this.nrow);
    for(let i=0; i<this.nrow; i++) col_res[i] = this.get(i,j);
    return col_res;
  }
  
  // pretty print in a 2d array
  pprint(){
    return [...(new Array(this.nrow))].map(
      (_,i) => [...(new Array(this.ncol))].map(
        (_,j) =>  this.get(i,j) ))
  }
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# Use and methods

## \`Matrix.pprint\`

We will start with the pretty print method \`pprint()\`. This will allow us to look at the matrices in a semi-coherent way as internally they are just one long 1-d vector.
`
)});
  main.variable(observer()).define(["Matrix"], function(Matrix){return(
new Matrix([2,3]).pprint()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Initializing a matrix
Next, we will look at the different ways of initializing a matrix. We're doing this after introducing \`pprint()\` as we will use it to help see what's going on easier.`
)});
  main.variable(observer()).define(["Matrix"], function(Matrix){return(
new Matrix([3,2]).pprint()
)});
  main.variable(observer()).define(["Matrix"], function(Matrix){return(
new Matrix([3,2], 5).pprint()
)});
  main.variable(observer()).define(["Matrix"], function(Matrix){return(
new Matrix([3,2], [1,2,3,4,5,6]).pprint()
)});
  main.variable(observer()).define(["Matrix"], function(Matrix){return(
new Matrix([4,2], [1,2,3,4,5,6,7])
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## \`Matrix.set\`
Next we will look at the functions to set a value at a given position. There are two ways to do this, the first is inplace (aka mutable) and the second is immutable (returns a new matrix object without modifying the original).

In an observable notebook due to cells executing at different times it's funky to deal with immutability. Keep that in mind as you look at these examples.`
)});
  main.variable(observer("test_mat")).define("test_mat", ["Matrix"], function(Matrix){return(
new Matrix([3,3])
)});
  main.variable(observer()).define(["test_mat"], function(test_mat){return(
test_mat.pprint()
)});
  main.variable(observer()).define(["test_mat"], function(test_mat)
{
  test_mat.set(1,1,5)
  test_mat.set(1,2,6)
}
);
  main.variable(observer()).define(["test_mat"], function(test_mat){return(
test_mat.set(1,2,5,false).pprint()
)});
  main.variable(observer()).define(["test_mat"], function(test_mat){return(
test_mat.pprint()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## \`Matrix.get\`

To get an element from a given position in our matrix we can use the \`Matrix.get\` method.
`
)});
  main.variable(observer()).define(["test_mat"], function(test_mat){return(
test_mat.get(1,2)
)});
  main.variable(observer()).define(["test_mat"], function(test_mat){return(
test_mat.get(1,1)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## \`Matrix.row\` and \`Matrix.col\`

In a similar vein we can get a whole row or column at a time.
`
)});
  main.variable(observer()).define(["test_mat"], function(test_mat){return(
test_mat.row(1)
)});
  main.variable(observer()).define(["test_mat"], function(test_mat){return(
test_mat.col(2)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
# Helpers

In an attempt to not polute the \`Matrix\` class with a bunch of methods here are some common manipulations that you may want implemented as their own functions.

## \`dot_prod\`

We start with a simple dot product. We would feed this with rows and columns or simply a vector.

_A big thanks to twitter user Amit Sch who pointed out that the reduce here [needs to be initialized with a zero](https://twitter.com/meetamit/status/970761760134369280) or it will cause problems. Goes to show you edge testing is valuable._
`
)});
  main.variable(observer("dot_prod")).define("dot_prod", function(){return(
(vec_a, vec_b) => vec_a.reduce((sum, d, i) => sum + d*vec_b[i], 0)
)});
  main.variable(observer()).define(["dot_prod"], function(dot_prod){return(
dot_prod([1,2,3], [4,5,6])
)});
  main.variable(observer()).define(["dot_prod","test_mat"], function(dot_prod,test_mat){return(
dot_prod(test_mat.row(1), test_mat.col(2))
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## \`transpose\`

Flips a matrices rows and columns. 
`
)});
  main.variable(observer("transpose")).define("transpose", ["Matrix"], function(Matrix){return(
function transpose(mat){
  const t_mat = new Matrix([mat.ncol, mat.nrow]);
  
  for(let i=0; i<mat.nrow; i++){
    for(let j=0; j<mat.ncol; j++){
      t_mat.set(j,i, mat.get(i,j));
    }
  }
  return t_mat
}
)});
  main.variable(observer("mat")).define("mat", ["Matrix"], function(Matrix){return(
new Matrix([2,4], [1,2,3,4,5,6,7,8])
)});
  main.variable(observer()).define(["mat"], function(mat){return(
mat.pprint()
)});
  main.variable(observer()).define(["transpose","mat"], function(transpose,mat){return(
transpose(mat).pprint()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## \`diag_mat\`

Make a diagonal matrix of a given size and a fill that can be a constant or vector.`
)});
  main.variable(observer("diag_mat")).define("diag_mat", ["Matrix"], function(Matrix){return(
function diag_mat(dim, val = 1){
  if(val.length > 1 && dim !== val.length) 
    throw(`Expected fill vector of length ${dim} but got one of length ${val.length}.`);
  const mat = new Matrix([dim, dim]);
  const vector_val = val.length > 1;
  for(let i=0; i<dim; i++){
    mat.set(i,i, vector_val ? val[i]: val);
  }
  return mat;
}
)});
  main.variable(observer()).define(["diag_mat"], function(diag_mat){return(
diag_mat(3).pprint()
)});
  main.variable(observer()).define(["diag_mat"], function(diag_mat){return(
diag_mat(3, 5).pprint()
)});
  main.variable(observer()).define(["diag_mat"], function(diag_mat){return(
diag_mat(5, [1,2,3,4,5]).pprint()
)});
  main.variable(observer()).define(["diag_mat"], function(diag_mat){return(
diag_mat(5, [1,2,3,4])
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## \`mat_mult\`

Multiplying two matrices together. Uses the \`dot_prod\` function to help. Returns a new matrix object.
`
)});
  main.variable(observer("mat_mult")).define("mat_mult", ["Matrix","dot_prod"], function(Matrix,dot_prod){return(
function mat_mult(mat_a, mat_b){
  if(mat_a.ncol !== mat_b.nrow) throw("Make sure your inner dimensions match for multiplication");
  const mat_res = new Matrix([mat_a.nrow, mat_b.ncol]); 
  for(let i=0; i<mat_a.nrow; i++){
    for(let j=0; j<mat_b.ncol; j++){
      mat_res.set(i,j, dot_prod(mat_a.row(i), mat_b.col(j)));
    }
  }
  return mat_res
}
)});
  main.variable(observer("mat_a")).define("mat_a", ["Matrix"], function(Matrix){return(
new Matrix([3,2], [3,5,6,1,5,6])
)});
  main.variable(observer("mat_b")).define("mat_b", ["Matrix"], function(Matrix){return(
new Matrix([2,5], [4,5,2,5,6,7,2,4,6,7])
)});
  main.variable(observer()).define(["mat_mult","mat_a","mat_b"], function(mat_mult,mat_a,mat_b){return(
mat_mult(mat_a, mat_b).pprint()
)});
  main.variable(observer()).define(["mat_mult","mat_b","mat_a"], function(mat_mult,mat_b,mat_a){return(
mat_mult(mat_b, mat_a)
)});
  return main;
}
