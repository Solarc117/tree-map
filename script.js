// ****************************************** DECEMBER 21ST 23:59 DEADLINE *******************************************
'use strict';
console.clear();
function log() {
  console.log(...arguments);
}

const canvas = d3.select('.canvas'),
  [canvasWidth, canvasHeight] = [
    canvas.attr('width'),
    canvas.attr('height'),
  ].map(num => parseFloat(num));

d3.json(
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
)
  .then(data => {
    /**
    POTENTIALLY USEFUL METHODS:
    (in this project, I'll try to only use methods that I find I really need, in order to avoid reading up on documentation that is hard to understand and therefore questionably useful, and also just to avoid unnecessary notes)
    1. CSS 
     - pointer-events
    2. JS
     - Array.filter((category, index,⚠ SELF ⚠) => {...})
     - URLSearchParams objects
       i) DEFAULT_DATASET
       ii) instance.get()
     - || (OR operator)
     - D3
       i) interpolateRgb()()
       ii) d3.treemap()
         - .size()
         - .paddingInner()
       iii) d3.hierarchy()
         - .eachBefore()
         - .sum() 📄 Potentially not D3
         - .leaves()
    @todo Define my treemap, and check that it is an array of objects. ✅
    @todo Look up the syntax to define a treemap. ✅
    @todo Define my treemap properly, and check that it is an array of objects. 
    @todo Render a g element for each obj in the treemap. ✅
    @todo Define the d3 color-scheme to be used. ⭐ 
    @todo Color each rect according to its group.
    📄 The value property represents the revenue in USD the movie raised.
    */
    // We tell D3 that the data is a tree structure, with the "Movies" node as the root and the individual movies as the 'leaf' nodes.
    // 1st arg is the data, 2nd is a function that tells d3 where the children of each node are
    const hierarchy = d3
      .hierarchy(data, node => node.children)
      // Then we call the sum() method, which takes a function that specifies how to add a value to each node.
      // Each leaf node has a value property. We want the larger values to correspond to larger tiles.
      .sum(node => node.value)
      // Then we want to use the sort() method, which accepts a function with two node parameters. For each node pair, we tell it how to sort them.
      // This method is much like the native Array.sort() method; it returns a positive value to sort 2 before 1, a negative value to sort 1 before 2, and 0 to keep the current order.
      // Here, if node2 has a greater value property, a positive value is returned and it is sorted BEFORE node1. We want the node with the highest value to come first.
      .sort((node1, node2) => node2.value - node1.value);
    // The hierarchy.leaves() method returns the leaf nodes of the tree obj.

    document.addEventListener('down', event => log(event.key));

    // Now we can use the d3.treemap().size() methods to create a function that will render a treemap of the specified size with the passed hierarchical data.
    const createTreemap = d3.treemap().size([canvasWidth, canvasHeight]);

    const movieTree = createTreemap(hierarchy),
      cells = canvas
        .selectAll('.cell')
        .data(movieTree)
        .enter()
        .append('g')
        .attr('class', 'cell')._groups[0];

    cells.forEach(cell =>
      d3
        .select(cell)
        .append('rect')
        .attr('x', movieNode => movieNode.x0)
        .attr('y', movieNode => movieNode.y0)
        .attr('width', movieNode => movieNode.x1 - movieNode.x0)
        .attr('height', movieNode => movieNode.y1 - movieNode.y0)
        .style('stroke', 'black')
        .style('stroke-width', '1px')
        .style('fill', 'gold')
    );
  })
  .catch(err => console.error('❌', err));
