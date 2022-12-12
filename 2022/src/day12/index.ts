import run from 'aocrunner';

import { PriorityQueue } from '@datastructures-js/priority-queue';

type GraphKey = string;
type GraphNode = { elevation: number; neighbours: GraphKey[] };
type Graph = Record<GraphKey, GraphNode>;

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
            neighbours: findNeighbours(x, y, line.length, lines.length),
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

function findNeighbours(x: number, y: number, maxX: number, maxY: number) {
  const neighbours = [];
  if (x < maxX - 1) neighbours.push(`${x + 1},${y}`); // Right
  if (y < maxY - 1) neighbours.push(`${x},${y + 1}`); // Down
  if (y > 0) neighbours.push(`${x},${y - 1}`); // Up
  if (x > 0) neighbours.push(`${x - 1},${y}`); // Left
  return neighbours;
}

// Reference: https://brilliant.org/wiki/dijkstras-short-path-finder/
function dijkstra(nodes: Graph, start: GraphKey) {
  const dist = {} as Record<string, number>;
  const visited = {} as Record<string, boolean>;
  for (let v of Object.keys(nodes)) {
    dist[v] = Infinity;
  }
  dist[start] = 0;
  const q = new PriorityQueue<GraphKey>((a, b) => (dist[b] < dist[a] ? 1 : -1));
  q.enqueue(start);

  while (!q.isEmpty()) {
    const v = q.dequeue();
    const node = nodes[v];
    if (visited[v]) continue;
    visited[v] = true;
    for (let n of node.neighbours) {
      const neighbour = nodes[n];
      const cost = neighbour.elevation - node.elevation > 1 ? Infinity : 1;
      const alt = dist[v] + cost;
      if (alt < dist[n]) {
        visited[n] = false;
        dist[n] = alt;
      }
      q.enqueue(n);
    }
  }

  return dist;
}

const part1 = (rawInput: string) => {
  const graph = parseInput(rawInput);
  return dijkstra(graph.nodes, graph.start)[graph.end];
};

const part2 = (rawInput: string) => {
  const graph = parseInput(rawInput);
  let shortestPath = Infinity;
  Object.entries(graph.nodes)
    .filter(([, node]) => node.elevation === 0)
    .forEach(([n]) => {
      const pathDistance = dijkstra(graph.nodes, n)[graph.end];
      shortestPath = Math.min(shortestPath, pathDistance);
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
