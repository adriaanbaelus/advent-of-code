import run from 'aocrunner';

type Monkey = { value: number } | { op: string; l: string; r: string };
type Monkeys = { [name: string]: Monkey };
type CalculateFn = (a: number, b: number) => number;
type SolveFn = (result: number) => number;

const calc: Record<'result' | 'left' | 'right', Record<string, CalculateFn>> = {
  result: {
    '+': (l, r) => l + r,
    '-': (l, r) => l - r,
    '*': (l, r) => l * r,
    '/': (l, r) => l / r,
  },
  left: {
    '+': (res, r) => res - r,
    '-': (res, r) => res + r,
    '*': (res, r) => res / r,
    '/': (res, r) => res * r,
  },
  right: {
    '+': (res, l) => res - l,
    '-': (res, l) => l - res,
    '*': (res, l) => res / l,
    '/': (res, l) => l / res,
  },
};

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .reduce((monkeys, line) => {
      const [, name, job] = line.match(/(.+): (.*)/) || [];
      if (name && job) {
        const matchesNumber = job.match(/\d+/);
        if (matchesNumber) {
          monkeys[name] = { value: Number(matchesNumber[0]) };
        } else {
          const [l, op, r] = job.split(' ');
          monkeys[name] = { op, l, r };
        }
      }
      return monkeys;
    }, {} as Monkeys);

const part1 = (rawInput: string) => {
  const monkeys = parseInput(rawInput);
  return Number(solve(monkeys));
};

const part2 = (rawInput: string) => {
  const monkeys = parseInput(rawInput);
  if (!('op' in monkeys.root)) throw new Error('Invalid input');

  // For part 2, we transform the root into l - r
  monkeys.root.op = '-';
  // `solve` will return a function that takes the wanted result of the equation.
  // Given that for root, l - r = 0, what's the value of humn?
  const solveHumanFor = solve(monkeys, 'root', 'humn');
  if (typeof solveHumanFor !== 'function')
    throw new Error(`Expected solve function, got "${solveHumanFor}"`);

  return solveHumanFor(0);
};

function solve(monkeys: Monkeys, name = 'root', target = ''): number | SolveFn {
  // If there is a target monkey/human and we've reached it, we're done.
  // We return a function that returns the solution for target
  if (name === target) return (solution) => solution;

  const monkey = monkeys[name];
  // Simple case: if monkey has a value, just return that (no solving needed)
  if ('value' in monkey) return monkey.value;
  const left = solve(monkeys, monkey.l, target);
  const right = solve(monkeys, monkey.r, target);

  if (typeof left === 'function' && typeof right === 'function')
    // If both sides need solving, this approach won't work (we'd need to solve the resulting polynomial)
    // Luckily, that doesn't happen with the input :)
    throw new Error('both sides of equation need to be solved');

  if (typeof left === 'function') {
    // Return a solve function. Since the right side is a simple value, we can calculate left side
    // as soon as we get the calculated result (which gets passed recursively, starting from 0 at root)
    return (result: number) => {
      const solutionForL = calc.left[monkey.op](result, right as number);
      return left(solutionForL);
    };
  } else if (typeof right === 'function') {
    // Same thing, but for right side
    return (result: number) => {
      const solutionForR = calc.right[monkey.op](result, left as number);
      return right(solutionForR);
    };
  } else {
    // Simple value calculation, no solving needed
    return calc.result[monkey.op](left, right);
  }
}

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          root: pppw + sjmn
          dbpl: 5
          cczh: sllz + lgvd
          zczc: 2
          ptdq: humn - dvpt
          dvpt: 3
          lfqf: 4
          humn: 5
          ljgn: 2
          sjmn: drzm * dbpl
          sllz: 4
          pppw: cczh / lfqf
          lgvd: ljgn * ptdq
          drzm: hmdt - zczc
          hmdt: 32
        `,
        expected: 152,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          root: pppw + sjmn
          dbpl: 5
          cczh: sllz + lgvd
          zczc: 2
          ptdq: humn - dvpt
          dvpt: 3
          lfqf: 4
          humn: 5
          ljgn: 2
          sjmn: drzm * dbpl
          sllz: 4
          pppw: cczh / lfqf
          lgvd: ljgn * ptdq
          drzm: hmdt - zczc
          hmdt: 32
        `,
        expected: 301,
      },
    ],
    solution: part2,
  },
});
