import run from 'aocrunner';

const parseInput = (rawInput: string) => rawInput.split('\n').filter(Boolean);
const PRIORITIES = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  let prioritiesSum = 0;
  for (let sack of input) {
    const [compartment1, compartment2] = [
      sack.slice(0, sack.length / 2),
      sack.slice(sack.length / 2),
    ];
    for (let item of compartment1) {
      if (compartment2.includes(item)) {
        prioritiesSum += PRIORITIES.indexOf(item);
        break;
      }
    }
  }

  return prioritiesSum;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  let prioritiesSum = 0;
  const groups = input.reduce((groups, sack, i) => {
    if (i % 3 === 0) {
      groups.unshift([]);
    }
    groups[0].push(sack);
    return groups;
  }, [] as string[][]);

  for (let [memb1, memb2, memb3] of groups) {
    for (let item of memb1) {
      if (memb2.includes(item) && memb3.includes(item)) {
        prioritiesSum += PRIORITIES.indexOf(item);
        break;
      }
    }
  }

  return prioritiesSum;
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          vJrwpWtwJgWrhcsFMMfFFhFp
          jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
          PmmdzqPrVvPwwTWBwg
          wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
          ttgJtRGJQctTZtZT
          CrZsJsPPZsGzwwsLwLmpwMDw
        `,
        expected: 157,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          vJrwpWtwJgWrhcsFMMfFFhFp
          jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
          PmmdzqPrVvPwwTWBwg
          wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
          ttgJtRGJQctTZtZT
          CrZsJsPPZsGzwwsLwLmpwMDw
        `,
        expected: 70,
      },
    ],
    solution: part2,
  },
});
