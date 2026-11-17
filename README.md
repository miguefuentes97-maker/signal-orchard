# signal-orchard

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/miguefuentes97-maker/signal-orchard/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/miguefuentes97-maker/signal-orchard/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**Signal Orchard** is an original, quiet puzzle game about bringing eight sleeping gardens back to life. Turn mirrors, guide golden and mint light, and use prisms to wake every flower with the fewest turns.

## Run it

Requires Node.js 22.18 or later and a desktop browser.

```sh
node serve.mjs
```

Open http://127.0.0.1:8087. The preview server serves only the game's static files and binds to loopback. The four files under `game/` contain everything needed to play: original vector art, system fonts, deterministic puzzle logic and synthesized sound, with no CDN or external runtime requests. `game/index.html` also uses classic scripts so it can be opened from its own files.

## Tend the garden

Click a silver mirror to turn it. Round sunflowers need golden light; pointed moonflowers need mint; twin blooms need both at once. A diamond prism shares a ray forward and to either side. Stone beds stop the light; flowers let it pass.

Use the arrow keys to select a mirror, Enter or Space to turn it, U to undo, R to restart, and Escape to pause. There is no timer. Every garden is available from the orchard menu, and the perfect-path counter shows the shortest solution.

Sound begins muted and starts only after interaction. Motion respects the device preference and has a separate switch. Best scores stay on this device, with an in-memory fallback when storage is unavailable.

## Verification and delivery

```sh
node tests/engine.test.mjs
node tests/source.test.mjs
```

All 1,662 configurations of the eight gardens are enumerated by the simulation tests. Every garden was also completed in a real browser using the visible controls. See [TESTING.md](TESTING.md) for the results and limits.

`main.ts` copies `game/` and the four unedited browser captures under `screenshots/` to `/output`, then writes the exact `makefun/dossier/v1` dossier using the unchanged official `vendor/makefun-game.ts`. Set `MAKEFUN_OUTPUT_DIR` to choose a different output directory. The entrypoint uses only Node's standard library; nothing needs to be installed. The source, art, level layouts and sound generation are original; the vendored kit library retains its MIT notice.

Prepared for the Make the best game bounty. Badges and the required footer identify the competition; an entry and any reward depend on acceptance and judging.

---

<sub>Entered on [make.fun](https://make.fun/?ref=zpy0g89e&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
