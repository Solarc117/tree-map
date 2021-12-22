// ****************************************** DECEMBER 21ST 23:59 DEADLINE *******************************************
'use strict';
console.clear();
function log() {
  console.log(...arguments);
}

const paddingBottom = 38,
  canvas = d3.select('.canvas'),
  canvasWidth = parseFloat(canvas.attr('width')),
  canvasHeight = parseFloat(canvas.attr('height')) - paddingBottom;

d3.json(
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
)
  .then(movies => {
    const hierarchy = d3
      .hierarchy(movies, ({ children }) => children)
      .sum(movie => movie.value)
      .sort((movie1, movie2) => movie2.value - movie1.value);

    const createTreemap = d3.treemap().size([canvasWidth, canvasHeight]),
      movieTree = createTreemap(hierarchy).leaves(), // Leaf nodes.
      movieCategories = movieTree
        .map(movieNode => movieNode.data.category)
        .reduce(
          (arr, curElem) => (arr.includes(curElem) ? arr : [...arr, curElem]),
          []
        ),
      colorScheme = d3.scaleOrdinal(movieCategories, d3.schemeCategory10),
      cells = canvas
        .selectAll('.cell')
        .data(movieTree)
        .enter()
        .append('g')
        .attr('id', ({ data: movie }) => movie.name)
        .attr('data-category', ({ data: movie }) => movie.category)
        .attr('data-revenue', ({ data: movie }) => movie.value)
        .attr('class', 'cell')
        ._groups[0].map(cell => d3.select(cell));

    // Tooltip.
    const tooltip = document.querySelector('.tooltip');
    cells.forEach(cell => {
      const movie = cell.data()[0].data;
      cell
        .append('rect')
        .attr('x', ({ x0 }) => x0)
        .attr('y', ({ y0 }) => y0)
        .attr('width', ({ x1, x0 }) => x1 - x0)
        .attr('height', ({ y1, y0 }) => y1 - y0)
        .style('fill', ({ data: movie }) => colorScheme(movie.category))
        .on('mouseover', ({ target }) => showTooltip(target));
      cell
        .append('text')
        .attr('x', ({ x0 }) => x0 + 3)
        .attr('y', ({ y0 }) => y0 + 16) // Plus font-size.
        .html(movieNode => {
          const title = movieNode.data.name,
            { x1, x0 } = movieNode,
            rectWidth = x1 - x0,
            g = document.getElementById(title),
            textElem = g.children[1],
            firstLineY = movieNode.y0 + 15;
          function checkIfFits(str) {
            textElem.innerHTML = str;
            return textElem.getComputedTextLength() < rectWidth - 4;
          }
          function optimizeLines(title, lines = []) {
            const words = Array.isArray(title)
              ? title
              : title
                  .split(' ')
                  .filter(s => s)
                  .map(word =>
                    checkIfFits(word) ? word : word.slice(0, 3) + '.'
                  );
            let currentLine = [];
            while (
              words.length > 0 &&
              checkIfFits([currentLine.join(' '), words[0]].join(' '))
            )
              currentLine.push(words.shift());
            lines.push(currentLine.join(' '));
            return words.length > 0 ? optimizeLines(words, lines) : lines;
          }
          function renderText(linesArr) {
            let str = ``;
            linesArr.forEach(
              (line, i) =>
                (str += `<tspan x='${x0 + 2}' y='${
                  firstLineY + i * 15
                }'>${line}</tspan> `)
            );
            return str;
          }
          return renderText(optimizeLines(title));
        })
        .style('user-select', 'none')
        .on('mouseover', ({ target }) => showTooltip(target));

      function showTooltip(target) {
        function addCommas(int) {
          const arr = int.split(''),
            subArrs = [];
          for (let i = arr.length - 3; i > 0; i -= 3) {
            subArrs.unshift(arr.splice(i, 3));
          }
          subArrs.unshift(arr);
          return subArrs
            .reduce((acc, curVal) => acc.concat(',', curVal))
            .join('');
        }
        let { x, y } = target.getBoundingClientRect();
        x += window.scrollX;
        y += window.scrollY;

        tooltip.innerHTML = `${movie.name} - $${addCommas(
          movie.value
        )} in revenue.`;

        const { clientWidth: tooltipWidth, clientHeight: tooltipHeight } =
          tooltip;

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      }
    });

    // Legend.
    /*
First, let me locate the y value I'll want for all the legend rects.
legendx = canh + 4 ((38 - recth) / 2) (equal padding)
Now, for the x, I'll just do 4 at first, then add 30 (rect), maybe 40 (cateogry title), and another 4 (for padding of next rect)
*/
    const legendCellWidth = canvasWidth / movieCategories.length,
      legendRectSide = 20,
      legendRectY = canvasHeight + (paddingBottom - legendRectSide) / 2;
    const legendCells = canvas
      .selectAll('.legend-cell')
      .data(movieCategories)
      .enter()
      .append('g')
      .attr('class', 'legend-cell')
      ._groups[0].map(legendCell => d3.select(legendCell));
    legendCells.forEach((cell, index) => {
      cell
        .append('rect')
        .attr('x', () => index * legendCellWidth + 10)
        .attr('y', legendRectY)
        .attr('width', legendRectSide)
        .attr('height', legendRectSide)
        .style('fill', category => colorScheme(category));
      cell
        .append('text')
        .attr('x', () => index * legendCellWidth + legendRectSide + 15)
        .attr('y', legendRectY + 15)
        .text(category => category);
    });
  })
  .catch(err => console.error('❌', err));
