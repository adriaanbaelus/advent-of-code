import run from 'aocrunner';

import { PriorityQueue } from '@datastructures-js/priority-queue';

type GraphKey = string;
type GraphNode = { elevation: number; adjacent: GraphKey[] };
type Graph = Record<GraphKey, GraphNode>;
type DijkstraCostFn = (from: GraphNode, to: GraphNode) => number;

const parseInput = (rawInput: string) =>
  rawInput
    .split('\n')
    .filter(Boolean)
    .reduce(
      (graph, line, y, lines) => {
        line.split('').forEach((char, x) => {
          const key = `${x},${y}`;
          graph.nodes[key] = {
            elevation: char.charCodeAt(0) - 'a'.charCodeAt(0),
            adjacent: findAdjacent(x, y, line.length, lines.length),
          };
          if (char === 'S') {
            graph.nodes[key].elevation = 0;
            graph.start = key;
          } else if (char === 'E') {
            graph.nodes[key].elevation = 25;
            graph.end = key;
          }
        });
        return graph;
      },
      { nodes: {} } as { nodes: Graph; start: GraphKey; end: GraphKey },
    );

const findAdjacent = (x: number, y: number, w: number, h: number) => {
  const adjacent = [];
  if (y > 0) adjacent.push(`${x},${y - 1}`); // Up
  if (x < w - 1) adjacent.push(`${x + 1},${y}`); // Right
  if (y < h - 1) adjacent.push(`${x},${y + 1}`); // Down
  if (x > 0) adjacent.push(`${x - 1},${y}`); // Left
  return adjacent;
};

// References:
// https://brilliant.org/wiki/dijkstras-short-path-finder/
// https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Using_a_priority_queue
function dijkstra(nodes: Graph, start: GraphKey, cost: DijkstraCostFn = costGoingUp) {
  const dist = {} as Record<string, number>;
  const visited = new Set<GraphKey>();
  for (let n of Object.keys(nodes)) {
    dist[n] = Infinity;
  }
  dist[start] = 0;
  const queue = new PriorityQueue<GraphKey>((a, b) => (dist[b] < dist[a] ? 1 : -1));
  queue.enqueue(start);

  while (!queue.isEmpty()) {
    const v = queue.dequeue();
    const node = nodes[v];
    // Since a node may have been queued multiple times (it gets queued every time a neighbour is visited)
    // we ignore all subsequent visits since they will have equal or higher distance
    if (visited.has(v)) continue;
    visited.add(v);
    for (let a of node.adjacent) {
      const neighbour = nodes[a];
      const distFromStartToN = dist[v] + cost(node, neighbour);
      if (distFromStartToN < dist[a]) {
        // Sometimes, we find a shorter path for a node that is yet to be visited.
        // If our priority queue supported changing prio or removing elements, we could do that.
        // (see wikipedia link above for optimizations)
        // Since it doesn't, we mark the node as unvisited and queue it.
        // That will make sure the node is (re)visited with correct distance.
        // The node may be queued multiple times, but will only be processed once (unless we arrive here again)
        visited.delete(a);
        dist[a] = distFromStartToN;
      }
      queue.enqueue(a);
    }
  }

  return dist;
}

const costGoingUp: DijkstraCostFn = (from, to) =>
  to.elevation - from.elevation > 1 ? Infinity : 1;
const costGoingDown: DijkstraCostFn = (from, to) =>
  from.elevation - to.elevation > 1 ? Infinity : 1;

const part1 = (rawInput: string) => {
  const graph = parseInput(rawInput);
  return dijkstra(graph.nodes, graph.start)[graph.end];
};

const part2 = (rawInput: string) => {
  // For part 2 we can naively calculate distances from all starting points (it takes about 15 seconds total).
  // A smarter approach is to invert the pathfinding: calculate distance to all coordinates from the finish.
  // We need to invert the cost function as well (if neighbour is more than 1 below, it's unreachable)
  // This way, we only need to do one pass through the area instead of for each starting point.
  const graph = parseInput(rawInput);
  let shortestPath = Infinity;
  const distances = dijkstra(graph.nodes, graph.end, costGoingDown);
  Object.entries(graph.nodes)
    .filter(([, node]) => node.elevation === 0)
    .forEach(([n]) => {
      shortestPath = Math.min(shortestPath, distances[n]);
    });
  return shortestPath;
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          Sabqponm
          abcryxxl
          accszExk
          acctuvwj
          abdefghi
        `,
        expected: 31,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          Sabqponm
          abcryxxl
          accszExk
          acctuvwj
          abdefghi
        `,
        expected: 29,
      },
    ],
    solution: part2,
  },
});
