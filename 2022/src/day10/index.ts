import run from 'aocrunner';

type Operation = 'noop' | 'addx';
type Instruction = [Operation, ...number[]];
type OperationExecutable = (X: number, ...args: number[]) => number;
type Callback<T> = (cycle: number, X: number, result: T | undefined) => T;

const MAX_CYCLES = 240;

const OPERATIONS = {
  addx: (X: number, n?: number) => X + (n || 0),
  noop: (X: number) => X,
} as { [k in Operation]: OperationExecutable };

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .map((s) => {
      const [instr, ...args] = s.split(/\s+/);
      return [instr, ...args.map(Number)];
    }) as Instruction[];

function count(cycle: number, X: number, result: number = 0) {
  if ([20, 60, 100, 140, 180, 220].includes(cycle + 1)) {
    return result + (cycle + 1) * X;
  }
  return result;
}

function render(cycle: number, X: number, result: string = '') {
  const c = cycle % 40;
  if (c === 0) result += '\n';
  result += Math.abs(c - X) <= 1 ? '#' : '.';
  return result;
}

function execute<T>(instructions: Instruction[], cb: Callback<T>) {
  const pending = { cycles: 0, instr: ['noop'] as Instruction };
  let X = 1,
    result;
  for (let cycle = 0; cycle < MAX_CYCLES; cycle++) {
    if (pending.cycles <= 0) {
      // Execute last queued instruction
      const [op, ...args] = pending.instr;
      X = OPERATIONS[op](X, ...args);

      // Queue new instruction
      const instr = instructions.shift();
      if (instr) {
        pending.cycles = instr.length;
        pending.instr = instr;
      }
    }

    result = cb(cycle, X, result);
    pending.cycles -= 1;
  }

  return result;
}

const part1 = (rawInput: string) => {
  return execute(parseInput(rawInput), count);
};

const part2 = (rawInput: string) => {
  return execute(parseInput(rawInput), render);
};

const testInstructions = `
  addx 15
  addx -11
  addx 6
  addx -3
  addx 5
  addx -1
  addx -8
  addx 13
  addx 4
  noop
  addx -1
  addx 5
  addx -1
  addx 5
  addx -1
  addx 5
  addx -1
  addx 5
  addx -1
  addx -35
  addx 1
  addx 24
  addx -19
  addx 1
  addx 16
  addx -11
  noop
  noop
  addx 21
  addx -15
  noop
  noop
  addx -3
  addx 9
  addx 1
  addx -3
  addx 8
  addx 1
  addx 5
  noop
  noop
  noop
  noop
  noop
  addx -36
  noop
  addx 1
  addx 7
  noop
  noop
  noop
  addx 2
  addx 6
  noop
  noop
  noop
  noop
  noop
  addx 1
  noop
  noop
  addx 7
  addx 1
  noop
  addx -13
  addx 13
  addx 7
  noop
  addx 1
  addx -33
  noop
  noop
  noop
  addx 2
  noop
  noop
  noop
  addx 8
  noop
  addx -1
  addx 2
  addx 1
  noop
  addx 17
  addx -9
  addx 1
  addx 1
  addx -3
  addx 11
  noop
  noop
  addx 1
  noop
  addx 1
  noop
  noop
  addx -13
  addx -19
  addx 1
  addx 3
  addx 26
  addx -30
  addx 12
  addx -1
  addx 3
  addx 1
  noop
  noop
  noop
  addx -9
  addx 18
  addx 1
  addx 2
  noop
  noop
  addx 9
  noop
  noop
  noop
  addx -1
  addx 2
  addx -37
  addx 1
  addx 3
  noop
  addx 15
  addx -21
  addx 22
  addx -6
  addx 1
  noop
  addx 2
  addx 1
  noop
  addx -10
  noop
  noop
  addx 20
  addx 1
  addx 2
  addx 2
  addx -6
  addx -11
  noop
  noop
  noop
`;

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: testInstructions,
        expected: 13140,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInstructions,
        expected: `
##..##..##..##..##..##..##..##..##..##..
###...###...###...###...###...###...###.
####....####....####....####....####....
#####.....#####.....#####.....#####.....
######......######......######......####
#######.......#######.......#######.....`,
      },
    ],
    solution: part2,
  },
});
