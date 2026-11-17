(function () {
  'use strict';
  const { LEVELS, Garden, trace, solve } = OrchardEngine;
  const $ = id => document.getElementById(id);
  const main = $('main'), modal = $('modal');
  let scene = 'title', index = 0, garden = null, selected = 0, overlay = null;
  let sound = false, audio = null, restoreFocus = null;
  let motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let best = [], storage = true;
  try {
    const saved = JSON.parse(localStorage.getItem('signal-orchard-v1') || '{}');
    best = LEVELS.map((_, i) => Number.isInteger(saved.best?.[i]) && saved.best[i] >= 0 ? saved.best[i] : null);
    if (typeof saved.sound === 'boolean') sound = saved.sound;
    if (typeof saved.motion === 'boolean') motion = saved.motion;
  } catch { best = LEVELS.map(() => null); storage = false; }
  if (!best.length) best = LEVELS.map(() => null);
  const pars = LEVELS.map(l => solve(l).best);
  function save() {
    try { localStorage.setItem('signal-orchard-v1', JSON.stringify({ best, sound, motion })); }
    catch { storage = false; }
    $('save-status').textContent = storage ? 'Progress stays on this device' : 'Progress is kept for this visit';
  }
  function settings() {
    $('sound-button').textContent = sound ? 'Sound on' : 'Sound off';
    $('sound-button').setAttribute('aria-pressed', String(sound));
    $('motion-button').textContent = motion ? 'Motion on' : 'Motion off';
    $('motion-button').setAttribute('aria-pressed', String(!motion));
    document.body.classList.toggle('no-motion', !motion);
  }
  function tone(win = false) {
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
      (win ? [392, 493.88, 587.33, 783.99] : [392]).forEach((f, i) => {
        const osc = audio.createOscillator(), gain = audio.createGain(), t = audio.currentTime + i * .10;
        osc.type = 'sine'; osc.frequency.value = f;
        gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.045, t + .015);
        gain.gain.exponentialRampToValueAtTime(.001, t + .45);
        osc.connect(gain); gain.connect(audio.destination); osc.start(t); osc.stop(t + .5);
      });
    } catch { /* Audio is optional. */ }
  }
  const flower = (x, y, need, lit) => {
    const c = need === 2 ? '#a5e9ce' : '#f4c466';
    const petals = Array.from({ length: need === 2 ? 6 : 8 }, (_, i) => `<ellipse cx="0" cy="-11" rx="${need === 2 ? 4 : 5}" ry="8" transform="rotate(${i * (need === 2 ? 60 : 45)})" fill="${lit ? c : '#637c5b'}"/>`).join('');
    return `<g transform="translate(${x} ${y})"><g opacity="${lit ? 1 : .72}"><path d="M0 11v15m0-3q-15-12-16-1q10 7 16 1m0-8q11-11 15-5q-2 10-15 5" fill="#76996a" stroke="#789768" stroke-width="1.5"/>${lit ? `<circle r="24" fill="${c}" opacity=".10"/>` : ''}${petals}${need === 3 ? '<path d="M0-19L7-6 19 0 7 6 0 19-7 6-19 0-7-6Z" fill="#9edfc4" opacity=".8"/>' : ''}<circle r="7" fill="${lit ? '#5b5832' : '#314a38'}" stroke="${lit ? c : '#9aa47a'}" stroke-width="2"/><circle r="2" fill="${lit ? '#fff5ba' : '#9aa47a'}"/>${lit ? '<path d="M-3 0l2 2 4-4" fill="none" stroke="#fff6cd" stroke-width="1.3"/>' : ''}</g></g>`;
  };
  function draw(level, state, demo = false) {
    const result = trace(level, state), unit = 64, margin = 36;
    const vw = level.w * unit + margin * 2, vh = level.h * unit + margin * 2;
    const px = x => margin + (x + .5) * unit, py = y => margin + (y + .5) * unit;
    let cells = '', foliage = '', objects = '', rays = '';
    for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
      cells += `<rect x="${margin + x * unit + 3}" y="${margin + y * unit + 3}" width="58" height="58" rx="12" fill="${(x + y) % 2 ? '#234a3a' : '#264d3c'}" stroke="#719369" stroke-opacity=".07"/>`;
      if ((x * 7 + y * 11) % 5 === 0) foliage += `<path d="M${px(x)-23} ${py(y)+24}q-6-10-2-13q8 3 7 12m-2 0q7-13 11-10q2 8-7 13" fill="#66875b" opacity=".35"/>`;
    }
    (level.stones || []).forEach(([x, y]) => {
      objects += `<g transform="translate(${px(x)} ${py(y)})"><ellipse cy="10" rx="22" ry="13" fill="#102d25"/><path d="M-22 4L-16-12 2-20 20-9 23 6 9 16-12 14Z" fill="#758369"/><path d="M-16-12L2-20 20-9 1-5Z" fill="#91977a"/><path d="M1-5L9 16 23 6 20-9Z" fill="#5d715c"/><path d="M-17 7q11-7 16-2" stroke="#9bb38a" stroke-width="4" fill="none" opacity=".6"/></g>`;
    });
    (level.prisms || []).forEach(([x, y]) => {
      objects += `<g transform="translate(${px(x)} ${py(y)})"><path d="M0-23L23 0 0 23-23 0Z" fill="#bfd6ad" stroke="#e2e7be" stroke-width="2"/><path d="M0-23V23M-23 0H23" stroke="#648c73" stroke-width="1"/><path d="M0-23L0 0-23 0Z" fill="#f8e0a3"/><circle r="5" fill="#fffbd5"/></g>`;
    });
    result.segments.forEach(s => {
      const x1 = px(s.x), y1 = py(s.y), x2 = px(s.nx), y2 = py(s.ny), color = s.color === 1 ? '#f8c35b' : '#9de5d0';
      rays += `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="13" opacity=".08"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="5" opacity=".24"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="2" opacity=".95"/>`;
    });
    level.sources.forEach(([x, y, dir, color]) => {
      const sx = Math.max(14, Math.min(vw - 14, px(x))), sy = Math.max(14, Math.min(vh - 14, py(y)));
      const c = color === 1 ? '#f6c15a' : '#a4e8d0';
      objects += `<g transform="translate(${sx} ${sy})"><circle r="13" fill="${c}" opacity=".15"/><circle r="7" fill="${c}"/><path d="M-13 0h-5m31 0h5M0-13v-5m0 31v5" stroke="${c}" stroke-width="1.5"/></g>`;
    });
    level.targets.forEach(([x, y, need], i) => { objects += flower(px(x), py(y), need, result.flowers[i]); });
    const mirrors = level.mirrors.map(([x, y], i) => `<button class="mirror ${state[i] ? 'back' : ''} ${!demo && selected === i ? 'selected' : ''}" style="left:${px(x)/vw*100}%;top:${py(y)/vh*100}%;width:${45/vw*100}%;height:${45/vh*100}%" data-mirror="${i}" ${demo ? 'tabindex="-1" aria-hidden="true"' : `aria-label="Mirror ${i+1}, column ${x+1}, row ${y+1}, ${state[i] ? 'backslash' : 'slash'}. Turn mirror."`}><span class="number" aria-hidden="true">${i+1}</span></button>`).join('');
    return `<div class="board ${demo ? 'demo' : ''}" aria-label="${demo ? 'A blooming demonstration garden' : 'Light garden puzzle'}"><svg viewBox="0 0 ${vw} ${vh}" role="img" aria-label="${result.flowers.filter(Boolean).length} of ${level.targets.length} flowers blooming; ${level.sources.length} light sources"><defs><radialGradient id="gardenShade"><stop stop-color="#30553e"/><stop offset="1" stop-color="#173c30"/></radialGradient><clipPath id="gardenClip"><rect x="5" y="5" width="${vw-10}" height="${vh-10}" rx="14"/></clipPath></defs><rect width="${vw}" height="${vh}" fill="url(#gardenShade)"/><g clip-path="url(#gardenClip)">${cells}${foliage}<g fill="none" stroke-linecap="round" class="beam-pulse">${rays}</g>${objects}</g><g fill="#b9cc9a" opacity=".35" font-family="system-ui" font-size="8">${Array.from({length:level.w},(_,x)=>`<text x="${px(x)}" y="19" text-anchor="middle">${String.fromCharCode(65+x)}</text>`).join('')}${Array.from({length:level.h},(_,y)=>`<text x="18" y="${py(y)+3}" text-anchor="middle">${y+1}</text>`).join('')}</g></svg>${mirrors}</div>`;
  }
  function announce(text) { $('announcement').textContent = text; }
  function title() {
    closeModal(false); scene = 'title'; garden = null;
    main.style.setProperty('--board-ratio', '1');
    const done = best.filter(v => v !== null).length;
    main.innerHTML = `<section class="hero"><div><div class="eyebrow">A garden of light</div><h1>Small turns.<br><em>Beautiful</em><br>beginnings.</h1><p class="intro">A sleeping orchard. Two quiet skies.<br>Turn mirrors, guide the light, and bring<br>eight little gardens back to life.</p><button class="primary" id="begin">${done && done < 8 ? 'Continue growing' : 'Enter the orchard'} <span>↗</span></button><p class="little-note">No timer. No hurry. Just a little curiosity.</p><div class="hero-features"><span><b>08</b>hand-tended gardens</span><span><b>02</b>colors of light</span><span><b>∞</b>time to wonder</span></div></div><div class="garden-wrap"><div class="board-label"><span>THE ORCHARD / TWO SKIES</span><span class="live">LIGHT FINDS A WAY</span></div>${draw(LEVELS[3], LEVELS[3].answer, true)}<p class="board-note">Every flower is a small reason to keep going.</p></div></section>`;
    $('begin').onclick = () => start(done && done < 8 ? best.findIndex(v => v === null) : 0);
  }
  function start(n) {
    closeModal(false); index = n; scene = 'play'; garden = new Garden(LEVELS[n]); selected = 0;
    render(); announce(`Garden ${n+1}: ${garden.level.name}. ${garden.level.subtitle}`);
  }
  function render(focus = false) {
    if (!garden) return;
    const l = garden.level, r = garden.result, bloomed = r.flowers.filter(Boolean).length;
    main.style.setProperty('--board-ratio', String((l.w * 64 + 72) / (l.h * 64 + 72)));
    main.innerHTML = `<section class="play"><aside class="side"><div class="eyebrow">The light keeper's journal</div><div class="chapter">Garden ${String(index+1).padStart(2,'0')} / 08</div><h1>${l.name}</h1><p class="description">${l.subtitle}</p><div class="metrics"><div class="metric"><span>Turns</span><strong>${garden.moves}</strong></div><div class="metric"><span>Perfect path</span><strong>${pars[index]} <small>turn${pars[index]===1?'':'s'}</small></strong></div></div><div class="legend"><div><i class="gold">✺</i><span><b>Sunflower</b><br>Golden light</span></div><div><i class="mint">✧</i><span><b>Moonflower</b><br>Mint light</span></div><div><i class="twin">❋</i><span><b>Twin bloom</b><br>Both together</span></div></div><button class="pause" id="pause">Ⅱ &nbsp; Take a breath <small>Esc</small></button><nav class="progress" aria-label="Choose garden">${LEVELS.map((v,i)=>`<button data-level="${i}" class="${i===index?'current':''} ${best[i]!==null?'complete':''}" aria-label="Garden ${i+1}: ${v.name}${best[i]!==null?', completed':''}" ${i===index?'aria-current="step"':''}>${best[i]!==null&&i!==index?'✓':String(i+1).padStart(2,'0')}</button>`).join('')}</nav></aside><div class="garden-wrap"><div class="board-label"><span>FOLLOW THE LIGHT</span><span class="growth"><span class="growth-text">${bloomed} / ${l.targets.length} IN BLOOM</span>${r.flowers.map(v=>`<i class="${v?'bloomed':''}"></i>`).join('')}</span></div>${draw(l,garden.state)}<div class="controls"><div><button id="undo" ${!garden.moves?'disabled':''}>↶ &nbsp; Undo <small>U</small></button> <button id="restart">↻ &nbsp; Restart <small>R</small></button></div><div class="keyhelp">CLICK A MIRROR TO TURN IT<br>Arrows to select · Enter to turn</div></div></div></section>`;
    main.querySelectorAll('[data-mirror]').forEach(b => b.onclick = () => turn(Number(b.dataset.mirror)));
    main.querySelectorAll('[data-level]').forEach(b => b.onclick = () => start(Number(b.dataset.level)));
    $('undo').onclick = undo; $('restart').onclick = restart; $('pause').onclick = pause;
    if (focus) main.querySelector(`[data-mirror="${selected}"]`)?.focus({ preventScroll: true });
  }
  function turn(n) {
    if (scene !== 'play' || overlay || garden.result.won) return;
    selected = n; const oldBlooms = garden.result.flowers.filter(Boolean).length;
    garden.turn(n); const r = garden.result; render(true); tone();
    if (r.won) {
      best[index] = best[index] === null ? garden.moves : Math.min(best[index], garden.moves);
      save(); tone(true); announce(`Garden complete in ${garden.moves} turns.`); showWin();
    } else if (r.flowers.filter(Boolean).length !== oldBlooms) announce(`${r.flowers.filter(Boolean).length} of ${r.flowers.length} flowers blooming.`);
  }
  function undo() { if (!overlay && garden?.undo()) { render(true); announce(`Undo. ${garden.moves} turns.`); } }
  function restart() { if (!overlay && garden) { garden.reset(); selected = 0; render(true); announce('Garden restarted.'); } }
  function dialog(kind, html) {
    overlay = kind; restoreFocus = document.activeElement;
    modal.hidden = false; modal.innerHTML = `<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">${html}</section>`;
    modal.querySelector('button')?.focus();
  }
  function closeModal(focus = true) {
    overlay = null; modal.hidden = true; modal.innerHTML = '';
    if (focus && restoreFocus?.isConnected) restoreFocus.focus();
  }
  function pause() {
    if (!garden || overlay) return;
    dialog('pause', `<div class="trophy">☾</div><div class="eyebrow">A moment of quiet</div><h2 id="dialog-title">The garden<br>can wait.</h2><p>Your mirrors will stay just where you left them.<br>There is no clock here.</p><button class="primary" id="resume">Return to the light <span>↗</span></button><button class="secondary" id="pause-home">Back to the beginning</button>`);
    $('resume').onclick = () => closeModal(); $('pause-home').onclick = title;
  }
  function showWin() {
    const perfect = garden.moves <= pars[index], complete = best.every(v => v !== null);
    dialog('win', `<div class="trophy">${perfect ? '✺' : '❋'}</div><div class="eyebrow">${perfect?'A perfect path':'A little more life'}</div><h2 id="dialog-title">${index===7 && complete?'An orchard,<br>wide awake.':'Look what<br>you helped grow.'}</h2><p>${index===7 && complete?'Eight gardens. Countless small discoveries.<br>The light keeper’s work is done, for now.':`Every flower in ${garden.level.name.toLowerCase()}<br>has found its light.`}</p><div class="result-metrics"><div><strong>${garden.moves}</strong><span>TURNS TAKEN</span></div><div><strong>${pars[index]}</strong><span>PERFECT PATH</span></div><div><strong>${best.filter(v=>v!==null).length}/8</strong><span>GARDENS AWAKE</span></div></div><button class="primary" id="next">${index===7?'Explore the orchard':'Grow the next garden'} <span>↗</span></button><button class="secondary" id="win-replay">Tend this garden again</button><button class="secondary" id="view-garden">Admire this garden</button>`);
    $('next').onclick = () => index === 7 ? levels() : start(index+1);
    $('win-replay').onclick = () => start(index);
    $('view-garden').onclick = () => { closeModal(false); render(); const c = document.createElement('button'); c.className = 'primary'; c.textContent = index===7?'Choose a garden ↗':'Next garden ↗'; c.onclick = () => index===7?levels():start(index+1); main.querySelector('.controls').replaceChildren(c); };
  }
  function levels() {
    dialog('levels', `<div class="eyebrow">A place to begin again</div><h2 id="dialog-title">The orchard.</h2><p>${best.filter(v=>v!==null).length} of 8 gardens awake. Revisit any path.</p><div class="level-list">${LEVELS.map((l,i)=>`<button data-choose="${i}"><span>${String(i+1).padStart(2,'0')} &nbsp; ${l.name}</span><small>${best[i]===null?'Explore ↗':`${best[i]} turns ${best[i]<=pars[i]?'✺':'✓'}`}</small></button>`).join('')}</div><button class="secondary" id="levels-close">Return</button>`);
    modal.querySelectorAll('[data-choose]').forEach(b=>b.onclick=()=>start(Number(b.dataset.choose)));
    $('levels-close').onclick=()=>closeModal();
  }
  function help() {
    dialog('help', `<div class="eyebrow">Field notes</div><h2 id="dialog-title">Let there<br>be light.</h2><ol class="help-list"><li><b>Turn a mirror</b> with a click. Its silver face sends the beam around a corner.</li><li><b>Wake every flower.</b> Round sunflowers need gold; pointed moonflowers need mint. The twin flower needs both colors at the same time.</li><li><b>A diamond shares light</b> forward and to both sides. Stone beds stop it. Flowers let it pass.</li><li><b>Find your own pace.</b> There is no time limit. A perfect path uses the fewest mirror turns. Undo and restart whenever you like.</li></ol><div class="help-keys">ARROWS &nbsp; Choose a mirror · ENTER / SPACE &nbsp; Turn<br>U &nbsp; Undo · R &nbsp; Restart · ESC &nbsp; Pause / Return</div><button class="primary" id="help-close">I’m ready to grow <span>↗</span></button>`);
    $('help-close').onclick=()=>closeModal();
  }
  function selectDirection(key) {
    const [x,y] = garden.level.mirrors[selected], dir = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[key];
    let chosen = selected, distance = Infinity;
    garden.level.mirrors.forEach(([mx,my],i) => {
      const dx=mx-x,dy=my-y,forward=dx*dir[0]+dy*dir[1],side=Math.abs(dx*dir[1]-dy*dir[0]);
      if(forward>0 && forward+side*3<distance){chosen=i;distance=forward+side*3;}
    });
    selected = chosen; render(true);
  }
  document.addEventListener('keydown', e => {
    if (overlay) {
      if (e.key === 'Escape') { e.preventDefault(); if (overlay !== 'win') closeModal(); else $('view-garden').click(); }
      if (e.key === 'Tab') {
        const bs=[...modal.querySelectorAll('button:not(:disabled)')], first=bs[0],last=bs.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
      return;
    }
    if(scene!=='play'||!garden)return;
    const tag=document.activeElement?.tagName;
    if(e.key.startsWith('Arrow')){e.preventDefault();selectDirection(e.key);}
    else if((e.key==='Enter'||e.key===' ') && (document.activeElement?.hasAttribute('data-mirror') || tag==='BODY')){e.preventDefault();turn(selected);}
    else if(e.key.toLowerCase()==='u'){e.preventDefault();undo();}
    else if(e.key.toLowerCase()==='r'){e.preventDefault();restart();}
    else if(e.key==='Escape'){e.preventDefault();pause();}
  });
  $('home').onclick=title; $('levels-button').onclick=levels; $('help-button').onclick=help;
  $('sound-button').onclick=()=>{sound=!sound;settings();save();tone();};
  $('motion-button').onclick=()=>{motion=!motion;settings();save();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&scene==='play'&&!overlay&&!garden?.result.won)pause();});
  settings();save();title();
})();
