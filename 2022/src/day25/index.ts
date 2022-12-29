import run from 'aocrunner';

const parseInput = (rawInput: string) => rawInput.split('\n').filter(Boolean);

const decDigits: Record<string, number> = { '=': -2, '-': -1, '0': 0, '1': 1, '2': 2 };
const snafuDigits: Record<number, string> = { [-2]: '=', [-1]: '-', [0]: '0', [1]: '1', [2]: '2' };

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let sum = 0;
  for (const n of input) {
    sum += toDecimal(n);
  }

  return toSnafu(sum);
};

const part2 = () => {
  return '50*';
};

function toDecimal(snafu: string) {
  let number = 0;
  for (let i = 0; i < snafu.length; i++) {
    const digit = decDigits[snafu[i]] || 0;
    number += digit * Math.pow(5, snafu.length - i - 1);
  }
  return number;
}

function toSnafu(num: number) {
  let result = '';
  while (num > 0) {
    let remainder = ((num + 2) % 5) - 2;
    result = snafuDigits[remainder] + result;
    num = (num - remainder) / 5;
  }
  return result;
}

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          1=-0-2
          12111
          2=0=
          21
          2=01
          111
          20012
          112
          1=-1=
          1-12
          12
          1=
          122
        `,
        expected: '2=-1=0',
      },
      {
        input: `1121-1110-1=0`,
        expected: '1121-1110-1=0',
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [],
    solution: part2,
  },
});
