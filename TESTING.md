# Verification

## Simulation

The engine tests exhaustively enumerate all 1,662 mirror configurations, run deterministic comparisons, and check authored solutions, reflection geometry, closed cycles, blockers, color requirements, undo and reset.

| Garden | Mirrors | Minimum turns |
| --- | ---: | ---: |
| First light | 1 | 1 |
| The long way home | 3 | 2 |
| Secret paths | 4 | 3 |
| Two skies | 6 | 4 |
| A generous sun | 6 | 4 |
| The conversation | 7 | 5 |
| The patient river | 8 | 6 |
| Orchard of tomorrow | 10 | 7 |

## Browser play

All eight gardens were completed with the visible controls in a desktop Chromium browser, each at its minimum turn count. Mouse input, Enter/Space, directional selection, U, R, Escape, pause/resume, replay, help, sound/motion switches and score persistence after reload were checked. The browser reported no console errors or warnings. A 390 × 844 viewport showed the stacked layout without horizontal overflow.

Four unedited captures in `screenshots/` show the title/demo garden, two-color gameplay, a solved prism garden and the final eight-garden victory. Their dimensions are 1264 × 938 or 1264 × 880; each is under 256 KiB.

The source check verifies local resource references, no external runtime requests and the official vendored library's SHA256. Direct `file:` navigation was blocked by the browser testing tool's protocol policy, so that particular navigation was not verified; the actual static game files were played from the loopback preview server.

## Deterministic delivery

The delivery entrypoint was run twice in an isolated Linux VM without network access. Recursive comparison of the two output trees passed. Dossier images were checked against the original screenshots and copied game files against the tested version. The official kit's local pre-submit checks also passed; server-only acceptance and judging remain separate.
