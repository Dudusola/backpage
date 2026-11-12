// Back Page: game rules. No DOM in here, so test.js can run whole careers in node.
(function (root) {
  const R = () => Math.random();
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (a) => a[Math.floor(R() * a.length)];
  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

  const KEYS = ['sho', 'drv', 'pas', 'def', 'ath', 'cmp'];

  // A sport is only this config. The life side is shared.
  const SPORTS = {
    bb: {
      name: 'Basketball',
      stats: { sho: 'Shooting', drv: 'Finishing', pas: 'Playmaking', def: 'Defense', ath: 'Athleticism', cmp: 'Composure' },
      arch: [
        { id: 'sniper', n: 'Sharpshooter', d: 'Lives behind the arc. Defence is a rumour.', m: { sho: 8, def: -4 } },
        { id: 'general', n: 'Floor General', d: 'Sees the pass before it exists.', m: { pas: 8, drv: -4 } },
        { id: 'enforcer', n: 'Enforcer', d: 'Nobody scores easy on your watch.', m: { def: 8, sho: -4 } },
      ],
      teams: [null, ['Harbor City Kings', 'Northgate Comets'], ['Redwater Foxes', 'Lakeshore Herons'], ['Dustbowl Coyotes', 'Port Azure Gulls']],
      body: { tall: 81, short: 75, mods: { tall: { drv: 3, def: 3, ath: -3, sho: -2 }, short: { ath: 3, pas: 2, drv: -2, def: -2 }, mid: {} } },
      mvp: 'MVP', star: 'All-Star', title: 'champions', final: 'The Finals', entry: 'Draft night', joined: 'Drafted by the {team}.', mid: 'went out in the play-offs',
      entryText: (t) => `With the eleventh pick, the ${t} take a chance on you. A four-year rookie deal and a locker by the door.`,
      base: (us, them) => [ri(84, 96) + Math.round((us - 70) / 2), ri(86, 98) + Math.round((them - 70) / 2)],
      line: (st, mf) => {
        const p = Math.max(2, mf * ((st.sho + st.drv) / 2 - 45) * 0.62 + ri(-15, 15) / 10);
        const r = Math.max(1, mf * (st.ath + st.def - 90) * 0.09 + ri(-8, 8) / 10);
        const a = Math.max(0.5, mf * (st.pas - 45) * 0.2 + ri(-8, 8) / 10);
        return `${p.toFixed(1)} pts · ${r.toFixed(1)} reb · ${a.toFixed(1)} ast`;
      },
      sit: {
        off: ['Shot clock at eight. Your man is sagging off you.', 'Fast break, two against one.', 'Out of the timeout, the play is drawn for you.', 'A switch leaves a slower defender on you.'],
        def: ['{star} isolates on you at the top of the key.', 'The pick and roll is coming straight at you.', 'They push the ball in transition.'],
        clutch: 'Down one. Nine seconds left. The ball is in your hands.',
      },
      off: [
        { l: 'Pull up from three', k: 'sho', pts: 3, ok: 'Splash. Nothing but net.', no: 'Front rim. They run the other way.' },
        { l: 'Drive to the rim', k: 'drv', pts: 2, ok: 'You finish through the contact.', no: 'Stripped in the lane.' },
        { l: 'Hit the cutter', k: 'pas', pts: 2, ok: 'A dime. Easy two for your teammate.', no: 'Picked off. Turnover.' },
      ],
      def: [
        { l: 'Jump the passing lane', k: 'ath', pts: 2, ok: 'Steal. You take it coast to coast.', no: 'You gambled. The open three drops.', lose: 3 },
        { l: 'Stay down and contest', k: 'def', pts: 0, ok: 'A hand in the face. Tough miss.', no: '{star} rises over you and scores.', lose: 2 },
      ],
    },
    soc: {
      name: 'Soccer',
      stats: { sho: 'Shooting', drv: 'Dribbling', pas: 'Passing', def: 'Defending', ath: 'Pace', cmp: 'Composure' },
      arch: [
        { id: 'poacher', n: 'Poacher', d: 'One touch, one goal. Tracks back never.', m: { sho: 8, def: -4 } },
        { id: 'maker', n: 'Playmaker', d: 'The game slows down around you.', m: { pas: 8, ath: -4 } },
        { id: 'destroyer', n: 'Destroyer', d: 'Wins the ball, and the argument.', m: { def: 8, sho: -4 } },
      ],
      teams: [null, ['Castellan CF', 'Northgate Athletic'], ['Redwater Rovers', 'Lakeshore United'], ['Dunmore Town', 'Port Azure FC']],
      body: { tall: 188, short: 174, mods: { tall: { def: 3, sho: 1, ath: -3 }, short: { ath: 3, drv: 3, def: -3 }, mid: {} } },
      mvp: 'Player of the Year', star: 'Team of the Season', title: 'champions', final: 'The Cup Final', entry: 'Signing day', joined: 'Signed by {team} from the academy.', mid: 'finished in the top half',
      entryText: (t) => `${t} sign you from the academy. A four-year deal, the number 27 shirt and a seat at the back of the bus.`,
      base: (us, them) => [(R() < 0.3 + (us - 70) / 100 ? 1 : 0), (R() < 0.4 + (them - 70) / 100 ? 1 : 0)],
      line: (st, mf) => {
        const g = Math.max(0, Math.round(mf * (st.sho * 0.6 + st.drv * 0.4 - 50) * 0.75 + ri(-2, 2)));
        const a = Math.max(0, Math.round(mf * (st.pas - 50) * 0.4 + ri(-2, 2)));
        const rt = clamp(6 + ((avg(KEYS.map((k) => st[k])) - 60) / 15) * mf, 5, 9.6);
        return `${g} goals · ${a} assists · ${rt.toFixed(1)} rating`;
      },
      sit: {
        off: ['You pick the ball up between the lines.', 'A counter-attack, three against two.', 'The full-back shows you the outside.', 'A loose ball drops to you on the edge of the box.'],
        def: ['{star} runs straight at you.', 'A through ball is played in behind.', 'Their number ten turns in the pocket.'],
        clutch: 'Ninetieth minute, level. The ball breaks to you in the box.',
      },
      off: [
        { l: 'Shoot', k: 'sho', pts: 1, p: 0.75, ok: 'Top corner. The keeper never moved.', okNo: 'On target, but the keeper claws it away.', no: 'Dragged wide.' },
        { l: 'Take him on', k: 'drv', pts: 1, p: 0.5, ok: 'You beat your man and square it. Tap-in.', okNo: 'You skin him, but the cross is cleared.', no: 'He reads it and takes the ball.' },
        { l: 'Thread the pass', k: 'pas', pts: 1, p: 0.55, ok: 'Through the eye of a needle. Finished first time.', okNo: 'A lovely ball. The striker skies it.', no: 'Cut out.' },
      ],
      def: [
        { l: 'Slide in', k: 'ath', pts: 0, ok: 'A clean tackle. The crowd roars.', no: 'Mistimed. They score from the free kick.', noNo: 'Mistimed. The free kick comes to nothing.', lose: 1, lp: 0.5 },
        { l: 'Hold your position', k: 'def', pts: 0, ok: 'You shepherd him wide. Danger over.', no: '{star} cuts inside and finishes.', noNo: 'He cuts inside and blazes over.', lose: 1, lp: 0.6 },
      ],
    },
  };

  const FIRST = ['Tunde', 'Marcus', 'Chidi', 'Leo', 'Emeka', 'Darius', 'Kofi', 'Mateo', 'Segun', 'Andre', 'Ibrahim', 'Jonas', 'Femi', 'Rafael', 'Kwame', 'Niko'];
  const LAST = ['Okafor', 'Bell', 'Adeyemi', 'Varga', 'Mensah', 'Castro', 'Balogun', 'Reyes', 'Osei', 'Lindqvist', 'Nwosu', 'Marsh', 'Diallo', 'Kovac', 'Eze', 'Santoro'];
  const PARTNERS = ['Amara', 'Zainab', 'Sofia', 'Kemi', 'Elena', 'Tolu', 'Maya', 'Ada', 'Jordan', 'Sam', 'Ife', 'Noor'];
  const person = () => `${pick(FIRST)} ${pick(LAST)}`;

  // The reel in the Draw: real players. The ratings are our own opinion, not official data.
  // [name, position, sho, drv, pas, def, ath, cmp, height (inches for bb, cm for soc)]. First 24 of each are active players.
  const POOL = {
    bb: [
      ['Stephen Curry', 'G', 99, 84, 90, 66, 80, 96, 74], ['LeBron James', 'F', 82, 97, 95, 88, 95, 93, 81], ['Kevin Durant', 'F', 96, 93, 80, 80, 86, 94, 83],
      ['Giannis Antetokounmpo', 'F', 68, 99, 82, 93, 98, 84, 83], ['Nikola Jokic', 'C', 86, 93, 99, 76, 62, 95, 83], ['Luka Doncic', 'G', 90, 92, 97, 68, 72, 93, 79],
      ['Shai Gilgeous-Alexander', 'G', 88, 97, 85, 86, 88, 93, 78], ['Jayson Tatum', 'F', 88, 89, 80, 85, 86, 86, 80], ['Joel Embiid', 'C', 82, 96, 74, 90, 78, 82, 84],
      ['Anthony Edwards', 'G', 87, 94, 76, 82, 97, 88, 76], ['Victor Wembanyama', 'C', 80, 90, 74, 99, 88, 82, 88], ['Kawhi Leonard', 'F', 88, 90, 76, 97, 84, 96, 79],
      ['Damian Lillard', 'G', 95, 86, 86, 62, 80, 97, 74], ['Kyrie Irving', 'G', 92, 96, 84, 66, 84, 94, 74], ['Jimmy Butler', 'F', 76, 90, 82, 90, 82, 96, 79],
      ['Devin Booker', 'G', 92, 89, 82, 70, 80, 90, 77], ['Ja Morant', 'G', 74, 96, 88, 66, 98, 86, 74], ['Donovan Mitchell', 'G', 88, 92, 78, 72, 90, 88, 75],
      ['Jalen Brunson', 'G', 88, 92, 86, 66, 74, 95, 74], ['Tyrese Haliburton', 'G', 88, 80, 97, 68, 78, 90, 77], ['Anthony Davis', 'C', 74, 93, 70, 97, 88, 82, 82],
      ['Draymond Green', 'F', 62, 70, 90, 96, 76, 88, 78], ['Rudy Gobert', 'C', 40, 82, 52, 98, 80, 72, 85], ['Klay Thompson', 'G', 96, 72, 66, 80, 70, 90, 78],
      ['Chris Paul', 'G', 84, 78, 98, 84, 66, 96, 72], ['Michael Jordan', 'G', 86, 99, 82, 96, 97, 99, 78], ['Kobe Bryant', 'G', 90, 96, 80, 92, 92, 99, 78],
      ['Magic Johnson', 'G', 74, 90, 99, 78, 84, 95, 81], ['Larry Bird', 'F', 96, 86, 92, 80, 68, 97, 81], ['Shaquille O\u2019Neal', 'C', 40, 99, 68, 90, 92, 84, 85],
      ['Tim Duncan', 'C', 72, 92, 76, 97, 78, 95, 83], ['Hakeem Olajuwon', 'C', 70, 96, 68, 99, 90, 92, 84], ['Allen Iverson', 'G', 80, 96, 84, 74, 97, 92, 72],
      ['Dirk Nowitzki', 'F', 95, 86, 70, 66, 64, 94, 84], ['Kareem Abdul-Jabbar', 'C', 70, 99, 76, 92, 80, 94, 86], ['Ray Allen', 'G', 98, 80, 72, 72, 80, 95, 77],
      ['Dennis Rodman', 'F', 40, 62, 60, 98, 90, 80, 79], ['Steve Nash', 'G', 93, 80, 98, 54, 72, 93, 75], ['Vince Carter', 'G', 86, 93, 74, 70, 99, 84, 78],
    ],
    soc: [
      ['Lionel Messi', 'FW', 96, 99, 96, 40, 82, 97, 170], ['Cristiano Ronaldo', 'FW', 97, 90, 82, 40, 90, 96, 187], ['Kylian Mbapp\u00e9', 'FW', 93, 94, 82, 40, 99, 90, 178],
      ['Erling Haaland', 'FW', 97, 80, 68, 46, 94, 90, 195], ['Kevin De Bruyne', 'MF', 88, 88, 99, 64, 76, 92, 181], ['Mohamed Salah', 'FW', 92, 92, 86, 46, 93, 90, 175],
      ['Vin\u00edcius J\u00fanior', 'FW', 86, 97, 80, 36, 97, 82, 176], ['Jude Bellingham', 'MF', 86, 90, 88, 80, 84, 92, 186], ['Lamine Yamal', 'FW', 84, 95, 88, 36, 90, 86, 180],
      ['Harry Kane', 'FW', 96, 82, 90, 48, 70, 93, 188], ['Rodri', 'MF', 78, 82, 92, 92, 66, 96, 191], ['Luka Modri\u0107', 'MF', 78, 92, 96, 74, 72, 96, 172],
      ['Virgil van Dijk', 'DF', 60, 72, 78, 97, 80, 95, 195], ['Victor Osimhen', 'FW', 90, 82, 68, 44, 94, 84, 186], ['Bukayo Saka', 'FW', 86, 92, 86, 60, 88, 88, 178],
      ['Neymar', 'FW', 88, 98, 92, 36, 88, 84, 175], ['Robert Lewandowski', 'FW', 96, 84, 80, 44, 76, 92, 185], ['Pedri', 'MF', 74, 92, 94, 70, 76, 92, 174],
      ['Declan Rice', 'MF', 72, 78, 86, 92, 78, 88, 188], ['William Saliba', 'DF', 44, 72, 78, 94, 86, 88, 192], ['Achraf Hakimi', 'DF', 72, 86, 84, 82, 96, 82, 181],
      ['Florian Wirtz', 'MF', 84, 93, 92, 52, 80, 86, 177], ['Son Heung-min', 'FW', 92, 88, 82, 44, 90, 88, 183], ['Antoine Griezmann', 'FW', 88, 88, 90, 60, 78, 92, 176],
      ['Pel\u00e9', 'FW', 97, 97, 92, 50, 92, 97, 173], ['Diego Maradona', 'FW', 92, 99, 94, 40, 86, 94, 165], ['Zinedine Zidane', 'MF', 86, 96, 96, 62, 74, 97, 185],
      ['Ronaldo Naz\u00e1rio', 'FW', 98, 98, 80, 36, 97, 92, 183], ['Ronaldinho', 'FW', 88, 99, 94, 38, 86, 88, 181], ['Thierry Henry', 'FW', 94, 92, 84, 42, 97, 90, 188],
      ['Jay-Jay Okocha', 'MF', 82, 98, 88, 50, 82, 84, 173], ['Paolo Maldini', 'DF', 50, 74, 78, 99, 82, 97, 186], ['Andr\u00e9s Iniesta', 'MF', 76, 96, 97, 62, 76, 96, 171],
      ['Xavi', 'MF', 72, 88, 99, 68, 66, 97, 170], ['Nwankwo Kanu', 'FW', 86, 92, 84, 40, 74, 88, 197], ['Didier Drogba', 'FW', 93, 82, 74, 52, 86, 94, 188],
      ['Samuel Eto\u2019o', 'FW', 94, 90, 78, 44, 95, 90, 180], ['Yaya Tour\u00e9', 'MF', 84, 86, 88, 84, 82, 90, 188], ['George Weah', 'FW', 92, 94, 78, 44, 96, 88, 184],
    ],
  };

  const LABEL = { coach: 'Coach', mates: 'Teammates', morale: 'Morale', fame: 'Fame', health: 'Fitness', money: 'Money', bond: 'Partner', heat: 'Rivalry' };

  const ovr = (s) => Math.round(avg(KEYS.map((k) => s.st[k])));
  const worth = (s) => s.money + s.inv.reduce((t, i) => t + i.amt, 0);
  const cfg = (s) => SPORTS[s.sport];
  const tx = (s, str) => str.replace(/\{(\w+)\}/g, (_, k) => (k === 'partner' ? (s.partner ? s.partner.name : 'your partner') : k === 'team' ? s.team : k === 'name' ? s.name : s.names[k]));
  const say = (s, t) => { s.log.push({ a: s.age, t: tx(s, t) }); if (s.log.length > 80) s.log.shift(); };

  // Apply stat changes; returns [label, amount] pairs for the outcome card.
  function ch(s, d) {
    const out = [];
    for (const k in d) {
      const v = d[k];
      if (!v) continue;
      if (k === 'money') s.money = Math.round(s.money + v);
      else if (k in s.st) s.st[k] = clamp(s.st[k] + v, 30, 99);
      else if (k === 'bond') { if (!s.partner) continue; s.partner.bond = clamp(s.partner.bond + v); }
      else s[k] = clamp(s[k] + v);
      out.push([k in s.st ? cfg(s).stats[k] : LABEL[k], v]);
    }
    return out;
  }

  const salaryFor = (tier, o) => Math.round([0, 900, 500, 250][tier] * clamp(0.5 + (o - 60) / 25, 0.4, 2));
  function moveTeam(s, tier) {
    const opts = cfg(s).teams[tier].filter((t) => t !== s.team);
    s.team = pick(opts); s.tier = tier; s.teams++;
    s.names.exCoach = s.names.coach; s.names.coach = person(); s.names.mate = person();
    s.coach = 55; s.mates = 50; s.contract = 3; s.salary = salaryFor(tier, ovr(s));
    s.f.feud = 0;
  }

  // ---------- training arcs (one per off-season) ----------
  const ARCS = [
    { id: 'jumper', n: 'Rebuild your shot', d: 'Tear the technique down and start again.', run: (s) => R() < 0.75 ? ['Ten thousand reps. It finally feels like yours.', { sho: ri(4, 7) }] : ['The new technique will not settle. You start the season thinking about your elbow.', { sho: -2, morale: -6 }] },
    { id: 'altitude', n: 'Altitude camp', d: 'Six weeks of running up a mountain.', run: (s) => R() < 0.82 ? ['You come back lighter and quicker than you have ever been.', { ath: ri(4, 6), health: 8 }] : ['Something pops in week four. The physio shakes her head.', { ath: 1, health: -28 }] },
    { id: 'film', n: 'Film room with a retired great', d: 'Costly. Mostly sitting and watching.', run: (s) => ['“Stop. Rewind. Why did you rush that?” Three hundred times.', { cmp: ri(4, 6), pas: 2, money: -40 }] },
    { id: 'tour', n: 'Brand tour abroad', d: 'Airports, photo shoots, very little training.', run: (s) => ['Your face is on a bus in three countries. {coach} is not impressed.', { fame: 10, money: 60 + s.fame * 2, coach: -8, ath: -1 }] },
    { id: 'country', n: 'Play for your country', d: 'A summer tournament and no rest.', run: (s) => ['The anthem, the shirt, the pressure. You grow up fast.', { cmp: 3, fame: 8, health: -12, def: 1 }] },
    { id: 'home', n: 'Rest at home', d: 'Sleep, family and your mother’s cooking.', run: (s) => ['You remember why you started. The body thanks you.', { health: 25, morale: 15, bond: 10 }] },
    { id: 'rival', n: 'Train with {rival}', d: 'Your oldest rival has rented a gym.', run: (s) => ['Neither of you will admit it helped. It helped.', { drv: 3, def: 3, heat: -20 }] },
    { id: 'retire', n: 'Announce your retirement', d: 'One last season, then you walk away.', when: (s) => s.age >= 33, run: (s) => { s.f.retire = 1; return ['You tell the press this season is your last. The tributes begin.', { fame: 8, morale: 10 }]; } },
  ];

  // ---------- events ----------
  // choice = [button label, outcome text, stat changes, optional extra (may return a replacement [text, changes])]
  const EVENTS = [
    { id: 'bench', when: (s) => s.coach < 55 && !s.f.feud, title: 'Dropped', text: '{coach} leaves you out of the biggest game of the month and does not say why.', c: [
      ['Confront him', 'You say it in front of the whole squad. The room goes silent.', { coach: -18, mates: 4 }, (s) => { s.f.feud = 1; }],
      ['Outwork everyone', 'First in, last out, all week. He notices. He says nothing.', { coach: 10, morale: -6, cmp: 1 }],
      ['Leak it to the press', 'The story runs on the back page. He knows exactly who talked.', { coach: -28, fame: 6 }, (s) => { s.f.feud = 1; s.f.leaked = 1; }],
    ] },
    { id: 'ultimatum', pri: 1, when: (s) => s.f.feud && s.coach < 32, title: 'Him or me', text: 'It has gone too far with {coach}. The chairman calls you both upstairs.', c: [
      ['Demand a move', 'You are gone within the week, and the fans are split on whose fault it was.', { fame: 4, morale: -5 }, (s) => { s.f.badExit = 1; moveTeam(s, clamp(s.tier + (R() < 0.5 ? 0 : 1), 1, 3)); }],
      ['Apologise in public', 'It costs you some pride. The dressing room respects it.', { coach: 28, mates: 8, fame: -4 }, (s) => { s.f.feud = 0; }],
      ['Say nothing', 'You stare at the table. So does he. Nothing is settled.', { morale: -10, coach: -4 }],
    ] },
    { id: 'reunion', once: 1, when: (s) => s.f.badExit && s.names.exCoach && s.seasons.length - (s.seen.ultimatum || 0) >= 2, title: 'Old faces', text: 'Your new side draws your old one. {exCoach} is waiting in the tunnel.', c: [
      ['Shake his hand', 'A nod, a handshake, and something heavy is put down.', { morale: 10, cmp: 2 }],
      ['Walk straight past', 'The cameras catch it. You play angry, and well.', { fame: 5, heat: 5, morale: 4 }],
    ] },
    { id: 'ballhog', when: (s) => s.mates < 62, title: 'Words in the dressing room', text: '{mate} says, loudly, that you never pass.', c: [
      ['Laugh it off', 'You set him up twice next game. Point made, quietly.', { mates: 10, pas: 1 }],
      ['Tell him to earn it', 'Half the room is with you. The other half is not.', { mates: -12, morale: 3 }, (s) => { s.f.mateFeud = 1; }],
      ['Take it to the coach', 'Nobody likes that you went upstairs.', { mates: -8, coach: 5 }],
    ] },
    { id: 'fight', when: (s) => s.f.mateFeud && s.mates < 45, title: 'Training ground', text: 'A late tackle from {mate} in a small-sided game. Then a shove.', c: [
      ['Shove back', 'It takes four teammates to pull you apart. Someone filmed it.', { mates: -10, fame: 5, coach: -8 }],
      ['Walk away', 'You keep walking. It is the hardest thing you do all year.', { cmp: 2, mates: 6 }, (s) => { s.f.mateFeud = 0; }],
      ['Buy him dinner', 'An awkward meal, then a good one. You find you grew up ten streets apart.', { mates: 16, money: -1 }, (s) => { s.f.mateFeud = 0; }],
    ] },
    { id: 'captain', once: 1, when: (s) => s.mates > 72 && s.seasons.length >= 3, title: 'The armband', text: 'The squad votes. They want you as captain.', c: [
      ['Accept', 'You give the first team talk of your life. Your voice shakes only once.', { cmp: 3, fame: 6, mates: 5 }, (s) => { s.f.captain = 1; }],
      ['Turn it down', 'You say {mate} deserves it more. He never forgets that.', { mates: 10 }],
    ] },
    { id: 'kid', once: 1, when: (s) => s.age >= 29, title: 'The kid', text: 'A nineteen-year-old is taking your minutes, and he is good.', c: [
      ['Mentor him', 'You teach him everything. He thanks you in his first big interview.', { mates: 12, fame: 4, morale: 4 }],
      ['Freeze him out', 'You keep your place, for now. The room gets colder.', { mates: -14, coach: -6 }],
    ] },
    { id: 'trash', when: (s) => s.heat > 35, title: 'Talk', text: '{rival} tells a reporter you were never the best player on your own street.', c: [
      ['Answer on the court', 'You say nothing and circle the fixture.', { cmp: 2, heat: 8 }],
      ['Fire back online', 'It gets two million views. Your coach sighs.', { fame: 8, heat: 15, coach: -4 }],
    ] },
    { id: 'rivalhurt', once: 1, when: (s) => s.seasons.length >= 4, title: 'Bad news', text: '{rival} has torn a knee ligament. The word is the season is over, perhaps more.', c: [
      ['Visit the hospital', 'You talk for three hours, about everything except the game.', { heat: -35, morale: 6 }, (s) => { s.f.rivalFriend = 1; }],
      ['Send a message', 'A short reply comes back. Thanks.', { heat: -10 }],
      ['Stay out of it', 'You tell yourself it is not your business.', {}],
    ] },
    { id: 'meet', when: (s) => !s.partner && s.age >= 19, title: 'Someone new', text: 'Three people keep turning up in your life this year.', c: [
      ['The old friend from home', 'You have known each other since you were nine. It is easy.', { morale: 10 }, (s) => { s.partner = { name: pick(PARTNERS), bond: 60, kind: 'home' }; }],
      ['The famous one', 'Your first photo together is everywhere by morning.', { fame: 12, morale: 6 }, (s) => { s.partner = { name: pick(PARTNERS), bond: 45, kind: 'famous' }; }],
      ['Stay single', 'The game comes first, you say.', { cmp: 1 }],
    ] },
    { id: 'time', when: (s) => s.partner && s.partner.bond < 55, title: 'Away again', text: '{partner} says you are never really home, even when you are.', c: [
      ['Take a week off', 'You miss a game. It is the best week of the year.', { bond: 22, coach: -8, morale: 8 }],
      ['Promise the summer', 'A promise is made. It will be remembered.', { bond: 6 }, (s) => { s.f.promised = 1; }],
      ['Say the job is the job', 'A long silence on the phone.', { bond: -18 }],
    ] },
    { id: 'scandal', when: (s) => s.fame > 55, title: 'Front page', text: 'A tabloid prints photos of you leaving a club at four in the morning, two days before a game.', c: [
      ['Own it and apologise', 'A dull statement. The story dies in a day.', { fame: -2, coach: -4, bond: -6 }],
      ['Deny everything', 'Then the video comes out.', { fame: 6, coach: -12, bond: -16, morale: -6 }, (s) => { s.f.tabloid = (s.f.tabloid || 0) + 1; }],
      ['Sue the paper', 'Lawyers. So many lawyers.', { money: -80, fame: 4 }, (s) => { s.f.tabloid = (s.f.tabloid || 0) + 1; }],
    ] },
    { id: 'propose', once: 1, when: (s) => s.partner && s.partner.bond > 74 && !s.f.married, title: 'A question', text: 'It has been on your mind for months. {partner} is across the table, laughing at something.', c: [
      ['Ask', 'Yes, before you have finished the sentence.', { bond: 15, morale: 15 }, (s) => { s.f.married = 1; }],
      ['Not yet', 'You order dessert instead.', {}],
    ] },
    { id: 'baby', once: 1, when: (s) => s.f.married && s.partner && s.partner.bond > 50, title: 'Three in the morning', text: 'Your first child is born the night before an away game.', c: [
      ['Stay at the hospital', 'You miss the game and you would do it again.', { bond: 15, morale: 15, coach: -5 }, (s) => { s.f.kids = (s.f.kids || 0) + 1; }],
      ['Fly out at dawn', 'You play on no sleep and dedicate the game to them.', { fame: 5, bond: -8, health: -8 }, (s) => { s.f.kids = (s.f.kids || 0) + 1; }],
    ] },
    { id: 'split', pri: 1, when: (s) => s.partner && s.partner.bond < 18, title: 'The end of it', text: '{partner} has packed a bag. Neither of you is surprised.', c: [
      ['Let it end kindly', 'You help carry the bags down. It hurts for a long time.', { morale: -14 }, (s) => { s.partner = null; s.f.married = 0; }],
      ['Fight for it', 'A long night of talking.', {}, (s) => (R() < 0.4 ? ['Somehow, by morning, the bag is unpacked.', { bond: 30, morale: 5 }] : (s.partner = null, s.f.married = 0, ['It was already over. The papers get hold of it.', { morale: -20, fame: 3 }]))],
    ] },
    { id: 'boots', once: 1, when: (s) => s.fame > 40, title: 'The shoe deal', text: 'Your agent has two offers on the table.', c: [
      ['Take the big cheque', 'A global brand, a flat fee, your face on a billboard.', { money: 400, fame: 6 }],
      ['Start your own line', 'No money up front and your name on the tongue. It rides on your fame.', { fame: 3 }, (s) => { s.inv.push({ n: 'Your signature line', amt: 150, kind: 'brand' }); }],
    ] },
    { id: 'cousin', once: 1, when: (s) => s.money > 300, title: 'A family matter', text: 'Your cousin has a restaurant plan, a logo and a very long text message.', c: [
      ['Put in $200k', 'He cries. You hope the food is good.', { money: -200, morale: 4 }, (s) => { s.inv.push({ n: 'Cousin’s restaurant', amt: 200, kind: 'resto' }); }],
      ['Say no, gently', 'Christmas is going to be awkward.', { morale: -4 }],
    ] },
    { id: 'app', when: (s) => s.money > 150, title: 'Cannot miss', text: '{mate} is evangelical about a new trading app. Half the squad are in.', c: [
      ['Put in $100k', 'You check the price before every training session.', { money: -100 }, (s) => (R() < 0.2 ? ['It quadruples. You get out the same week.', { money: 400, mates: 4 }] : ['The founder is last seen boarding a flight. The money is gone.', { morale: -8, mates: -4 }])],
      ['Stay out', 'You watch from the side. It is the right call more often than not.', { cmp: 1 }],
    ] },
    { id: 'skim', once: 1, when: (s) => worth(s) > 2500, title: 'The numbers', text: 'Your accounts do not add up. Your adviser says not to worry.', c: [
      ['Order an audit', 'He has been skimming for years. You recover most of it.', { money: -60, cmp: 1 }],
      ['Trust him', 'You sign where he tells you to sign.', {}, (s) => { const lost = Math.round(s.money * 0.3); return ['By the time you look again, a third of your cash has gone.', { money: -lost, morale: -10 }]; }],
    ] },
    { id: 'court', once: 1, when: (s) => s.money > 250 && s.seasons.length >= 2, title: 'Where you started', text: 'The court where you learned to play is being sold to a developer.', c: [
      ['Buy it and rebuild it', 'They paint your name on the wall. You ask them to paint over it. They refuse.', { money: -250, fame: 8, morale: 12 }, (s) => { s.f.gaveBack = 1; }],
      ['Sign a petition', 'It becomes a car park.', { morale: -5 }],
    ] },
    { id: 'side', when: (s) => s.fame > 30, title: 'A side thing', text: 'Offers are coming in that have nothing to do with the game.', c: [
      ['Start a podcast', 'Two microphones and too many opinions. People listen.', { fame: 7, money: 40, coach: -4 }, (s) => { s.f.sides = (s.f.sides || 0) + 1; }],
      ['Record a verse', 'It is not good. It goes platinum anyway.', { fame: 10, mates: 4, cmp: -1 }, (s) => { s.f.sides = (s.f.sides || 0) + 1; }],
      ['Stick to sport', 'You go to the gym instead.', { ath: 1 }],
    ] },
    { id: 'injury', when: (s) => s.health < 62 || R() < 0.12, title: 'Something tore', text: 'You land badly and feel it straight away. The scan shows a partial tear.', c: [
      ['Play through it', 'Tape, painkillers and gritted teeth.', {}, (s) => (R() < 0.45 ? ['It holds. Just. Your teammates know what it cost you.', { mates: 8, health: -15 }] : (s.f.injured = 1, ['It goes completely in the second game. You are out for months.', { health: -35, morale: -12 }]))],
      ['Rest and therapy', 'Six slow weeks in the pool. You come back sound.', { health: 12, coach: -3 }],
      ['Have the surgery', 'You miss most of the season, and the knee is as good as new.', { health: 40, morale: -6 }, (s) => { s.f.injured = 1; }],
    ] },
    { id: 'contract', pri: 1, when: (s) => s.contract <= 0, title: 'Contract year', text: 'Your deal is up. Three roads.', c: [
      ['Stay loyal', 'You sign for less than you could have asked for. The fans sing your name.', { fame: 5, mates: 8, coach: 6, morale: 6 }, (s) => { s.contract = 4; s.salary = Math.round(salaryFor(s.tier, ovr(s)) * 0.85); }],
      ['Join a contender', 'A better team and a smaller role.', { fame: 3 }, (s) => (ovr(s) >= 74 ? (moveTeam(s, Math.max(1, s.tier - 1)), ['They roll out the carpet. New city, new shirt.', { morale: 6 }]) : (s.contract = 2, s.salary = salaryFor(s.tier, ovr(s)), ['Nobody bigger calls. You re-sign on a short deal.', { morale: -8 }]))],
      ['Chase the money', 'A struggling team offers a number with a lot of zeroes.', { fame: -3 }, (s) => { moveTeam(s, 3); s.salary = Math.round(s.salary * 2.2); }],
    ] },
    { id: 'bait', when: (s) => s.seasons.length >= 1, title: 'Press room', text: 'After a bad loss a reporter asks whether your teammates let you down.', c: [
      ['“We lose together”', 'A dull answer and the right one.', { mates: 8, cmp: 1 }],
      ['“Ask them”', 'It leads every bulletin that night.', { mates: -14, fame: 6 }, (s) => { s.f.mateFeud = 1; }],
      ['Walk out', 'The empty chair gets its own headline.', { fame: 4, coach: -5 }],
    ] },
    { id: 'pills', once: 1, when: (s) => s.age >= 27 && s.st.ath < 82, title: 'A quiet word', text: 'A man at the gym says he has something that will give you your legs back. Untraceable, he says.', c: [
      ['Take it', 'You feel twenty-two again.', { ath: 6, health: 5 }, (s) => { s.f.doped = 1; }],
      ['Report him', 'The league thanks you. He is never seen at the gym again.', { fame: 3, cmp: 1 }],
      ['Walk away', 'You finish your set and go home.', {}],
    ] },
    { id: 'test', pri: 1, once: 1, when: (s) => s.f.doped && R() < 0.5, title: 'A letter from the league', text: 'Your sample from last month has been flagged.', c: [
      ['Admit it', 'A suspension, a statement and a long road back.', { fame: -20, mates: -10, coach: -10, morale: -15 }, (s) => { s.f.injured = 1; s.f.banned = 1; }],
      ['Blame a supplement', 'Nobody believes you. The ban is longer.', { fame: -30, mates: -18, coach: -15, morale: -20 }, (s) => { s.f.injured = 1; s.f.banned = 1; }],
    ] },
    { id: 'promise', once: 1, when: (s) => s.f.promised && s.partner, title: 'The summer you promised', text: '{partner} has not forgotten. Neither has your agent, who has booked you a tour.', c: [
      ['Keep the promise', 'Three weeks with no phone. You had forgotten what quiet sounded like.', { bond: 25, morale: 12, money: -30 }],
      ['Do the tour', 'You call from four time zones. It is not the same.', { bond: -25, money: 120, fame: 5 }],
    ] },
    { id: 'bestman', once: 1, when: (s) => s.f.rivalFriend && s.f.married, title: 'An invitation', text: '{rival} is getting married and asks you to stand beside him.', c: [
      ['Say yes', 'Your speech is mostly about a game when you were twelve. He still says he won it.', { morale: 15, heat: -30, fame: 3 }],
      ['Make an excuse', 'You regret it before you have put the phone down.', { morale: -8 }],
    ] },
  ];

  // ---------- origins: where the story starts. Each one changes the opening and brings its own events. ----------
  const ORIGINS = [
    { id: 'single', n: 'Raised by a single mother', d: 'One income, one small flat, one person in the stands every week.', st: { cmp: 3 }, d0: { morale: 10, money: -20 } },
    { id: 'abroad', n: 'Left home to chase it', d: 'A one-way ticket at sixteen. New country, new language, nobody you know.', st: { cmp: 2, ath: 1 }, d0: { morale: -10 } },
    { id: 'bottom', n: 'Came from nothing', d: 'Borrowed shoes and a court with no nets. You are hungrier than all of them.', st: { ath: 3, drv: 1 }, d0: { money: -20, heat: 10 } },
    { id: 'nepo', n: 'Born into the game', d: 'Your father was a star. Every door opens, and everyone is watching you walk through.', st: { cmp: -3 }, d0: { money: 500, fame: 30, coach: -10, mates: -12 } },
    { id: 'steady', n: 'An ordinary kid, doing it right', d: 'No drama and no shortcuts. Homework done, kit packed the night before.', st: { cmp: 4 }, d0: { coach: 10 } },
    { id: 'own', n: 'Write your own', d: 'One line of backstory, in your words. No head start, no handicap.', st: {}, d0: {} },
  ];
  const ORIG = Object.fromEntries(ORIGINS.map((o) => [o.id, o]));

  EVENTS.push(
    { id: 'house', once: 1, when: (s) => s.origin === 'single' && s.money > 400, title: 'First real money', text: 'Your mother still takes the early bus to her cleaning shift.', c: [
      ['Buy her a house', 'She cries in the kitchen of a house she owns. So do you.', { money: -350, morale: 20, cmp: 2 }, (s) => { s.f.gaveBack = 1; }],
      ['Retire her, quietly', 'A monthly transfer, and a firm word about the early bus.', { money: -80, morale: 10 }],
      ['Invest it first', 'She says she understands. She does. It still sits with you.', { morale: -6 }],
    ] },
    { id: 'father', once: 1, when: (s) => s.origin === 'single' && s.fame > 45, title: 'A stranger at the gate', text: 'A man you have not seen since you were four is waiting outside training. He has your eyes.', c: [
      ['Hear him out', 'One coffee. It answers some things and not others.', { morale: 6, cmp: 2 }],
      ['Send him away', 'You get in the car without a word, and play angry for a month.', { morale: -6, drv: 1 }],
      ['Write him a cheque', 'He takes it. You never learn whether that was all he came for.', { money: -100, morale: -4 }],
    ] },
    { id: 'visa', once: 1, when: (s) => s.origin === 'abroad' && s.seasons.length <= 2, title: 'Paperwork', text: 'Your work permit is stuck in a queue. Without it you cannot play.', c: [
      ['Hire the costly lawyer', 'Sorted in a week. You try not to look at the invoice.', { money: -60 }],
      ['Wait it out', 'You miss the first month and watch from the stands.', { coach: -8, morale: -8, cmp: 1 }],
    ] },
    { id: 'homesick', when: (s) => s.origin === 'abroad' && s.morale < 62, title: 'Three in the morning, back home', text: 'It is your grandmother’s birthday. The whole family is on a video call, and you are in a hotel in a city you cannot pronounce.', c: [
      ['Fly home for two days', 'Jollof, noise, your old bed. You come back lighter.', { morale: 18, coach: -6, health: -4 }],
      ['Stay and train', 'You hang up and go to the gym. It is what you came here for.', { cmp: 2, morale: -6 }],
      ['Bring the family over', 'Six tickets and a bigger flat. The loneliness stops.', { money: -120, morale: 22 }],
    ] },
    { id: 'flag', once: 1, when: (s) => s.origin === 'abroad' && s.seasons.length >= 2 && ovr(s) >= 76, title: 'Two flags', text: 'Both countries want you: the one you left, and the one that made you a player.', c: [
      ['The country you left', 'The airport is full when you land. Children are wearing your name.', { fame: 10, morale: 12 }],
      ['The country you live in', 'A better squad and a bigger stage. Back home, some call you a traitor.', { fame: 6, money: 150, morale: -6 }],
    ] },
    { id: 'crew', once: 1, when: (s) => s.origin === 'bottom' && s.fame > 28, title: 'The boys from the block', text: 'Four friends from home arrive with suitcases. They say they are your team now.', c: [
      ['Put them on the payroll', 'The house is never quiet again. {coach} asks who all these people are.', { money: -150, morale: 8, coach: -6 }, (s) => { s.f.entourage = 1; }],
      ['Find them real jobs', 'Two of them stick at it. Two never speak to you again.', { money: -30, cmp: 1 }],
      ['Send them home', 'It is the right call, and it costs you something you do not get back.', { morale: -12, cmp: 2 }],
    ] },
    { id: 'cheque', once: 1, when: (s) => s.origin === 'bottom' && s.money > 250, title: 'The first big cheque', text: 'More money than your street has ever seen, in a single transfer.', c: [
      ['Spend it loudly', 'A car the colour of a traffic cone. You love it for a month.', { money: -200, fame: 6, morale: 8 }],
      ['Send half home', 'Your aunt builds a second floor. Your name is said in prayers.', { money: -125, morale: 14 }],
      ['Lock it away', 'Nobody claps for a savings account. You do it anyway.', { cmp: 2 }],
    ] },
    { id: 'surname', once: 1, when: (s) => s.origin === 'nepo', title: 'The surname', text: 'A banner in the away end reads DADDY’S BOY. Your own teammates laugh a little too long.', c: [
      ['Let your game answer', 'You say nothing and have your best month of the season.', { cmp: 3, mates: 6 }],
      ['Wear your first name', 'The new shirt sells out. Your father does not call for a month.', { fame: 8, morale: -4 }],
      ['Complain to the club', 'A statement is issued. The dressing room rolls its eyes.', { mates: -10, coach: -4 }],
    ] },
    { id: 'family', once: 1, when: (s) => s.origin === 'nepo' && s.seasons.length >= 2, title: 'Family business', text: 'Your father wants to run your career himself. He has, he reminds you, done all this before.', c: [
      ['Let him', 'The deals get bigger. He is in every meeting, including the ones with your coach.', { money: 300, coach: -10, morale: -4 }],
      ['Hire your own agent', 'Sunday dinners are quiet for a year. The career is yours.', { morale: -8, cmp: 3, coach: 4 }],
    ] },
    { id: 'degree', once: 1, when: (s) => s.origin === 'steady' && s.seasons.length >= 1, title: 'Night classes', text: 'Your old teacher says you could finish the degree part-time. Nobody in the dressing room would understand why.', c: [
      ['Enrol', 'Essays on the team bus. You will read every contract you ever sign.', { cmp: 3, mates: -3 }, (s) => { s.f.degree = 1; s.seen.skim = 0; }],
      ['Not now', 'The form stays in a drawer.', {}],
    ] },
    { id: 'nightout', when: (s) => s.origin === 'steady' && s.seasons.length >= 1, title: 'The night before', text: 'The whole squad is going out the night before a big game. They want you there.', c: [
      ['Go home and sleep', 'They call you boring. You are also the freshest player on the pitch.', { coach: 6, mates: -5, health: 4 }],
      ['One drink, then home', 'You show your face and leave by ten.', { mates: 5 }],
      ['Stay till closing', 'A great night. A terrible morning.', { mates: 10, coach: -10, health: -8 }],
    ] },
  );
  const EV = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
  const ARC = Object.fromEntries(ARCS.map((a) => [a.id, a]));

  function pickEvent(s) {
    const n = s.seasons.length;
    const ok = EVENTS.filter((e) => e.when(s) && (s.seen[e.id] === undefined || (!e.once && n - s.seen[e.id] >= 4)));
    if (!ok.length) return null;
    const e = ok.find((x) => x.pri) || pick(ok);
    s.seen[e.id] = n;
    return e.id;
  }

  // ---------- career start ----------
  function create({ name, sport, arch, origin, story, look }) {
    const s = {
      v: 2, cap: {}, src: {}, h: 0, look: Object.assign({ skin: 4, hair: 'fade', beard: 0, band: 0 }, look), name: (name || '').trim().slice(0, 18) || 'The Kid', sport, arch, age: 18,
      st: {}, coach: 55, mates: 50, morale: 60, fame: 5, health: 85, heat: 40, money: 20,
      partner: null, inv: [], f: {}, seen: {}, log: [], seasons: [], grades: [], days: 2, note: '',
      names: { coach: person(), mate: person(), rival: person(), exCoach: '' },
      team: '', tier: 3, teams: 0, contract: 4, salary: 0, titles: 0, mvps: 0, stars: 0, peak: 0,
      steps: [], si: 0, cur: { t: 'draw', left: KEYS.slice(), card: null, respin: 2, used: [] },
    };
    s.origin = ORIG[origin] ? origin : 'steady';
    s.story = s.origin === 'own' ? (story || '').trim().slice(0, 90) : '';
    ch(s, ORIG[s.origin].d0);
    s.money = Math.max(0, s.money);
    return s;
  }

  function spin(s) {
    const c = s.cur;
    if (c.card) { if (!c.respin) return; c.respin--; }
    const p = pick(POOL[s.sport].filter((x) => !c.used.includes(x[0])));
    c.used.push(p[0]);
    c.card = { n: p[0], pos: p[1], r: Object.fromEntries(KEYS.map((k, i) => [k, p[i + 2]])), h: p[8] };
    c.reel = Array.from({ length: 11 }, () => pick(POOL[s.sport])[0]).concat(p[0]); // names that fly past
  }

  // Take one thing from the player on the card: a rating (it becomes your ceiling) or, on the last spin, his frame.
  function place(s, key) {
    const c = s.cur;
    if (!c.card) return;
    if (!c.left.length) { s.h = c.card.h; s.src.h = c.card.n; return signUp(s); }
    if (!c.left.includes(key)) return;
    s.cap[key] = c.card.r[key]; s.src[key] = c.card.n;
    s.st[key] = clamp(c.card.r[key] - ri(10, 16), 30, 99); // you are 18: the ceiling is his, the rest is work
    c.card = null; c.left = c.left.filter((k) => k !== key);
  }

  const build = (s) => { const b = cfg(s).body; return s.h >= b.tall ? 'tall' : s.h <= b.short ? 'short' : 'mid'; };
  const fmtH = (sport, h) => (sport === 'bb' ? Math.floor(h / 12) + '\u2032' + (h % 12) + '\u2033' : (h / 100).toFixed(2) + ' m');

  function signUp(s) {
    const m = Object.assign({}, cfg(s).arch.find((x) => x.id === s.arch).m);
    for (const add of [ORIG[s.origin].st, cfg(s).body.mods[build(s)]]) for (const k in add) m[k] = (m[k] || 0) + add[k];
    for (const k in m) { s.st[k] = clamp(s.st[k] + m[k], 30, 99); s.cap[k] = clamp(s.cap[k] + m[k], 30, 99); }
    const o = ovr(s);
    s.tier = o >= 74 ? 2 : 3; // good prospects still start low: room to climb
    s.team = pick(cfg(s).teams[s.tier]); s.teams = 1; s.salary = salaryFor(s.tier, o); s.peak = o;
    say(s, cfg(s).joined);
    s.cur = { t: 'signed', text: cfg(s).entryText(s.team) };
  }

  // ---------- season script ----------
  function buildSeason(s) {
    s.steps = ['arc', 'event', 'match:Opening night', 'event', 'match:Rivalry game', 'event', 'cut', 'report'];
    s.si = -1; s.grades = []; s.days = 2; s.note = ''; s.final = null;
  }

  function teamStr(s) {
    const g = s.grades.length ? avg(s.grades) : 0.5;
    return [0, 82, 72, 62][s.tier] + (ovr(s) - 72) * 0.6 + (s.mates - 50) * 0.08 + (g - 0.5) * 10;
  }

  function advance(s) {
    if (s.cur.t === 'signed') buildSeason(s);
    if (s.cur.t === 'report') {
      if (s.cur.r.last) { s.cur = { t: 'end', l: legacy(s) }; return; }
      s.age++; buildSeason(s);
    }
    s.si++;
    const step = s.steps[s.si];
    if (step === 'arc') {
      const pool = ARCS.filter((a) => a.id !== 'retire').sort(() => R() - 0.5).slice(0, 3).map((a) => a.id);
      if (s.age >= 33 && !s.f.retire) pool[2] = 'retire';
      s.cur = { t: 'arc', opts: pool };
    } else if (step === 'event') {
      const id = pickEvent(s);
      if (!id) return advance(s);
      s.cur = { t: 'event', id };
    } else if (step.startsWith('match:')) {
      s.cur = { t: 'match', m: newMatch(s, step.slice(6)) };
    } else if (step === 'cut') {
      if (teamStr(s) + ri(-5, 5) >= 81 && !s.f.injured) s.steps.splice(s.si + 1, 0, 'match:' + cfg(s).final);
      return advance(s);
    } else {
      s.cur = { t: 'report', r: endSeason(s) };
    }
  }

  function takeArc(s, i) {
    const a = ARC[s.cur.opts[i]];
    const [text, d] = a.run(s);
    s.cur.out = { text: tx(s, text), d: ch(s, d) };
    say(s, `Off-season: ${tx(s, a.n)}.`);
  }

  function choose(s, i) {
    const e = EV[s.cur.id];
    const [label, text, d, extra] = e.c[i];
    let t = text, deltas = ch(s, d);
    const more = extra && extra(s);
    if (Array.isArray(more)) { t = text + ' ' + more[0]; deltas = deltas.concat(ch(s, more[1])); }
    s.cur.out = { text: tx(s, t), d: deltas };
    say(s, `${tx(s, e.title)}: ${label.toLowerCase().replace(/[“”]/g, '')}.`);
  }

  // ---------- matches: a handful of timed moments ----------
  function newMatch(s, kind) {
    const c = cfg(s), isFinal = kind === c.final;
    const oppTier = isFinal ? 1 : ri(1, 3);
    const opp = kind === 'Rivalry game' ? `${s.names.rival}’s ${pick(c.teams[oppTier].filter((t) => t !== s.team)).split(' ').pop()}` : pick(c.teams[oppTier].filter((t) => t !== s.team));
    const [us, them] = c.base(teamStr(s), [0, 82, 72, 62][oppTier] + (isFinal ? 4 : 0));
    const order = ['off', 'def', 'off', 'def', 'clutch'];
    const star = pick(POOL[s.sport].slice(0, 24).filter((p) => p[1] !== 'DF'))[0];
    return {
      kind, opp, star, us, them, i: 0, hits: 0, mine: 0, opt: null, res: null, done: null, isFinal,
      moments: order.map((k) => ({ k, text: (k === 'clutch' ? c.sit.clutch : pick(c.sit[k])).replace('{star}', star), x: ri(22, 78) })),
    };
  }

  function optsFor(s, kind) {
    const c = cfg(s), list = kind === 'def' ? c.def : c.off;
    if (s.sport === 'bb' && kind !== 'def' && build(s) === 'tall') return list.map((o) => (o.k === 'drv' ? Object.assign({}, o, { l: 'Rise up and dunk', ok: 'You hammer it down. The bench is on its feet.', no: 'Met at the rim and sent back.', bonus: 4 }) : o));
    return list;
  }

  // Green zone grows with the rating; the marker speeds up when it matters.
  function zone(s, key, clutch) {
    const st = s.st[key], g = clamp(8 + (st - 40) * 0.42, 8, 34);
    return { c: ri(28, 72), g, y: 9, period: (clutch ? 780 : 1050) * (0.85 + s.st.cmp / 400) * (s.f.injured ? 0.85 : 1) };
  }

  function pickOpt(s, i) {
    const m = s.cur.m, mo = m.moments[m.i], c = cfg(s);
    const o = optsFor(s, mo.k)[i];
    m.opt = i; m.z = zone(s, o.k, mo.k === 'clutch');
    m.z.g += o.bonus || 0;
  }

  // pos is where the marker stopped, 0 to 100.
  function stop(s, pos) {
    const m = s.cur.m, mo = m.moments[m.i], c = cfg(s);
    const o = optsFor(s, mo.k)[m.opt];
    const dist = Math.abs(pos - m.z.c);
    const q = dist <= m.z.g / 2 ? 'g' : dist <= m.z.g / 2 + m.z.y ? 'y' : 'r';
    const hit = q === 'g' || (q === 'y' && R() < 0.45);
    let text;
    if (hit) {
      const scored = o.pts && R() < (o.p === undefined ? 1 : o.p);
      if (scored) { m.us += o.pts; m.mine += o.pts; }
      text = scored || !o.okNo ? o.ok : o.okNo;
      m.hits++;
    } else {
      const conceded = o.lose && R() < (o.lp === undefined ? 1 : o.lp);
      if (conceded) m.them += o.lose;
      text = conceded || !o.noNo ? o.no : o.noNo;
    }
    m.res = { q, hit, text: text.replace('{star}', m.star) };
  }

  function nextMoment(s) {
    const m = s.cur.m;
    m.opt = null; m.res = null; m.z = null;
    if (++m.i < m.moments.length) return;
    const bb = s.sport === 'bb';
    if (bb && m.us === m.them) (R() < 0.5 ? (m.us += 2) : (m.them += 2)); // overtime
    const g = m.hits / m.moments.length;
    const grade = ['F', 'D', 'C', 'B', 'A', 'A+'][m.hits];
    const win = m.us > m.them, draw = m.us === m.them;
    s.grades.push(g);
    const d = ch(s, { coach: Math.round((g - 0.5) * 16), fame: win ? 2 + (m.isFinal ? 8 : 0) : 0, morale: win ? 5 : draw ? 0 : -5, heat: m.kind === 'Rivalry game' ? 6 : 0 });
    if (m.isFinal) s.final = win ? 'won' : 'lost';
    m.done = { grade, win, draw, d };
    say(s, `${m.kind}: ${win ? 'beat' : draw ? 'drew with' : 'lost to'} ${m.opp} ${m.us}–${m.them}. Grade ${grade}.`);
  }

  // ---------- end of season ----------
  function endSeason(s) {
    const c = cfg(s), o = ovr(s), g = s.grades.length ? avg(s.grades) : 0.5, last = s.name.split(' ').pop().toUpperCase();
    const mf = clamp(0.55 + s.coach / 250 + (o - 70) / 120 + (g - 0.5) * 0.2 + (s.morale - 50) / 400, 0.3, 1.1) * (s.f.injured ? 0.45 : 1);
    const line = c.line(s.st, mf), str = teamStr(s);
    const title = s.final === 'won';
    const awards = [];
    if (title) { awards.push('Champion'); s.titles++; }
    if (o >= 89 && mf > 0.85 && R() < 0.2 + (o - 89) * 0.07 + (title ? 0.2 : 0)) { awards.push(c.mvp); s.mvps++; }
    if (o >= 84 && mf > 0.75) { awards.push(c.star); s.stars++; }
    if (!s.seasons.length && o >= 74 && R() < 0.5) awards.push('Rookie of the Year');
    s.peak = Math.max(s.peak, o);

    const finish = title ? `${s.team} are ${c.title}.` : s.final === 'lost' ? `${s.team} lost ${c.final.replace('The', 'the')}.` : str >= 72 ? `${s.team} ${c.mid}.` : `${s.team} finished in the bottom half.`;
    const head = title ? `${last} LIFTS IT` : awards.includes(c.mvp) ? `${last} NAMED ${c.mvp.toUpperCase()}` : s.f.banned ? `${last} BANNED` : s.f.feud && s.coach < 32 ? `“HIM OR ME”` : s.f.injured ? `A YEAR ON THE TREATMENT TABLE` : s.final === 'lost' ? `SO CLOSE` : g >= 0.7 ? `${last} RUNS THE SHOW` : str < 64 ? `A LONG WINTER` : `STEADY YEAR FOR ${last}`;
    const stand = s.f.banned ? `A failed test costs ${s.name} most of the season.` : s.f.feud && s.coach < 32 && !title ? `${s.name} and ${s.names.coach} are barely speaking. ${finish}` : `${finish} ${s.name}, ${s.age}, averaged ${line.replace(/ · /g, ', ')}.`;

    // money
    const notes = [];
    const fameCash = Math.round(s.fame * s.fame * 0.08);
    s.money += s.salary + fameCash;
    notes.push(`Salary ${money(s.salary)}, endorsements ${money(fameCash)}.`);
    s.inv = s.inv.filter((i) => {
      const before = i.amt;
      if (i.kind === 'idx') i.amt = Math.round(i.amt * (1.04 + R() * 0.06));
      else if (i.kind === 'prop') i.amt = Math.round(i.amt * (R() < 0.12 ? 0.8 : 1.09));
      else if (i.kind === 'brand') i.amt = Math.round(i.amt * (0.85 + s.fame / 150));
      else if (i.kind === 'resto') { if (R() < 0.22) { notes.push(`${i.n} closed. ${money(before)} gone.`); return false; } s.money += Math.round(i.amt * 0.12); }
      else if (i.kind === 'vc') {
        const r = R();
        if (r < 0.12) { s.money += i.amt * 6; notes.push(`${i.n} was bought out: ${money(i.amt * 6)} back.`); return false; }
        if (r < 0.42) { notes.push(`${i.n} folded. ${money(before)} gone.`); return false; }
      }
      return true;
    });

    s.seasons.push({ age: s.age, team: s.team, line, awards, o });
    say(s, `Season over. ${finish}${awards.length ? ' Honours: ' + awards.join(', ') + '.' : ''}`);

    // the year takes its toll
    for (const k of KEYS) {
      const a = s.age, cap = s.cap[k] || 99;
      if (a <= 26) s.st[k] = Math.max(s.st[k], Math.min(cap, s.st[k] + ri(1, 3)));
      else s.st[k] = clamp(s.st[k] + (a <= 30 ? ri(-1, 0) : a <= 32 ? -ri(0, 2) - (k === 'ath' ? 1 : 0) : -ri(1, 3)), 30, 99);
    }
    s.coach = clamp(s.coach - 3 + (title ? 10 : 0)); s.mates = clamp(s.mates - 3 + (title ? 8 : 0));
    if (s.partner) s.partner.bond = clamp(s.partner.bond - (s.f.kids ? 3 : 6));
    s.health = clamp(s.health + 12); s.fame = clamp(s.fame + awards.length * 4 - 1);
    s.contract--; s.f.injured = 0; s.f.banned = 0;
    const done = s.f.retire || s.age >= 39 || (s.age >= 31 && ovr(s) < 64) || s.health <= 5;
    if (done && !s.f.retire) notes.push(s.age >= 39 ? 'The body says enough. You retire.' : 'No club offers terms. You retire.');
    return { head, stand, line, awards, notes, last: !!done, age: s.age, team: s.team, o };
  }

  // ---------- life and money ----------
  const ACTS = {
    coach: { n: 'Dinner with the coach', need: () => true, run: (s) => ['{coach} talks tactics until the restaurant closes.', { coach: 10, money: -2 }] },
    team: { n: 'Team night out', need: () => true, run: (s) => ['Karaoke. There is video. There will always be video.', { mates: 10, health: -4 }] },
    date: { n: 'Time with your partner', need: (s) => !!s.partner, run: (s) => ['No phones. A whole evening.', { bond: 14, morale: 4 }] },
    gym: { n: 'Extra session', need: () => true, run: (s) => { const k = pick(KEYS); return ['Alone in the gym after dark.', { [k]: 1, health: -6 }]; } },
    rest: { n: 'Rest day', need: () => true, run: (s) => ['Feet up. Ice bath. Nothing else.', { health: 15, morale: 3 }] },
  };
  function act(s, id) {
    const a = ACTS[id];
    if (s.days < 1 || !a.need(s)) return;
    s.days--;
    const [t, d] = a.run(s);
    s.note = tx(s, t) + ' ' + ch(s, d).map(([l, v]) => `${l} ${v > 0 ? '+' : '−'}${Math.abs(v)}`).join(', ') + '.';
  }

  const FUNDS = {
    idx: { n: 'Index fund', d: 'Dull. Grows a few per cent a year.' },
    prop: { n: 'Property', d: 'Steady, with the odd bad year.' },
    vc: { n: 'Start-up stake', d: 'Usually worth nothing. Sometimes six times over.' },
  };
  function invest(s, kind) {
    const amt = Math.floor(s.money / 4);
    if (amt < 10) return;
    s.money -= amt;
    const have = s.inv.find((i) => i.kind === kind && kind !== 'vc');
    if (have) have.amt += amt; else s.inv.push({ n: FUNDS[kind].n, amt, kind });
  }
  function cashOut(s, i) {
    const x = s.inv[i];
    if (!x || x.kind === 'resto') return; // family money stays put
    s.money += x.amt; s.inv.splice(i, 1);
  }

  const money = (k) => (Math.abs(k) >= 1000 ? `$${(k / 1000).toFixed(k >= 10000 ? 0 : 1)}M` : `$${Math.round(k)}k`);

  function legacy(s) {
    const n = s.seasons.length, w = worth(s);
    const score = Math.round(s.titles * 10 + s.mvps * 8 + s.stars * 2 + n * 0.5 + s.fame * 0.15 + Math.max(0, s.peak - 75) + Math.min(6, w / 5000) + (s.f.gaveBack ? 5 : 0));
    const rank = score >= 125 ? 'Immortal' : score >= 85 ? 'Hall of Famer' : score >= 55 ? 'Fan favourite' : score >= 32 ? 'Solid professional' : 'What might have been';
    const ribbon = s.f.doped && s.seen.test !== undefined ? 'The Asterisk' : w > 60000 ? 'The Mogul' : s.teams === 1 && n >= 10 ? 'One-Club Legend' : s.teams >= 6 ? 'The Journeyman' : (s.f.tabloid || 0) >= 2 ? 'Tabloid Regular' : s.f.gaveBack ? 'Hometown Hero' : s.f.kids && s.partner ? 'Family First' : (s.f.sides || 0) >= 2 ? 'Multi-Hyphenate' : 'Quiet Pro';
    return { score, rank, ribbon, worth: w, n };
  }

  const G = { SPORTS, KEYS, ORIGINS, ORIG, POOL, optsFor, build, fmtH, ARC, EV, ACTS, FUNDS, create, spin, place, advance, takeArc, choose, pickOpt, stop, nextMoment, act, invest, cashOut, legacy, ovr, worth, money, tx };
  if (typeof module !== 'undefined') module.exports = G; else root.G = G;
})(this);
