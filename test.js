// Self-check: play many random careers start to finish and make sure nothing breaks.
const assert = require('assert');
const G = require('./game.js');
const pick = (n) => Math.floor(Math.random() * n);
const ranks = {}, ribbons = {}, mechs = {}, grades = {}, orders = {}, seen = {}; let seasons = 0, titles = 0, clutch = 0, matches = 0, N = 400;
for (let n = 0; n < N; n++) {
  const sport = n % 2 ? 'bb' : 'soc', sp = G.SPORTS[sport];
  const pos = sp.pos[n % sp.pos.length].id;
  const s = G.create({ name: 'Test Player', sport, pos, country: G.COUNTRIES[n % G.COUNTRIES.length].id, origin: G.ORIGINS[n % 6].id, story: 'x' });
  assert.equal(s.country, G.COUNTRIES[n % G.COUNTRIES.length].id);
  assert.equal(s.pos, pos);
  G.setOpt(s, 'play', ['all', 'big', 'sim'][n % 3]);
  if (n % 5 === 0) { G.spin(s); G.place(s, 'sho'); G.redraw(s); assert(!s.cap.sho && s.cur.left.length === 6, 'redraw'); }
  while (s.cur.t === 'draw') { G.spin(s); if (pick(4) === 0) G.spin(s); G.place(s, s.cur.left[pick(s.cur.left.length)]); }
  assert(s.h > 0 && G.KEYS.every((k) => s.cap[k] >= 30), 'draw incomplete');
  assert(G.POOL[sport].some((p) => p[0] === s.src.h && p[1] === pos), 'frame from another position');
  let guard = 0;
  while (s.cur.t !== 'end') {
    assert(++guard < 3000, 'career never ended');
    const c = s.cur;
    if (c.t === 'arc') { assert.equal(c.opts.length, 3); G.takeArc(s, pick(3)); assert(c.out.text && !/[{}]|undefined/.test(c.out.text), c.out.text); }
    else if (c.t === 'event') { const e = G.EV[c.id]; seen[c.id] = 1; assert(e.c.every((x) => !/[{}]/.test(G.tx(s, x[0])))); G.choose(s, pick(e.c.length)); assert(!/[{}]|undefined|NaN/.test(c.out.text), c.out.text); }
    else if (c.t === 'match') {
      matches++;
      while (!c.m.done) {
        const mo = c.m.moments[c.m.i];
        assert(mo.k === 'off' || mo.k === 'def', 'unsettled moment ' + mo.k);
        assert(mo.vs && !/[{}]|undefined/.test(mo.text + mo.clock), mo.text);
        if (mo.clutch) clutch++;
        const opts = G.optsFor(s, mo); assert(opts.length >= 2 && opts.every(Boolean), 'moves');
        orders[mo.o.join()] = 1;
        G.pickOpt(s, pick(opts.length));
        const z = c.m.z; assert(z.g >= 4 && z.period > 250, 'zone');
        mechs[z.mech] = (mechs[z.mech] || 0) + 1;
        let touches = 0;
        while (!c.m.res) { assert(++touches <= 2); const at = G.zoneAt(z, 500); assert(at - z.g / 2 >= 0 && at + z.g / 2 <= 100, 'green off the meter'); G.stop(s, Math.random() * 100, Math.random() * 4000); }
        assert(c.m.res.text && !/[{}]/.test(c.m.res.text), c.m.res.text);
        G.nextMoment(s);
      }
      grades[c.m.done.grade] = (grades[c.m.done.grade] || 0) + 1;
      assert(Number.isFinite(c.m.us) && Number.isFinite(c.m.them));
    } else if (c.t === 'report') { assert(s.rec, 'no season record'); assert(!/undefined|NaN/.test(c.r.head + c.r.stand + c.r.line + c.r.notes.join()), c.r.notes.join()); if (pick(2)) {
        s.days = 3;
        for (let i = 0; i < 3; i++) { const ids = Object.keys(G.ACTS).filter((id) => G.ACTS[id].need(s)); G.act(s, ids[pick(ids.length)]); assert(!/[{}]|undefined/.test(s.note), s.note); }
        const id = G.STOCKS[pick(G.STOCKS.length)].id; G.buyStock(s, id); if (pick(3) === 0) G.sellStock(s, id);
        G.buyHome(s, pick(3), pick(2) === 0); if (s.homes.length) G.homeDo(s, pick(s.homes.length), ['reno', 'rent', 'ghost', 'sell'][pick(4)]);
        G.buyCar(s, pick(3)); if (s.cars.length) G.carDo(s, 0, pick(2) ? 'service' : 'sell');
        G.startBiz(s, pick(G.BIZ.length)); const bi = s.inv.findIndex((x) => x.kind === 'biz'); if (bi >= 0) pick(2) ? G.growBiz(s, bi) : G.cashOut(s, bi);
        G.buyLux(s, pick(G.LUX.length)); if (s.lux.length && pick(2)) G.sellLux(s, 0);
        G.setOpt(s, 'stake', [0.1, 0.25, 0.5][pick(3)]);
        for (let k = 0; k < 4; k++) { const pl = G.PLATS[pick(4)]; pick(3) ? G.post(s, pl.id, pl.posts[pick(pl.posts.length)]) : G.socDo(s, pl.id, ['verify', 'monetize', 'ad', 'buy'][pick(4)]); assert(!/[{}]|undefined|NaN/.test(s.soc.note), s.soc.note); }
        G.buy(s, 'parents'); assert(!/undefined|NaN/.test(s.note), s.note);
        assert(Number.isFinite(G.worth(s)) && Object.values(s.mkt).every((p) => p > 0), 'assets');      } }
    if (c.t !== 'match' || c.m.done) G.advance(s);
    for (const k of G.KEYS) assert(s.st[k] >= 30 && s.st[k] <= 99, k);
    for (const k of ['coach', 'mates', 'morale', 'fame', 'health', 'heat', 'money']) assert(Number.isFinite(s[k]), k);
    JSON.stringify(s);
  }
  const l = s.cur.l; assert(Number.isFinite(l.score)); assert(s.after, 'no after-career choice');
  ranks[l.rank] = (ranks[l.rank] || 0) + 1; ribbons[l.ribbon] = (ribbons[l.ribbon] || 0) + 1; seasons += l.n; titles += s.titles;
}
// random lives are complete and get a birth line
for (let i = 0; i < 200; i++) { const d = G.randomLife(), s = G.create(d); assert(d.name.includes(' ') && s.country === d.country && s.pos === d.pos); assert(s.log[0].a === 0 && !/undefined|  |, \./.test(s.log[0].t), s.log[0].t); }
// every club has its own scoreboard name
for (const sp of Object.values(G.SPORTS)) { const all = sp.teams.slice(1).flat(); assert.equal(new Set(all.map(G.short)).size, all.length, 'short team names clash'); }
// an old save still loads
const old = G.create({ sport: 'bb' }); old.v = 2; delete old.pos; delete old.soc; delete old.opt; delete old.lux; delete old.mkt.GOLD; G.migrate(old); assert(old.v === 3 && G.posOf(old).id === 'SF' && old.soc && old.opt.play === 'all' && old.mkt.GOLD > 0);
console.log('ok', N, 'careers. avg seasons', (seasons / N).toFixed(1), 'avg titles', (titles / N).toFixed(2), 'clutch per match', (clutch / matches).toFixed(2));
console.log(ranks); console.log(ribbons); console.log(mechs); console.log(grades);
console.log('distinct move sets', Object.keys(orders).length, 'events never seen:', G.EV ? Object.keys(G.EV).filter((id) => !seen[id]).join(', ') : '');
