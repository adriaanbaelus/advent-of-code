import run from 'aocrunner';

const parseInput = (rawInput: string) =>
  rawInput.split('\n').reduce(
    (acc, item) => {
      if (!item) acc.unshift(0);
      acc[0] += Number(item);
      return acc;
    },
    [0],
  );

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return Math.max(...input);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput).sort((a, b) => b - a);
  return input[0] + input[1] + input[2];
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          1000
          2000
          3000
          
          4000
          
          5000
          6000
          
          7000
          8000
          9000
          
          10000
        `,
        expected: 24000,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          1000
          2000
          3000
          
          4000
          
          5000
          6000
          
          7000
          8000
          9000
          
          10000
        `,
        expected: 45000,
      },
    ],
    solution: part2,
  },
});
