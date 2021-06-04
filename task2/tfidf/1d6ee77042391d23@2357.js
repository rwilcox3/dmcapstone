// https://observablehq.com/@kerryrodden/introduction-to-text-analysis-with-tf-idf@2357
import define1 from "./e93997d5089d7165@2303.js";
import define2 from "./60ea978986bfd25e@1624.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Introduction to text analysis with TF-IDF`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Earlier this year, the *New York Times* published an ["Overlooked no more" belated obituary](https://www.nytimes.com/2019/01/02/obituaries/karen-sparck-jones-overlooked.html) of [Karen Spärck Jones](https://en.wikipedia.org/wiki/Karen_Sp%C3%A4rck_Jones), who invented the concept of Inverse Document Frequency in 1972. This is now best known as part of the text analysis technique TF-IDF ([Term Frequency - Inverse Document Frequency](https://en.wikipedia.org/wiki/Tf-idf)). 

When I was a PhD student, I was a teaching assistant for Karen's class on Information Retrieval, and one of my readings was the technical report *[Simple, proven approaches to text retrieval](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-356.pdf)*, written by Karen and [Stephen Robertson](https://en.wikipedia.org/wiki/Stephen_Robertson_%28computer_scientist%29). In this notebook, I'll explain some of the concepts from that paper through a series of interactive examples.

More specifically, TF-IDF is a method for *term weighting*, where each of the documents in a collection is characterized using weights assigned to the words (or terms) present in it. This makes it possible to rank the documents according to their estimated relevance to a search query. These concepts are still relevant to modern search engines and other kinds of text analysis.

## The \`tiny-tfidf\` library

I wrote a small [library](https://github.com/kerryrodden/tiny-tfidf) and [NPM package](https://www.npmjs.com/package/tiny-tfidf) called \`tiny-tfidf\` to help with this explanation. It implements a version of TF-IDF known as [BM25](https://en.wikipedia.org/wiki/Okapi_BM25), as described in the original [technical report](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-356.pdf). Paragraphs of indented text in this notebook are direct quotes from that technical report.

It also includes an implementation of a basic document similarity metric, based on [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity).

Typically this kind of analysis would be done offline, rather than interactively in JavaScript. So the use case for this package is mostly educational: to analyze very small text collections as a way of understanding the techniques involved.

It's an ES6 module, so on modern browsers we can just import it into Observable.`
)});
  main.variable(observer("tfidf")).define("tfidf", function(){return(
import("https://unpkg.com/tiny-tfidf?module")
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
If you haven't used Observable before, a few things to know:
- code cells have a grey background.
- the result of executing a code cell will appear above that cell, in a form that you can inspect.
- results may be blank while the data is loading.
- code cells may be hidden by default; if no code is visible for a particular output, such as a table or chart, you can see it via the cell's menu on the left.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Example dataset
We'll use a realistic dataset that is still small enough to process in the browser. It has 50 documents: [the "State of the State" speeches by the governors of all 50 US states](https://github.com/fivethirtyeight/data/tree/master/state-of-the-state), as collected, analyzed, and published by [FiveThirtyEight](https://fivethirtyeight.com/features/what-americas-governors-are-talking-about/). 🙏`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`First we retrieve the metadata file, which tells us the name of the speech transcript file for each state, plus other details about the governors.`
)});
  main.variable(observer("metadata")).define("metadata", ["d3"], function(d3){return(
d3.csv(
  "https://raw.githubusercontent.com/fivethirtyeight/data/master/state-of-the-state/index.csv"
)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Next, we get the list of states from this metadata file...`
)});
  main.variable(observer("states")).define("states", ["metadata"], function(metadata){return(
metadata.map(d => d.state)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`... and the locations of the actual transcripts of the speeches, which we can then fetch using \`d3.text\`.`
)});
  main.variable(observer("files")).define("files", ["metadata"], function(metadata){return(
metadata.map(d => "https://raw.githubusercontent.com/fivethirtyeight/data/master/state-of-the-state/speeches/" + d.filename)
)});
  main.variable(observer("speeches")).define("speeches", ["files","d3"], function(files,d3){return(
Promise.all(files.map(d => d3.text(d)))
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Now we'll use \`tiny-tfidf\` to process the speeches. The main class is called \`\`Corpus\`\`, which means a collection of documents. Its constructor expects an array of document identifiers, with a parallel array containing the text of each document. There are also some optional parameters that we'll get into later.`
)});
  main.variable(observer("corpus")).define("corpus", ["tfidf","states","speeches","useStopwords","customStopwords","K1","b"], function(tfidf,states,speeches,useStopwords,customStopwords,K1,b){return(
new tfidf.Corpus(
  states,
  speeches,
  useStopwords,
  customStopwords,
  K1,
  b
)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Term frequency

A very simple way to characterize a document is just to count how often each word occurs in it. This concept is called the *term frequency*.`
)});
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`
> The term frequency for term ${tex`t(i)`} in document ${tex`d(j)`} is:
>
> ${tex`TF(i,j) = \text{the number of occurrences of term}\ t(i) \text{in document}\ d(j)`}
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`For example, here are the 10 most common terms in the governor's speech for California. This excludes any words of only 1 character.`
)});
  main.variable(observer()).define(["corpus","table","d3"], function(corpus,table,d3)
{
  const document = corpus.getDocument("California");
  const tfTable = table(
    document
      .getUniqueTerms()
      .map(t => ({
        Term: t,
        Frequency: document.getTermFrequency(t)
      }))
      .sort((a, b) => d3.descending(a.Frequency, b.Frequency))
      .slice(0, 10)
  );
  tfTable.style.maxWidth = "200px";
  return tfTable;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`As you can see, the term frequency is not generally that useful by itself, since the most frequent words in a document are usually just words that are frequent in general.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`We can use a list of *stopwords* to discard words like this - words that we expect will not be useful for any document collection. Here is the list that \`tiny-tfidf\` is using:`
)});
  main.variable(observer()).define(["corpus"], function(corpus){return(
corpus.getStopwords().getStopwordList()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Stopword filtering is enabled by default, but you can turn it off via the optional \`\`useStopwords\`\` parameter in the constructor for \`\`Corpus\`\`.`
)});
  main.variable(observer("useStopwords")).define("useStopwords", function(){return(
true
)});
  main.variable(observer()).define(["md"], function(md){return(
md`And if you want to specify your own stopwords to be added to the default list, you can do this in the optional \`\`customStopwords\`\` parameter.`
)});
  main.variable(observer("customStopwords")).define("customStopwords", function(){return(
[]
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Here are the most frequent terms for the California speech, after stopword filtering using the parameters above.`
)});
  main.variable(observer()).define(["corpus","table","d3"], function(corpus,table,d3)
{
  const document = corpus.getDocument("California");
  const tfTableMinusStopwords = table(
    document
      .getUniqueTerms()
      .filter(d => !corpus.getStopwords().includes(d))
      .map(t => ({
        Term: t,
        Frequency: document.getTermFrequency(t)
      }))
      .sort((a, b) => d3.descending(a.Frequency, b.Frequency))
      .slice(0, 10)
  );
  tfTableMinusStopwords.style.maxWidth = "200px";
  return tfTableMinusStopwords;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`With words like "California" and "water", this list seems a bit more useful for characterizing the speech, but we can still do better - words like "state" and "let" are probably also very frequent in other speeches.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Collection frequency (a.k.a. inverse document frequency)

Words like "state" and "let" are probably not very useful for characterizing an individual speech, but we don't necessarily want to filter them out altogether (or try to predict all custom stopwords in advance). Instead, we can adjust the weight that each term receives for a particular document, by taking into account how many documents in the collection contain that term. This is known as the *collection frequency* or *inverse document frequency*. Frequent terms get the lowest weights, and infrequent terms get the highest.`
)});
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`> ${tex`
\text{Given:}\\
\\[2ex]
n = \text{the number of documents term t(i) occurs in}\\
N = \text{the number of documents in the collection}\\
\\[2ex]
\text{the Collection Frequency Weight for a term is then\\}\\
\\[2ex]
CFW(i) = \log(N) - \log(n)`}
`
)});
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`This is visualized in the graph below, for our collection of ${tex`N=50`} documents. So, for example, a term that occurs in 30 documents would have a ${tex`CFW`} of about 0.5.`
)});
  main.variable(observer()).define(["corpus","d3"], function(corpus,d3)
{
  const width = 350;
  const height = 350;
  const margin = { top: 10, right: 10, bottom: 60, left: 60 };

  const N = corpus.getDocumentIdentifiers().length;
  const xDomain = d3.range(1, N + 1);
  const data = xDomain.map(d => [d, Math.log(N) - Math.log(d)]);

  const x = d3
    .scaleLinear()
    .domain([0, N])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d[1])])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(5)
    .tickSizeOuter(0);

  const yAxis = d3.axisLeft(y);

  const line = d3
    .line()
    .x(d => x(d[0]))
    .y(d => y(d[1]));

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .style("font-size", "12px")
    .call(xAxis)
    .append("text")
    .attr("x", width - 5)
    .attr("y", margin.bottom - 15)
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .text("n = number of documents a term appears in");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .style("font-size", "12px")
    .call(yAxis)
    .append("text")
    .attr("x", -margin.left)
    .attr("y", margin.top)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .text("CFW");

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round")
    .attr("d", line);

  return svg.node();
}
);
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`One implication of the original ${tex`CFW`} formula, visible in the chart above: a term that appears in every document will have a collection frequency weight of 0. Because the ${tex`CFW`} is used as a multiplier in the final term weight, this means that these very common terms effectively disappear, in the same way that stopwords do, and therefore will produce no results for a query. I think this is counterintuitive, so in the \`tiny-tfidf\` implementation, which is meant for educational purposes, I chose to use a collection frequency weight of ${tex`\ log(N+1) - log(n)`}, so that a term appearing in every document gets a very low weight, not zero.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Here are the collection frequencies (and corresponding collection frequency weights) for the terms that appear in at least 30 of the 50 state-of-the-state speeches. They are sorted in descending order of collection frequency, so the terms that appear in all 50 documents are listed first (note that they have a very low CFW, not zero).`
)});
  main.variable(observer("maxCF")).define("maxCF", function(){return(
30
)});
  main.variable(observer()).define(["table","corpus","maxCF"], function(table,corpus,maxCF)
{
  const cfwTable = table(
    corpus
      .getTerms()
      .map(term => ({
        Term: term,
        CF: corpus.getCollectionFrequency(term),
        CFW: corpus.getCollectionFrequencyWeight(term)
      }))
      .filter(d => d.CF >= maxCF)
      .sort((a, b) => b.CF - a.CF)
  );
  cfwTable.style.maxWidth = "250px";
  return cfwTable;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`Here's a histogram showing the number of terms that appear in each number of documents. You can see that a very large number of terms appear in only one document, and a very small number appear in every document.`
)});
  main.variable(observer()).define(["corpus","d3","width"], function(corpus,d3,width)
{
  const collectionFrequencies = corpus
    .getTerms()
    .map(t => corpus.getCollectionFrequency(t));
  const height = 400;
  const margin = { top: 10, right: 10, bottom: 60, left: 80 };
  const data = d3
    .nest()
    .key(d => d)
    .rollup(d => d.length)
    .entries(collectionFrequencies)
    .map(d => ({ n: +d.key, count: d.value }))
    .sort((a, b) => d3.ascending(a.n, b.n));

  const x = d3
    .scaleBand()
    .paddingInner(0.1)
    .domain(data.map(d => d.n))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  const bar = svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.n))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.count))
    .attr("height", d => y(0) - y(d.count));

  const xAxis = d3
    .axisBottom(x)
    .tickValues([1, 2, 3, 4].concat(d3.range(5, data.length + 1, 5)))
    .tickSizeOuter(0);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .style("font-size", "12px")
    .call(xAxis)
    .append("text")
    .attr("x", width - 5)
    .attr("y", margin.bottom - 15)
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .text("Number of documents");

  const yAxis = d3.axisLeft(y);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .style("font-size", "12px")
    .call(yAxis)
    .append("text")
    .attr("x", -margin.left)
    .attr("y", margin.top)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .text("Count");

  return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`### Document length

We need to also adjust the weights for document length, because otherwise long documents would all be weighted higher than short documents, simply because they have more occurrences of each term.
`
)});
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`> ${tex`
DL(j) = \text{the total of term occurrences in document}\ d(j)
\\[2ex]
\text{The use of document length described below actually normalizes the measure by the length of an average document:}
\\[2ex]
NDL(j) = {\dfrac{DL(j)}{(\text{Average DL for all documents})}}
`}
`
)});
  main.variable(observer("lengths")).define("lengths", ["corpus"], function(corpus){return(
corpus
  .getDocumentIdentifiers()
  .map(d => [d, corpus.getDocument(d).getLength()])
  .sort((a, b) => b[1] - a[1])
)});
  main.variable(observer()).define(["md","d3","lengths"], function(md,d3,lengths){return(
md`From the \`lengths\` array we can see that:

- The average speech length is ${d3.mean(lengths, d => d[1])} words.
- The longest speech is ${lengths[0][0]}, with ${lengths[0][1]} words.
- The shortest speech is ${lengths[49][0]}, with ${lengths[49][1]} words.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Combining the evidence (TF-IDF)

The combination of these three signals, plus a couple of tuning constants, is what gives us the BM25 combined weight for each term. This is the "TF-IDF" weight, described in the reference tech report as Combined Weight:
`
)});
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`
> For one term ${tex`t(i)`} and one document ${tex`d(j)`}, the Combined Weight is
> 
> ${tex`CW(i,j) = {\dfrac{CFW (i) * TF(i,j) * (K1+1)} {K1 * ((1-b) + (b * NDL(j) ) ) + TF(i,j)}}`}
>
> ${tex`K1`} and ${tex`b`} are tuning constants (see below). The formula ensures that (a) the effect of term frequency is not too strong (doubling ${tex`TF`} does not double the weight), and (b) for a term occurring once in a document of average length, the weight is just ${tex`CFW`}.
`
)});
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`This looks like a complicated formula, but it basically just involves multiplying the term frequency by the collection frequency weight (IDF) and then modifying that using the normalized document length. ${tex`K1`} and ${tex`b`} are tuning constants:
- ${tex`K1`} modifies term frequency (higher values increase its influence; in the original report it is recommended that this "should be set after systematic trials on the particular collection of documents")
- ${tex`b`} modifies document length (between 0 and 1; towards 1 means that documents are long because they are repetitive or verbose, and towards 0 means they are long because they are multitopic)`
)});
  main.variable(observer()).define(["md","tex"], function(md,tex){return(
md`The \`\`tiny-tfidf\`\` library uses the recommended default values of 2.0 for ${tex`K1`} and 0.75 for ${tex`b`}, but you can tweak the values below to change them for this notebook.`
)});
  main.variable(observer("K1")).define("K1", function(){return(
2.0
)});
  main.variable(observer("b")).define("b", function(){return(
0.75
)});
  main.variable(observer()).define(["md"], function(md){return(
md`We can then use these weights as a means of characterizing each document with terms: the terms that are most characteristic of a document are those that appear frequently in the document, relative to the frequency with which that term appears in the collection as a whole.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Returning to the example of California, we see that the top TF-IDF weighted terms from that speech seem much more characteristic than the most frequent terms we looked at above.`
)});
  main.variable(observer()).define(["table","corpus","d3"], function(table,corpus,d3)
{
  const tfidfTable = table(
    corpus
      .getTopTermsForDocument("California")
      .map(d => ({
        Term: d[0],
        Weight: d[1]
      }))
      .sort((a, b) => d3.descending(a.Weight, b.Weight))
      .slice(0, 10)
  );
  tfidfTable.style.maxWidth = "200px";
  return tfidfTable;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`In the table below we can compare, for every state, the most frequent term (that isn't a stopword) with the top TF-IDF weighted term. In some cases these are the same, but for others, the most frequent term does not have the highest TF-IDF weight, depending on how often that term appears in other speeches. As we saw above, the word *state* appears in all 50 speeches; the TF-IDF weighting demotes it from being the top term for any individual state.`
)});
  main.variable(observer()).define(["table","corpus","html","fileLookup","d3"], function(table,corpus,html,fileLookup,d3)
{
  const statesTable = table(
    corpus.getDocumentIdentifiers().map(d => ({
      State: html`<a target="_blank" href="${fileLookup.get(d)}">${d}</a>`,
      "Most frequent (non-stopword) term": corpus
        .getDocument(d)
        .getUniqueTerms()
        .filter(t => !corpus.getStopwords().includes(t))
        .map(t => ({
          Term: t,
          Frequency: corpus.getDocument(d).getTermFrequency(t)
        }))
        .sort((a, b) => d3.descending(a.Frequency, b.Frequency))[0].Term,
      "Top weighted term via TF-IDF": corpus.getTopTermsForDocument(d)[0][0]
    }))
  );
  return statesTable;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md` In many cases, the top-weighted TF-IDF term is the collective noun used for people from that state (such as *Californians*, or *Hoosiers* for Indiana), often displacing the name of the state. 

Why does that happen? Governors do sometimes mention the names of other states, usually in the context of a comparison, for example the [Wisconsin speech](https://github.com/fivethirtyeight/data/blob/master/state-of-the-state/speeches/Wisconsin_SOTS.txt):

> *We have a real opportunity here, folks. At the end of the day, Mr. Majority Leader and Mr. Speaker, healthcare
> should not be a partisan issue – Republican states like Kentucky, Nebraska, and Idaho have expanded Medicaid, and
> so have Democratic states like Washington, California, and Minnesota. We should be able to get it done here, too.*

... but they don't tend to mention the names for people from those other states, and so those terms appear only in the document for the home state, giving them a higher collection frequency weight (inverse document frequency) and therefore a higher combined (TF-IDF) weight. 
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Ranking documents for a query

Now we are able to score the documents in the collection, for a given query. To do this, we take every document, identify which of the query terms appear in it, and add together their combined (TF-IDF) weights.

So, for example, the term *hurricane* appears in 7 of the speeches. Scoring them for this query is the same as extracting the combined (TF-IDF) weight for the term *hurricane* from each document.`
)});
  main.variable(observer()).define(["searchResultsTable"], function(searchResultsTable){return(
searchResultsTable("hurricane")
)});
  main.variable(observer()).define(["md"], function(md){return(
md`For queries with more terms, we add together the weights of the different terms, for each document.

Below are the results for the query *hurricane florence*. We can see that North Carolina, South Carolina, and Virginia each get higher scores than they did for the query *hurricane*, because their speeches also contain the term *florence*. The scores for the other states are the same as they were for *hurricane* alone.`
)});
  main.variable(observer()).define(["searchResultsTable"], function(searchResultsTable){return(
searchResultsTable("hurricane florence")
)});
  main.variable(observer()).define(["md"], function(md){return(
md`You can try your own search in the box below. For example, try "hamilton" to find the speeches where governors mentioned Alexander Hamilton.`
)});
  main.variable(observer("viewof searchQuery")).define("viewof searchQuery", ["text"], function(text){return(
text({
  placeholder: "Enter query text",
  submit: "Go"
})
)});
  main.variable(observer("searchQuery")).define("searchQuery", ["Generators", "viewof searchQuery"], (G, _) => G.input(_));
  main.variable(observer()).define(["searchResultsTable","searchQuery"], function(searchResultsTable,searchQuery){return(
searchResultsTable(searchQuery)
)});
  main.variable(observer()).define(["md","corpus"], function(md,corpus){return(
md`## Cosine similarity
We can also use the term weights to measure the similarity of the documents to each other. One popular method involves representing each document as a vector of its term weights: each entry in the vector corresponds to one term from the collection. 

Since there are ${corpus.getTerms().length} terms in the collection and ${
  corpus
    .getTerms()
    .map(t => corpus.getCollectionFrequency(t))
    .filter(d => d === 1).length
} of them appear in only one document, the vectors are generally quite sparse (containing a lot of zeroes).

We can then use the cosine of the angle between the vectors (in the ${
  corpus.getTerms().length
}-dimensional space defined by the terms in the collection) as the similarity metric - a technique generally known as [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity). The complement (dissimilarity or distance) is often used in practice, and a *distance matrix* represents the distance between every pair of documents. \`\`tiny-tfidf\`\` has a \`\`Similarity\`\` class to calculate this matrix.`
)});
  main.variable(observer("similarity")).define("similarity", ["tfidf","corpus"], function(tfidf,corpus){return(
new tfidf.Similarity(corpus)
)});
  main.variable(observer("matrix")).define("matrix", ["similarity"], function(similarity){return(
similarity.getDistanceMatrix()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`In the visualization below, darker squares correspond to a less distant (more similar) pair of documents. The main diagonal is greyed out because the color scale is defined after excluding the distance of a document from itself (which is always 0).

Hover over a square to see the distance between a particular pair of states, plus the top 5 terms that the pair have in common.`
)});
  main.variable(observer()).define(["d3","matrix","corpus"], function(d3,matrix,corpus)
{
  const size = 850;
  const margin = { topAndLeft: 120, bottomAndRight: 120 };

  const color = d3
    .scaleSequential(d3.interpolateGreens)
    .domain(d3.extent(d3.merge(matrix.matrix).filter(d => d > 0.01)).reverse());

  const scale = d3
    .scaleBand()
    .domain(matrix.identifiers)
    .range([margin.topAndLeft, size - margin.bottomAndRight])
    .padding(0.1);

  const div = d3.create("div").style("overflow-x", "auto");

  const tooltip = div
    .selectAll("#matrix-tooltip")
    .data([null]) // only append the tooltip div if it doesn't already exist
    .join("div")
    .attr("id", "matrix-tooltip")
    .style("display", "none");

  const svg = div
    .append("svg")
    .attr("width", size)
    .attr("height", size);

  const data = d3.merge(
    matrix.matrix.map((d, i) =>
      d.map((value, j) => ({ row: i, column: j, value }))
    )
  );

  svg
    .selectAll(".cell")
    .data(data)
    .join("rect")
    .attr("class", "cell")
    .attr("x", d => scale(matrix.identifiers[d.row]))
    .attr("y", d => scale(matrix.identifiers[d.column]))
    .attr("width", scale.bandwidth())
    .attr("height", scale.bandwidth())
    .attr("fill", d => (d.row === d.column ? "lightgray" : color(d.value)))
    .on("mouseenter", function(d) {
      d3.select(this).style("stroke", "gray");
      showTooltip(d);
    })
    .on("mouseleave", function() {
      d3.select(this).style("stroke", null);
      hideTooltip();
    });

  function showTooltip(d) {
    const state1 = matrix.identifiers[d.row],
      state2 = matrix.identifiers[d.column];
    const commonTerms = corpus
      .getCommonTerms(state1, state2, 5)
      .map(d => `<li>${d[0]}</li>`)
      .join("");
    const [x, y] = d3.mouse(div.node());
    tooltip
      .html(
        `${state1} to ${state2}: ${d.value.toFixed(2)}<ul>${commonTerms}</ul>`
      )
      .style("top", y + "px")
      .style("left", x + 15 + "px");
    tooltip.style("display", null);
  }

  function hideTooltip() {
    tooltip.style("display", "none");
  }

  svg
    .selectAll(".row-label")
    .data(matrix.identifiers)
    .join("text")
    .attr("class", "row-label")
    .attr("x", margin.topAndLeft - 5)
    .attr("y", d => scale(d) + scale.bandwidth() / 2)
    .text(d => d)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end");

  svg
    .append("g")
    .attr("transform", `translate(0,${margin.topAndLeft}) rotate(-90)`)
    .selectAll(".column-label")
    .data(matrix.identifiers)
    .join("text")
    .attr("class", "column-label")
    .attr("x", 5)
    .attr("y", d => scale(d) + scale.bandwidth() / 2)
    .text(d => d)
    .attr("dy", "0.35em");

  return div.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`An overall pattern that is visible in the matrix is that the states with the shortest speeches (such as Georgia) generally are more distant from others - because they have fewer unique terms and therefore fewer chances for overlap with other speeches.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`The Dakotas are the most similar pair of states, for unsurprising reasons - but their speeches were also among the few that mentioned *tribes* and *cybersecurity*:`
)});
  main.variable(observer()).define(["commonTermsTable"], function(commonTermsTable){return(
commonTermsTable("North Dakota", "South Dakota", 8)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`New York and New Jersey apparently have a shared interest in tunnels, transit, and audits:`
)});
  main.variable(observer()).define(["commonTermsTable"], function(commonTermsTable){return(
commonTermsTable("New York", "New Jersey", 8)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`New Jersey's and Nevada's governors were the only ones to mention Planned Parenthood in their speeches, and they also both talked about voter registration and marijuana.`
)});
  main.variable(observer()).define(["commonTermsTable"], function(commonTermsTable){return(
commonTermsTable("New Jersey", "Nevada", 7)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Of course, not all of the similarities have meaning. The Kentucky and West Virginia speeches are similar because... both had transcribers who chose to annotate their transcripts with the word [APPLAUSE] 👏:`
)});
  main.variable(observer()).define(["commonTermsTable"], function(commonTermsTable){return(
commonTermsTable("Kentucky", "West Virginia", 1)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Finally, we can apply the dimensionality reduction technique [UMAP](https://umap-learn.readthedocs.io/en/latest/) to the distance matrix, to lay out the states in two dimensions according to the similarity of the speeches. We can also color the dots for each state to indicate whether the speech was given by a Democratic (blue) or Republican (red) governor. 

The final layout is slightly different every time this notebook runs, but there tend to be rough clusters of blue and red, perhaps indicating that governors from the same party use similar vocabulary.`
)});
  main.variable(observer("umapLayout")).define("umapLayout", ["UMAP","matrix"], function(UMAP,matrix){return(
new UMAP({
  metric: "precomputed",
  nComponents: 2,
  minDist: 0.2,
  nNeighbors: 7
}).fit(matrix.matrix)
)});
  main.variable(observer()).define(["d3","width","umapLayout","metadata","matrix"], function(d3,width,umapLayout,metadata,matrix)
{
  const height = 600;
  const margin = { top: 30, right: 50, bottom: 30, left: 50 };

  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(umapLayout.map(d => d[0])))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(umapLayout.map(d => d[1])))
    .range([margin.top, height - margin.bottom]);

  svg
    .selectAll(".point")
    .data(umapLayout)
    .join("circle")
    .attr("class", "point")
    .attr("cx", d => x(d[0]))
    .attr("cy", d => y(d[1]))
    .attr("r", 5)
    .style("fill", (d, i) => {
      switch (metadata[i].party) {
        case "D":
          return "cornflowerblue";
        case "R":
          return "indianred";
        default:
          return "lightgrey";
      }
    });

  // Labels should always go on top of circles in case of overlap
  svg
    .selectAll(".label")
    .data(umapLayout)
    .join("text")
    .attr("class", "label")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1]))
    .attr("dy", -12)
    .attr("text-anchor", "middle")
    .style("font", "13px sans-serif")
    .style("fill-opacity", 0.6)
    .text((d, i) => matrix.identifiers[i]);

  return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`This is as far as we'll go with these simple text analysis techniques. For more depth on the dataset, you can read the [original FiveThirtyEight analysis](https://fivethirtyeight.com/features/what-americas-governors-are-talking-about/), which focuses on party differences, and uses more sophisticated natural language processing (for example to analyze phrases instead of single words).`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Thanks for reading! I hope you've found this notebook useful, and would love to hear feedback or suggestions.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Appendix`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  main.variable(observer("UMAP")).define("UMAP", ["require"], async function(require){return(
(await require("umap-js@1.3.1")).UMAP
)});
  const child1 = runtime.module(define1);
  main.import("text", child1);
  const child2 = runtime.module(define2);
  main.import("table", child2);
  main.variable(observer("fileLookup")).define("fileLookup", ["states","files"], function(states,files){return(
new Map(states.map((d, i) => [d, files[i]]))
)});
  main.variable(observer("searchResultsTable")).define("searchResultsTable", ["md","corpus","html","fileLookup","table"], function(md,corpus,html,fileLookup,table){return(
function(query) {
  if (query.length === 0) return md`*No results*`;
  const results = corpus.getResultsForQuery(query).map(d => ({
    Document: html`<a target="_blank" href="${fileLookup.get(d[0])}">${
      d[0]
    }</a>`,
    Score: d[1]
  }));
  if (results.length === 0) return md`*No results*`;
  const resultsTable = table(results);
  resultsTable.style.maxWidth = "250px";
  return resultsTable;
}
)});
  main.variable(observer("commonTermsTable")).define("commonTermsTable", ["table","corpus"], function(table,corpus){return(
function(identifier1, identifier2, cutoff = 10) {
  const ctTable = table(
    corpus
      .getCommonTerms(identifier1, identifier2, cutoff)
      .map(d => ({ Term: d[0], Weight: d[1] }))
  );
  ctTable.style.maxWidth = "200px";
  return ctTable;
}
)});
  main.variable(observer("styles")).define("styles", ["html"], function(html){return(
html`
  <style>
  .row-label, .column-label {
    font: 13px sans-serif;
  }

  #matrix-tooltip {
    font: bold 13px sans-serif;
    max-width: 350px;
    color: white;
    background: #222;
    opacity: 0.7;
    padding: 5px 10px;
    border-radius: 5px;
    position: absolute;
    z-index: 9999;
  }

  #matrix-tooltip ul {
    font-weight: normal;
    margin: 5px 0;
    padding: 0;
    list-style: none;
  }

  #matrix-tooltip li:before {
    content: none;
  }

</style>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---

Made with ❤️ at [Recurse Center](https://www.recurse.com/).`
)});
  return main;
}
