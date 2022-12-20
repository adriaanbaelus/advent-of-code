import run from 'aocrunner';

type Rock = { id: string; x: number; y: number; w: number; h: number; blocks: number[][] };
type World = number[][];

const debug = false;

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .flatMap((str) => str.split('').map((c, i) => [c === '<' ? -1 : c === '>' ? +1 : 0, i]));

const rock = (id: string, blocks: number[][]) => ({
  id,
  x: 2,
  y: Infinity,
  w: blocks[0].length,
  h: blocks.length,
  blocks: blocks.reverse(),
});

const _ = 0;
const $ = 1;

// prettier-ignore
const rocks: Rock[] = [
  rock('_', [ [$,$,$,$], ]),

  rock('+', [ [_,$,_],
              [$,$,$],
              [_,$,_], ]),

  rock('J', [ [_,_,$],
              [_,_,$],
              [$,$,$], ]),

  rock('I', [ [$],
              [$],
              [$],
              [$], ]),

  rock('.', [ [$,$],
              [$,$], ]),
];
const jets = parseInput('>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>');

const part1 = () => calculateHeight(2022);
const part2 = () => calculateHeight(1000000000000);

function calculateHeight(n: number) {
  const nextJet = takeFrom(jets);
  const nextRock = takeFrom(rocks);
  const world: World = [[0, 0, 0, 0, 0, 0, 0]];

  const cache: Record<string, { ceiling: number; rocks: number }> = {};
  const cacheKeyForTurn = [];

  let cycleStart, cycleEnd;
  let ceiling = 0;

  for (let i = 0; i < n; i++) {
    const [direction, j] = nextJet();
    const rock = { ...nextRock(), x: 2 + direction, y: ceiling + 3 };
    debug && console.log(`\nFor rock #${i + 1}:`);
    debug && print(world, rock, 15);

    const cacheKey = generateCacheKey(rock, world, j);
    cacheKeyForTurn.push(cacheKey);
    if (cache[cacheKey]) {
      // Cycle detected. From now on, the output will keep repeating, so we break the loop.
      // The end result can be calculated based on current cycle information.
      cycleStart = cache[cacheKey];
      cycleEnd = { ceiling, rocks: i };
      debug && console.log('Cycle detected, exiting loop', cycleStart, cycleEnd);
      break;
    }
    cache[cacheKey] = { ceiling, rocks: i };

    // Add some empty rows to top of world to allow correct movement and collision detection of rocks
    for (let y = world.length; y < rock.y + rock.h; y++) {
      world.push([0, 0, 0, 0, 0, 0, 0]);
    }

    // As long as rock is not at rest, keep dropping and blasting it
    while (drop(rock, world)) {
      const [direction] = nextJet();
      blast(rock, world, direction);
    }
    // Rock is in final position, add it to the world
    addRockToWorld(rock, world);
    // Move ceiling to new top of the world after rock has settled
    ceiling = Math.max(ceiling, rock.y + rock.h);
  }

  debug && console.log('\nResult:\n');
  debug && print(world);

  if (!cycleStart || !cycleEnd) return ceiling;

  const rocksPerCycle = cycleEnd.rocks - cycleStart.rocks;
  const heightPerCycle = cycleEnd.ceiling - cycleStart.ceiling;
  const cycleCount = Math.floor((n - cycleStart.rocks) / rocksPerCycle);
  const remainingRocks = (n - cycleStart.rocks) % rocksPerCycle;
  const cacheKeyForRemaining = cacheKeyForTurn[cycleStart.rocks + remainingRocks];
  const remainingCeiling = cache[cacheKeyForRemaining].ceiling - cycleStart.ceiling;

  return cycleStart.ceiling + cycleCount * heightPerCycle + remainingCeiling;
}

function takeFrom<T>(input: T[]): () => T {
  const generator = infinite(input);
  return () => generator.next().value;
}

function* infinite<T>(input: T[]): Generator<T> {
  const list = [...input];
  while (true) {
    const item = list.shift();
    if (!item) return;
    list.push(item);
    yield item;
  }
}

function extractTopLayer(world: World) {
  let x = 0;
  let y = world.length - 1;
  let relativeY = y;
  const tops: [number, number][] = [];
  while (x < 7) {
    if (world[y][x] || y <= 0) {
      if (x === 0) relativeY = y;
      tops.push([x, y - relativeY]);
      x++;
      y = world.length - 1;
    } else {
      y--;
    }
  }
  return tops;
}

function generateCacheKey(rock: Rock, world: World, jetIndex: number) {
  const tops = extractTopLayer(world)
    .map(([x, y]) => `${x},${y}`)
    .join(';');
  return `${rock.id};${jetIndex};${tops}`;
}

function drop(rock: Rock, world: World) {
  if (rock.y === 0) return false;
  const newY = rock.y - 1;
  if (!canMove({ ...rock, y: newY }, world)) return false;
  rock.y = newY;
  return true;
}

function blast(rock: Rock, world: World, dx: number) {
  const newX = rock.x + dx;
  if (canMove({ ...rock, x: newX }, world)) {
    rock.x = newX;
  }
}

function canMove(rock: Rock, world: World) {
  if (rock.x < 0 || rock.x + rock.w > 7) return false;
  for (let by = 0; by < rock.h; by++) {
    for (let bx = 0; bx < rock.w; bx++) {
      if (rock.blocks[by][bx] && world[rock.y + by][rock.x + bx]) return false;
    }
  }
  return true;
}

function addRockToWorld(rock: Rock, world: World) {
  for (let by = 0; by < rock.h; by++) {
    for (let bx = 0; bx < rock.w; bx++) {
      world[rock.y + by][rock.x + bx] += rock.blocks[by][bx];
    }
  }
}

function print(world: World, movingRock?: Rock, h = world.length - 1) {
  const minY = Math.max(0, world.length - h - 1);
  for (let y = world.length - 1; y >= minY; y--) {
    const row = world[y]
      .map((n, x) => {
        if (movingRock && y >= movingRock.y && y < movingRock.y + movingRock.h) {
          if (movingRock.blocks[y - movingRock.y][x - movingRock.x]) return '@';
        }
        if (n === 0) return '.';
        if (n === 1) return '#';
        return '!';
      })
      .join('');
    const yStr = ('   ' + (y + 1)).slice(-4);
    console.log(`${yStr} |${row}|`);
  }
  console.log('     +-------+');
}

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: '',
        expected: 3068,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: '',
        expected: 1514285714288,
      },
    ],
    solution: part2,
  },
});
