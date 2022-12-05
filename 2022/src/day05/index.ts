import run from 'aocrunner';

type Instruction = { amount: number; from: number; to: number };
type Stack = string[];

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .reduce(
      ({ stacks, instructions }, line) => {
        const matchesStackInput = /(\s*)\[(.+?)\]/g;
        if (matchesStackInput.test(line)) {
          const cols = (line.length + 1) / 4;
          for (let i = 0; i < cols; i++) {
            if (!stacks[i]) stacks[i] = [];
            const item = line.charAt(i * 4 + 1);
            if (item && item !== ' ') {
              stacks[i].push(item);
            }
          }
        } else if (line.startsWith('move')) {
          const matches = line.match(/move (\d+) from (\d+) to (\d+)/) || [];
          const [, amount, from, to] = matches.map(Number);
          instructions.push({ amount, from: from - 1, to: to - 1 });
        }
        return { stacks, instructions };
      },
      { stacks: [] as Stack[], instructions: [] as Instruction[] },
    );

const tops = (stacks: Stack[]) => {
  let result = '';
  for (let stack of stacks) {
    if (stack.length) result += stack[0];
  }
  return result;
};

const part1 = (rawInput: string) => {
  const { stacks, instructions } = parseInput(rawInput);
  for (let { amount, from, to } of instructions) {
    const items = stacks[from].splice(0, amount).reverse();
    stacks[to].unshift(...items);
  }

  return tops(stacks);
};

const part2 = (rawInput: string) => {
  const { stacks, instructions } = parseInput(rawInput);
  for (let { amount, from, to } of instructions) {
    const items = stacks[from].splice(0, amount);
    stacks[to].unshift(...items);
  }

  return tops(stacks);
};

run({
  trimTestInputs: false,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2
        `,
        expected: 'CMZ',
      },
      {
        input: `
[D]       
[N]     [C]    
[Z] [M] [P] [X]
 1   2   3   4

move 1 from 1 to 4
        `,
        expected: 'NMCD',
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2
        `,
        expected: 'MCD',
      },
    ],
    solution: part2,
  },
});
