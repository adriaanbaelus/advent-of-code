import run from 'aocrunner';
import { Range, Map, Set, Record } from 'immutable';

const debug = false;

type Coordinates = Record<{ x: number; y: number }> & Readonly<{ x: number; y: number }>;

const coords = Record({ x: 0, y: 0 });
const N = coords({ y: -1 });
const E = coords({ x: +1 });
const S = coords({ y: +1 });
const W = coords({ x: -1 });
const NE = coords({ y: -1, x: +1 });
const NW = coords({ y: -1, x: -1 });
const SE = coords({ y: +1, x: +1 });
const SW = coords({ y: +1, x: -1 });
const directionsToCheck: Coordinates[][] = [
  [NE, N, NW],
  [SE, S, SW],
  [NW, W, SW],
  [NE, E, SE],
];

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .reduce((positions, line, y) => {
      for (let x = 0; x < line.length; x++) {
        if (line[x] === '#') {
          const pos = coords({ x, y });
          positions = positions.set(pos, coords());
        }
      }
      return positions;
    }, Map<Coordinates, Coordinates>());

const part1 = (rawInput: string) => {
  let positions = parseInput(rawInput);
  let directions = [...directionsToCheck];
  let emptyCount = 0;

  debug && print(positions, '\nInitial positions:');

  for (let i = 0; i < 10; i++) {
    positions = update(positions, directions);
    debug && print(positions, `\nPositions after turn ${i + 1}`);
  }
  const [xRange, yRange] = boundaries(positions);
  for (const y of yRange) {
    for (const x of xRange) {
      if (!positions.has(coords({ x, y }))) {
        emptyCount += 1;
      }
    }
  }

  return emptyCount;
};

const part2 = (rawInput: string) => {
  let i = 0;
  let positions = parseInput(rawInput);
  let directions = [...directionsToCheck];
  debug && print(positions, '\nInitial positions:');

  while (!positions.keySeq().toSet().equals(positions.valueSeq().toSet())) {
    positions = update(positions, directions);
    debug && print(positions, `\nPositions after turn ${i + 1}`);
    i += 1;
  }
  return i;
};

function update(positions: Map<Coordinates, Coordinates>, directionsToCheck: Coordinates[][]) {
  // Positions is map of current position as key and previous position as value (for all elves)
  // We can easily get all the current positions by taking all the keys of the map
  const originalPositions = positions.keySeq().toSet();
  for (const current of originalPositions) {
    const occupied = getNeighbours(current, originalPositions);
    if (occupied.isEmpty()) {
      // No neighbours, elf should remain in current position
      positions = positions.set(current, current);
      continue;
    }

    const fromCurrent = (direction: Coordinates) => add(current, direction);
    for (const directions of directionsToCheck) {
      const [a, next, b] = directions.map(fromCurrent);
      // Check if direction is available (based on original positions)
      if (occupied.intersect([a, next, b]).isEmpty()) {
        // If direction is available in original position, we still need to check if another elf
        // moved there since start of this round
        const other = positions.get(next);
        if (other) {
          // Reset other elf to their original position (both elves should stay in original position)
          positions = positions.remove(next).set(other, other);
        } else {
          // Next position is available, so remove current position and store next position
          positions = positions.remove(current).set(next, current);
        }
        // No need to check other directions once move attempt was made
        break;
      }
    }
  }

  // Rotate preferred directions (this modifies the array, which is fine for this case)
  directionsToCheck.push(directionsToCheck.shift() as Coordinates[]);

  return positions;
}

function boundaries(positions: Map<Coordinates, Coordinates>) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of positions.keys()) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return [Range(minX, maxX + 1), Range(minY, maxY + 1)];
}

function getNeighbours(position: Coordinates, positions: Set<Coordinates>) {
  let occupied = Set<Coordinates>();
  for (const direction of [NW, N, NE, E, SE, S, SW, W]) {
    const neighbour = add(position, direction);
    if (positions.has(neighbour)) {
      occupied = occupied.add(neighbour);
    }
  }
  return occupied;
}

function add(a: Coordinates, b: Coordinates) {
  return coords({
    x: a.x + b.x,
    y: a.y + b.y,
  });
}

function print(positions: Map<Coordinates, Coordinates>, heading = '') {
  console.log(heading);
  const [xRange, yRange] = boundaries(positions);
  for (const y of yRange) {
    let line = '';
    for (const x of xRange) {
      const xy = coords({ x, y });
      const elf = positions.get(xy);
      line += elf ? '#' : '.';
    }
    console.log(line);
  }
}

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          ##
          #.
          ..
          ##
          `,
        expected: 25,
      },
      {
        input: `
          ....#..
          ..###.#
          #...#.#
          .#...##
          #.###..
          ##.#.##
          .#..#..
        `,
        expected: 110,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          ....#..
          ..###.#
          #...#.#
          .#...##
          #.###..
          ##.#.##
          .#..#..
        `,
        expected: 20,
      },
    ],
    solution: part2,
  },
});
