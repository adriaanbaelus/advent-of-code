# 🎄 Advent of Code 2022 - day 12 🎄

## Info

Task description: [link](https://adventofcode.com/2022/day/12)

## Notes

I went into this one recognizing I needed a path finding algorithm and being vaguely familiar with Dijkstra.

- The current implementation uses Dijkstra with a priority queue library,
  which I could've (should've?) implemented myself using arrays.
- I struggled a bit before I figured out we sometimes queue a node multiple times if multiple neighbours are passed
  before we get to visit the node itself
- I encountered a bug for which I still have no real explanation: sometimes, a node was visited and later discovered to
  have a shorter path. As far as I understand Dijkstra, this shouldn't occur because we always handle the first
  unvisited node closest to the origin. I assumed it was an edge case because we can't re-prioritize items already in
  the queue (with this implementation). It was solved by marking the node as unvisited, which seems to work (but I guess
  may end up looping infinitely for some edge cases)
- I initially brute forced part 2 (it didn't take THAT much time, about 15 seconds for all starting locations).
  Since that just worked, I committed it as is. Afterwards, I figured out you can search from the finish instead of the
  start, which is a lot faster (requiring only one pass through the area).

Only later did I realize Dijkstra adds no real value here!
We can do just as well using a BFS search:

- Visit a node
- Add all its (unvisited) **reachable** neighbours to the end of the queue (with current distance + 1)
- Take first node from queue and repeat until you reach the end

This works absolutely fine because every step weighs the same. You end up visiting the nodes
in order of distance from the origin, just like Dijkstra.
Dijkstra or A\* _would_ become more interesting if some transitions have a different cost,
for example if cost depends on elevation difference.

After realizing this, I recognized that I'm doing a lot of unnecessary work.
In the current implementation, I add all neighbours to the graph, even if they are unreachable from the current node.
I figured this was a good use of Dijkstra (adding unreachable nodes with Infinity cost),
but it would be much more efficient not to handle edges that can never be walked.
