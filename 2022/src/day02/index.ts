import run from 'aocrunner';

const parseInput = (rawInput: string) => rawInput.split('\n').filter(Boolean);

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const pickScores: Record<string, number> = { X: 1, Y: 2, Z: 3 };
  const vsScores: Record<string, Record<string, number>> = {
    X: { A: 3, B: 0, C: 6 },
    Y: { A: 6, B: 3, C: 0 },
    Z: { A: 0, B: 6, C: 3 },
  };

  const scores = input.map((round) => {
    const picks = round.split(' ');
    return pickScores[picks[1]] + vsScores[picks[1]][picks[0]];
  }, []);
  return scores.reduce((sum, score) => sum + score);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const resultScores: Record<string, number> = { X: 0, Y: 3, Z: 6 };
  const [R, P, S] = [1, 2, 3];
  const pickScores: Record<string, Record<string, number>> = {
    A: { X: S, Y: R, Z: P },
    B: { X: R, Y: P, Z: S },
    C: { X: P, Y: S, Z: R },
  };

  const scores = input.map((round) => {
    const guide = round.split(' ');
    return resultScores[guide[1]] + pickScores[guide[0]][guide[1]];
  }, []);

  return scores.reduce((sum, score) => sum + score);
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          A Y
          B X
          C Z
        `,
        expected: 15,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          A Y
          B X
          C Z
        `,
        expected: 12,
      },
    ],
    solution: part2,
  },
});
