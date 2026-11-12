// Self-check: play many random careers start to finish and make sure nothing breaks.
const assert = require('assert');
const G = require('./game.js');
const pick = (n) => Math.floor(Math.random() * n);
const ranks = {}, ribbons = {}; let seasons = 0, titles = 0, N = 400;
for (let n = 0; n < N; n++) {
  const sport = n % 2 ? 'bb' : 'soc';
  const s = G.create({ name: 'Test Player', sport, arch: G.SPORTS[sport].arch[n % 3].id, origin: G.ORIGINS[n % 6].id, story: 'x' });
  while (s.cur.t === 'draw') { G.spin(s); if (pick(4) === 0) G.spin(s); G.place(s, s.cur.left[pick(s.cur.left.length)]); }
  assert(s.h > 0 && G.KEYS.every((k) => s.cap[k] >= 30), 'draw incomplete');
  let guard = 0;
  while (s.cur.t !== 'end') {
    assert(++guard < 2000, 'career never ended');
    const c = s.cur;
    if (c.t === 'arc') { assert.equal(c.opts.length, 3); G.takeArc(s, pick(3)); assert(c.out.text && !/[{}]|undefined/.test(c.out.text), c.out.text); }
    else if (c.t === 'event') { const e = G.EV[c.id]; G.choose(s, pick(e.c.length)); assert(!/[{}]|undefined|NaN/.test(c.out.text), c.out.text); }
    else if (c.t === 'match') {
      while (!c.m.done) { const mo = c.m.moments[c.m.i]; G.pickOpt(s, pick(mo.k === 'def' ? 2 : 3)); assert(c.m.z.g >= 8 && c.m.z.period > 300); G.stop(s, Math.random() * 100); assert(c.m.res.text); G.nextMoment(s); }
      assert(Number.isFinite(c.m.us) && Number.isFinite(c.m.them));
    } else if (c.t === 'report') { assert(!/undefined|NaN/.test(c.r.head + c.r.stand + c.r.line), c.r.stand); if (pick(2)) { G.act(s, 'gym'); G.invest(s, ['idx', 'prop', 'vc'][pick(3)]); } }
    if (c.t !== 'match' || c.m.done) G.advance(s);
    for (const k of G.KEYS) assert(s.st[k] >= 30 && s.st[k] <= 99, k);
    for (const k of ['coach', 'mates', 'morale', 'fame', 'health', 'heat', 'money']) assert(Number.isFinite(s[k]), k);
    JSON.stringify(s);
  }
  const l = s.cur.l; assert(Number.isFinite(l.score));
  ranks[l.rank] = (ranks[l.rank] || 0) + 1; ribbons[l.ribbon] = (ribbons[l.ribbon] || 0) + 1; seasons += l.n; titles += s.titles;
}
console.log('ok', N, 'careers. avg seasons', (seasons / N).toFixed(1), 'avg titles', (titles / N).toFixed(2));
console.log(ranks); console.log(ribbons);
