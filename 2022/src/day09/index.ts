import run from 'aocrunner';

const X = 0;
const Y = 1;
const directions: Record<string, number[]> = {
  U: [0, +1],
  D: [0, -1],
  L: [-1, 0],
  R: [+1, 0],
};

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .map((line) => {
      const instruction = line && line.match(/^\s*([UDLR])\s+(\d+)/);
      if (!instruction) return;
      const dir = instruction[1];
      const steps = Number(instruction[2]);
      return [directions[dir], steps];
    })
    .filter(Boolean) as [number[], number][];

const toUnit = (i: number) => (i > 0 ? 1 : i < 0 ? -1 : 0);

const moveToward = ([hx, hy]: number[], [tx, ty]: number[]) => {
  if (Math.abs(tx - hx) > 1 || Math.abs(ty - hy) > 1) {
    const dx = toUnit(hx - tx);
    const dy = toUnit(hy - ty);
    return [tx + dx, ty + dy];
  }
  return [tx, ty];
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const visited = new Set<string>();
  let head = [0, 0];
  let tail = [0, 0];

  for (let [[dx, dy], steps] of input) {
    for (let s = 0; s < steps; s++) {
      head = [head[X] + dx, head[Y] + dy];
      tail = moveToward(head, tail);
      visited.add(tail.toString());
    }
  }

  return visited.size;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const visited = new Set<string>();
  const knots = Array.from({ length: 10 }).map(() => [0, 0]);

  for (let [[dx, dy], steps] of input) {
    for (let s = 0; s < steps; s++) {
      knots[0] = [knots[0][X] + dx, knots[0][Y] + dy];
      for (let k = 1; k < knots.length; k++) {
        knots[k] = moveToward(knots[k - 1], knots[k]);
      }
      visited.add(knots[9].toString());
    }
  }

  return visited.size;
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          R 4
          U 4
          L 3
          D 1
          R 4
          D 1
          L 5
          R 2
        `,
        expected: 13,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          R 4
          U 4
          L 3
          D 1
          R 4
          D 1
          L 5
          R 2
        `,
        expected: 1,
      },
      {
        input: `
          R 5
          U 8
          L 8
          D 3
          R 17
          D 10
          L 25
          U 20
        `,
        expected: 36,
      },
    ],
    solution: part2,
  },
});
