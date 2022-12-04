import run from 'aocrunner';

type Range = [number, number];

const parseRange = (rawInput: string) =>
  rawInput.split('-').map(Number) as Range;
const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .map((s) => s.split(',').map(parseRange));

const contains = (r1: Range, r2: Range) => r1[0] <= r2[0] && r1[1] >= r2[1];
const overlaps = (r1: Range, r2: Range) => r1[0] <= r2[1] && r1[1] >= r2[0];

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let count = 0;
  for (let [r1, r2] of input) {
    if (contains(r1, r2) || contains(r2, r1)) {
      count += 1;
    }
  }

  return count;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let count = 0;
  for (let [r1, r2] of input) {
    if (overlaps(r1, r2)) {
      count += 1;
    }
  }

  return count;
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          2-4,6-8
          2-3,4-5
          5-7,7-9
          2-8,3-7
          6-6,4-6
          2-6,4-8        
        `,
        expected: 2,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          2-4,6-8
          2-3,4-5
          5-7,7-9
          2-8,3-7
          6-6,4-6
          2-6,4-8        
        `,
        expected: 4,
      },
    ],
    solution: part2,
  },
});
