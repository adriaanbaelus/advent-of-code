import run from 'aocrunner';

type Valve = { key: string; flow: number; tunnels: string[] };
interface Graph {
  valves: Valve[];
  valvesWithFlow: Valve[];
  initialValve: Valve;
  distance: (from: Valve, to: Valve) => number;
  withinDistance: (from: Valve, distance: number) => (to: Valve) => boolean;
}

const debug = false;

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
    const nextForTarget = next.filter(
      graph.withinDistance(target, timeAfterTravel),
    );
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
  debug && console.log(valves);
  const graph = makeGraph(valves);
  debug &&
    console.log(
      `# valves: ${graph.valves.length}, # flowing valves: ${graph.valvesWithFlow.length}`,
    );
  debug && console.log('Distance between flowing valves:');
  const relevantValves = [graph.initialValve, ...graph.valvesWithFlow];
  for (let v of relevantValves) {
    debug &&
      console.log(
        `- From ${v.key}:`,
        relevantValves.map((to) => `${to.key}:${graph.distance(v, to)}`),
      );
  }
  const [total, path] = findOptimalRelease(graph);
  let t = 0;
  for (let i = 1; i < path.length; i++) {
    const fromKey = path[i - 1];
    const toKey = path[i];
    const from = graph.valves.find((v) => v.key === fromKey) as Valve;
    const to = graph.valves.find((v) => v.key === toKey) as Valve;
    const dist = graph.distance(from, to);
    debug &&
      console.log(`${t}: Moving from ${fromKey} to ${toKey} in ${dist} turns`);
    t += dist;
    debug &&
      console.log(
        `${t}: Opening ${toKey} (releasing ${to.flow} for ${
          30 - t - 1
        } turns, ${to.flow * (30 - t - 1)} total)`,
      );
    t += 1;
  }
  debug && console.log(`Done in ${t} turns`);
  debug && console.log(`Total release = ${total} for path:`, path);
  return total;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return;
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
