import run from 'aocrunner';

const ROCK = '#';
const SAND = 'o';
const MOVING_SAND = 'O';
const AIR = '.';
const ORIGIN = { x: 500, y: 0 };
const debug = false;

type Block = typeof ROCK | typeof SAND | typeof MOVING_SAND | typeof AIR;
type Coord = string;
type Chart = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  floor: number;
  blocks: Record<Coord, Block>;
};

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split(' -> ').map((s) => s.split(',').map(Number)))
    .reduce(
      (chart, corners) => {
        for (let i = 0; i < corners.length - 1; i++) {
          let [x1, y1] = corners[i];
          const [x2, y2] = corners[i + 1];
          chart.minX = Math.min(chart.minX, x1, x2);
          chart.minY = Math.min(chart.minY, y1, y2);
          chart.maxX = Math.max(chart.maxX, x1, x2);
          chart.maxY = Math.max(chart.maxY, y1, y2);
          chart.floor = Infinity;
          chart.blocks[coord(x1, y1)] = ROCK;
          while (x1 !== x2 || y1 !== y2) {
            x1 += toUnit(x2 - x1);
            y1 += toUnit(y2 - y1);
            chart.blocks[coord(x1, y1)] = ROCK;
          }
        }
        return chart;
      },
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: 0,
        maxY: -Infinity,
        blocks: {},
      } as Chart,
    );

const coord = (x: number, y: number): Coord => `${x},${y}`;
const toUnit = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);

const dropSand = (
  chart: Chart,
  [x = ORIGIN.x, y = ORIGIN.y] = [],
): [number, number] | null => {
  const { blocks, maxY } = chart;
  if (y > maxY) return null;
  if (blocks[coord(ORIGIN.x, ORIGIN.y)]) return null;
  if (y < chart.floor - 1) {
    if (!blocks[coord(x, y + 1)]) return dropSand(chart, [x, y + 1]);
    if (!blocks[coord(x - 1, y + 1)]) return dropSand(chart, [x - 1, y + 1]);
    if (!blocks[coord(x + 1, y + 1)]) return dropSand(chart, [x + 1, y + 1]);
  }
  blocks[coord(x, y)] = SAND;
  debug && print(chart, [x, y]);
  return [x, y];
};

const part1 = (rawInput: string) => {
  const chart = parseInput(rawInput);

  let sandBlocks = 0;
  while (dropSand(chart)) sandBlocks++;

  return sandBlocks;
};

const part2 = (rawInput: string) => {
  const chart = parseInput(rawInput);
  chart.floor = chart.maxY + 2;
  chart.maxY = chart.maxY + 1;

  let sandBlocks = 0;
  while (dropSand(chart)) sandBlocks++;

  return sandBlocks;
};

const print = (chart: Chart, movingSand?: [number, number]) => {
  let str = '';
  for (let y = chart.minY; y <= chart.maxY; y++) {
    for (let x = chart.minX; x <= chart.maxX; x++) {
      if (movingSand && x === movingSand[0] && y === movingSand[1]) {
        str += MOVING_SAND;
      } else {
        str += chart.blocks[coord(x, y)] || AIR;
      }
    }
    str += '\n';
  }
  console.log(str);
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          498,4 -> 498,6 -> 496,6
          503,4 -> 502,4 -> 502,9 -> 494,9
        `,
        expected: 24,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          498,4 -> 498,6 -> 496,6
          503,4 -> 502,4 -> 502,9 -> 494,9
        `,
        expected: 93,
      },
    ],
    solution: part2,
  },
});
