import run from 'aocrunner';
import chalk from 'chalk';

const debug = false;
const direction = { R: 0, D: 1, L: 2, U: 3 };

type Edges = { min: number; max: number };
type Face = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
type Faces = { size: number } & Record<Face, { x: number; y: number; adjacent: [Face, number][] }>;

type Map = {
  cells: string[];
  edges: { atX: Edges[]; atY: Edges[] };
  faces: Faces;
  directions: (number | 'L' | 'R')[];
};

type AbsolutePosition = [number, number, number];
type RelativePosition = [number, number, number, Face];

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .reduce(
      ([map], line) => {
        if (/\d/.test(line)) {
          map.directions = (line.match(/(\d+|[RL])/g) || []).map((item) =>
            'RL'.includes(item) ? (item as 'R' | 'L') : Number(item),
          );
        } else {
          // Add 1 space to top and left of map so coordinates start at 1
          map.cells.push(' ' + line);
        }
        return [map] as [Map];
      },
      [{ cells: [''], directions: [] }] as [Omit<Map, 'edges' | 'faces'>],
    )
    .map((map) => {
      const { cells } = map;
      const edges: { atX: Edges[]; atY: Edges[] } = { atX: [], atY: [] };
      const isOOB = (cell: string | undefined) => [' ', undefined].includes(cell);
      for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
          if (!isOOB(cells[y][x]) && isOOB(cells[y]?.[x - 1])) {
            edges.atY[y] = { min: x, max: Infinity };
          }
          if (!isOOB(cells[y][x]) && isOOB(cells[y]?.[x + 1])) {
            edges.atY[y].max = x;
          }
          if (!isOOB(cells[y][x]) && isOOB(cells[y - 1][x])) {
            edges.atX[x] = { min: y, max: Infinity };
          }
          if (!isOOB(cells[y][x]) && isOOB(cells[y + 1]?.[x])) {
            edges.atX[x].max = y;
          }
        }
      }
      const position = [edges.atY[1].min, 1, direction.R];

      // Calculate cube faces as follows:
      // 0 = no turns, 1 = turn 90º, 2 = turn 180º, 3 = turn 270º (= 90º CCW)
      // Note that the example input is unfolded in a different format
      //                F1     F0
      //                ↑      ↑
      //        D2 ← AAAAAAABBBBBB → E2
      //             AAAAAAABBBBBB
      //             AAAAAAABBBBBB
      //             AAAAAAABBBBBB
      //        D3 ← CCCCCCC     ↓
      //             CCCCCCC    C1
      //         C1  CCCCCCC
      //         ↑   CCCCCCC → B3
      // A2 ← DDDDDDDEEEEEEE
      //      DDDDDDDEEEEEEE
      //      DDDDDDDEEEEEEE
      //      DDDDDDDEEEEEEE → B2
      //      FFFFFFF      ↓
      //      FFFFFFF      F1
      //      FFFFFFF
      // A3 ← FFFFFFF → E3
      //         ↓
      //         B0

      const w = edges.atY[1].min - 1;
      // prettier-ignore
      const faces: Faces = {
        size: w,
        A: {
          x: 1 + w, y: 1,
          adjacent: [ ['B', 0], ['C', 0], ['D', 2], ['F', 1] ],
        },
        B: {
          x: 1 + 2 * w, y: 1,
          adjacent: [ ['E', 2], ['C', 1], ['A', 0], ['F', 0] ],
        },
        C: {
          x: 1 + w, y: 1 + w,
          adjacent: [ ['B', 3], ['E', 0], ['D', 3], ['A', 0] ],
        },
        D: {
          x: 1, y: 1 + 2 * w,
          adjacent: [ ['E', 0], ['F', 0], ['A', 2], ['C', 1] ],
        },
        E: {
          x: 1 + w, y: 1 + 2 * w,
          adjacent: [ ['B', 2], ['F', 1], ['D', 0], ['C', 0] ],
        },
        F: {
          x: 1, y: 1 + 3 * w,
          adjacent: [ ['E', 3], ['B', 0], ['A', 3], ['D', 0] ],
        },
      };
      return [{ ...map, edges, faces }, position] as [Map, AbsolutePosition];
    })[0];

const part1 = (rawInput: string) => {
  const [map, origin] = parseInput(rawInput);
  let pos: AbsolutePosition = [...origin];
  const positions = [pos];
  for (const instruction of map.directions) {
    if (typeof instruction === 'number') {
      for (let s = 0; s < instruction; s++) {
        pos = step2d(map, pos);
        positions.push(pos);
      }
    } else {
      pos = rotate(pos, instruction);
      positions.push(pos);
    }
  }

  debug && print(map, positions);

  return 1000 * pos[1] + 4 * pos[0] + pos[2];
};

const part2 = (rawInput: string) => {
  const [map, origin] = parseInput(rawInput);

  let pos: AbsolutePosition = [...origin];
  const positions = [pos];
  for (const instruction of map.directions) {
    if (typeof instruction === 'number') {
      for (let s = 0; s < instruction; s++) {
        pos = step3d(map, pos);
        positions.push(pos);
      }
    } else {
      pos = rotate(pos, instruction);
      positions.push(pos);
    }
  }

  debug && print(map, positions);

  return 1000 * pos[1] + 4 * pos[0] + pos[2];
};

function rotate<T extends AbsolutePosition | RelativePosition>(pos: T, rotation: 'L' | 'R'): T {
  let [x, y, r, ...rest] = pos;
  r = (r + (rotation === 'R' ? 1 : 3)) % 4;
  return [x, y, r, ...rest] as T;
}

function step2d(map: Map, from: AbsolutePosition): AbsolutePosition {
  let [x, y, r] = from;
  if (r === 0) x = wrap(x + 1, map.edges.atY[y]);
  if (r === 1) y = wrap(y + 1, map.edges.atX[x]);
  if (r === 2) x = wrap(x - 1, map.edges.atY[y]);
  if (r === 3) y = wrap(y - 1, map.edges.atX[x]);

  if (map.cells[y][x] === '.') return [x, y, r];
  return from;
}

function wrap(pos: number, edges: Edges) {
  if (pos > edges.max) return edges.min;
  if (pos < edges.min) return edges.max;
  return pos;
}

function step3d(map: Map, from: AbsolutePosition): AbsolutePosition {
  // Convert absolute coordinates into x,y relative to current cube face
  let [x, y, r, f] = toRelativePosition(from, map);
  const min = 0;
  const max = map.faces.size - 1;
  if (r === 0) x = x + 1;
  if (r === 1) y = y + 1;
  if (r === 2) x = x - 1;
  if (r === 3) y = y - 1;
  if (x < min || x > max || y < min || y > max) {
    // We're moving off the current face
    // Figure out what the new face will be based on where character is currently looking
    const [newFace, rotations] = map.faces[f].adjacent[r];
    f = newFace;
    // Wrap position around on the cube face
    x = wrap(x, { min, max });
    y = wrap(y, { min, max });
    // Then rotate the cube face as many times as configured
    // This will result in (correct) new relative corrdinates on the new face
    for (let i = 0; i < rotations; i++) {
      [x, y, r] = rotateFace([x, y, r, f], map.faces.size);
    }
  }
  // Convert coordinates back into absolute position
  [x, y, r] = toAbsolutePosition([x, y, r, f], map);
  // Check for collisions
  if (map.cells[y][x] === '.') {
    return [x, y, r];
  }
  return from;
}

function rotateFace([x, y, r, f]: RelativePosition, size: number): RelativePosition {
  r = (r + 1) % 4;
  return [size - 1 - y, x, r, f];
}

function toRelativePosition([x, y, r]: AbsolutePosition, map: Map): RelativePosition {
  const f = getFace([x, y, r], map);
  const face = map.faces[f];
  return [x - face.x, y - face.y, r, f];
}

function toAbsolutePosition([x, y, r, f]: RelativePosition, map: Map): AbsolutePosition {
  const face = map.faces[f];
  return [x + face.x, y + face.y, r];
}

function getFace([x, y]: AbsolutePosition, map: Map): Face {
  const { size, ...faces } = map.faces;
  for (const [f, face] of Object.entries(faces)) {
    if (x >= face.x && x < face.x + size && y >= face.y && y < face.y + size) return f as Face;
  }
  throw new Error(`Could not get face for position ${x},${y}`);
}

function print(map: Map, history: AbsolutePosition[]) {
  const characterAt = history.reduce((characterAt, [x, y, r], i) => {
    characterAt[`${x},${y}`] = chalk.blue(['→', '↓', '←', '↑'][r]);
    if (i === history.length - 1) characterAt[`${x},${y}`] = chalk.green(['→', '↓', '←', '↑'][r]);
    return characterAt;
  }, {} as Record<string, string>);
  for (let y = 1; y < map.cells.length; y++) {
    let line = '';
    for (let x = 1; x < map.cells[y].length; x++) {
      let character = characterAt[`${x},${y}`];
      const cell = map.cells[y][x];
      if (cell !== '.' && character) {
        character = chalk.red('✜');
      }
      line += character || cell;
    }
    console.log(line);
  }
}

run({
  trimTestInputs: false,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5`,
        expected: 6032,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
    ...#.#..
    .#......
    #.....#.
    ........
    ...#
    #...
    ....
    ..#.
..#....#
........
.....#..
........
#...
..#.
....
....

10R5L5R10L4R5L5`,
        expected: 10006,
      },
    ],
    solution: part2,
  },
});
