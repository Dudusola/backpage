// Back Page: screens. All rules live in game.js.
(function () {
  const KEY = 'backpage.v1';
  const $ = (q) => document.querySelector(q);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const view = $('#view');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let s = null, tab = 'career', lastStep = '', installEvt = null, rolling = false;
  let draft = G.randomLife(), custom = false;
  // Save slots live in this browser only, so each phone has its own careers. Slot 0 keeps the old key.
  const SLOTS = 5, keyOf = (i) => (i ? `${KEY}.${i}` : KEY);
  const read = (i) => {
    let x = null;
    try { x = JSON.parse(localStorage.getItem(keyOf(i))); } catch (e) { return null; }
    if (x && x.v === 2) G.migrate(x);
    return x && x.v === 3 ? x : null; // older saves predate ceilings and height
  };
  let slot = 0;
  try { slot = +localStorage.getItem(KEY + '.slot') || 0; } catch (e) { /* no storage */ }
  s = read(slot);
  const save = () => { try { if (s) { localStorage.setItem(keyOf(slot), JSON.stringify(s)); localStorage.setItem(KEY + '.slot', slot); } } catch (e) { /* private mode: play on without saving */ } };
  const drop = (i) => { try { localStorage.removeItem(keyOf(i)); } catch (e) { /* no storage */ } };

  // ---------- small pieces ----------
  const sign = (v) => (v > 0 ? '+' : '−') + Math.abs(v);
  const last = (n) => n.split(' ').pop();
  const deltas = (d) => d && d.length ? `<ul class="deltas">${d.map(([l, v]) => `<li class="${v < 0 ? 'dn' : ''}">${esc(l)} ${l === 'Money' ? (v > 0 ? '+' : '−') + G.money(Math.abs(v)) : sign(v)}</li>`).join('')}</ul>` : '';
  const bar = (label, v, right) => `<li><span>${esc(label)}</span><i><b style="width:${v}%"></b></i><span class="num">${right || Math.round(v)}</span></li>`;
  const btn = (a, label, attrs = '') => `<button class="btn" data-a="${a}" ${attrs}>${esc(label)}</button>`;
  const choice = (a, i, label, attrs = '') => `<button class="choice" data-a="${a}" data-i="${i}" ${attrs}>${esc(label)}</button>`;
  const chip = (k, v, label, on, attrs = '') => `<button type="button" class="chip" data-a="look" data-k="${k}" data-v="${v}" aria-pressed="${on}" ${attrs}>${label}</button>`;
  const kitOf = (team) => ([...team].reduce((a, c) => a + c.charCodeAt(0), 0) % 6) + 1;
  const NOTE = 'Player names are used for reference only. The ratings are our own opinion. This game is not affiliated with or endorsed by any league, club or player.';

  const HAIR = {
    bald: ['', ''],
    buzz: ['', '<path d="M31 44Q30 21 50 21Q70 21 69 44Q66 31 50 30Q34 31 31 44Z"/>'],
    fade: ['', '<path d="M32 41V25Q50 15 68 25V41Q66 31 50 30Q34 31 32 41Z"/>'],
    afro: ['<circle cx="50" cy="35" r="27"/>', ''],
    locs: ['<path d="M27 40Q27 17 50 17Q73 17 73 40V76H66V44H34V76H27Z"/>', '<path d="M31 44Q30 21 50 21Q70 21 69 44Q66 31 50 30Q34 31 31 44Z"/>'],
    long: ['<rect x="26" y="18" width="48" height="64" rx="22"/>', '<path d="M31 44Q30 21 50 21Q70 21 69 44Q66 31 50 30Q34 31 31 44Z"/>'],
  };
  function portrait(l, kit, age) {
    const sk = `var(--skin-${l.skin})`, hc = age >= 34 ? 'var(--hair-grey)' : 'var(--hair)', h = HAIR[l.hair] || HAIR.bald;
    return `<svg class="face" viewBox="0 0 100 110" aria-hidden="true">
      <g style="fill:${hc}">${h[0]}</g>
      <path class="ol" d="M12 110Q14 80 42 75H58Q86 80 88 110Z" style="fill:var(--kit-${kit})"/>
      <rect class="ol" x="43" y="62" width="14" height="16" style="fill:${sk}"/>
      <ellipse class="ol" cx="50" cy="46" rx="19" ry="23" style="fill:${sk}"/>
      <g style="fill:${hc}">${h[1]}${l.beard ? `<path d="M32 52Q34 73 50 73Q66 73 68 52Q62 61 50 61Q38 61 32 52Z"${l.beard === 1 ? ' opacity=".35"' : ''}/>` : ''}</g>
      ${l.band ? '<rect x="31" y="32" width="38" height="6" style="fill:var(--color-accent)"/>' : ''}
      <circle class="ink" cx="42" cy="46" r="1.8"/><circle class="ink" cx="58" cy="46" r="1.8"/><path class="ln" d="M44 57Q50 60 56 57"/>
    </svg>`;
  }
  const me = () => portrait(s.look, kitOf(s.team || 'x'), s.age);

  function court(sport, k, x) {
    const px = 30 + (x / 100) * 140, off = k !== 'def';
    const you = [px, off ? 86 : 58], opp = [px + (off ? 4 : -3), off ? 72 : 76];
    const lines = sport === 'bb'
      ? '<rect class="ln" x="75" y="8" width="50" height="46"/><path class="ln" d="M82 54a18 18 0 0 0 36 0"/><path class="ln" d="M28 8v26a72 72 0 0 0 144 0V8"/><path class="ln" d="M91 13h18"/><circle class="ln" cx="100" cy="18" r="4"/>'
      : '<rect class="ln" x="44" y="8" width="112" height="50"/><rect class="ln" x="76" y="8" width="48" height="18"/><path class="ln" d="M82 58a20 20 0 0 0 36 0"/><rect class="ln" x="88" y="3" width="24" height="5"/><circle class="ball" cx="100" cy="44" r="1.2"/>';
    const ball = off ? you : opp;
    return `<svg class="court" viewBox="0 0 200 112" aria-hidden="true"><rect class="bg" x="8" y="8" width="184" height="100"/><rect class="ln" x="8" y="8" width="184" height="100"/>${lines}<circle class="opp" cx="${opp[0]}" cy="${opp[1]}" r="5"/><circle class="me" cx="${you[0]}" cy="${you[1]}" r="5.5"/><circle class="ball" cx="${ball[0] + 7}" cy="${ball[1] + 3}" r="2.2"/></svg>`;
  }

  // ---------- screens ----------
  function setup() {
    const sp = G.SPORTS[draft.sport], l = draft.look;
    if (!sp.pos.some((p) => p.id === draft.pos)) draft.pos = sp.pos[0].id;
    const saved = [...Array(SLOTS).keys()].map((i) => [i, read(i)]).filter(([, x]) => x);
    const top = `${saved.length ? `<p class="meta">Saved careers on this device</p><ul class="choices">${saved.map(([i, x]) => `<li><button type="button" class="choice" data-a="load" data-i="${i}">${esc(x.name)} · ${esc(G.posOf(x).n)}${x.team ? ' · ' + esc(x.team) : ''}</button><p class="hint">${x.cur.t === 'end' ? 'Retired' : x.cur.t === 'draw' ? 'In the draw' : `Age ${x.age}`} · <button type="button" class="link" data-a="del" data-i="${i}">Delete</button></p></li>`).join('')}</ul>` : ''}
      <h2 class="headline">${custom ? 'Build a life' : 'A new life'}</h2>
      <p class="stand">Play the big moments yourself. Live with everything else: the coach, the money, the people at home.</p>`;
    if (!custom) {
      const C = G.home(draft), o = G.ORIGINS.find((x) => x.id === draft.origin), p = sp.pos.find((x) => x.id === draft.pos);
      return `<section class="step">${top}
        <figure class="photo">${portrait(l, 1, 18)}<figcaption>${esc(C.adj)} ${esc(p.n.toLowerCase())}, 18</figcaption></figure>
        <h2 class="sub">${esc(draft.name)}</h2>
        <p class="text">Born in ${esc(C.city)}, ${esc(C.n)}. ${esc(sp.name)}, ${esc(p.n.toLowerCase())}. ${esc(o.n)}.</p>
        <p class="hint">${esc(o.d)}</p>
        ${btn('begin', 'Live this life')}
        <div class="seg" style="margin-top:var(--space-md)">${choice('roll', 0, 'Roll again')}${choice('custom', 0, 'Build your own')}</div>
        <p class="hint" style="margin-top:var(--space-md)">${NOTE}</p>
      </section>`;
    }
    return `<section class="step">${top}
      <label class="field">Player name<input id="name" maxlength="18" autocomplete="off" placeholder="Your name" value="${esc(draft.name)}"></label>
      <fieldset><legend class="field">Sport</legend><div class="seg">
        ${Object.entries(G.SPORTS).map(([k, v]) => `<button type="button" class="choice" data-a="sport" data-k="${k}" aria-pressed="${draft.sport === k}">${v.name}</button>`).join('')}
      </div></fieldset>
      <fieldset><legend class="field">Position</legend><div class="seg">
        ${sp.pos.map((p) => `<button type="button" class="choice" data-a="pos" data-k="${p.id}" aria-pressed="${draft.pos === p.id}">${p.n}</button>`).join('')}
      </div><p class="hint">${esc(sp.pos.find((p) => p.id === draft.pos).d)} It decides your moves in matches and who you get your height from.</p></fieldset>
      <label class="field">Country<select id="country">${G.COUNTRIES.map((c) => `<option value="${c.id}" ${draft.country === c.id ? 'selected' : ''}>${esc(c.n)}</option>`).join('')}</select></label>
      <fieldset><legend class="field">Where you come from</legend><ul class="choices">
        ${G.ORIGINS.map((o) => `<li><button type="button" class="choice" data-a="origin" data-k="${o.id}" aria-pressed="${draft.origin === o.id}">${o.n}</button><p class="hint">${o.d}</p></li>`).join('')}
      </ul></fieldset>
      ${draft.origin === 'own' ? `<label class="field">Your story, in one line<input id="story" maxlength="90" autocomplete="off" placeholder="Learned on a hoop with no net. Now I play under the lights." value="${esc(draft.story)}"></label>` : ''}
      <fieldset><legend class="field">How you look</legend><div class="looks">
        <div class="pic">${portrait(l, 1, 18)}</div>
        <div class="lookopts">
          <div class="chips">${[1, 2, 3, 4, 5, 6].map((n) => chip('skin', n, '', l.skin === n, `style="background:var(--skin-${n})" aria-label="Skin tone ${n}"`)).join('')}</div>
          <div class="chips">${Object.keys(HAIR).map((h) => chip('hair', h, h, l.hair === h)).join('')}</div>
          <div class="chips">${['Clean', 'Stubble', 'Beard'].map((b, i) => chip('beard', i, b, l.beard === i)).join('')}${chip('band', l.band ? 0 : 1, 'Headband', !!l.band)}</div>
        </div>
      </div></fieldset>
      ${btn('begin', 'Begin')}
      <p style="margin-top:var(--space-md)"><button type="button" class="link" data-a="roll">Roll a random life instead</button></p>
      <p class="hint" style="margin-top:var(--space-md)">${NOTE}</p>
    </section>`;
  }

  function draw() {
    const c = s.cur, st = G.SPORTS[s.sport].stats, n = 6 - c.left.length, frame = !c.left.length, show = c.card && !rolling;
    const reel = c.card ? `<div class="reelwin ${rolling ? 'roll' : ''}"><div class="reelstrip" style="--n:${c.reel.length - 1}">${c.reel.map((x) => `<span>${esc(last(x))}</span>`).join('')}</div></div>` : `<div class="reelwin idle"><div class="reelstrip"><span>?</span></div></div>`;
    const respin = show ? (c.respin ? `<button class="link" data-a="spin">Spin again (${c.respin} left)</button>` : `<p class="hint">No re-spins left. Take something from this one.</p>`) : '';
    const card = !show ? '' : frame
      ? `<div class="pcard"><div><p class="meta">${c.card.pos} · your frame</p><h3 class="title">${esc(c.card.n)}</h3></div><span class="big num">${G.fmtH(s.sport, c.card.h)}</span></div>${btn('place', 'Take this frame', 'data-k="frame" style="margin-top:var(--space-md)"')}`
      : `<div class="pcard"><div><p class="meta">${c.card.pos} · ${G.fmtH(s.sport, c.card.h)}</p><h3 class="title">${esc(c.card.n)}</h3></div></div>`;
    return `<section class="step still">
      <p class="meta">The draw · ${frame ? 'Last spin' : `Pick ${n + 1} of 6`}</p>
      <h2 class="title">${frame ? 'Now, a body' : 'Built from the greats'}</h2>
      <p class="text">${frame ? `One more spin, from players who played ${esc(G.posOf(s).n.toLowerCase())}. You get his height, and it changes how you play.` : `Each spin lands on a real player, great or not: all ${G.POOL[s.sport].length} are equally likely. Take one of his ratings and it becomes your ceiling there. You start well below it and grow into it.`}</p>
      ${reel}${card}
      ${!c.card ? btn('spin', frame ? 'Spin for your frame' : 'Spin', 'style="margin-top:var(--space-md)"') : ''}
      ${frame ? '' : `<ul class="slots">${G.KEYS.map((k) => `<li><button data-a="place" data-k="${k}" ${!show || s.cap[k] ? 'disabled' : ''}><span>${st[k]}${s.cap[k] ? `<small>${esc(last(s.src[k]))}</small>` : ''}</span>${s.cap[k] ? `<span class="v">${s.st[k]} → ${s.cap[k]}</span>` : show ? `<span class="open">Take ${c.card.r[k]}</span>` : `<span class="v">—</span>`}</button></li>`).join('')}</ul>`}
      ${respin}
      <p style="margin-top:var(--space-lg)">${n || c.card ? `<button class="link" data-a="redraw">Start the draw over</button> · ` : ''}<button class="link" data-a="setup">Change sport, position or looks</button></p>
    </section>`;
  }

  const backstory = () => s.story || (G.ORIG[s.origin] || G.ORIG.steady).d;
  const ratings = (sp) => G.KEYS.map((k) => bar(`${sp.stats[k]} · ${last(s.src[k] || '')}`, s.st[k], `${s.st[k]}/${s.cap[k]}`)).join('');

  function out(c, next = 'Continue') { return `<p class="text">${esc(c.out.text)}</p>${deltas(c.out.d)}${btn('cont', next)}`; }

  function stepCard() {
    const c = s.cur, sp = G.SPORTS[s.sport];
    if (c.t === 'signed') return `<p class="meta">${sp.entry}</p><figure class="photo">${me()}<figcaption>${G.fmtH(s.sport, s.h)}, like ${esc(last(s.src.h))}</figcaption></figure><h2 class="headline">${esc(s.team)}</h2><p class="stand">${esc(c.text)}</p><p class="text">${esc(backstory())}</p>
      <ul class="bars wide" style="margin-top:var(--space-lg)">${ratings(sp)}</ul>${btn('cont', 'Start season one')}
      <p style="margin-top:var(--space-md)"><button class="link" data-a="redraw">Not happy with the build? Draw again</button></p>`;
    if (c.t === 'arc') return `<p class="meta">Off-season · Age ${s.age}</p><h2 class="title">How do you spend the summer?</h2>` + (c.out ? out(c)
      : `<ul class="choices">${c.opts.map((id, i) => `<li>${choice('arc', i, G.tx(s, G.ARC[id].n))}<p class="hint">${esc(G.ARC[id].d)}</p></li>`).join('')}</ul>`);
    if (c.t === 'event') {
      const e = G.EV[c.id];
      return `<h2 class="title">${esc(G.tx(s, e.title))}</h2>` + (c.out ? out(c)
        : `<p class="text">${esc(G.tx(s, e.text))}</p><div class="choices">${e.c.map((x, i) => choice('ev', i, G.tx(s, x[0]))).join('')}</div>`);
    }
    if (c.t === 'match') return match(c.m, sp);
    if (c.t === 'report') {
      const r = c.r;
      return `<article><p class="meta">Late edition · Age ${r.age} · ${esc(r.team)}</p><figure class="photo">${portrait(s.look, kitOf(r.team), r.age)}<figcaption>${esc(last(s.name))}, ${r.age}</figcaption></figure><h2 class="headline">${esc(r.head)}</h2><p class="stand">${esc(r.stand)}</p>
        <table class="box"><tr><th>Season</th><td>${esc(r.line)}</td></tr><tr><th>Overall</th><td>${r.o}</td></tr><tr><th>Honours</th><td>${r.awards.length ? esc(r.awards.join(', ')) : 'None'}</td></tr></table>
        <ul class="notes" style="margin-top:var(--space-sm)">${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
        ${btn('cont', r.last ? 'Read your legacy' : 'Next season')}</article>`;
    }
    if (c.t === 'end') {
      const l = c.l;
      return `<article><p class="meta">Final edition · ${l.n} seasons</p><figure class="photo">${me()}<figcaption>${esc(s.name)}</figcaption></figure><h2 class="headline">${esc(l.rank)}</h2>
        <p class="stand">${esc(s.name)} retires at ${s.age} with ${s.titles} ${s.titles === 1 ? 'title' : 'titles'} and a net worth of ${G.money(l.worth)}.</p>
        <p class="text">Where it started: ${esc(backstory())}</p>${s.after ? `<p class="text">After: ${esc(s.after)}</p>` : ''}<p class="ribbon">${esc(l.ribbon)}</p>
        <table class="box"><tr><th>Legacy score</th><td>${l.score}</td></tr><tr><th>Titles</th><td>${s.titles}</td></tr><tr><th>${sp.mvp}</th><td>${s.mvps}</td></tr><tr><th>${sp.star}</th><td>${s.stars}</td></tr><tr><th>Peak overall</th><td>${s.peak}</td></tr><tr><th>Clubs</th><td>${s.teams}</td></tr></table>
        ${btn('fresh', 'Start a new career')}</article>`;
    }
    return '';
  }

  function match(m, sp) {
    const head = `<p class="meta">${esc(m.kind)}${m.done ? ' · Full time' : ` · Moment ${m.i + 1} of ${m.moments.length}`}</p>
      <div class="score"><span>${esc(G.short(s.team))}</span><b>${G.scoreAt(m)[0]}</b><b>${G.scoreAt(m)[1]}</b><span>${esc(G.short(m.opp))}</span></div>`;
    if (m.done) return head + `<span class="grade" aria-label="Grade ${m.done.grade}">${m.done.grade}</span>
      <p class="res">${m.done.win ? 'A win.' : m.done.draw ? 'A draw.' : 'A defeat.'} You came through in ${m.hits} of ${m.moments.length} moments${m.mine ? ` and scored ${m.mine}` : ''}.</p>${deltas(m.done.d)}${btn('cont', 'Continue')}`;
    const mo = m.moments[m.i], opts = G.optsFor(s, mo), him = last(mo.vs[0]);
    const who = `<p class="meta">${esc(mo.clock)}${mo.clutch ? ' · Clutch' : ''} · ${mo.k === 'def' ? 'Coming at you' : 'Marking you'}: ${esc(mo.vs[0])}</p>`;
    let body;
    if (m.res) body = `<p class="res">${esc(m.res.text)}</p><p class="hint">${m.res.q === 'g' ? 'In the green.' : m.res.q === 'y' ? (m.res.hit ? 'Close enough, this time.' : 'Close, but not enough.') : m.res.late ? 'Too late.' : 'Well off.'}</p>${btn('next', m.i + 1 < m.moments.length ? 'Next moment' : 'Full time')}`;
    else if (m.opt !== null) {
      const z = m.z, c = G.zoneAt(z, 0);
      const how = { sweep: 'Stop the marker in the green.', drift: 'The gap is moving. Catch it.', double: `Two touches: stop it in the green twice. Touch ${z.marks.length + 1} of 2.`, react: 'One pass only. Stop it before it runs out.' }[z.mech];
      body = `<p class="text"><b>${esc(opts[m.opt].l)}.</b> ${how}</p>
        <div class="meter" id="meter"><i class="fair" id="fair" style="left:${c - z.g / 2 - z.y}%;width:${z.g + 2 * z.y}%"></i><i class="good" id="good" style="left:${c - z.g / 2}%;width:${z.g}%"></i><b class="mark" id="mark"></b></div>
        ${btn('stop', 'Stop', 'id="stop"')}`;
    } else body = `<p class="text">${esc(mo.text)}</p><div class="choices">${opts.map((o, i) => choice('opt', i, o.l)).join('')}</div>
      <ul class="notes">${opts.map((o) => `<li>${esc(o.l)}: your ${sp.stats[o.k].toLowerCase()} ${s.st[o.k]} v his ${sp.stats[o.vs].toLowerCase()} ${G.rate(mo.vs, o.vs)}</li>`).join('')}</ul><p class="hint">The bigger your edge over ${esc(him)}, the wider the green.</p>`;
    return head + who + court(s.sport, mo.k, mo.x) + body;
  }

  function career() {
    const ages = [...new Set(s.log.map((l) => l.a))].slice(-3).reverse();
    const key = s.cur.t + s.si + s.age + (s.cur.out ? 'o' : '') + (s.cur.m ? s.cur.m.i + '' + (s.cur.m.opt !== null) + !!s.cur.m.res + !!s.cur.m.done : '');
    const still = key === lastStep; lastStep = key;
    return `<section class="step ${still ? 'still' : ''}">${stepCard()}</section>` + (s.cur.t === 'match' || !ages.length ? '' :
      `<h2 class="sub">The story so far</h2><div class="log">${ages.map((a) => `<h3>Age ${a}</h3><ul>${s.log.filter((l) => l.a === a).reverse().map((l) => `<li>${esc(l.t)}</li>`).join('')}</ul>`).join('')}</div>`);
  }

  function life() {
    const sp = G.SPORTS[s.sport];
    return `<section class="step still"><figure class="photo">${me()}<figcaption>${G.home(s).adj} ${G.posOf(s).n.toLowerCase()} ·${G.fmtH(s.sport, s.h)}, ${G.build(s) === 'mid' ? 'average build' : G.build(s) + ' for the game'}</figcaption></figure>
      <h2 class="title">Overall ${G.ovr(s)}</h2><p class="hint">Now, and your ceiling. You grow towards it until 26.</p>
      <ul class="bars wide" style="margin-top:var(--space-sm);clear:both">${ratings(sp)}</ul>
      <h2 class="sub">People</h2><ul class="bars">
        ${bar('Coach ' + last(s.names.coach), s.coach)}${bar('Teammates', s.mates)}${s.partner ? bar(s.partner.name, s.partner.bond) : ''}${bar('Rivalry with ' + last(s.names.rival), s.heat)}
      </ul>
      <h2 class="sub">You</h2><ul class="bars">${bar('Fitness', s.health)}${bar('Morale', s.morale)}${bar('Fame', s.fame)}</ul>
      <h2 class="sub">Free days: ${s.days} left this season</h2>
      ${s.note ? `<p class="text">${esc(s.note)}</p>` : ''}
      <div class="choices">${Object.entries(G.ACTS).filter(([, a]) => a.need(s)).map(([id, a]) => `<button class="choice" data-a="act" data-k="${id}" ${s.days < 1 ? 'disabled' : ''}>${a.n}</button>`).join('')}</div>
    </section>`;
  }

  function moneyTab() {
    const q = Math.floor(s.money / 4);
    return `<section class="step still"><p class="meta">Net worth</p><h2 class="headline num">${G.money(G.worth(s))}</h2>
      <table class="box"><tr><th>Cash</th><td>${G.money(s.money)}</td></tr><tr><th>Salary</th><td>${G.money(s.salary)} a year, ${Math.max(0, s.contract)} ${s.contract === 1 ? 'year' : 'years'} left</td></tr></table>
      <h2 class="sub">Holdings</h2>
      ${s.inv.length ? `<ul class="rows">${s.inv.map((x, i) => `<li><div><b>${esc(x.n)}</b><span class="num">${G.money(x.amt)}</span></div>${x.kind === 'resto' ? '<span class="hint">Family. It stays.</span>' : `<button class="choice small" data-a="cash" data-i="${i}">Cash out</button>`}</li>`).join('')}</ul>` : `<p class="hint">Nothing yet. Money left as cash earns nothing.</p>`}
      ${s.note ? `<p class="text">${esc(s.note)}</p>` : ''}
      <h2 class="sub">Invest a quarter of your cash</h2>
      <ul class="rows">${Object.entries(G.FUNDS).map(([k, f]) => `<li><div><b>${f.n}</b><span class="hint">${f.d}</span></div><button class="choice small" data-a="invest" data-k="${k}" ${q < 10 ? 'disabled' : ''}>Put in ${G.money(q)}</button></li>`).join('')}</ul>
      <h2 class="sub">Buy</h2>
      <ul class="rows">${Object.entries(G.BUY).map(([k, b]) => `<li><div><b>${b.n}</b><span class="hint">${b.d}</span></div><button class="choice small" data-a="buy" data-k="${k}" ${s.money < b.cost ? 'disabled' : ''}>${G.money(b.cost)}</button></li>`).join('')}</ul>
    </section>`;
  }

  function record() {
    return `<section class="step still"><h2 class="title">Career record</h2>
      ${s.seasons.length ? `<div class="scroll"><table class="box"><tr><th>Age</th><th>Club</th><th>Season</th><th>Ovr</th></tr>${s.seasons.map((r) => `<tr><td>${r.age}</td><td>${esc(G.short(r.team))}${r.awards.length ? '<br>' + esc(r.awards.join(', ')) : ''}</td><td>${esc(r.line).replace(/ · /g, '<br>')}</td><td>${r.o}</td></tr>`).join('')}</table></div>` : `<p class="text">No seasons in the book yet.</p>`}
      <p style="margin-top:var(--space-xl)">${installEvt ? `<button class="link" data-a="install">Install as an app</button> · ` : ''}<button class="link" data-a="switch">Saved careers</button> · <button class="link" data-a="fresh">Abandon this career</button></p>
      <p class="hint" style="margin-top:var(--space-md)">${NOTE}</p>
    </section>`;
  }

  // ---------- render ----------
  function render() {
    const playing = s && s.cur.t !== 'draw';
    $('#tabs').hidden = $('#strip').hidden = !playing;
    if (!s) { $('#dateline').textContent = 'Late edition'; view.innerHTML = setup(); return; }
    const sp = G.SPORTS[s.sport];
    $('#dateline').textContent = !playing ? sp.name : `Season ${s.seasons.length + (['report', 'end'].includes(s.cur.t) ? 0 : 1)} · Age ${s.age}`;
    if (playing) {
      $('#strip').innerHTML = `<span class="who"><b>${esc(s.name)}</b> · ${G.posOf(s).n} · ${esc(s.team)}</span><span class="cash">${G.money(s.money)}</span>`;
      document.querySelectorAll('#tabs button').forEach((b) => (b.dataset.k === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
    }
    view.innerHTML = !playing ? draw() : tab === 'life' ? life() : tab === 'money' ? moneyTab() : tab === 'record' ? record() : career();
    if (playing && tab === 'career' && s.cur.t === 'match' && s.cur.m.opt !== null && !s.cur.m.res) runMeter();
  }

  // The marker sweeps back and forth; where it stops decides the moment.
  // drift: the green moves too. react: one pass, and running out counts as a miss.
  let meterPos = null, meterT = 0, raf = 0;
  function runMeter() {
    const z = s.cur.m.z, mark = $('#mark'), good = $('#good'), fair = $('#fair'), w = $('#meter').clientWidth, t0 = performance.now();
    cancelAnimationFrame(raf);
    const tick = (now) => {
      meterT = now - t0;
      const p = meterT / z.period;
      if (z.mech === 'react' && p >= 1) { meterPos = 100; on.stop(); save(); render(); return; }
      meterPos = (z.mech === 'react' ? p : p % 2 < 1 ? p % 2 : 2 - (p % 2)) * 100;
      mark.style.transform = `translateX(${(meterPos / 100) * w}px)`;
      if (z.a) { const c = G.zoneAt(z, meterT); good.style.left = c - z.g / 2 + '%'; fair.style.left = c - z.g / 2 - z.y + '%'; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    $('#stop').focus({ preventScroll: true });
  }

  // Abandoning: back to the form, filled in with this player so a new build is one tap away.
  // keep: just switching careers, so leave it in its slot and offer a fresh random life.
  function toSetup(keep) {
    custom = !keep;
    draft = keep ? G.randomLife() : { name: s.name, sport: s.sport, pos: s.pos, country: s.country || 'NG', origin: s.origin, story: s.story, look: Object.assign({}, s.look) };
    if (!keep) drop(slot);
    s = null; lastStep = ''; window.scrollTo(0, 0);
  }

  const on = {
    sport: (b) => { draft.sport = b.dataset.k; },
    pos: (b) => { draft.pos = b.dataset.k; },
    redraw: () => { if (s.cur.t === 'draw' || confirm('Throw this build away and draw again?')) { G.redraw(s); lastStep = ''; window.scrollTo(0, 0); } },
    setup: () => { if (6 - s.cur.left.length === 0 && !s.cur.card || confirm('Go back to setup? This draw will be lost.')) toSetup(); },
    origin: (b) => { draft.origin = b.dataset.k; },
    look: (b) => { draft.look[b.dataset.k] = b.dataset.k === 'hair' ? b.dataset.v : +b.dataset.v; },
    begin: () => {
      const free = [...Array(SLOTS).keys()].find((i) => !read(i));
      if (free === undefined) return alert(`All ${SLOTS} save slots are full. Delete a saved career first.`);
      slot = free; s = G.create(draft); tab = 'career'; window.scrollTo(0, 0);
    },
    load: (b) => { slot = +b.dataset.i; s = read(slot); tab = 'career'; lastStep = ''; window.scrollTo(0, 0); },
    del: (b) => { const i = +b.dataset.i; if (confirm(`Delete ${read(i).name}'s career? It cannot be brought back.`)) drop(i); },
    switch: () => toSetup(true),
    roll: () => { draft = G.randomLife(); custom = false; window.scrollTo(0, 0); },
    custom: () => { custom = true; },
    spin: () => {
      G.spin(s);
      if (calm) return;
      rolling = true; // the reel runs, then the card is shown
      setTimeout(() => { rolling = false; render(); }, 1700);
    },
    place: (b) => G.place(s, b.dataset.k),
    cont: () => { G.advance(s); window.scrollTo(0, 0); },
    arc: (b) => G.takeArc(s, +b.dataset.i),
    ev: (b) => G.choose(s, +b.dataset.i),
    opt: (b) => G.pickOpt(s, +b.dataset.i),
    stop: () => { cancelAnimationFrame(raf); G.stop(s, meterPos === null ? 0 : meterPos, meterT); meterPos = null; },
    next: () => G.nextMoment(s),
    tab: (b) => { tab = b.dataset.k; window.scrollTo(0, 0); },
    act: (b) => G.act(s, b.dataset.k),
    invest: (b) => { G.invest(s, b.dataset.k); s.note = ''; },
    buy: (b) => { G.buy(s, b.dataset.k); s.note = `Bought: ${G.BUY[b.dataset.k].n.toLowerCase()}.`; },
    cash: (b) => G.cashOut(s, +b.dataset.i),
    fresh: () => { if (s.cur.t === 'end' || confirm('Abandon this career? It cannot be brought back.')) toSetup(); },
    install: () => { installEvt.prompt(); installEvt = null; },
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled || rolling) return;
    on[b.dataset.a](b); save(); render();
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'name') draft.name = e.target.value; if (e.target.id === 'story') draft.story = e.target.value; if (e.target.id === 'country') draft.country = e.target.value; });
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (s && tab === 'record') render(); });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js');

  render();
})();
