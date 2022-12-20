import run from 'aocrunner';

type Coordinates = [number, number, number];
type World = Record<string, Coordinates>;
const infiniteBoundaries = {
  xMin: Infinity,
  xMax: -Infinity,
  yMin: Infinity,
  yMax: -Infinity,
  zMin: Infinity,
  zMax: -Infinity,
};
type Boundaries = typeof infiniteBoundaries;

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .map((s) => s.split(',').map(Number))
    .reduce<[World, Boundaries]>(
      ([world, boundaries], [x, y, z]) => {
        world[`${x},${y},${z}`] = [x, y, z];
        // We make boundaries one larger than the droplet dimensions
        // That way, we can easily write code that surrounds it
        boundaries.xMin = Math.min(boundaries.xMin, x - 1);
        boundaries.xMax = Math.max(boundaries.xMax, x + 1);
        boundaries.yMin = Math.min(boundaries.yMin, y - 1);
        boundaries.yMax = Math.max(boundaries.yMax, y + 1);
        boundaries.zMin = Math.min(boundaries.zMin, z - 1);
        boundaries.zMax = Math.max(boundaries.zMax, z + 1);
        return [world, boundaries];
      },
      [{}, { ...infiniteBoundaries }],
    );

const part1 = (rawInput: string) => {
  const [world, boundaries] = parseInput(rawInput);
  return Object.values(world).reduce(
    (sum, coords) => sum + countOpenFacets(world, boundaries, coords),
    0,
  );
};

const part2 = (rawInput: string) => {
  const [world, boundaries] = parseInput(rawInput);

  let surface = 0;
  const start = [boundaries.xMin, boundaries.yMin, boundaries.zMin];
  const visited = new Set<string>();
  const q = [start];
  while (q.length > 0) {
    const current = q.shift() as Coordinates;
    const k = key(current);
    if (visited.has(k)) continue;
    visited.add(k);

    for (let neighbour of neighbours(current, boundaries)) {
      if (!empty(world, neighbour)) {
        surface += 1;
        continue;
      }
      q.push(neighbour);
    }
  }

  return surface;
};

function countOpenFacets(world: World, boundaries: Boundaries, [x, y, z]: Coordinates) {
  return neighbours([x, y, z], boundaries)
    .map((coords) => (empty(world, coords) ? 1 : 0))
    .reduce((a, c) => a + c, 0 as number);
}

function empty(world: World, coordinates: Coordinates) {
  return !world[key(coordinates)];
}

function key([x, y, z]: Coordinates) {
  return `${x},${y},${z}`;
}

function neighbours([x, y, z]: Coordinates, boundaries: Boundaries): Coordinates[] {
  const neighbours: Coordinates[] = [];
  if (x > boundaries.xMin && x <= boundaries.xMax) neighbours.push([x - 1, y, z]);
  if (x >= boundaries.xMin && x < boundaries.xMax) neighbours.push([x + 1, y, z]);
  if (y > boundaries.yMin && y <= boundaries.yMax) neighbours.push([x, y - 1, z]);
  if (y >= boundaries.yMin && y < boundaries.yMax) neighbours.push([x, y + 1, z]);
  if (z > boundaries.zMin && z <= boundaries.zMax) neighbours.push([x, y, z - 1]);
  if (z >= boundaries.zMin && z < boundaries.zMax) neighbours.push([x, y, z + 1]);
  return neighbours;
}

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          2,2,2
          1,2,2
          3,2,2
          2,1,2
          2,3,2
          2,2,1
          2,2,3
          2,2,4
          2,2,6
          1,2,5
          3,2,5
          2,1,5
          2,3,5
        `,
        expected: 64,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          2,2,2
          1,2,2
          3,2,2
          2,1,2
          2,3,2
          2,2,1
          2,2,3
          2,2,4
          2,2,6
          1,2,5
          3,2,5
          2,1,5
          2,3,5
        `,
        expected: 58,
      },
    ],
    solution: part2,
  },
});
