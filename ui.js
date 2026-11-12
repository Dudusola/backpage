// Back Page: screens. All rules live in game.js.
(function () {
  const KEY = 'backpage.v1';
  const $ = (q) => document.querySelector(q);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const view = $('#view');

  let s = null, tab = 'career', lastStep = '', installEvt = null;
  const draft = { name: '', sport: 'bb', arch: 'sniper', origin: 'single', story: '' };
  try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
  if (s && s.v !== 1) s = null;
  const save = () => { try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch (e) { /* private mode: play on without saving */ } };

  // ---------- small pieces ----------
  const sign = (v) => (v > 0 ? '+' : '−') + Math.abs(v);
  const deltas = (d) => d && d.length ? `<ul class="deltas">${d.map(([l, v]) => `<li class="${v < 0 ? 'dn' : ''}">${esc(l)} ${l === 'Money' ? (v > 0 ? '+' : '−') + G.money(Math.abs(v)) : sign(v)}</li>`).join('')}</ul>` : '';
  const bar = (label, v) => `<li><span>${esc(label)}</span><i><b style="width:${v}%"></b></i><span class="num">${Math.round(v)}</span></li>`;
  const btn = (a, label, attrs = '') => `<button class="btn" data-a="${a}" ${attrs}>${esc(label)}</button>`;
  const choice = (a, i, label, attrs = '') => `<button class="choice" data-a="${a}" data-i="${i}" ${attrs}>${esc(label)}</button>`;

  function court(sport, k, x) {
    const px = 30 + (x / 100) * 140, off = k !== 'def';
    const me = [px, off ? 86 : 58], opp = [px + (off ? 4 : -3), off ? 72 : 76];
    const lines = sport === 'bb'
      ? '<rect class="ln" x="75" y="8" width="50" height="46"/><path class="ln" d="M82 54a18 18 0 0 0 36 0"/><path class="ln" d="M28 8v26a72 72 0 0 0 144 0V8"/><path class="ln" d="M91 13h18"/><circle class="ln" cx="100" cy="18" r="4"/>'
      : '<rect class="ln" x="44" y="8" width="112" height="50"/><rect class="ln" x="76" y="8" width="48" height="18"/><path class="ln" d="M82 58a20 20 0 0 0 36 0"/><rect class="ln" x="88" y="3" width="24" height="5"/><circle class="ball" cx="100" cy="44" r="1.2"/>';
    const ball = off ? me : opp;
    return `<svg class="court" viewBox="0 0 200 112" aria-hidden="true"><rect class="bg" x="8" y="8" width="184" height="100"/><rect class="ln" x="8" y="8" width="184" height="100"/>${lines}<circle class="opp" cx="${opp[0]}" cy="${opp[1]}" r="5"/><circle class="me" cx="${me[0]}" cy="${me[1]}" r="5.5"/><circle class="ball" cx="${ball[0] + 7}" cy="${ball[1] + 3}" r="2.2"/></svg>`;
  }

  // ---------- screens ----------
  function setup() {
    const sp = G.SPORTS[draft.sport];
    if (!sp.arch.some((a) => a.id === draft.arch)) draft.arch = sp.arch[0].id;
    return `<section class="step">
      <h2 class="headline">Your career, in headlines</h2>
      <p class="stand">Play the big moments yourself. Live with everything else: the coach, the money, the people at home.</p>
      <label class="field">Player name<input id="name" maxlength="18" autocomplete="off" placeholder="Tobi Adeyemi" value="${esc(draft.name)}"></label>
      <fieldset><legend class="field">Sport</legend><div class="seg">
        ${Object.entries(G.SPORTS).map(([k, v]) => `<button type="button" class="choice" data-a="sport" data-k="${k}" aria-pressed="${draft.sport === k}">${v.name}</button>`).join('')}
      </div></fieldset>
      <fieldset><legend class="field">Kind of player</legend><ul class="choices">
        ${sp.arch.map((a) => `<li><button type="button" class="choice" data-a="arch" data-k="${a.id}" aria-pressed="${draft.arch === a.id}">${a.n}</button><p class="hint">${a.d}</p></li>`).join('')}
      </ul></fieldset>
      <fieldset><legend class="field">Where you come from</legend><ul class="choices">
        ${G.ORIGINS.map((o) => `<li><button type="button" class="choice" data-a="origin" data-k="${o.id}" aria-pressed="${draft.origin === o.id}">${o.n}</button><p class="hint">${o.d}</p></li>`).join('')}
      </ul></fieldset>
      ${draft.origin === 'own' ? `<label class="field">Your story, in one line<input id="story" maxlength="90" autocomplete="off" placeholder="Sold oranges at the stadium gate. Now I play inside it." value="${esc(draft.story)}"></label>` : ''}
      ${btn('begin', 'Begin')}
    </section>`;
  }

  function draw() {
    const c = s.cur, st = G.SPORTS[s.sport].stats, n = 6 - c.left.length;
    return `<section class="step">
      <p class="meta">The draw · ${n} of 6 placed</p>
      <h2 class="title">What made you</h2>
      <p class="text">Six spins. Each lands on something from your childhood, with a number. Put the number where you want it.</p>
      ${c.card ? `<div class="reel"><div><b>${esc(c.card.n)}</b><span class="hint">${esc(c.card.d)}</span></div><span class="big num">${c.card.r}</span></div>` : `<div class="reel empty"><span>Spin to see what you get.</span></div>`}
      ${c.card ? (c.respin ? `<button class="link" data-a="spin">Spin again (once only)</button>` : `<p class="hint">Re-spin used. Place this one.</p>`) : btn('spin', 'Spin', 'style="margin-top:var(--space-md)"')}
      <ul class="slots">${G.KEYS.map((k) => `<li><button data-a="place" data-k="${k}" ${!c.card || s.st[k] ? 'disabled' : ''}><span>${st[k]}</span>${s.st[k] ? `<span class="v">${s.st[k]}</span>` : c.card ? `<span class="open">Place here</span>` : `<span class="v">—</span>`}</button></li>`).join('')}</ul>
    </section>`;
  }

  const backstory = () => s.story || (G.ORIG[s.origin] || G.ORIG.steady).d;

  function out(c, next = 'Continue') { return `<p class="text">${esc(c.out.text)}</p>${deltas(c.out.d)}${btn('cont', next)}`; }

  function stepCard() {
    const c = s.cur, sp = G.SPORTS[s.sport];
    if (c.t === 'signed') return `<p class="meta">${sp.entry}</p><h2 class="headline">${esc(s.team)}</h2><p class="stand">${esc(c.text)}</p><p class="text">${esc(backstory())}</p>
      <ul class="bars" style="margin-top:var(--space-lg)">${G.KEYS.map((k) => bar(sp.stats[k], s.st[k])).join('')}</ul>${btn('cont', 'Start season one')}`;
    if (c.t === 'arc') return `<p class="meta">Off-season · Age ${s.age}</p><h2 class="title">How do you spend the summer?</h2>` + (c.out ? out(c)
      : `<ul class="choices">${c.opts.map((id, i) => `<li>${choice('arc', i, G.tx(s, G.ARC[id].n))}<p class="hint">${esc(G.ARC[id].d)}</p></li>`).join('')}</ul>`);
    if (c.t === 'event') {
      const e = G.EV[c.id];
      return `<h2 class="title">${esc(G.tx(s, e.title))}</h2>` + (c.out ? out(c)
        : `<p class="text">${esc(G.tx(s, e.text))}</p><div class="choices">${e.c.map((x, i) => choice('ev', i, x[0])).join('')}</div>`);
    }
    if (c.t === 'match') return match(c.m, sp);
    if (c.t === 'report') {
      const r = c.r;
      return `<article><p class="meta">Late edition · Age ${r.age} · ${esc(r.team)}</p><h2 class="headline">${esc(r.head)}</h2><p class="stand">${esc(r.stand)}</p>
        <table class="box"><tr><th>Season</th><td>${esc(r.line)}</td></tr><tr><th>Overall</th><td>${r.o}</td></tr><tr><th>Honours</th><td>${r.awards.length ? esc(r.awards.join(', ')) : 'None'}</td></tr></table>
        <ul class="notes" style="margin-top:var(--space-sm)">${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
        ${btn('cont', r.last ? 'Read your legacy' : 'Next season')}</article>`;
    }
    if (c.t === 'end') {
      const l = c.l;
      return `<article><p class="meta">Final edition · ${l.n} seasons</p><h2 class="headline">${esc(l.rank)}</h2>
        <p class="stand">${esc(s.name)} retires at ${s.age} with ${s.titles} ${s.titles === 1 ? 'title' : 'titles'} and a net worth of ${G.money(l.worth)}.</p>
        <p class="text">Where it started: ${esc(backstory())}</p><p class="ribbon">${esc(l.ribbon)}</p>
        <table class="box"><tr><th>Legacy score</th><td>${l.score}</td></tr><tr><th>Titles</th><td>${s.titles}</td></tr><tr><th>${sp.mvp}</th><td>${s.mvps}</td></tr><tr><th>${sp.star}</th><td>${s.stars}</td></tr><tr><th>Peak overall</th><td>${s.peak}</td></tr><tr><th>Clubs</th><td>${s.teams}</td></tr></table>
        ${btn('fresh', 'Start a new career')}</article>`;
    }
    return '';
  }

  function match(m, sp) {
    const short = (t) => t.split(' ').pop();
    const head = `<p class="meta">${esc(m.kind)}${m.done ? ' · Full time' : ` · Moment ${m.i + 1} of ${m.moments.length}`}</p>
      <div class="score"><span>${esc(short(s.team))}</span><b>${m.us}</b><b>${m.them}</b><span>${esc(short(m.opp))}</span></div>`;
    if (m.done) return head + `<span class="grade" aria-label="Grade ${m.done.grade}">${m.done.grade}</span>
      <p class="res">${m.done.win ? 'A win.' : m.done.draw ? 'A draw.' : 'A defeat.'} You came through in ${m.hits} of ${m.moments.length} moments${m.mine ? ` and scored ${m.mine}` : ''}.</p>${deltas(m.done.d)}${btn('cont', 'Continue')}`;
    const mo = m.moments[m.i], opts = mo.k === 'def' ? sp.def : sp.off;
    let body;
    if (m.res) body = `<p class="res">${esc(m.res.text)}</p><p class="hint">${m.res.q === 'g' ? 'In the green.' : m.res.q === 'y' ? (m.res.hit ? 'Close enough, this time.' : 'Close, but not enough.') : 'Well off.'}</p>${btn('next', m.i + 1 < m.moments.length ? 'Next moment' : 'Full time')}`;
    else if (m.opt !== null) {
      const z = m.z, fl = z.c - z.g / 2 - z.y;
      body = `<p class="text"><b>${esc(opts[m.opt].l)}.</b> Stop the marker in the green.</p>
        <div class="meter" id="meter"><i class="fair" style="left:${fl}%;width:${z.g + 2 * z.y}%"></i><i class="good" style="left:${z.c - z.g / 2}%;width:${z.g}%"></i><b class="mark" id="mark"></b></div>
        ${btn('stop', 'Stop', 'id="stop"')}`;
    } else body = `<p class="text">${esc(mo.text)}</p><div class="choices">${opts.map((o, i) => choice('opt', i, o.l)).join('')}</div><p class="hint">Your ${opts.map((o) => `${sp.stats[o.k].toLowerCase()} is ${s.st[o.k]}`).join(', ')}. Higher means a wider green.</p>`;
    return head + court(s.sport, mo.k, mo.x) + body;
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
    return `<section class="step still"><h2 class="title">Overall ${G.ovr(s)}</h2>
      <ul class="bars" style="margin-top:var(--space-sm)">${G.KEYS.map((k) => bar(sp.stats[k], s.st[k])).join('')}</ul>
      <h2 class="sub">People</h2><ul class="bars">
        ${bar('Coach ' + s.names.coach.split(' ').pop(), s.coach)}${bar('Teammates', s.mates)}${s.partner ? bar(s.partner.name, s.partner.bond) : ''}${bar('Rivalry with ' + s.names.rival.split(' ').pop(), s.heat)}
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
      <h2 class="sub">Invest a quarter of your cash</h2>
      <ul class="rows">${Object.entries(G.FUNDS).map(([k, f]) => `<li><div><b>${f.n}</b><span class="hint">${f.d}</span></div><button class="choice small" data-a="invest" data-k="${k}" ${q < 10 ? 'disabled' : ''}>Put in ${G.money(q)}</button></li>`).join('')}</ul>
    </section>`;
  }

  function record() {
    return `<section class="step still"><h2 class="title">Career record</h2>
      ${s.seasons.length ? `<div class="scroll"><table class="box"><tr><th>Age</th><th>Club</th><th>Season</th><th>Ovr</th></tr>${s.seasons.map((r) => `<tr><td>${r.age}</td><td>${esc(r.team.split(' ').pop())}${r.awards.length ? '<br>' + esc(r.awards.join(', ')) : ''}</td><td>${esc(r.line).replace(/ · /g, '<br>')}</td><td>${r.o}</td></tr>`).join('')}</table></div>` : `<p class="text">No seasons in the book yet.</p>`}
      <p style="margin-top:var(--space-xl)">${installEvt ? `<button class="link" data-a="install">Install as an app</button> · ` : ''}<button class="link" data-a="fresh">Abandon this career</button></p>
    </section>`;
  }

  // ---------- render ----------
  function render() {
    const playing = s && !['draw'].includes(s.cur.t);
    $('#tabs').hidden = $('#strip').hidden = !playing;
    if (!s) { $('#dateline').textContent = 'Late edition'; view.innerHTML = setup(); return; }
    const sp = G.SPORTS[s.sport];
    $('#dateline').textContent = s.cur.t === 'draw' ? sp.name : `Season ${s.seasons.length + (['report', 'end'].includes(s.cur.t) ? 0 : 1)} · Age ${s.age}`;
    if (playing) {
      $('#strip').innerHTML = `<span class="who"><b>${esc(s.name)}</b> · ${sp.arch.find((a) => a.id === s.arch).n} · ${esc(s.team)}</span><span class="cash">${G.money(s.money)}</span>`;
      document.querySelectorAll('#tabs button').forEach((b) => b.toggleAttribute('aria-current', false) || (b.dataset.k === tab && b.setAttribute('aria-current', 'page')));
    }
    view.innerHTML = !playing ? draw() : tab === 'life' ? life() : tab === 'money' ? moneyTab() : tab === 'record' ? record() : career();
    if (playing && tab === 'career' && s.cur.t === 'match' && s.cur.m.opt !== null && !s.cur.m.res) runMeter();
  }

  // The marker sweeps back and forth; where it stops decides the moment.
  let meterPos = null, raf = 0;
  function runMeter() {
    const mark = $('#mark'), w = $('#meter').clientWidth, period = s.cur.m.z.period, t0 = performance.now();
    cancelAnimationFrame(raf);
    const tick = (now) => {
      const p = ((now - t0) / period) % 2;
      meterPos = (p < 1 ? p : 2 - p) * 100;
      mark.style.transform = `translateX(${(meterPos / 100) * w}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    $('#stop').focus({ preventScroll: true });
  }

  const on = {
    sport: (b) => { draft.sport = b.dataset.k; },
    arch: (b) => { draft.arch = b.dataset.k; },
    origin: (b) => { draft.origin = b.dataset.k; },
    begin: () => { s = G.create(draft); tab = 'career'; },
    spin: () => G.spin(s),
    place: (b) => G.place(s, b.dataset.k),
    cont: () => { G.advance(s); window.scrollTo(0, 0); },
    arc: (b) => G.takeArc(s, +b.dataset.i),
    ev: (b) => G.choose(s, +b.dataset.i),
    opt: (b) => G.pickOpt(s, +b.dataset.i),
    stop: () => { cancelAnimationFrame(raf); G.stop(s, meterPos === null ? 0 : meterPos); meterPos = null; },
    next: () => G.nextMoment(s),
    tab: (b) => { tab = b.dataset.k; window.scrollTo(0, 0); },
    act: (b) => G.act(s, b.dataset.k),
    invest: (b) => G.invest(s, b.dataset.k),
    cash: (b) => G.cashOut(s, +b.dataset.i),
    fresh: () => { if (s.cur.t === 'end' || confirm('Abandon this career? It cannot be brought back.')) { s = null; lastStep = ''; } },
    install: () => { installEvt.prompt(); installEvt = null; },
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    on[b.dataset.a](b); save(); render();
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'name') draft.name = e.target.value; if (e.target.id === 'story') draft.story = e.target.value; });
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (s && tab === 'record') render(); });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js');

  render();
})();
