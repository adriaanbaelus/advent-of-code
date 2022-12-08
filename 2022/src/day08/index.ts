import run from 'aocrunner';

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .map((s) => s.split('').map(Number));

const visibleLeft = (trees: number[][], y: number, x: number) => {
  for (let i = 0; i < x; i++) {
    if (trees[y][i] >= trees[y][x]) return false;
  }
  return true;
};

const visibleRight = (trees: number[][], y: number, x: number) => {
  for (let i = x + 1; i < trees[y].length; i++) {
    if (trees[y][i] >= trees[y][x]) return false;
  }
  return true;
};

const visibleUp = (trees: number[][], y: number, x: number) => {
  for (let i = 0; i < y; i++) {
    if (trees[i][x] >= trees[y][x]) return false;
  }
  return true;
};

const visibleDown = (trees: number[][], y: number, x: number) => {
  for (let i = y + 1; i < trees.length; i++) {
    if (trees[i][x] >= trees[y][x]) return false;
  }
  return true;
};

const part1 = (rawInput: string) => {
  const trees = parseInput(rawInput);
  let visible = trees.length * 2 + trees[0].length * 2 - 4;
  for (let y = 1; y < trees.length - 1; y++) {
    for (let x = 1; x < trees[0].length - 1; x++) {
      if (
        visibleLeft(trees, y, x) ||
        visibleRight(trees, y, x) ||
        visibleUp(trees, y, x) ||
        visibleDown(trees, y, x)
      ) {
        visible += 1;
      }
    }
  }
  return visible;
};

const scoreLeft = (trees: number[][], y: number, x: number) => {
  let score = 0;
  for (let i = x - 1; i >= 0; i--) {
    score += 1;
    if (trees[y][i] >= trees[y][x]) {
      break;
    }
  }
  return score;
};
const scoreRight = (trees: number[][], y: number, x: number) => {
  let score = 0;
  for (let i = x + 1; i < trees[y].length; i++) {
    score += 1;
    if (trees[y][i] >= trees[y][x]) {
      break;
    }
  }
  return score;
};
const scoreUp = (trees: number[][], y: number, x: number) => {
  let score = 0;
  for (let i = y - 1; i >= 0; i--) {
    score += 1;
    if (trees[i][x] >= trees[y][x]) {
      break;
    }
  }
  return score;
};
const scoreDown = (trees: number[][], y: number, x: number) => {
  let score = 0;
  for (let i = y + 1; i < trees.length; i++) {
    score += 1;
    if (trees[i][x] >= trees[y][x]) {
      break;
    }
  }
  return score;
};

const part2 = (rawInput: string) => {
  const trees = parseInput(rawInput);
  let highestScore = 0;
  for (let y = 1; y < trees.length - 1; y++) {
    for (let x = 1; x < trees[0].length - 1; x++) {
      const L = scoreLeft(trees, y, x);
      const R = scoreRight(trees, y, x);
      const U = scoreUp(trees, y, x);
      const D = scoreDown(trees, y, x);
      // console.log(`[${x},${y}]: ${trees[y][x]} - L${L} R${R} U${U} D${D}`);
      let score =
        scoreLeft(trees, y, x) *
        scoreRight(trees, y, x) *
        scoreUp(trees, y, x) *
        scoreDown(trees, y, x);
      highestScore = Math.max(highestScore, score);
    }
  }
  return highestScore;
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          30373
          25512
          65332
          33549
          35390
        `,
        expected: 21,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          30373
          25512
          65332
          33549
          35390
        `,
        expected: 8,
      },
    ],
    solution: part2,
  },
});
