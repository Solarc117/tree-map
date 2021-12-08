'use strict';
console.clear();
function log() {
  console.log(...arguments);
}

d3.json(
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
)
  .then(data => {
    log(data);
  })
  .catch(err => console.error('❌', err));
