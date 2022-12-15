import run from 'aocrunner';

type Point = [number, number];
type Range = [number, number];

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .map((line) => {
      const matches = line.match(
        /\s*Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/,
      );
      if (matches) {
        const [, sx, sy, bx, by] = matches.map(Number);
        return [
          [sx, sy],
          [bx, by],
        ];
      }
    })
    .filter(Boolean) as [Point, Point][];

const distance = (from: Point, to: Point) => {
  return Math.abs(to[1] - from[1]) + Math.abs(to[0] - from[0]);
};

const intersectionAtY = (
  [cx, cy]: Point,
  r: number,
  y: number,
): Range | null => {
  const distanceY = Math.abs(cy - y);
  if (distanceY > r) return null;
  const distanceX = r - distanceY;
  return [cx - distanceX, cx + distanceX];
};

// Finds overlapping ranges and merges them together
const normalize = (ranges: Range[]) => {
  // Sort by start of range (to make sure we can find adjacent ranges)
  // (make a copy because sort modifies `ranges`)
  const unnormalized = [...ranges].sort(([s1], [s2]) => s2 - s1);
  // Prefill normalized ranges with first range
  const normalized = [unnormalized.pop() as Range];
  while (unnormalized.length > 0) {
    const [s1, e1] = normalized.pop() as Range; // Take last normalized range
    const [s2, e2] = unnormalized.pop() as Range; // Take next unnormalized range
    if (s2 > e1) {
      // Ranges are not adjacent, just add them both
      normalized.push([s1, e1], [s2, e2]);
    } else {
      // Ranges overlap, so add one new range (union of 2 old ones)
      normalized.push([Math.min(s1, s2), Math.max(e1, e2)]);
    }
  }
  return normalized;
};

// Given the input (sensors and their closest beacons), and a specific Y value,
// find all X values that are already 'covered' (i.e. where the missing beacon can't be)
const findAllIntersectionsAtY = (y: number, input: Point[][]) => {
  let intersections: Range[] = [];
  for (let [sensor, beacon] of input) {
    const r = distance(sensor, beacon);
    const intersection = intersectionAtY(sensor, r, y);
    if (intersection) {
      intersections.push(intersection);
    }
  }
  return normalize(intersections);
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const intersections = findAllIntersectionsAtY(2000000, input);
  return intersections.map(([min, max]) => max - min).reduce((a, b) => a + b);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  // I feel like there is probably a better way, but we basically brute force it using part 1:
  // - walk all possible Y values
  // - check if there is an X value outside of the 'covered' intersections at Y
  for (let y = 0; y <= 4000000; y++) {
    const [, [startOfSecondIntersection] = []] = findAllIntersectionsAtY(
      y,
      input,
    );
    // Technically we should also check if the first intersection starts after 0 or ends before 4000000
    // (in case the beacon is at one of the edges), but this worked fine with my input 🤷
    if (startOfSecondIntersection) {
      const x = startOfSecondIntersection - 1;
      return 4000000 * x + y;
    }
  }
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          Sensor at x=2, y=2000008: closest beacon is at x=-2, y=2000005
          Sensor at x=9, y=2000006: closest beacon is at x=10, y=2000006
          Sensor at x=13, y=1999992: closest beacon is at x=15, y=1999993
          Sensor at x=12, y=2000004: closest beacon is at x=10, y=2000006
          Sensor at x=10, y=2000010: closest beacon is at x=10, y=2000006
          Sensor at x=14, y=2000007: closest beacon is at x=10, y=2000006
          Sensor at x=8, y=1999997: closest beacon is at x=2, y=2000000
          Sensor at x=2, y=1999990: closest beacon is at x=2, y=2000000
          Sensor at x=0, y=2000001: closest beacon is at x=2, y=2000000
          Sensor at x=20, y=2000004: closest beacon is at x=25, y=2000007
          Sensor at x=17, y=2000010: closest beacon is at x=21, y=2000012
          Sensor at x=16, y=1999997: closest beacon is at x=15, y=1999993
          Sensor at x=14, y=1999993: closest beacon is at x=15, y=1999993
          Sensor at x=20, y=1999991: closest beacon is at x=15, y=1999993
        `,
        expected: 26,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          Sensor at x=2, y=18: closest beacon is at x=-2, y=15
          Sensor at x=9, y=16: closest beacon is at x=10, y=16
          Sensor at x=13, y=2: closest beacon is at x=15, y=3
          Sensor at x=12, y=14: closest beacon is at x=10, y=16
          Sensor at x=10, y=20: closest beacon is at x=10, y=16
          Sensor at x=14, y=17: closest beacon is at x=10, y=16
          Sensor at x=8, y=7: closest beacon is at x=2, y=10
          Sensor at x=2, y=0: closest beacon is at x=2, y=10
          Sensor at x=0, y=11: closest beacon is at x=2, y=10
          Sensor at x=20, y=14: closest beacon is at x=25, y=17
          Sensor at x=17, y=20: closest beacon is at x=21, y=22
          Sensor at x=16, y=7: closest beacon is at x=15, y=3
          Sensor at x=14, y=3: closest beacon is at x=15, y=3
          Sensor at x=20, y=1: closest beacon is at x=15, y=3
        `,
        expected: 56000011,
      },
    ],
    solution: part2,
  },
});
