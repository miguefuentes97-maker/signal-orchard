import assert from 'node:assert/strict';
import '../game/engine.js';
const { trace, solve, LEVELS, Garden, REFLECT } = globalThis.OrchardEngine;
const report = [];
for (const [i, level] of LEVELS.entries()) {
  assert.equal(trace(level, level.answer).won, true, `authored solution ${i + 1}`);
  assert.equal(trace(level, level.initial).won, false, `unsolved start ${i + 1}`);
  const solved = solve(level);
  assert.ok(Number.isFinite(solved.best) && solved.best > 0);
  const game = new Garden(level), before = JSON.stringify(game.result.segments);
  for (let j = 0; j < game.state.length; j++) if (game.state[j] !== solved.solution[j]) game.turn(j);
  assert.equal(game.moves, solved.best);
  assert.equal(game.result.won, true);
  while (game.undo()) { /* restore exact state */ }
  assert.deepEqual(game.state, level.initial);
  assert.equal(game.moves, 0);
  assert.equal(JSON.stringify(game.result.segments), before);
  game.turn(0); game.reset(); assert.equal(game.history.length, 0);
  assert.equal(game.turn(-1), false);
  assert.equal(game.turn(game.state.length), false);
  // Enumerate every configuration: determinism and a finite state-space bound.
  for (let bits = 0; bits < 2 ** level.mirrors.length; bits++) {
    const state = level.mirrors.map((_, j) => (bits >>> j) & 1);
    const a = trace(level, state), b = trace(level, state);
    assert.deepEqual(a.segments, b.segments);
    assert.ok(a.visited <= level.w * level.h * 4 * level.sources.length);
  }
  report.push({ level: i + 1, name: level.name, mirrors: level.mirrors.length, minimumMoves: solved.best, solutions: solved.count });
}
// Independent geometric expectations for both mirror orientations.
assert.deepEqual(REFLECT[0], [3, 2, 1, 0]);
assert.deepEqual(REFLECT[1], [1, 0, 3, 2]);
for (let orientation = 0; orientation < 2; orientation++) for (let d = 0; d < 4; d++) {
  const step = [[1, 0], [0, 1], [-1, 0], [0, -1]][d];
  const source = [1 - step[0], 1 - step[1], d, 1];
  const small = { w: 3, h: 3, sources: [source], mirrors: [[1, 1]], targets: [[1, 1, 1]], stones: [], prisms: [] };
  const beam = trace(small, [orientation]).segments;
  const reflection = beam.find(s => s.x === 1 && s.y === 1);
  const expect = orientation === 0 ? [-step[1], -step[0]] : [step[1], step[0]];
  assert.deepEqual([reflection.nx - 1, reflection.ny - 1], expect.map(n => n || 0));
}
const loop = { w: 5, h: 5, sources: [[2, 1, 0, 1]], mirrors: [[3, 1], [3, 3], [1, 3], [1, 1]], targets: [[0, 4, 1]], prisms: [], stones: [] };
assert.ok(trace(loop, [1, 0, 1, 0]).repeats > 0, 'closed mirror loop terminates');
const blocked = { w: 3, h: 1, sources: [[-1, 0, 0, 1]], mirrors: [], targets: [[2, 0, 1]], stones: [[1, 0]], prisms: [] };
assert.equal(trace(blocked, []).won, false);
assert.equal(trace({ ...blocked, stones: [], targets: [[2, 0, 3]] }, []).won, false, 'twin bloom needs both colors');
assert.equal(trace({ ...blocked, stones: [], sources: [[-1, 0, 0, 1], [3, 0, 2, 2]], targets: [[1, 0, 3]] }, []).won, true);
console.log(JSON.stringify({ passed: true, levels: report }, null, 2));
