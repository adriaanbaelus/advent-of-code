import run from 'aocrunner';

type File = number;
type Dir = { [key: string]: File | Dir };
type Context = { fs: Dir; cwd: string[] };

const parseInput = (rawInput: string) => rawInput.split('\n').filter(Boolean);

function isDir(fileOrDir: File | Dir): fileOrDir is Dir {
  return typeof fileOrDir === 'object';
}

function getCurrentDir(ctx: Context) {
  let dir = ctx.fs;
  for (let item of ctx.cwd) {
    const d = dir[item];
    if (isDir(d)) {
      dir = d;
    }
  }
  return dir;
}

function parseCd(ctx: Context, input: string) {
  const matches = input.match(/\$\s*cd\s+(.+)/);
  if (matches) {
    const name = matches[1];
    if (name == '/') {
      ctx.cwd = [];
    } else if (name == '..') {
      ctx.cwd.pop();
    } else {
      const dir = getCurrentDir(ctx);
      if (!(name in dir)) {
        dir[name] = {};
      }
      ctx.cwd.push(name);
    }
  }
}

function parseLs(ctx: Context, input: string) {
  // No real need to do anything with it
}

function parseDirOutput(ctx: Context, input: string) {
  const matches = input.match(/\s*dir\s+(.+)/);
  if (matches) {
    const [, name] = matches;
    const dir = getCurrentDir(ctx);
    if (!(name in dir)) {
      dir[name] = {};
    }
  }
}

function parseFileOutput(ctx: Context, input: string) {
  const matches = input.match(/\s*(\d+)\s+(.+)/);
  if (matches) {
    const [, size, name] = matches;
    const dir = getCurrentDir(ctx);
    if (!(name in dir)) {
      dir[name] = Number(size);
    }
  }
}

function calculateSize(item: File | Dir): number {
  if (isDir(item)) {
    return Object.values(item).reduce((sum: number, item) => sum + calculateSize(item), 0);
  }
  return item;
}

function walkDirs(root: Dir, cb: (d: Dir, n: string) => void) {
  for (let [name, item] of Object.entries(root)) {
    if (isDir(item)) {
      walkDirs(item, cb);
      cb(item, name);
    }
  }
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const ctx = { fs: {}, cwd: [] };

  for (let line of input) {
    parseCd(ctx, line);
    parseLs(ctx, line);
    parseDirOutput(ctx, line);
    parseFileOutput(ctx, line);
  }

  let sum = 0;
  walkDirs(ctx.fs, (dir) => {
    const size = calculateSize(dir);
    if (size <= 100000) {
      sum += size;
    }
  });

  return sum;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const ctx = { fs: {}, cwd: [] };

  for (let line of input) {
    parseCd(ctx, line);
    parseLs(ctx, line);
    parseDirOutput(ctx, line);
    parseFileOutput(ctx, line);
  }

  const available = 70000000 - calculateSize(ctx.fs);
  const needed = 30000000 - available;
  let closest = Infinity;
  walkDirs(ctx.fs, (dir) => {
    const size = calculateSize(dir);
    if (size > needed && size < closest) {
      closest = size;
    }
  });

  return closest;
};

run({
  trimTestInputs: true,
  onlyTests: false,
  part1: {
    tests: [
      {
        input: `
          $ cd /
          $ ls
          dir a
          14848514 b.txt
          8504156 c.dat
          dir d
          $ cd a
          $ ls
          dir e
          29116 f
          2557 g
          62596 h.lst
          $ cd e
          $ ls
          584 i
          $ cd ..
          $ cd ..
          $ cd d
          $ ls
          4060174 j
          8033020 d.log
          5626152 d.ext
          7214296 k
        `,
        expected: 95437,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          $ cd /
          $ ls
          dir a
          14848514 b.txt
          8504156 c.dat
          dir d
          $ cd a
          $ ls
          dir e
          29116 f
          2557 g
          62596 h.lst
          $ cd e
          $ ls
          584 i
          $ cd ..
          $ cd ..
          $ cd d
          $ ls
          4060174 j
          8033020 d.log
          5626152 d.ext
          7214296 k
        `,
        expected: 24933642,
      },
    ],
    solution: part2,
  },
});
