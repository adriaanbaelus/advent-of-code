import run from 'aocrunner';

const parseInput = (rawInput: string) => rawInput.split('\n').filter(Boolean);

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  console.log(input);

  return;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return;
};

run({
  trimTestInputs: true,
  onlyTests: true,
  part1: {
    tests: [
      {
        input: `
          
        `,
        expected: 1,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [],
    solution: part2,
  },
});
