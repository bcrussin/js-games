var blocks = {
  square: {
    1: [[-1, -1], [-1, 0], [0, 0], [0, -1]],
    2: [[-1, -1], [-1, 0], [0, 0], [0, -1]],
    3: [[-1, -1], [-1, 0], [0, 0], [0, -1]],
    4: [[-1, -1], [-1, 0], [0, 0], [0, -1]]
  },
  
  line: {
    1: [[0, 0], [0, -1], [0, -2], [0, 1]],
    2: [[0, 0], [1, 0], [-1, 0], [-2, 0]],
    3: [[0, 0], [0, -1], [0, 1], [0, 2]],
    4: [[0, 0], [1, 0], [2, 0], [-1, 0]],
  },
  
  s: {
    1: [[0, 0], [-1, 0], [0, -1], [1, -1]],
    2: [[0, 0], [0, -1], [1, 0], [1, 1]],
    3: [[0, 0], [1, 0], [0, 1], [-1, 1]],
    4: [[0, 0], [0, 1], [-1, 0], [-1, -1]]
  },
  
  z: {
    1: [[0, 0], [1, 0], [0, -1], [-1, -1]],
    2: [[0, 0], [0, 1], [1, 0], [1, -1]],
    3: [[0, 0], [-1, 0], [0, 1], [1, 1]],
    4: [[0, 0], [0, -1], [-1, 0], [-1, 1]]
  },
  
  j: {
    1: [[0, 0], [1, 0], [-1, 0], [-1, -1]],
    2: [[0, 0], [0, 1], [0, -1], [1, -1]],
    3: [[0, 0], [-1, 0], [1, 0], [1, 1]],
    4: [[0, 0], [0, -1], [0, 1], [-1, 1]]
  },
  
  l: {
    1: [[0, 0], [-1, 0], [1, 0], [1, -1]],
    2: [[0, 0], [0, -1], [0, 1], [1, 1]],
    3: [[0, 0], [-1, 0], [1, 0], [-1, 1]],
    4: [[0, 0], [0, 1], [0, -1], [-1, -1]]
  },
  
  t: {
    1: [[0, 0], [-1, 0], [1, 0], [0, -1]],
    2: [[0, 0], [0, -1], [0, 1], [1, 0]],
    3: [[0, 0], [-1, 0], [1, 0], [0, 1]],
    4: [[0, 0], [-1, 0], [0, -1], [0, 1]]
  }
};

var blockRef = {
  1: 'square',
  2: 'line',
  3: 's',
  4: 'z',
  5: 'j',
  6: 'l',
  7: 't'
};

var colors = [
  '#ffd633',
  '#66ccff',
  '#77ff33',
  '#ff1a1a',
  '#0039e6',
  '#ffa64d',
  '#c61aff'
];

var borderColors = [
  '#cca300',
  '#0099e6',
  '#44cc00',
  '#b30000',
  '#002699',
  '#cc6600',
  '#9900cc'
];