/* Signal Orchard — original deterministic beam simulation. No external code. */
(function (root) {
  'use strict';
  const STEP = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const REFLECT = [[3, 2, 1, 0], [1, 0, 3, 2]]; // / and backslash
  const key = (x, y) => `${x},${y}`;
  function trace(level, state) {
    const mirrors = new Map(level.mirrors.map((m, i) => [key(m[0], m[1]), i]));
    const stones = new Set((level.stones || []).map(p => key(...p)));
    const prisms = new Set((level.prisms || []).map(p => key(...p)));
    const light = new Map(), segments = [], visited = new Set();
    const queue = level.sources.map(s => [...s]);
    let repeats = 0;
    while (queue.length) {
      let [x, y, d, color] = queue.shift();
      while (true) {
        const nx = x + STEP[d][0], ny = y + STEP[d][1];
        segments.push({ x, y, nx, ny, color });
        x = nx; y = ny;
        if (x < 0 || y < 0 || x >= level.w || y >= level.h) break;
        const cell = key(x, y), visit = `${cell},${d},${color}`;
        if (visited.has(visit)) { repeats++; break; }
        visited.add(visit);
        if (stones.has(cell)) break;
        light.set(cell, (light.get(cell) || 0) | color);
        if (mirrors.has(cell)) d = REFLECT[state[mirrors.get(cell)]][d];
        else if (prisms.has(cell)) {
          queue.push([x, y, (d + 1) % 4, color], [x, y, (d + 3) % 4, color]);
        }
      }
    }
    const flowers = level.targets.map(([x, y, need]) => ((light.get(key(x, y)) || 0) & need) === need);
    return { segments, light, flowers, won: flowers.every(Boolean), repeats, visited: visited.size };
  }
  function solve(level, from = level.initial) {
    let best = Infinity, solution = null, count = 0;
    for (let bits = 0; bits < 2 ** level.mirrors.length; bits++) {
      const state = level.mirrors.map((_, i) => (bits >>> i) & 1);
      const distance = state.reduce((n, b, i) => n + (b !== from[i]), 0);
      if (!trace(level, state).won) continue;
      count++;
      if (distance < best) { best = distance; solution = state; }
    }
    return { best, solution, count };
  }
  function make(name, subtitle, w, h, mirrors, flips, sources, targets, prisms = [], stones = []) {
    const answer = mirrors.map(m => m[2]);
    return { name, subtitle, w, h, mirrors: mirrors.map(m => m.slice(0, 2)), answer,
      initial: answer.map((s, i) => flips.includes(i) ? 1 - s : s), sources, targets, prisms, stones };
  }
  const LEVELS = [
    make('First light', 'Turn the silver mirror. Let the sleeping flower find the sun.', 7, 7,
      [[3, 4, 0]], [0], [[-1, 4, 0, 1]], [[3, 1, 1]], [], [[1, 1], [5, 5]]),
    make('The long way home', 'Light passes through flowers. A single ray can wake a whole garden.', 7, 7,
      [[2, 5, 0], [2, 1, 0], [5, 1, 1]], [0, 2], [[-1, 5, 0, 1]], [[2, 3, 1], [4, 1, 1], [5, 5, 1]], [], [[4, 4], [0, 2]]),
    make('Secret paths', 'Follow the light around the stone beds. Every turn has a purpose.', 7, 7,
      [[1, 5, 0], [1, 1, 0], [5, 1, 1], [5, 4, 0]], [0, 1, 3], [[-1, 5, 0, 1]], [[1, 3, 1], [3, 1, 1], [3, 4, 1]], [], [[3, 3], [3, 5], [6, 2]]),
    make('Two skies', 'Sunflowers need gold. Moonflowers need mint. The twin bloom needs both.', 7, 7,
      [[2, 5, 0], [2, 2, 0], [5, 2, 1], [4, 1, 1], [4, 4, 0], [1, 4, 1]], [0, 2, 3, 4],
      [[-1, 5, 0, 1], [-1, 1, 0, 2]], [[5, 5, 1], [1, 2, 2], [2, 4, 3]], [], [[3, 0], [6, 6]]),
    make('A generous sun', 'The diamond prism shares a ray in three directions. Mirrors still turn one at a time.', 7, 7,
      [[3, 1, 0], [6, 1, 1], [6, 4, 0], [5, 3, 0], [3, 5, 0], [1, 5, 1]], [0, 1, 2, 3, 5],
      [[-1, 3, 0, 1]], [[4, 4, 1], [5, 0, 1], [1, 4, 1]], [[3, 3]], [[0, 0], [4, 6]]),
    make('The conversation', 'Two skies meet at a prism. Find the shared light, even when a path circles back.', 7, 7,
      [[1, 3, 0], [1, 1, 0], [3, 1, 1], [5, 5, 1], [5, 3, 1], [3, 5, 0], [1, 5, 1]], [1, 2, 3, 4, 5, 6],
      [[-1, 3, 0, 1], [7, 5, 2, 2]], [[2, 5, 3], [4, 3, 1], [3, 2, 2]], [[3, 3]], [[0, 6], [6, 0]]),
    make('The patient river', 'A quiet maze. Trace the beam before you turn; there is no clock to race.', 8, 7,
      [[1, 6, 0], [1, 1, 0], [6, 1, 1], [6, 5, 0], [3, 5, 1], [3, 3, 0], [5, 3, 0], [5, 0, 0]], [0, 1, 2, 4, 6, 7],
      [[-1, 6, 0, 1]], [[4, 1, 1], [4, 5, 1], [4, 3, 1], [7, 0, 1]], [], [[0, 0], [2, 4], [7, 4]]),
    make('Orchard of tomorrow', 'The last sleeping garden. Bring a little light all the way to the horizon.', 8, 8,
      [[1, 6, 0], [1, 1, 0], [6, 1, 1], [6, 6, 0], [3, 6, 1], [3, 3, 0], [5, 3, 0], [5, 2, 1], [2, 2, 1], [2, 0, 0]], [0, 1, 3, 4, 6, 8, 9],
      [[-1, 6, 0, 1]], [[4, 1, 1], [4, 6, 1], [4, 3, 1], [2, 1, 1], [7, 0, 1]], [], [[0, 3], [4, 4], [7, 7], [0, 7]])
  ];
  class Garden {
    constructor(level) { this.level = level; this.reset(); }
    reset() { this.state = [...this.level.initial]; this.history = []; this.moves = 0; }
    turn(i) {
      if (!Number.isInteger(i) || i < 0 || i >= this.state.length) return false;
      this.history.push([...this.state]); this.state[i] ^= 1; this.moves++; return true;
    }
    undo() { if (!this.history.length) return false; this.state = this.history.pop(); this.moves--; return true; }
    get result() { return trace(this.level, this.state); }
  }
  root.OrchardEngine = { trace, solve, LEVELS, Garden, REFLECT };
})(globalThis);
