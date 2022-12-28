import run from 'aocrunner';

import { PriorityQueue } from '@datastructures-js/priority-queue';

type CoordKey = number & { readonly _type: unique symbol };
type Coords = [number, number];
type Direction = [number, number];
type BlizzardsAtPosition = Direction[];
type Blizzards = BlizzardsAtPosition[];
type BlizzardsAtTurn = (turn: number) => (x: number, y: number) => BlizzardsAtPosition;

const direction = { '^': [0, -1], v: [0, +1], '<': [-1, 0], '>': [+1, 0] };

const parseInput = (rawInput: string) => {
  const lines = rawInput
    .split('\n')
    .filter(Boolean)
    .slice(1, -1)
    .map((line) => line.slice(1, -1));
  const height = lines.length;
  const width = lines[0].length;
  const initial: Blizzards = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = lines[y][x] as '.' | '^' | 'v' | '<' | '>';
      const blizzard = char === '.' ? [] : [direction[char] as Direction];
      initial[y * width + x] = blizzard;
    }
  }
  const start: Coords = [0, -1];
  const end: Coords = [width - 1, height];
  const blizzardsAtTurn = seedBlizzards(initial, height, width);
  return { start, end, blizzardsAtTurn };
};

const part1 = (rawInput: string) => {
  const { start, end, blizzardsAtTurn } = parseInput(rawInput);
  return findFastest(start, end, blizzardsAtTurn);
};

const part2 = (rawInput: string) => {
  const { start, end, blizzardsAtTurn } = parseInput(rawInput);

  const firstLeg = findFastest(start, end, blizzardsAtTurn);
  const secondLeg = findFastest(end, start, blizzardsAtTurn, firstLeg);
  const thirdLeg = findFastest(start, end, blizzardsAtTurn, secondLeg);

  return thirdLeg;
};

function findFastest(
  [fromX, fromY]: Coords,
  [toX, toY]: Coords,
  blizzardsAtTurn: BlizzardsAtTurn,
  startingTurn = 0,
) {
  const w = Math.abs(toX - fromX);
  const h = Math.abs(Math.max(0, toY) - Math.max(0, fromY));
  const visited = new Set<CoordKey>();
  const { isEmpty, enqueue, dequeue } = makeCoordsQueue(toX, toY);
  enqueue(fromX, fromY, startingTurn);
  const isStart = (x: number, y: number) => x === fromX && y === fromY;
  const isFinish = (x: number, y: number) => x === toX && y === toY;

  while (!isEmpty()) {
    const { x, y, t, k } = dequeue();
    if (isFinish(x, y)) return t;
    if (visited.has(k)) continue;
    visited.add(k);

    const blizzards = blizzardsAtTurn(t + 1);
    const candidates = [
      [x + 1, y],
      [x, y + 1],
      [x, y],
      [x - 1, y],
      [x, y - 1],
    ];

    for (const [nx, ny] of candidates) {
      const isOutOfBounds = nx < 0 || nx > w || ny < 0 || ny >= h;
      if (isOutOfBounds && !isFinish(nx, ny) && !isStart(nx, ny)) continue;
      if (blizzards(nx, ny).length > 0) continue;
      enqueue(nx, ny, t + 1);
    }
  }

  // If we get here, we failed to find any viable path
  return Infinity;
}

function seedBlizzards(initial: Blizzards, h: number, w: number) {
  const cache = new Map<number, Blizzards>();

  const get = (blizzards: Blizzards, x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return [];
    const i = y * w + x;
    if (!blizzards[i]) blizzards[i] = [];
    return blizzards[i];
  };
  const atTurn = (turn: number) => {
    let blizzards: Blizzards = initial;
    const cached = cache.get(turn);
    if (cached) {
      blizzards = cached;
    } else if (turn > 0) {
      blizzards = [];
      const prev = atTurn(turn - 1);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          for (const blizz of prev(x, y)) {
            let [newX, newY] = add([x, y], blizz);
            // Wrap blizzard to other side of field if out of bounds
            newX = (w + newX) % w;
            newY = (h + newY) % h;
            get(blizzards, newX, newY).push(blizz);
          }
        }
      }
      cache.set(turn, blizzards);
    }
    return (x: number, y: number) => get(blizzards, x, y);
  };
  return atTurn;
}

function add([x, y]: Coords, [dx, dy]: Direction): Coords {
  return [x + dx, y + dy];
}

function makeCoordsQueue(toX: number, toY: number) {
  // We'll try our hand at A* this time
  const heuristic = (k: CoordKey) => {
    const [x, y, t] = coords(k);
    // Use manhattan distance to end as heuristic in optimistic case (no blizzards in the way)
    const distanceToEnd = Math.abs(toX - x) + Math.abs(toY - y);
    return t + distanceToEnd;
  };

  const q = new PriorityQueue<CoordKey>((a, b) => heuristic(a) - heuristic(b));

  const isEmpty = () => q.isEmpty();
  const enqueue = (x: number, y: number, t: number) => q.enqueue(key(x, y, t));
  const dequeue = () => {
    const k = q.dequeue();
    const [x, y, t] = coords(k);
    return { x, y, t, k };
  };

  return { isEmpty, enqueue, dequeue };
}

function key(x: number, y: number, t: number) {
  // Compensate for possible y = -1 at starting point, we increase the y value by 1
  y = y + 1;
  return (100000 * t + 1000 * y + x) as CoordKey;
}

function coords(k: CoordKey) {
  const xy = k % 100000;
  const t = (k - xy) / 100000;
  const x = xy % 1000;
  const y = (xy - x) / 1000 - 1;
  return [x, y, t] as [...Coords, number];
}

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          #.#####
          #.....#
          #>....#
          #.....#
          #...v.#
          #.....#
          #####.#
        `,
        expected: 10,
      },
      {
        input: `
          #.######
          #>>.<^<#
          #.<..<<#
          #>v.><>#
          #<^v^^>#
          ######.#
        `,
        expected: 18,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          #.######
          #>>.<^<#
          #.<..<<#
          #>v.><>#
          #<^v^^>#
          ######.#
        `,
        expected: 54,
      },
    ],
    solution: part2,
  },
});
