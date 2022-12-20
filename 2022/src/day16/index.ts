import run from 'aocrunner';

type Valve = { key: string; flow: number; tunnels: string[] };
interface Graph {
  valves: Valve[];
  valvesWithFlow: Valve[];
  initialValve: Valve;
  distance: (from: Valve, to: Valve) => number;
  withinDistance: (from: Valve, distance: number) => (to: Valve) => boolean;
}

const parseInput = (rawInput: string) =>
  rawInput.split('\n').reduce((valves, line) => {
    const matches = line.match(
      /Valve (\S+) has flow rate=(\d+); tunnels? leads? to valves? ((\S+,?\s?)+)/,
    );
    if (matches) {
      valves.push({
        key: matches[1],
        flow: Number(matches[2]),
        tunnels: matches[3].split(', '),
      });
    }
    return valves;
  }, [] as Valve[]);

const makeGraph = (valves: Valve[]) => {
  const initialValve = valves.find((v) => v.key === 'AA');
  if (!initialValve) throw new Error('Initial valve not present');
  const valvesWithFlow = valves.filter((v) => v.flow > 0);
  const distances: Record<string, Record<string, number>> = {};

  const calculateDistances = (from: Valve) => {
    distances[from.key] = { [from.key]: 0 };
    const q = [from];
    while (q.length > 0) {
      const current = q.shift() as Valve;
      for (let n of current.tunnels) {
        const next = valves.find((v) => v.key === n);
        if (!next) throw new Error(`Could not find node with key ${n}`);
        if (distances[from.key][next.key] !== undefined) continue;
        q.push(next);
        distances[from.key][next.key] = 1 + distances[from.key][current.key];
      }
    }
  };

  for (const valve of [initialValve, ...valvesWithFlow]) {
    calculateDistances(valve);
  }

  const distance = (from: Valve, to: Valve) => distances[from.key][to.key];
  const withinDistance = (from: Valve, distance: number) => (to: Valve) =>
    from.key !== to.key && distances[from.key][to.key] < distance;

  return {
    valves,
    valvesWithFlow,
    initialValve,
    distances,
    distance,
    withinDistance,
  };
};

const findOptimalRelease = (
  graph: Graph,
  from = graph.initialValve,
  next = graph.valvesWithFlow,
  turns = 31, // 30 + 1 because we open valve AA with this recursive function
): [number, string[]] => {
  // Open current valve
  turns = turns - 1;
  const released = from.flow * turns;
  // We keep track of visited valves, purely for debugging
  const path = [from.key];

  if (turns <= 0) return [0, path];
  if (turns <= 1 || next.length === 0) return [released, path];

  // Available targets from now on exclude current valve (since it's already open)
  next = next.filter((v) => v !== from);

  let bestTargetReleased = 0;
  let bestTargetPath: string[] = [];

  // Next, simulate walking to each of the unopened valves
  for (let target of next) {
    const timeAfterTravel = turns - graph.distance(from, target);
    // Check which other unopened valves can still be reached from there
    const nextForTarget = next.filter(graph.withinDistance(target, timeAfterTravel));
    // Recur with the picked valve and remaining time
    // (which will give you the maximal total release if you were to go to that valve and open it)
    let [targetReleased, targetPath] = findOptimalRelease(
      graph,
      target,
      nextForTarget,
      timeAfterTravel,
    );
    // If the maximal release for the currently picked valve is better than the one we got from earlier valves,
    // the currently picked valve is the best possible target
    if (targetReleased > bestTargetReleased) {
      bestTargetReleased = targetReleased;
      bestTargetPath = targetPath;
    }
  }
  return [released + bestTargetReleased, path.concat(bestTargetPath)];
};

const part1 = (rawInput: string) => {
  const valves = parseInput(rawInput);
  const graph = makeGraph(valves);
  const [score] = findOptimalRelease(graph);
  return score;
};

function* combinations<T>(items: T[]): Generator<T[]> {
  if (items.length === 0) return items;
  if (items.length === 1) {
    yield items;
  } else {
    yield [items[0]];
    for (const c of combinations(items.slice(1))) {
      yield c;
      yield [items[0], ...c];
    }
  }
}

function* distributions<T>(items: T[]): Generator<[T[], T[]]> {
  for (const itemsA of combinations(items)) {
    if (itemsA.length === 0 || itemsA.length === items.length) continue;
    const itemsB = items.filter((i) => !itemsA.includes(i));
    yield [itemsA, itemsB];
  }
}

const part2 = (rawInput: string) => {
  const valves = parseInput(rawInput);
  const graph = makeGraph(valves);

  let bestScore = 0;
  for (const [pDestinations, eDestinations] of distributions(graph.valvesWithFlow)) {
    const [pReleased] = findOptimalRelease(graph, graph.initialValve, pDestinations, 27);
    const [eReleased] = findOptimalRelease(graph, graph.initialValve, eDestinations, 27);
    const score = pReleased + eReleased;
    bestScore = Math.max(bestScore, score);
  }

  return bestScore;
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
          Valve BB has flow rate=13; tunnels lead to valves CC, AA
          Valve CC has flow rate=2; tunnels lead to valves DD, BB
          Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
          Valve EE has flow rate=3; tunnels lead to valves FF, DD
          Valve FF has flow rate=0; tunnels lead to valves EE, GG
          Valve GG has flow rate=0; tunnels lead to valves FF, HH
          Valve HH has flow rate=22; tunnel leads to valve GG
          Valve II has flow rate=0; tunnels lead to valves AA, JJ
          Valve JJ has flow rate=21; tunnel leads to valve II
        `,
        expected: 1651,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
          Valve BB has flow rate=13; tunnels lead to valves CC, AA
          Valve CC has flow rate=2; tunnels lead to valves DD, BB
          Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
          Valve EE has flow rate=3; tunnels lead to valves FF, DD
          Valve FF has flow rate=0; tunnels lead to valves EE, GG
          Valve GG has flow rate=0; tunnels lead to valves FF, HH
          Valve HH has flow rate=22; tunnel leads to valve GG
          Valve II has flow rate=0; tunnels lead to valves AA, JJ
          Valve JJ has flow rate=21; tunnel leads to valve II
        `,
        expected: 1707,
      },
    ],
    solution: part2,
  },
});
