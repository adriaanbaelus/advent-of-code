import run from 'aocrunner';

const ORE = 0;
const CLAY = 1;
const OBSIDIAN = 2;
const GEODE = 3;
const TYPES = [ORE, CLAY, OBSIDIAN, GEODE];

type Tuple3<T> = [T, T, T];
type Tuple4<T> = [T, T, T, T];
type Requirements = Tuple3<number>;
type Blueprint = { id: number; cost: Tuple4<Requirements>; max: Tuple4<number> };

type State = {
  turns: number;
  bots: Tuple4<number>;
  resources: Tuple4<number>;
};
type Action = { state: State } & ({ key: 'idle' } | { key: 'build'; type: number });

// prettier-ignore
const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .map((line) => {
      const matches = (line.match(/\d+/g) || []).map(Number);
      return {
        id: matches[0],
        cost: [
          //       ore,       clay,   obsidian
          [ matches[1],          0,          0 ], // For ore bot
          [ matches[2],          0,          0 ], // For clay bot
          [ matches[3], matches[4],          0 ], // For obsidian bot
          [ matches[5],          0, matches[6] ], // For geode bot
        ],
        // Since we can only build 1 bot per turn, there's an upper limit on how many bots we need for each resource
        max: [
          Math.max(matches[1], matches[2], matches[3], matches[5]),
          matches[4],
          matches[6],
          Infinity,
        ],
      } as Blueprint;
    })
    .filter(Boolean);

const part1 = (rawInput: string) => {
  const blueprints = parseInput(rawInput);
  let sum = 0;
  for (const blueprint of blueprints) {
    const optimal = findOptimalState(blueprint, 24);
    sum += optimal.resources[GEODE] * blueprint.id;
  }
  return sum;
};

const part2 = (rawInput: string) => {
  const blueprints = parseInput(rawInput).slice(0, 3);
  let product = 1;
  for (const blueprint of blueprints) {
    const optimal = findOptimalState(blueprint, 32);
    product *= optimal.resources[GEODE];
  }
  return product;
};

function findOptimalState(bp: Blueprint, turns: number) {
  let initial: State = { turns, bots: [1, 0, 0, 0], resources: [0, 0, 0, 0] };
  let optimal = initial;

  const recur = (action = idle(initial)) => {
    const state = perform(action, bp);
    let bestFromCurrent = state;

    for (const a of nextActions(state, bp)) {
      if (irrelevant(a, optimal, bp)) continue;
      const next = recur(a);
      if (next.resources[GEODE] > bestFromCurrent.resources[GEODE]) {
        bestFromCurrent = next;
      }
    }
    if (bestFromCurrent.resources[GEODE] > optimal.resources[GEODE]) {
      optimal = bestFromCurrent;
    }
    return bestFromCurrent;
  };

  recur();
  return optimal;
}

function perform(action: Action, bp: Blueprint): State {
  const { state } = action;
  const bots: Tuple4<number> = [...state.bots];
  const resources: Tuple4<number> = [...state.resources];
  const turns = state.turns - 1;

  if (action.key === 'build') {
    // If we're building a new bot, take all required resources
    const requirements = bp.cost[action.type];
    for (let i = 0; i < requirements.length; i++) {
      if (resources[i] < requirements[i]) throw new Error('Insufficient resources to build bot');
      resources[i] -= requirements[i];
    }
  }
  // Increase available resources by production of active bots
  for (let [type, count] of bots.entries()) {
    resources[type] += count;
  }
  // If bot was built, add it to the list of active bots (so it can start working next turn)
  if (action.key === 'build') {
    bots[action.type]++;
  }

  return { bots, resources, turns };
}

function nextActions(state: State, bp: Blueprint) {
  if (state.turns <= 0) return [];
  if (state.turns <= 1) return [idle(state)]; // No point in building, resources will be consumed without payoff

  const next: Action[] = [];
  for (let botType = TYPES.length - 1; botType >= 0; botType--) {
    const buildAction = build(state, botType, bp);
    if (buildAction) next.push(buildAction);
  }
  return next.length > 0 ? next : [idle(state)];
}

function irrelevant(action: Action, optimal: State, bp: Blueprint) {
  const current = action.state;

  if (action.key === 'build') {
    const botType = action.type;
    // If we're already producing enough of this resource for any bot building, we don't need to build more of this bot type
    if (current.bots[botType] >= bp.max[botType]) return true;
    // If current bot type requires a resource without bots collecting it, we can never build it
    const requirements = bp.cost[botType];
    if (requirements.some((req, type) => req && !current.bots[type])) return true;
  }

  if (optimal.turns > current.turns) {
    // If the current state has strictly less or equal bots AND resources than the optimal state,
    // and the optimal state has more turns remaining, the current state is always irrelevant
    if (
      TYPES.every(
        (type) =>
          optimal.bots[type] >= current.bots[type] &&
          optimal.resources[type] >= current.resources[type],
      )
    )
      return true;
  }

  // Assuming we could create a Geode bot every single turn from now on, what's the maximum amount of geodes
  // starting from current state?
  // If it is less than the number of geodes at the optimal state, the current state is always irrelevant.
  const mostOptimisticForCurrent =
    current.resources[GEODE] +
    current.turns * current.bots[GEODE] +
    (current.turns * (current.turns - 1)) / 2;

  if (optimal.resources[GEODE] >= mostOptimisticForCurrent) return true;

  return false;
}

const idle = (state: State) => ({ key: 'idle', state } as Action);
const build = (state: State, type: number, bp: Blueprint) => {
  const requirements = bp.cost[type];
  // When planning a build action, we want to return the action at the time where it can actually be executed
  // We fast forward by performing idle actions until there are enough resources available.
  const hasResources = (s: State) => requirements.every((cost, r) => s.resources[r] >= cost);
  while (!hasResources(state)) {
    // Exit if it turns out the current action can not be completed before time runs out
    if (state.turns <= 1) return null;
    state = perform(idle(state), bp);
  }
  return { key: 'build', type, state } as Action;
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
        `,
        expected: 9,
      },
      {
        input: `
          Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
          Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.
        `,
        expected: 33,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
        `,
        expected: 56,
      },
      {
        input: `
          Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.
        `,
        expected: 62,
      },
    ],
    solution: part2,
  },
});
