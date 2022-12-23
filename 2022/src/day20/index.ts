import run from 'aocrunner';

//                     Value,  Original index
type MoveableNumber = [number, number];
const toMoveableNumber = (n: number, i: number) => [n, i] as MoveableNumber;

const parseInput = (rawInput: string) => rawInput.split(/\s+/).filter(Boolean).map(Number);

const part1 = (rawInput: string) => {
  let sequence: MoveableNumber[] = parseInput(rawInput).map(toMoveableNumber);

  sequence = mix(sequence);
  const zero = sequence.findIndex(([n]) => n === 0);

  return [1000, 2000, 3000].map((i) => get(sequence, zero + i)).reduce((sum, n) => sum + n);
};

const part2 = (rawInput: string) => {
  let sequence: MoveableNumber[] = parseInput(rawInput)
    .map((n) => n * 811589153)
    .map(toMoveableNumber);

  for (let j = 0; j < 10; j++) {
    sequence = mix(sequence);
  }

  const zero = sequence.findIndex(([n]) => n === 0);
  return [1000, 2000, 3000].map((i) => get(sequence, zero + i)).reduce((sum, n) => sum + n);
};

function mix(sequence: MoveableNumber[]) {
  for (let i = 0; i < sequence.length; i++) {
    move(sequence, item(sequence, i));
  }
  return sequence;
}

function item(sequence: MoveableNumber[], i: number) {
  return sequence.findIndex(([, j]) => i === j);
}

function move(sequence: MoveableNumber[], i: number): void {
  const prevIndex = normalize(i, sequence);
  const [n, originalIndex] = sequence[prevIndex];
  // 0 is inert, i.e. it should always remain where it was
  if (n === 0) return;

  // Since inserting at i=0 is the same as inserting at the end of the list,
  // we should calculate newIndex using original length - 1.
  // In this case, the same is achieved by first removing the item, then calculating newIndex.
  sequence.splice(prevIndex, 1);
  let newIndex = normalize(prevIndex + n, sequence);
  // In the examples, items at position 0 are visualized at the end (since those are the same spot).
  // It doesn't actually matter for the end result, so the line below is purely for debugging.
  if (newIndex === 0) newIndex = sequence.length;
  sequence.splice(newIndex, 0, [n, originalIndex]);
}

function normalize<T>(i: number, sequence: T[]): number {
  return i % sequence.length;
}

function get(sequence: MoveableNumber[], i: number): number {
  return sequence[normalize(i, sequence)][0];
}

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: ` 1 2 -3 3 -2 0 4 `,
        expected: 3,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: ` 1 2 -3 3 -2 0 4 `,
        expected: 1623178306,
      },
    ],
    solution: part2,
  },
});
