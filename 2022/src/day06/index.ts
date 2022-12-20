import run from 'aocrunner';

const parseInput = (rawInput: string) => rawInput.split('\n').filter(Boolean)[0];

function containsDuplicates(input: string) {
  for (let i = 0; i < input.length; i++) {
    if (input.lastIndexOf(input[i]) !== i) return true;
  }
  return false;
}

function findDistinctMarker(input: string, n: number) {
  for (let i = 0; i < input.length; i++) {
    const start = Math.max(0, i - n);
    const range = input.slice(start, i);
    if (i >= n && !containsDuplicates(range)) {
      return i;
    }
  }
  return -1;
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return findDistinctMarker(input, 4);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return findDistinctMarker(input, 14);
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `mjqjpqmgbljsphdztnvjfqwrcgsmlb`,
        expected: 7,
      },
      {
        input: `bvwbjplbgvbhsrlpgdmjqwftvncz`,
        expected: 5,
      },
      {
        input: `nppdvjthqldpwncqszvftbrmjlhg`,
        expected: 6,
      },
      {
        input: `nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg`,
        expected: 10,
      },
      {
        input: `zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw`,
        expected: 11,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `mjqjpqmgbljsphdztnvjfqwrcgsmlb`,
        expected: 19,
      },
      {
        input: `bvwbjplbgvbhsrlpgdmjqwftvncz`,
        expected: 23,
      },
      {
        input: `nppdvjthqldpwncqszvftbrmjlhg`,
        expected: 23,
      },
      {
        input: `nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg`,
        expected: 29,
      },
      {
        input: `zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw`,
        expected: 26,
      },
    ],
    solution: part2,
  },
});
