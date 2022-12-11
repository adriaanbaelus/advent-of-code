import run from 'aocrunner';

type Monkey = {
  items: number[];
  onInspect: WorryModifierFn;
  testDivisor: number;
  passTo: number[];
};
type WorryModifierFn = (v: number) => number;

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .reduce((monkeys, line) => {
      const noop = (v: number) => v;
      if (parseNewMonkey(line)) {
        monkeys.push({
          items: [],
          onInspect: noop,
          testDivisor: 1,
          passTo: [],
        });
      }
      const monkey = monkeys.at(-1) as Monkey;
      parseMonkeyItems(line, monkey);
      parseOperation(line, monkey);
      parseTest(line, monkey);
      parsePassTo(line, monkey);

      return monkeys;
    }, [] as Monkey[]);

const part1 = (rawInput: string) => {
  const monkeys = parseInput(rawInput);
  const rounds = 20;
  const inspections = monkeys.map(() => 0);

  for (let r = 0; r < rounds; r++) {
    for (let m = 0; m < monkeys.length; m++) {
      const monkey = monkeys[m];

      while (monkey.items.length > 0) {
        inspections[m]++;
        let lvl = monkey.items.shift() as number;
        lvl = monkey.onInspect(lvl);
        lvl = Math.floor(lvl / 3);
        const passedTest = lvl % monkey.testDivisor === 0;
        const receiver = monkey.passTo[passedTest ? 0 : 1];
        monkeys[receiver].items.push(lvl);
      }
    }
  }

  inspections.sort((a, b) => b - a);
  return inspections[0] * inspections[1];
};

const part2 = (rawInput: string) => {
  const monkeys = parseInput(rawInput);
  const rounds = 10000;
  const inspections = monkeys.map(() => 0);
  // Since worry levels will keep increasing infinitely, we want a way to limit them.
  // We only really care whether lvl % testDivisor is correct for each monkey, we don't need the actual number.
  // We can calculate a common multiple of all different test divisors.
  // This will put an upper bound on the max value of lvl,
  // while still getting a correct result for lvl % testDivisor (for each different testDivisor)
  const divisors = Array.from(new Set(monkeys.map((m) => m.testDivisor)));
  // Since the data set only contains a few prime numbers for test divisors, we can simply multiply them.
  // A "proper" solution would calculate the Least Common Multiple.
  // See https://en.wikipedia.org/wiki/Least_common_multiple
  const commonDivisor = divisors.reduce((a, v) => a * v);

  for (let r = 0; r < rounds; r++) {
    for (let m = 0; m < monkeys.length; m++) {
      const monkey = monkeys[m];

      while (monkey.items.length > 0) {
        inspections[m]++;
        let lvl = monkey.items.shift() as number;
        lvl = monkey.onInspect(lvl) % commonDivisor;
        const passedTest = lvl % monkey.testDivisor === 0;
        const receiver = monkey.passTo[passedTest ? 0 : 1];
        monkeys[receiver].items.push(lvl);
      }
    }
  }

  inspections.sort((a, b) => b - a);
  return inspections[0] * inspections[1];
};

function parseNewMonkey(line: string) {
  return Boolean(line.match(/\s*Monkey\s+(\d+)/));
}
function parseMonkeyItems(line: string, monkey: Monkey) {
  const matches = line.match(/\s*Starting items:\s+([0-9, ]+)/);
  if (!matches) return;
  monkey.items = matches[1].split(', ').map(Number);
}
function parseOperation(line: string, monkey: Monkey) {
  const matches = line.match(/\s*Operation:\s+(.*)/);
  if (!matches) return;
  const fnBody = matches[1].replace(/new\s*=\s*/, 'return ');
  monkey.onInspect = new Function('old', fnBody) as WorryModifierFn;
}
function parseTest(line: string, monkey: Monkey) {
  const matches = line.match(/\s*Test:\s+divisible by (\d+)/);
  if (!matches) return;
  monkey.testDivisor = Number(matches[1]);
}
function parsePassTo(line: string, monkey: Monkey) {
  const matches = line.match(/\s*If (true|false):\s+throw to monkey (\d+)/);
  if (!matches) return;
  const i = matches[1] === 'true' ? 0 : 1;
  monkey.passTo[i] = Number(matches[2]);
}

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          Monkey 0:
            Starting items: 79, 98
            Operation: new = old * 19
            Test: divisible by 23
              If true: throw to monkey 2
              If false: throw to monkey 3
          
          Monkey 1:
            Starting items: 54, 65, 75, 74
            Operation: new = old + 6
            Test: divisible by 19
              If true: throw to monkey 2
              If false: throw to monkey 0
          
          Monkey 2:
            Starting items: 79, 60, 97
            Operation: new = old * old
            Test: divisible by 13
              If true: throw to monkey 1
              If false: throw to monkey 3
          
          Monkey 3:
            Starting items: 74
            Operation: new = old + 3
            Test: divisible by 17
              If true: throw to monkey 0
              If false: throw to monkey 1
        `,
        expected: 10605,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          Monkey 0:
            Starting items: 79, 98
            Operation: new = old * 19
            Test: divisible by 23
              If true: throw to monkey 2
              If false: throw to monkey 3
          
          Monkey 1:
            Starting items: 54, 65, 75, 74
            Operation: new = old + 6
            Test: divisible by 19
              If true: throw to monkey 2
              If false: throw to monkey 0
          
          Monkey 2:
            Starting items: 79, 60, 97
            Operation: new = old * old
            Test: divisible by 13
              If true: throw to monkey 1
              If false: throw to monkey 3
          
          Monkey 3:
            Starting items: 74
            Operation: new = old + 3
            Test: divisible by 17
              If true: throw to monkey 0
              If false: throw to monkey 1
        `,
        expected: 2713310158,
      },
    ],
    solution: part2,
  },
});
