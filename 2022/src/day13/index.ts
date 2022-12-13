import run from 'aocrunner';

type Packet = (number | Packet)[];

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Packet);

function compare(left: Packet, right: Packet): number {
  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; i++) {
    let l = left[i],
      r = right[i];
    if (typeof l === 'number' && typeof r === 'number') {
      if (l < r) return -1;
      if (l > r) return 1;
    } else {
      l = typeof l === 'number' ? [l] : l;
      r = typeof r === 'number' ? [r] : r;
      const ordered = compare(l, r);
      if (ordered !== 0) return ordered;
    }
  }
  if (left.length < right.length) return -1;
  if (left.length > right.length) return 1;
  return 0;
}

const part1 = (rawInput: string) => {
  const packets = parseInput(rawInput);
  let sum = 0;
  for (let i = 0; i < packets.length - 1; i += 2) {
    if (compare(packets[i], packets[i + 1]) < 0) {
      sum += i / 2 + 1;
    }
  }

  return sum;
};

const part2 = (rawInput: string) => {
  const packets = parseInput(rawInput);
  const divider1 = [[2]];
  const divider2 = [[6]];
  packets.push(divider1, divider2);
  packets.sort(compare);
  return (packets.indexOf(divider1) + 1) * (packets.indexOf(divider2) + 1);
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          [1,1,3,1,1]
          [1,1,5,1,1]
          
          [[1],[2,3,4]]
          [[1],4]
          
          [9]
          [[8,7,6]]
          
          [[4,4],4,4]
          [[4,4],4,4,4]
          
          [7,7,7,7]
          [7,7,7]
          
          []
          [3]
          
          [[[]]]
          [[]]
          
          [1,[2,[3,[4,[5,6,7]]]],8,9]
          [1,[2,[3,[4,[5,6,0]]]],8,9]
        `,
        expected: 13,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          [1,1,3,1,1]
          [1,1,5,1,1]
          
          [[1],[2,3,4]]
          [[1],4]
          
          [9]
          [[8,7,6]]
          
          [[4,4],4,4]
          [[4,4],4,4,4]
          
          [7,7,7,7]
          [7,7,7]
          
          []
          [3]
          
          [[[]]]
          [[]]
          
          [1,[2,[3,[4,[5,6,7]]]],8,9]
          [1,[2,[3,[4,[5,6,0]]]],8,9]
        `,
        expected: 140,
      },
    ],
    solution: part2,
  },
});
