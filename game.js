// Back Page: game rules. No DOM in here, so test.js can run whole careers in node.
(function (root) {
  const R = () => Math.random();
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (a) => a[Math.floor(R() * a.length)];
  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
  const ord = (n) => n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  const shuffle = (a) => a.slice().sort(() => R() - 0.5);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

  const KEYS = ['sho', 'drv', 'pas', 'def', 'ath', 'cmp'];

  // A sport is only this config. The life side is shared.
  const SPORTS = {
    bb: {
      name: 'Basketball',
      stats: { sho: 'Shooting', drv: 'Finishing', pas: 'Playmaking', def: 'Defense', ath: 'Athleticism', cmp: 'Composure' },
      teams: [null, ['Harbor City Kings', 'Northgate Comets'], ['Redwater Foxes', 'Lakeshore Herons'], ['Dustbowl Coyotes', 'Port Azure Gulls']],
      body: { tall: 81, short: 75, mods: { tall: { drv: 3, def: 3, ath: -3, sho: -2 }, short: { ath: 3, pas: 2, drv: -2, def: -2 }, mid: {} } },
      mvp: 'MVP', star: 'All-Star', title: 'champions', final: 'The Finals', entry: 'Draft night', joined: 'Drafted by the {team}.', mid: 'went out in the play-offs',
      entryText: (t, n) => `With the ${ord(n)} pick, the ${t} take a chance on you. ${n <= 30 ? 'A four-year rookie deal and a locker by the door.' : 'A two-way contract and a lot to prove.'}`,
      base: (us, them) => [ri(86, 92) + Math.round((us - 70) / 2), ri(86, 92) + Math.round((them - 70) / 2)],
      line: (st, mf, w) => {
        const p = Math.max(2, w[0] * mf * ((st.sho + st.drv) / 2 - 45) * 0.62 + ri(-15, 15) / 10);
        const r = Math.max(1, w[1] * mf * (st.ath + st.def - 90) * 0.09 + ri(-8, 8) / 10);
        const a = Math.max(0.5, w[2] * mf * (st.pas - 45) * 0.2 + ri(-8, 8) / 10);
        return `${p.toFixed(1)} pts · ${r.toFixed(1)} reb · ${a.toFixed(1)} ast`;
      },
      // att: share of your moments spent attacking. w: weights on the season line (pts, reb, ast).
      pos: [
        { id: 'PG', n: 'Point guard', d: 'The ball is in your hands every trip down the floor.', m: { pas: 3, drv: -1, def: -2 }, att: 0.7, off: ['three', 'drive', 'cutter'], def: ['steal', 'contest', 'charge'], w: [1, 0.6, 1.7] },
        { id: 'SG', n: 'Shooting guard', d: 'Get open, get fed, get buckets.', m: { sho: 3, pas: -2, def: -1 }, att: 0.7, off: ['three', 'pullup', 'drive'], def: ['steal', 'contest', 'charge'], w: [1.15, 0.7, 0.9] },
        { id: 'SF', n: 'Small forward', d: 'A bit of everything, at both ends.', m: { def: 1, ath: 1, cmp: -2 }, att: 0.6, off: ['three', 'drive', 'cutter'], def: ['steal', 'contest', 'block'], w: [1, 1, 1] },
        { id: 'PF', n: 'Power forward', d: 'Screens, boards and the dirty work.', m: { def: 2, drv: 1, sho: -3 }, att: 0.5, off: ['pullup', 'post', 'glass'], def: ['contest', 'block', 'charge'], w: [0.95, 1.5, 0.8] },
        { id: 'C', n: 'Centre', d: 'You own the paint. Everyone else is visiting.', m: { def: 3, drv: 1, sho: -4 }, att: 0.45, off: ['post', 'glass', 'kick'], def: ['block', 'contest', 'box'], w: [0.9, 1.9, 0.7] },
      ],
      sit: {
        // [what is happening, the moves that fit it]
        off: [['Shot clock at eight.', ['three', 'pullup', 'drive']], ['Fast break, two against one.', ['drive', 'cutter', 'three']], ['Out of the timeout, the play is drawn for you.', ['three', 'pullup', 'post']],
          ['A switch leaves {star} on you.', ['post', 'drive', 'pullup']], ['Late in the clock, the ball swings your way.', ['three', 'kick', 'pullup']], ['You catch it at the elbow, facing up.', ['pullup', 'drive', 'cutter']],
          ['A shot clangs off the rim and the ball is loose.', ['glass', 'kick']], ['Their run has to stop. The crowd is on its feet.', ['three', 'drive', 'post']],
          ['They pack the paint and dare you to shoot.', ['three', 'kick', 'pullup']], ['You get the ball deep on the block.', ['post', 'kick']]],
        def: [['{star} isolates at the top of the key.', ['contest', 'steal', 'charge']], ['The pick and roll comes straight at you.', ['steal', 'contest', 'block']], ['They push it in transition, {star} leading the break.', ['charge', 'block', 'steal']],
          ['{star} curls off a screen.', ['contest', 'steal']], ['They clear out the side for {star}.', ['contest', 'charge', 'block']], ['A drive and kick. {star} catches it on the wing.', ['contest', 'steal']],
          ['A shot goes up. {star} is crashing the glass.', ['box', 'block']], ['{star} backs you down in the post.', ['contest', 'charge', 'block']]],
        level: 'Tied. {secs} seconds left. The ball is in your hands.',
        behind: 'Down {gap}. {secs} seconds left. The ball is in your hands.',
        ahead: 'Up {gap}. {secs} seconds left. {star} wants the last shot, and you are guarding him.',
        dbl: 'They send a second defender at you.',
      },
      // mech: how the meter behaves. sweep = bounce and stop; drift = the window moves; double = two stops; react = one pass only.
      // vs: which of the opponent's ratings you are up against.
      opts: {
        three: { l: 'Pull up from three', k: 'sho', vs: 'def', mech: 'sweep', pts: 3, ok: 'Splash. Nothing but net.', no: 'Front rim. They run the other way.' },
        pullup: { l: 'Step back for the jumper', k: 'sho', vs: 'def', mech: 'drift', pts: 2, ok: 'Space created, shot buried.', no: '{star} stays attached. Off the side of the rim.' },
        drive: { l: 'Drive to the rim', k: 'drv', vs: 'def', mech: 'double', pts: 2, ok: 'You finish through the contact.', no: 'Stripped in the lane.' },
        cutter: { l: 'Hit the cutter', k: 'pas', vs: 'def', mech: 'drift', pts: 2, ok: 'A dime. Easy two for your teammate.', no: 'Picked off. Turnover.' },
        post: { l: 'Back him down in the post', k: 'drv', vs: 'def', mech: 'double', pts: 2, ok: 'Drop step, soft hook. Two.', no: '{star} holds his ground. You travel.' },
        glass: { l: 'Crash the offensive glass', k: 'ath', vs: 'ath', mech: 'react', pts: 2, ok: 'Up over everyone for the putback.', no: 'Boxed out. They run.' },
        kick: { l: 'Kick it out of the double', k: 'pas', vs: 'def', mech: 'drift', pts: 3, ok: 'Inside out. The corner three drops.', no: 'Thrown into the third row.' },
        steal: { l: 'Jump the passing lane', k: 'ath', vs: 'pas', mech: 'react', pts: 2, ok: 'Steal. You take it coast to coast.', no: 'You gambled. The open three drops.', lose: 3 },
        contest: { l: 'Stay down and contest', k: 'def', vs: 'sho', mech: 'sweep', pts: 0, ok: 'A hand in the face. Tough miss.', no: '{star} rises over you and scores.', lose: 2 },
        charge: { l: 'Plant your feet for the charge', k: 'cmp', vs: 'drv', mech: 'react', pts: 0, ok: 'Offensive foul. You bounce up clapping.', no: 'Blocking foul, and the basket counts.', lose: 3 },
        block: { l: 'Go for the block', k: 'ath', vs: 'drv', mech: 'react', pts: 0, ok: 'Pinned against the glass.', no: 'You leave your feet and {star} lays it in.', lose: 2 },
        box: { l: 'Box out and rebound', k: 'def', vs: 'ath', mech: 'sweep', pts: 0, ok: 'You seal him off. The board is yours.', no: 'Tip-in. {star} wanted it more.', lose: 2 },
      },
    },
    soc: {
      name: 'Soccer',
      stats: { sho: 'Shooting', drv: 'Dribbling', pas: 'Passing', def: 'Defending', ath: 'Pace', cmp: 'Composure' },
      teams: [null, ['Castellan CF', 'Northgate Athletic'], ['Redwater Rovers', 'Lakeshore United'], ['Dunmore Town', 'Port Azure FC']],
      body: { tall: 188, short: 174, mods: { tall: { def: 3, sho: 1, ath: -3 }, short: { ath: 3, drv: 3, def: -3 }, mid: {} } },
      mvp: 'Player of the Year', star: 'Team of the Season', title: 'champions', final: 'The Cup Final', entry: 'Signing day', joined: 'Signed by {team} from the academy.', mid: 'finished in the top half',
      entryText: (t, n) => `${t} sign you from the academy. A four-year deal, the number 27 shirt and a seat at the back of the bus.`,
      base: (us, them) => [(R() < 0.3 + (us - 70) / 100 ? 1 : 0), (R() < 0.4 + (them - 70) / 100 ? 1 : 0)],
      line: (st, mf, w) => {
        const g = Math.max(0, Math.round(w[0] * mf * (st.sho * 0.6 + st.drv * 0.4 - 50) * 0.75 + ri(-2, 2)));
        const a = Math.max(0, Math.round(w[1] * mf * (st.pas - 50) * 0.4 + ri(-2, 2)));
        const rt = clamp(6 + ((avg(KEYS.map((k) => st[k])) - 60) / 15) * mf, 5, 9.6);
        return `${g} goals · ${a} assists · ${rt.toFixed(1)} rating`;
      },
      pos: [
        { id: 'ST', n: 'Striker', d: 'Live in the box. Judged on one number.', m: { sho: 3, def: -3 }, att: 0.75, off: ['shoot', 'header', 'takeon'], def: ['press', 'track'], w: [1.3, 0.7] },
        { id: 'W', n: 'Winger', d: 'Chalk on your boots and a full-back to beat.', m: { drv: 3, def: -2, cmp: -1 }, att: 0.7, off: ['takeon', 'cross', 'shoot'], def: ['track', 'slide'], w: [0.9, 1.2] },
        { id: 'CM', n: 'Midfielder', d: 'Box to box. The game goes through you.', m: { pas: 3, sho: -2, ath: -1 }, att: 0.55, off: ['thread', 'longshot', 'takeon'], def: ['intercept', 'slide', 'hold'], w: [0.6, 1.2] },
        { id: 'DF', n: 'Defender', d: 'Clean sheets, last-ditch blocks and the odd set-piece goal.', m: { def: 4, sho: -3, drv: -1 }, att: 0.3, off: ['header', 'carry', 'switch'], def: ['hold', 'slide', 'intercept'], w: [0.25, 0.4] },
      ],
      sit: {
        off: [['You pick the ball up between the lines.', ['thread', 'takeon', 'longshot']], ['A counter-attack, three against two.', ['takeon', 'thread', 'shoot']], ['{star} shows you the outside.', ['takeon', 'cross']],
          ['A loose ball drops to you on the edge of the box.', ['shoot', 'longshot']], ['A corner. The box is crowded.', ['header']], ['A quick throw-in. They switch off for a second.', ['thread', 'cross', 'takeon']],
          ['Their keeper shanks a clearance. It falls to you.', ['longshot', 'switch', 'carry']], ['A one-two on the edge of the area.', ['shoot', 'thread']],
          ['They sit deep. Nobody closes you down.', ['switch', 'carry', 'longshot']], ['A free kick, twenty-five yards out.', ['shoot', 'cross', 'header']]],
        def: [['{star} runs straight at you.', ['slide', 'hold', 'track']], ['A ball in behind, and {star} is chasing it.', ['track', 'slide']], ['{star} turns in the pocket.', ['intercept', 'hold', 'press']],
          ['A cross is coming. {star} is lurking at the back post.', ['track', 'hold']], ['They break three against two. {star} has the ball.', ['hold', 'slide', 'intercept']], ['{star} drops a shoulder on the edge of the box.', ['hold', 'slide']],
          ['Their keeper takes his time on the ball.', ['press', 'intercept']], ['They play it short from a corner.', ['press', 'intercept', 'track']]],
        level: 'Ninetieth minute, level. The ball breaks to you.',
        behind: 'Stoppage time, a goal down. One last chance falls to you.',
        ahead: 'Stoppage time, a goal up. {star} breaks through and only you are back.',
        dbl: 'Two of them close you down at once.',
      },
      opts: {
        shoot: { l: 'Shoot', k: 'sho', vs: 'def', mech: 'sweep', pts: 1, p: 0.75, ok: 'Top corner. The keeper never moved.', okNo: 'On target, but the keeper claws it away.', no: 'Dragged wide.' },
        header: { l: 'Attack the cross', k: 'ath', vs: 'def', mech: 'react', pts: 1, p: 0.55, ok: 'You rise highest and bury the header.', okNo: 'A towering header, tipped over the bar.', no: '{star} beats you to it.' },
        takeon: { l: 'Take him on', k: 'drv', vs: 'def', mech: 'double', pts: 1, p: 0.5, ok: 'You beat your man and square it. Tap-in.', okNo: 'You skin him, but the cross is cleared.', no: '{star} reads it and takes the ball.' },
        cross: { l: 'Whip in a cross', k: 'pas', vs: 'def', mech: 'drift', pts: 1, p: 0.45, ok: 'Onto the striker’s head. Goal.', okNo: 'A perfect ball. Nobody gambles.', no: 'Straight into the first man.' },
        thread: { l: 'Thread the pass', k: 'pas', vs: 'def', mech: 'drift', pts: 1, p: 0.55, ok: 'Through the eye of a needle. Finished first time.', okNo: 'A lovely ball. The striker skies it.', no: 'Cut out.' },
        longshot: { l: 'Hit it from distance', k: 'sho', vs: 'def', mech: 'sweep', pts: 1, p: 0.4, ok: 'From thirty yards. Top corner.', okNo: 'Swerving and dipping, tipped round the post.', no: 'Row Z.' },
        carry: { l: 'Carry it out from the back', k: 'drv', vs: 'def', mech: 'double', pts: 1, p: 0.25, ok: 'Past one, past two, then a pass through. Goal.', okNo: 'You break the lines and the move goes on.', no: 'Caught in possession. {star} scores.', noNo: 'Caught in possession. A gasp, then a clearance.', lose: 1, lp: 0.35 },
        switch: { l: 'Switch the play', k: 'pas', vs: 'def', mech: 'drift', pts: 1, p: 0.3, ok: 'Sixty yards onto the winger’s toe, and he scores.', okNo: 'Sixty yards onto the winger’s toe. The move goes on.', no: 'Overhit. Throw-in to them.' },
        slide: { l: 'Slide in', k: 'ath', vs: 'drv', mech: 'react', pts: 0, ok: 'A clean tackle. The crowd roars.', no: 'Mistimed. They score from the free kick.', noNo: 'Mistimed. The free kick comes to nothing.', lose: 1, lp: 0.5 },
        hold: { l: 'Hold your position', k: 'def', vs: 'drv', mech: 'sweep', pts: 0, ok: 'You shepherd him wide. Danger over.', no: '{star} cuts inside and finishes.', noNo: '{star} cuts inside and blazes over.', lose: 1, lp: 0.6 },
        press: { l: 'Press the keeper', k: 'ath', vs: 'pas', mech: 'react', pts: 1, p: 0.2, ok: 'You charge it down and it rolls into the net.', okNo: 'You force the long ball. Possession back.', no: 'They play round you easily.' },
        track: { l: 'Track your runner', k: 'ath', vs: 'ath', mech: 'sweep', pts: 0, ok: 'You get back and block the cross.', no: '{star} is free at the back post. Goal.', noNo: '{star} is free at the back post, and heads wide.', lose: 1, lp: 0.45 },
        intercept: { l: 'Read the pass', k: 'def', vs: 'pas', mech: 'drift', pts: 0, ok: 'You step in and steal it. Counter on.', no: 'Wrong guess. {star} is through, and scores.', noNo: 'Wrong guess. {star} is through, but drags it wide.', lose: 1, lp: 0.35 },
      },
    },
  };

  const FIRST = ['Tunde', 'Marcus', 'Chidi', 'Leo', 'Emeka', 'Darius', 'Kofi', 'Mateo', 'Segun', 'Andre', 'Ibrahim', 'Jonas', 'Femi', 'Rafael', 'Kwame', 'Niko'];
  const LAST = ['Okafor', 'Bell', 'Adeyemi', 'Varga', 'Mensah', 'Castro', 'Balogun', 'Reyes', 'Osei', 'Lindqvist', 'Nwosu', 'Marsh', 'Diallo', 'Kovac', 'Eze', 'Santoro'];
  const PARTNERS = ['Amara', 'Zainab', 'Sofia', 'Kemi', 'Elena', 'Tolu', 'Maya', 'Ada', 'Jordan', 'Sam', 'Ife', 'Noor'];
  // Where you are from: the food and the city colour the stories, the region picks the tournament.
  const COUNTRIES = [
    ['AR', 'Argentina', 'Argentine', 'asado', 'Rosario', 'sa'], ['AU', 'Australia', 'Australian', 'a meat pie', 'Melbourne', 'as'], ['BR', 'Brazil', 'Brazilian', 'feijoada', 'S\u00e3o Paulo', 'sa'],
    ['CM', 'Cameroon', 'Cameroonian', 'ndol\u00e9', 'Douala', 'af'], ['CA', 'Canada', 'Canadian', 'poutine', 'Toronto', 'na'], ['CI', 'C\u00f4te d\u2019Ivoire', 'Ivorian', 'atti\u00e9k\u00e9', 'Abidjan', 'af'],
    ['EG', 'Egypt', 'Egyptian', 'koshari', 'Cairo', 'af'], ['EN', 'England', 'English', 'a Sunday roast', 'Manchester', 'eu'], ['FR', 'France', 'French', 'pot-au-feu', 'Paris', 'eu'],
    ['DE', 'Germany', 'German', 'currywurst', 'Dortmund', 'eu'], ['GH', 'Ghana', 'Ghanaian', 'waakye', 'Kumasi', 'af'], ['GR', 'Greece', 'Greek', 'moussaka', 'Athens', 'eu'],
    ['IT', 'Italy', 'Italian', 'rag\u00f9', 'Naples', 'eu'], ['JM', 'Jamaica', 'Jamaican', 'ackee and saltfish', 'Kingston', 'na'], ['JP', 'Japan', 'Japanese', 'ramen', 'Osaka', 'as'],
    ['KE', 'Kenya', 'Kenyan', 'ugali and sukuma', 'Nairobi', 'af'], ['LT', 'Lithuania', 'Lithuanian', 'cepelinai', 'Kaunas', 'eu'], ['MX', 'Mexico', 'Mexican', 'tacos al pastor', 'Guadalajara', 'na'],
    ['MA', 'Morocco', 'Moroccan', 'tagine', 'Casablanca', 'af'], ['NL', 'Netherlands', 'Dutch', 'stamppot', 'Rotterdam', 'eu'], ['NG', 'Nigeria', 'Nigerian', 'jollof', 'Lagos', 'af'],
    ['PT', 'Portugal', 'Portuguese', 'bacalhau', 'Lisbon', 'eu'], ['SN', 'Senegal', 'Senegalese', 'thieboudienne', 'Dakar', 'af'], ['RS', 'Serbia', 'Serbian', '\u0107evapi', 'Belgrade', 'eu'],
    ['ZA', 'South Africa', 'South African', 'bunny chow', 'Soweto', 'af'], ['KR', 'South Korea', 'Korean', 'kimchi jjigae', 'Seoul', 'as'], ['ES', 'Spain', 'Spanish', 'paella', 'Seville', 'eu'],
    ['US', 'United States', 'American', 'your mother\u2019s mac and cheese', 'Chicago', 'na'],
  ].map(([id, n, adj, food, city, r]) => ({ id, n, adj, food, city, r }));
  const CTRY = Object.fromEntries(COUNTRIES.map((c) => [c.id, c]));
  const CUPS = { af: ['AFCON', 'AfroBasket'], eu: ['the Euros', 'EuroBasket'], sa: ['the Copa Am\u00e9rica', 'the AmeriCup'], na: ['the Gold Cup', 'the AmeriCup'], as: ['the Asian Cup', 'the Asia Cup'] };
  const home = (s) => CTRY[s.country] || CTRY.NG; // saves from before countries existed already talked about jollof
  const person = () => `${pick(FIRST)} ${pick(LAST)}`;

  // The reel in the Draw: real players, from greats to busts, every one equally likely. The ratings are our own opinion, not official data.
  // [name, position, sho, drv, pas, def, ath, cmp, height (inches for bb, cm for soc)]
  const POOL = {
    bb: [
      ['Stephen Curry', 'PG', 99, 84, 90, 66, 80, 96, 74], ['LeBron James', 'SF', 82, 97, 95, 88, 95, 93, 81], ['Kevin Durant', 'SF', 96, 93, 80, 80, 86, 94, 83],
      ['Giannis Antetokounmpo', 'PF', 68, 99, 82, 93, 98, 84, 83], ['Nikola Jokić', 'C', 86, 93, 99, 76, 62, 95, 83], ['Luka Dončić', 'PG', 90, 92, 97, 68, 72, 93, 79],
      ['Shai Gilgeous-Alexander', 'PG', 88, 97, 85, 86, 88, 93, 78], ['Jayson Tatum', 'SF', 88, 89, 80, 85, 86, 86, 80], ['Joel Embiid', 'C', 82, 96, 74, 90, 78, 82, 84],
      ['Anthony Edwards', 'SG', 87, 94, 76, 82, 97, 88, 76], ['Victor Wembanyama', 'C', 80, 90, 74, 99, 88, 82, 88], ['Kawhi Leonard', 'SF', 88, 90, 76, 97, 84, 96, 79],
      ['Damian Lillard', 'PG', 95, 86, 86, 62, 80, 97, 74], ['Kyrie Irving', 'PG', 92, 96, 84, 66, 84, 94, 74], ['Jimmy Butler', 'SF', 76, 90, 82, 90, 82, 96, 79],
      ['Devin Booker', 'SG', 92, 89, 82, 70, 80, 90, 77], ['Ja Morant', 'PG', 74, 96, 88, 66, 98, 86, 74], ['Donovan Mitchell', 'SG', 88, 92, 78, 72, 90, 88, 75],
      ['Jalen Brunson', 'PG', 88, 92, 86, 66, 74, 95, 74], ['Tyrese Haliburton', 'PG', 88, 80, 97, 68, 78, 90, 77], ['Anthony Davis', 'PF', 74, 93, 70, 97, 88, 82, 82],
      ['Draymond Green', 'PF', 62, 70, 90, 96, 76, 88, 78], ['Rudy Gobert', 'C', 40, 82, 52, 98, 80, 72, 85], ['Klay Thompson', 'SG', 96, 72, 66, 80, 70, 90, 78],
      ['Chris Paul', 'PG', 84, 78, 98, 84, 66, 96, 72], ['James Harden', 'SG', 90, 92, 92, 62, 76, 88, 77], ['Russell Westbrook', 'PG', 66, 94, 88, 72, 96, 74, 75],
      ['Paul George', 'SF', 88, 84, 76, 86, 82, 84, 80], ['Jaylen Brown', 'SG', 82, 90, 70, 82, 90, 82, 78], ['Bam Adebayo', 'C', 52, 82, 76, 94, 88, 82, 81],
      ['Domantas Sabonis', 'C', 56, 86, 86, 70, 72, 84, 83], ['De’Aaron Fox', 'PG', 78, 94, 80, 72, 96, 86, 75], ['Trae Young', 'PG', 88, 84, 96, 40, 72, 88, 73],
      ['Zion Williamson', 'PF', 50, 97, 72, 62, 94, 74, 78], ['Paolo Banchero', 'PF', 76, 90, 76, 70, 84, 82, 82], ['Cade Cunningham', 'PG', 82, 86, 88, 72, 76, 86, 78],
      ['Karl-Anthony Towns', 'C', 90, 84, 70, 64, 70, 80, 84], ['Pascal Siakam', 'PF', 74, 88, 74, 82, 82, 82, 80], ['Jamal Murray', 'PG', 86, 86, 80, 64, 76, 92, 76],
      ['Chet Holmgren', 'C', 80, 78, 68, 94, 78, 80, 85], ['Evan Mobley', 'PF', 62, 84, 70, 94, 84, 78, 84], ['Scottie Barnes', 'SF', 70, 84, 82, 84, 86, 80, 79],
      ['LaMelo Ball', 'PG', 84, 82, 92, 62, 80, 80, 79], ['Zach LaVine', 'SG', 88, 88, 72, 58, 94, 80, 77], ['DeMar DeRozan', 'SF', 72, 90, 80, 66, 76, 92, 78],
      ['Kristaps Porziņģis', 'C', 86, 78, 60, 86, 64, 80, 86], ['Lauri Markkanen', 'PF', 88, 78, 60, 62, 72, 80, 84], ['Jrue Holiday', 'PG', 80, 80, 82, 94, 80, 90, 76],
      ['Mikal Bridges', 'SF', 82, 78, 68, 88, 82, 82, 78], ['Ben Simmons', 'PG', 30, 84, 90, 90, 90, 62, 82], ['Lonzo Ball', 'PG', 76, 62, 88, 84, 80, 78, 78],
      ['Alex Caruso', 'SG', 66, 64, 72, 92, 82, 82, 77], ['Marcus Smart', 'PG', 62, 70, 78, 92, 76, 80, 76], ['Derrick White', 'SG', 80, 72, 78, 88, 74, 86, 76],
      ['OG Anunoby', 'SF', 76, 72, 58, 92, 86, 78, 79], ['Josh Hart', 'SG', 60, 76, 74, 78, 82, 80, 76], ['Steven Adams', 'C', 30, 70, 58, 80, 82, 76, 83],
      ['Brook Lopez', 'C', 78, 62, 52, 86, 58, 82, 85], ['P.J. Tucker', 'PF', 62, 54, 52, 82, 70, 82, 77], ['Patty Mills', 'PG', 80, 66, 66, 52, 72, 84, 73],
      ['Duncan Robinson', 'SF', 88, 52, 58, 46, 60, 74, 79], ['Matthew Dellavedova', 'PG', 60, 52, 72, 62, 58, 72, 76], ['Boban Marjanović', 'C', 40, 74, 40, 52, 30, 70, 88],
      ['Tacko Fall', 'C', 30, 62, 30, 60, 40, 60, 90], ['Precious Achiuwa', 'PF', 46, 70, 48, 76, 84, 62, 80], ['Josh Okogie', 'SG', 48, 62, 50, 82, 86, 64, 76],
      ['Jordan Nwora', 'SF', 72, 56, 46, 46, 62, 60, 79], ['Al-Farouq Aminu', 'PF', 52, 54, 50, 80, 78, 64, 81], ['Gabe Vincent', 'PG', 70, 62, 66, 70, 70, 74, 75],
      ['Chimezie Metu', 'PF', 48, 62, 40, 56, 76, 56, 81], ['Anthony Bennett', 'PF', 42, 50, 40, 40, 62, 40, 80], ['Kwame Brown', 'C', 30, 56, 40, 62, 70, 40, 83],
      ['Darko Miličić', 'C', 36, 52, 40, 66, 62, 44, 84], ['Hasheem Thabeet', 'C', 30, 46, 30, 70, 58, 46, 87], ['Greg Oden', 'C', 30, 72, 40, 80, 64, 60, 84],
      ['Michael Olowokandi', 'C', 34, 56, 34, 64, 64, 46, 84], ['Adam Morrison', 'SF', 62, 52, 46, 36, 46, 48, 80], ['Markelle Fultz', 'PG', 40, 70, 74, 60, 76, 52, 76],
      ['Sam Bowie', 'C', 50, 60, 56, 72, 46, 60, 85], ['Muggsy Bogues', 'PG', 56, 62, 92, 70, 86, 84, 63], ['Spud Webb', 'PG', 66, 70, 80, 50, 94, 74, 67],
      ['Nate Robinson', 'PG', 76, 78, 66, 50, 96, 66, 69], ['Manute Bol', 'C', 36, 40, 30, 92, 40, 60, 91], ['Gheorghe Mureșan', 'C', 30, 62, 30, 56, 30, 56, 91],
      ['Yao Ming', 'C', 80, 90, 64, 82, 58, 84, 90], ['Michael Jordan', 'SG', 86, 99, 82, 96, 97, 99, 78], ['Kobe Bryant', 'SG', 90, 96, 80, 92, 92, 99, 78],
      ['Magic Johnson', 'PG', 74, 90, 99, 78, 84, 95, 81], ['Larry Bird', 'SF', 96, 86, 92, 80, 68, 97, 81], ['Shaquille O’Neal', 'C', 40, 99, 68, 90, 92, 84, 85],
      ['Tim Duncan', 'PF', 72, 92, 76, 97, 78, 95, 83], ['Hakeem Olajuwon', 'C', 70, 96, 68, 99, 90, 92, 84], ['Allen Iverson', 'PG', 80, 96, 84, 74, 97, 92, 72],
      ['Dirk Nowitzki', 'PF', 95, 86, 70, 66, 64, 94, 84], ['Kareem Abdul-Jabbar', 'C', 70, 99, 76, 92, 80, 94, 86], ['Ray Allen', 'SG', 98, 80, 72, 72, 80, 95, 77],
      ['Dennis Rodman', 'PF', 40, 62, 60, 98, 90, 80, 79], ['Steve Nash', 'PG', 93, 80, 98, 54, 72, 93, 75], ['Vince Carter', 'SG', 86, 93, 74, 70, 99, 84, 78],
      ['Wilt Chamberlain', 'C', 60, 99, 74, 90, 99, 82, 85], ['Bill Russell', 'C', 40, 80, 78, 99, 92, 96, 82], ['Oscar Robertson', 'PG', 84, 92, 96, 72, 82, 94, 77],
      ['Jerry West', 'PG', 94, 88, 84, 86, 82, 98, 74], ['Julius Erving', 'SF', 74, 96, 78, 78, 99, 88, 79], ['Karl Malone', 'PF', 72, 94, 72, 80, 88, 84, 81],
      ['John Stockton', 'PG', 82, 72, 99, 84, 66, 92, 73], ['Scottie Pippen', 'SF', 72, 86, 86, 97, 90, 86, 80], ['Charles Barkley', 'PF', 66, 96, 80, 74, 92, 82, 78],
      ['Patrick Ewing', 'C', 74, 90, 58, 90, 78, 84, 84], ['David Robinson', 'C', 72, 92, 64, 96, 94, 80, 85], ['Reggie Miller', 'SG', 97, 70, 70, 62, 70, 97, 79],
      ['Gary Payton', 'PG', 74, 86, 90, 97, 82, 90, 76], ['Isiah Thomas', 'PG', 82, 92, 94, 72, 84, 96, 73], ['Tracy McGrady', 'SG', 88, 94, 82, 72, 92, 82, 80],
      ['Kevin Garnett', 'PF', 76, 84, 78, 96, 88, 88, 83], ['Paul Pierce', 'SF', 88, 88, 76, 76, 72, 96, 79], ['Dwyane Wade', 'SG', 70, 97, 82, 84, 94, 94, 76],
      ['Tony Parker', 'PG', 72, 94, 84, 62, 88, 88, 74], ['Manu Ginóbili', 'SG', 84, 90, 86, 78, 80, 96, 78], ['Pau Gasol', 'C', 72, 88, 80, 80, 64, 86, 84],
      ['Carmelo Anthony', 'SF', 88, 90, 66, 58, 78, 88, 79], ['Dwight Howard', 'C', 30, 86, 48, 96, 96, 62, 82], ['Derrick Rose', 'PG', 72, 96, 84, 64, 98, 84, 75],
      ['Chris Bosh', 'PF', 80, 82, 64, 82, 78, 82, 83], ['Rajon Rondo', 'PG', 50, 74, 97, 84, 78, 84, 73], ['Dikembe Mutombo', 'C', 30, 62, 40, 99, 78, 74, 86],
      ['Ben Wallace', 'C', 30, 52, 46, 98, 88, 78, 81], ['Robert Horry', 'PF', 76, 60, 62, 76, 70, 98, 82], ['Bruce Bowen', 'SF', 72, 46, 44, 94, 74, 80, 79],
      ['Kyle Korver', 'SG', 95, 46, 58, 62, 60, 84, 79], ['J.J. Redick', 'SG', 94, 60, 66, 52, 62, 86, 76], ['Moses Malone', 'C', 50, 92, 52, 82, 88, 84, 82],
      ['Blake Griffin', 'PF', 62, 90, 82, 62, 96, 74, 81], ['Andre Iguodala', 'SF', 66, 74, 82, 92, 84, 92, 78], ['Derek Fisher', 'PG', 76, 52, 72, 72, 58, 94, 73],
      ['Cooper Flagg', 'SF', 78, 86, 80, 88, 88, 82, 81], ['Dylan Harper', 'SG', 78, 88, 82, 72, 82, 84, 78], ['Ace Bailey', 'SF', 80, 82, 62, 66, 86, 70, 82],
      ['VJ Edgecombe', 'SG', 74, 84, 68, 80, 96, 74, 77], ['Stephon Castle', 'PG', 66, 86, 78, 84, 86, 78, 78], ['Zaccharie Risacher', 'SF', 78, 72, 62, 72, 80, 72, 80],
      ['Alex Sarr', 'C', 58, 74, 62, 86, 86, 66, 84], ['Reed Sheppard', 'PG', 84, 68, 76, 72, 72, 78, 74], ['Bronny James', 'PG', 56, 58, 62, 68, 74, 56, 74],
      ['Amen Thompson', 'SG', 48, 90, 80, 88, 99, 70, 79], ['Jalen Williams', 'SF', 84, 86, 80, 84, 82, 86, 78], ['Tyrese Maxey', 'PG', 88, 90, 80, 64, 96, 86, 74],
      ['Alperen \u015eeng\u00fcn', 'C', 58, 90, 92, 72, 66, 82, 83], ['Franz Wagner', 'SF', 78, 88, 78, 80, 80, 84, 82], ['Jaren Jackson Jr.', 'PF', 80, 76, 58, 94, 82, 76, 83],
      ['Desmond Bane', 'SG', 90, 80, 74, 76, 76, 86, 77], ['Brandon Miller', 'SF', 86, 78, 70, 70, 80, 78, 81], ['Scoot Henderson', 'PG', 62, 82, 78, 60, 88, 62, 75],
      ['Jalen Green', 'SG', 80, 86, 62, 56, 94, 70, 76], ['Dereck Lively II', 'C', 30, 74, 58, 88, 88, 70, 85], ['Kel\u2019el Ware', 'C', 62, 72, 48, 82, 84, 64, 84],
      ['Jonathan Kuminga', 'PF', 62, 88, 62, 72, 94, 62, 79], ['Dalton Knecht', 'SF', 82, 70, 56, 50, 72, 68, 78], ['James Wiseman', 'C', 46, 70, 40, 62, 82, 50, 84],
      ['Kevin Knox', 'SF', 62, 58, 46, 48, 70, 52, 81], ['Killian Hayes', 'PG', 52, 58, 72, 74, 72, 52, 77], ['Dominique Wilkins', 'SF', 78, 96, 70, 66, 99, 86, 80],
      ['Clyde Drexler', 'SG', 80, 92, 82, 82, 94, 86, 79], ['Penny Hardaway', 'PG', 80, 90, 92, 72, 90, 84, 79], ['Grant Hill', 'SF', 72, 92, 88, 84, 90, 86, 80],
      ['Kevin McHale', 'PF', 70, 94, 62, 88, 72, 90, 82], ['George Mikan', 'C', 50, 94, 60, 86, 70, 92, 82], ['Tony Allen', 'SG', 52, 66, 56, 96, 84, 80, 76],
      ['Elgin Baylor', 'SF', 74, 96, 80, 72, 94, 90, 77],
    ],
    soc: [
      ['Lionel Messi', 'W', 96, 99, 96, 40, 82, 97, 170], ['Cristiano Ronaldo', 'ST', 97, 90, 82, 40, 90, 96, 187], ['Kylian Mbappé', 'ST', 93, 94, 82, 40, 99, 90, 178],
      ['Erling Haaland', 'ST', 97, 80, 68, 46, 94, 90, 195], ['Kevin De Bruyne', 'CM', 88, 88, 99, 64, 76, 92, 181], ['Mohamed Salah', 'W', 92, 92, 86, 46, 93, 90, 175],
      ['Vinícius Júnior', 'W', 86, 97, 80, 36, 97, 82, 176], ['Jude Bellingham', 'CM', 86, 90, 88, 80, 84, 92, 186], ['Lamine Yamal', 'W', 84, 95, 88, 36, 90, 86, 180],
      ['Harry Kane', 'ST', 96, 82, 90, 48, 70, 93, 188], ['Rodri', 'CM', 78, 82, 92, 92, 66, 96, 191], ['Luka Modrić', 'CM', 78, 92, 96, 74, 72, 96, 172],
      ['Virgil van Dijk', 'DF', 60, 72, 78, 97, 80, 95, 195], ['Victor Osimhen', 'ST', 90, 82, 68, 44, 94, 84, 186], ['Bukayo Saka', 'W', 86, 92, 86, 60, 88, 88, 178],
      ['Neymar', 'W', 88, 98, 92, 36, 88, 84, 175], ['Robert Lewandowski', 'ST', 96, 84, 80, 44, 76, 92, 185], ['Pedri', 'CM', 74, 92, 94, 70, 76, 92, 174],
      ['Declan Rice', 'CM', 72, 78, 86, 92, 78, 88, 188], ['William Saliba', 'DF', 44, 72, 78, 94, 86, 88, 192], ['Achraf Hakimi', 'DF', 72, 86, 84, 82, 96, 82, 181],
      ['Florian Wirtz', 'CM', 84, 93, 92, 52, 80, 86, 177], ['Son Heung-min', 'W', 92, 88, 82, 44, 90, 88, 183], ['Antoine Griezmann', 'ST', 88, 88, 90, 60, 78, 92, 176],
      ['Raheem Sterling', 'W', 78, 88, 78, 40, 90, 74, 170], ['Marcus Rashford', 'W', 84, 86, 76, 44, 92, 74, 185], ['Jack Grealish', 'W', 70, 90, 82, 46, 72, 80, 180],
      ['Phil Foden', 'W', 86, 90, 88, 52, 80, 86, 171], ['Cole Palmer', 'CM', 88, 88, 90, 48, 76, 92, 189], ['Trent Alexander-Arnold', 'DF', 74, 76, 95, 72, 76, 84, 180],
      ['Andy Robertson', 'DF', 60, 76, 84, 80, 88, 82, 178], ['Bruno Fernandes', 'CM', 86, 82, 92, 58, 74, 86, 179], ['Casemiro', 'CM', 70, 70, 80, 90, 70, 90, 185],
      ['N’Golo Kanté', 'CM', 62, 80, 82, 94, 90, 88, 168], ['Paul Pogba', 'CM', 84, 88, 90, 70, 80, 80, 191], ['Riyad Mahrez', 'W', 84, 92, 84, 40, 80, 86, 179],
      ['Sadio Mané', 'W', 88, 90, 78, 52, 94, 86, 174], ['Pierre-Emerick Aubameyang', 'ST', 90, 80, 70, 38, 96, 84, 187], ['Romelu Lukaku', 'ST', 88, 76, 66, 44, 84, 78, 191],
      ['Ousmane Dembélé', 'W', 84, 94, 82, 42, 94, 74, 178], ['Thomas Müller', 'ST', 84, 74, 90, 56, 66, 92, 185], ['Toni Kroos', 'CM', 84, 80, 98, 64, 58, 96, 183],
      ['Jamal Musiala', 'CM', 80, 96, 86, 46, 82, 86, 184], ['Federico Valverde', 'CM', 84, 82, 86, 80, 90, 86, 182], ['Antonio Rüdiger', 'DF', 50, 62, 70, 90, 86, 82, 190],
      ['Khvicha Kvaratskhelia', 'W', 84, 94, 84, 40, 86, 80, 183], ['Rafael Leão', 'W', 82, 92, 76, 36, 96, 72, 188], ['Lautaro Martínez', 'ST', 90, 84, 72, 48, 84, 88, 174],
      ['Julián Álvarez', 'ST', 86, 84, 80, 62, 86, 86, 170], ['Ángel Di María', 'W', 84, 90, 90, 46, 84, 88, 180], ['Martin Ødegaard', 'CM', 82, 88, 94, 56, 74, 88, 178],
      ['Alexis Mac Allister', 'CM', 80, 80, 88, 80, 74, 88, 174], ['Jérémy Doku', 'W', 66, 95, 68, 38, 96, 64, 173], ['Nico Williams', 'W', 76, 92, 78, 40, 96, 74, 181],
      ['Ollie Watkins', 'ST', 86, 74, 72, 54, 86, 82, 180], ['Kyle Walker', 'DF', 48, 72, 72, 86, 96, 82, 183], ['Christian Pulisic', 'W', 82, 88, 80, 46, 86, 80, 177],
      ['Darwin Núñez', 'ST', 80, 80, 64, 46, 94, 62, 187], ['Mason Mount', 'CM', 80, 80, 84, 62, 76, 78, 181], ['Kalvin Phillips', 'CM', 62, 64, 80, 78, 66, 72, 178],
      ['Ademola Lookman', 'W', 86, 88, 78, 40, 86, 82, 174], ['Wilfred Ndidi', 'CM', 58, 68, 74, 90, 82, 80, 183], ['Alex Iwobi', 'CM', 72, 82, 82, 62, 76, 72, 180],
      ['Samuel Chukwueze', 'W', 74, 88, 70, 36, 90, 62, 172], ['Kelechi Iheanacho', 'ST', 84, 78, 74, 36, 70, 74, 185], ['Odion Ighalo', 'ST', 82, 70, 60, 40, 72, 80, 188],
      ['Ahmed Musa', 'W', 72, 80, 62, 38, 94, 66, 170], ['Victor Moses', 'W', 72, 82, 70, 62, 86, 70, 177], ['Victor Boniface', 'ST', 84, 84, 70, 40, 82, 72, 190],
      ['Calvin Bassey', 'DF', 50, 64, 66, 82, 86, 72, 185], ['William Troost-Ekong', 'DF', 52, 48, 60, 80, 68, 82, 191], ['Moses Simon', 'W', 70, 86, 74, 40, 90, 70, 168],
      ['John Obi Mikel', 'CM', 56, 70, 82, 82, 72, 84, 188], ['Jesse Lingard', 'CM', 74, 78, 74, 52, 78, 68, 175], ['Harry Maguire', 'DF', 56, 52, 66, 82, 58, 72, 194],
      ['Phil Jones', 'DF', 40, 50, 54, 76, 62, 60, 185], ['Wout Weghorst', 'ST', 74, 50, 58, 52, 56, 70, 197], ['Peter Crouch', 'ST', 80, 70, 68, 40, 56, 80, 201],
      ['Andy Carroll', 'ST', 76, 58, 56, 46, 64, 66, 193], ['Emile Heskey', 'ST', 70, 64, 64, 48, 82, 72, 188], ['Adebayo Akinfenwa', 'ST', 72, 48, 52, 46, 40, 80, 180],
      ['Nicklas Bendtner', 'ST', 70, 60, 56, 36, 60, 56, 194], ['Ali Dia', 'ST', 32, 34, 30, 30, 48, 30, 180], ['Jamie Vardy', 'ST', 88, 76, 66, 48, 92, 84, 179],
      ['Pelé', 'ST', 97, 97, 92, 50, 92, 97, 173], ['Diego Maradona', 'CM', 92, 99, 94, 40, 86, 94, 165], ['Zinedine Zidane', 'CM', 86, 96, 96, 62, 74, 97, 185],
      ['Ronaldo Nazário', 'ST', 98, 98, 80, 36, 97, 92, 183], ['Ronaldinho', 'W', 88, 99, 94, 38, 86, 88, 181], ['Thierry Henry', 'ST', 94, 92, 84, 42, 97, 90, 188],
      ['Jay-Jay Okocha', 'CM', 82, 98, 88, 50, 82, 84, 173], ['Paolo Maldini', 'DF', 50, 74, 78, 99, 82, 97, 186], ['Andrés Iniesta', 'CM', 76, 96, 97, 62, 76, 96, 171],
      ['Xavi', 'CM', 72, 88, 99, 68, 66, 97, 170], ['Nwankwo Kanu', 'ST', 86, 92, 84, 40, 74, 88, 197], ['Didier Drogba', 'ST', 93, 82, 74, 52, 86, 94, 188],
      ['Samuel Eto’o', 'ST', 94, 90, 78, 44, 95, 90, 180], ['Yaya Touré', 'CM', 84, 86, 88, 84, 82, 90, 188], ['George Weah', 'ST', 92, 94, 78, 44, 96, 88, 184],
      ['Sergio Ramos', 'DF', 72, 66, 76, 92, 82, 92, 184], ['Carles Puyol', 'DF', 44, 56, 64, 94, 82, 94, 178], ['Rio Ferdinand', 'DF', 46, 70, 76, 94, 86, 90, 189],
      ['John Terry', 'DF', 56, 52, 66, 94, 70, 94, 187], ['Roberto Carlos', 'DF', 86, 82, 80, 80, 96, 82, 168], ['Cafu', 'DF', 58, 82, 82, 84, 92, 88, 176],
      ['Dani Alves', 'DF', 66, 84, 88, 78, 86, 84, 172], ['Kaká', 'CM', 88, 96, 90, 46, 94, 88, 186], ['Frank Lampard', 'CM', 92, 78, 88, 68, 76, 92, 184],
      ['Steven Gerrard', 'CM', 90, 82, 92, 78, 82, 94, 183], ['Paul Scholes', 'CM', 88, 78, 96, 64, 62, 94, 170], ['Wayne Rooney', 'ST', 92, 88, 88, 60, 84, 90, 176],
      ['David Beckham', 'W', 84, 72, 97, 60, 74, 90, 180], ['Andrea Pirlo', 'CM', 84, 76, 99, 58, 50, 98, 177], ['Francesco Totti', 'ST', 90, 88, 94, 40, 72, 94, 180],
      ['Zlatan Ibrahimović', 'ST', 95, 88, 84, 40, 80, 94, 195], ['Luis Suárez', 'ST', 95, 90, 84, 46, 82, 86, 182], ['Sergio Agüero', 'ST', 95, 90, 78, 36, 86, 92, 173],
      ['Karim Benzema', 'ST', 92, 88, 88, 40, 78, 94, 185], ['Arjen Robben', 'W', 92, 94, 80, 40, 92, 84, 180], ['Patrick Vieira', 'CM', 72, 80, 84, 92, 86, 90, 193],
      ['Claude Makélélé', 'CM', 50, 72, 82, 94, 78, 92, 170], ['Michael Essien', 'CM', 76, 80, 80, 90, 90, 86, 178], ['Taribo West', 'DF', 48, 56, 54, 86, 84, 74, 181],
      ['Sunday Oliseh', 'CM', 80, 70, 84, 84, 74, 84, 183], ['Rashidi Yekini', 'ST', 90, 70, 56, 36, 80, 82, 190], ['Finidi George', 'W', 76, 90, 84, 40, 88, 80, 181],
      ['Daniel Amokachi', 'ST', 82, 82, 64, 40, 94, 74, 180], ['Obafemi Martins', 'ST', 82, 82, 62, 36, 98, 72, 170], ['Joseph Yobo', 'DF', 46, 54, 60, 86, 80, 82, 185],
      ['Endrick', 'ST', 82, 84, 66, 40, 88, 72, 173], ['Arda G\u00fcler', 'CM', 84, 88, 88, 46, 72, 80, 176], ['Kobbie Mainoo', 'CM', 70, 84, 84, 78, 74, 82, 175],
      ['Alejandro Garnacho', 'W', 78, 88, 70, 40, 92, 68, 180], ['Rasmus H\u00f8jlund', 'ST', 78, 70, 58, 44, 88, 68, 191], ['Warren Za\u00efre-Emery', 'CM', 72, 82, 82, 82, 80, 82, 178],
      ['D\u00e9sir\u00e9 Dou\u00e9', 'W', 80, 90, 82, 46, 86, 76, 181], ['Michael Olise', 'W', 86, 90, 88, 40, 80, 82, 184], ['Xavi Simons', 'CM', 80, 88, 84, 50, 82, 78, 179],
      ['Benjamin \u0160e\u0161ko', 'ST', 84, 74, 62, 40, 90, 72, 195], ['Viktor Gy\u00f6keres', 'ST', 90, 82, 66, 46, 88, 84, 187], ['Alexander Isak', 'ST', 90, 90, 74, 40, 88, 84, 192],
      ['Jo\u0161ko Gvardiol', 'DF', 66, 78, 80, 88, 84, 84, 185], ['Pau Cubars\u00ed', 'DF', 44, 70, 84, 86, 74, 88, 184], ['Dean Huijsen', 'DF', 52, 74, 82, 84, 76, 82, 197],
      ['Est\u00eav\u00e3o', 'W', 80, 90, 78, 36, 88, 74, 176], ['Dominik Szoboszlai', 'CM', 86, 82, 88, 70, 84, 82, 186], ['Bryan Mbeumo', 'W', 86, 84, 82, 48, 82, 84, 171],
      ['Mohammed Kudus', 'W', 80, 90, 78, 52, 86, 76, 177], ['Akor Adams', 'ST', 78, 72, 58, 44, 86, 70, 185], ['Tolu Arokodare', 'ST', 76, 62, 58, 46, 74, 70, 197],
      ['Antony', 'W', 70, 82, 66, 40, 84, 52, 172], ['Mykhailo Mudryk', 'W', 62, 80, 58, 36, 96, 50, 175], ['Ansu Fati', 'W', 74, 80, 70, 36, 74, 58, 178],
      ['Nicolas Jackson', 'ST', 76, 80, 62, 40, 92, 58, 186], ['Jadon Sancho', 'W', 72, 88, 82, 40, 78, 66, 180], ['Johan Cruyff', 'ST', 90, 98, 94, 46, 90, 96, 180],
      ['Franz Beckenbauer', 'DF', 70, 84, 92, 96, 80, 99, 181], ['Eus\u00e9bio', 'ST', 96, 92, 80, 40, 96, 90, 175], ['Marco van Basten', 'ST', 97, 86, 80, 40, 82, 94, 188],
      ['Roberto Baggio', 'ST', 92, 94, 92, 40, 80, 94, 174], ['Ryan Giggs', 'W', 80, 94, 86, 50, 90, 88, 179], ['Abedi Pel\u00e9', 'CM', 84, 94, 88, 50, 86, 88, 173],
      ['Roger Milla', 'ST', 90, 86, 74, 36, 78, 92, 176], ['Rivaldo', 'W', 92, 94, 88, 40, 82, 88, 186], ['Andriy Shevchenko', 'ST', 95, 88, 78, 40, 92, 90, 183],
      ['Beb\u00e9', 'W', 52, 62, 46, 30, 72, 36, 190], ['Eric Djemba-Djemba', 'CM', 44, 52, 58, 64, 70, 44, 175], ['Kerlon', 'W', 52, 80, 50, 30, 70, 40, 172],
    ],
  };
  const pAvg = (p) => avg(p.slice(2, 8));
  const RANKED = Object.fromEntries(Object.entries(POOL).map(([k, v]) => [k, v.slice().sort((a, b) => pAvg(b) - pAvg(a))]));

  const LABEL = { coach: 'Coach', mates: 'Teammates', morale: 'Morale', fame: 'Fame', health: 'Fitness', money: 'Money', bond: 'Partner', heat: 'Rivalry' };

  const ovr = (s) => Math.round(avg(KEYS.map((k) => s.st[k])));
  const worth = (s) => s.money + s.inv.reduce((t, i) => t + i.amt, 0);
  const cfg = (s) => SPORTS[s.sport];
  function tx(s, str) {
    const C = home(s), v = { team: s.team, name: s.name, partner: s.partner ? s.partner.name : 'your partner', country: C.n, adj: C.adj, food: C.food, city: C.city, cup: CUPS[C.r][s.sport === 'bb' ? 1 : 0] };
    return str.replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : s.names[k]));
  }
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
      ['Fly home for two days', '{food}, noise, your old bed. You come back lighter.', { morale: 18, coach: -6, health: -4 }],
      ['Stay and train', 'You hang up and go to the gym. It is what you came here for.', { cmp: 2, morale: -6 }],
      ['Bring the family over', 'Six tickets and a bigger flat. The loneliness stops.', { money: -120, morale: 22 }],
    ] },
    { id: 'flag', once: 1, when: (s) => s.origin === 'abroad' && s.seasons.length >= 2 && ovr(s) >= 76, title: 'Two flags', text: 'Both countries want you: the one you left, and the one that made you a player.', c: [
      ['Play for {country}', 'The airport is full when you land. Children are wearing your name.', { fame: 10, morale: 12 }],
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
  EVENTS.push(
    { id: 'callup', once: 1, when: (s) => s.seasons.length >= 1 && ovr(s) >= 68, title: '{country} come calling', text: 'The {adj} federation want you in the squad for {cup}. Say yes and the summer off is gone.', c: [
      ['Answer the call', 'You pull on the shirt for the first time and sing every word of the anthem.', { fame: 8, cmp: 2, health: -8, morale: 8 }, (s) => { s.f.capped = 1; }],
      ['Ask to sit this one out', 'The radio phone-ins in {city} talk about nothing else for a week.', { health: 10, fame: -6, morale: -4 }],
    ] },
    { id: 'tourney', when: (s) => s.f.capped && s.seasons.length % 2 === 0, title: '{cup}', text: 'A semi-final, and the whole of {country} has stopped work to watch. The last chance falls to you.', c: [
      ['Take it yourself', 'You do not think.', {}, (s) => (R() < 0.35 + (ovr(s) - 70) / 60 ? ['It goes in. In {city} they are dancing on car roofs.', { fame: 12, morale: 14, cmp: 2 }] : ['It goes wide. You sit on the grass for a long time.', { morale: -14, fame: -4 }])],
      ['Find a teammate', 'You draw two and pass. He scores and he is the hero. You are fine with that, mostly.', { cmp: 2, morale: 4 }],
    ] },
    { id: 'world', once: 1, when: (s) => s.f.capped && ovr(s) >= 80 && s.seasons.length >= 4, title: 'The World Cup', text: '{country} have never gone further than the quarter-finals. This time they have you.', c: [
      ['Play every minute', 'You run until your legs stop listening.', { health: -18 }, (s) => (R() < 0.4 ? ['A semi-final. Nobody in {country} sleeps that night.', { fame: 16, morale: 16 }] : ['Out in the last sixteen. You gave everything.', { fame: 6, morale: -6 }])],
      ['Save yourself for your club', 'You play the group games and sit out the rest. Your club are grateful. {city} is not.', { fame: -8, coach: 8, health: 6 }],
    ] },
    { id: 'homecoming', once: 1, when: (s) => s.fame > 40, title: 'Back in {city}', text: 'You go home for the summer. Someone has painted your face on the wall where you learned to play.', c: [
      ['Run a free camp for kids', 'Two hundred kids and a lot of shouting. One of them is better than you were.', { money: -20, morale: 12, fame: 4 }, (s) => { s.f.gaveBack = 1; }],
      ['Stay in and eat {food}', 'Three weeks of sleep and home cooking. You go back heavier and happier.', { health: 10, morale: 10, ath: -1 }],
      ['Throw a party for the street', 'The music stops at six in the morning. Your mother is still dancing.', { money: -60, fame: 6, morale: 10 }],
    ] },
    { id: 'parcel', when: (s) => s.seasons.length >= 1, title: 'A parcel from home', text: 'Your aunt has posted {food} halfway round the world. It arrives slightly crushed and smelling wonderful.', c: [
      ['Share it with the squad', 'Half the dressing room want the recipe. {mate} has thirds.', { mates: 8, morale: 6 }],
      ['Eat it alone at midnight', 'Standing at the kitchen counter, in the dark. Perfect.', { morale: 10 }],
    ] },
    { id: 'politician', once: 1, when: (s) => s.fame > 50, title: 'Election season', text: 'A politician in {country} wants a photo with you. He promises {city} a new stadium if he wins.', c: [
      ['Take the photo', 'The stadium is never built. Half of {city} has an opinion about you now.', { fame: 4, money: 30, morale: -6 }],
      ['Politely decline', 'Your agent breathes out.', { cmp: 1 }],
      ['Speak out against him', 'The clip goes everywhere. Your mother asks you to be careful.', { fame: 8, morale: 4 }],
    ] },
    { id: 'homeclub', once: 1, when: (s) => s.age >= 31 && s.tier > 1, title: 'Coming home', text: 'A club in {city} wants you for your last years. Less money, a lot of love, and your mother at every game.', c: [
      ['Go home', 'Half the city comes to the airport.', { morale: 20, fame: 4 }, (s) => { moveTeam(s, 3); s.team = `${home(s).city} ${s.sport === 'bb' ? 'Royals' : 'United'}`; s.salary = Math.round(s.salary * 0.6); s.f.gaveBack = 1; }],
      ['Not yet', 'You tell them maybe one day. Everyone knows what that means.', { morale: -3 }],
    ] },
    { id: 'agent', once: 1, when: (s) => s.seasons.length === 0, title: 'Two agents', text: 'A man with a very big watch wants to represent you. So does your uncle, who has read one book about contracts.', c: [
      ['The big watch', 'He gets you a boot deal by Friday and takes twenty per cent.', { money: 80, morale: -2 }],
      ['Your uncle', 'He reads every clause out loud, twice. Nobody cheats you.', { morale: 6, cmp: 1 }],
    ] },
    { id: 'viral', when: (s) => s.fame > 25, title: 'Forty million views', text: 'Someone filmed you dancing in the dressing room after a win. The internet has decided it is the best thing it has ever seen.', c: [
      ['Lean into it', 'A brand wants the dance in an advert. {coach} wants you to watch some film.', { fame: 8, money: 40, coach: -4 }],
      ['Log off for a month', 'It is very quiet. You sleep better.', { cmp: 2, fame: -2 }],
    ] },
    { id: 'loan', when: (s) => s.money > 200, title: 'A favour', text: '{mate} needs money. He says it is only until his next contract.', c: [
      ['Lend him $80k', 'You transfer it that night.', { money: -80 }, (s) => (R() < 0.5 ? ['He pays you back early, with a watch on top. A friend for life.', { money: 90, mates: 10 }] : ['His next contract never comes. Neither does the money.', { mates: -4, morale: -4 }])],
      ['Say no', 'He nods. The bus is a little cooler for a while.', { mates: -6 }],
    ] },
    { id: 'move', once: 1, when: (s) => s.seasons.length >= 2, title: 'A new role', text: '{coach} thinks you are in the wrong position and wants to move you.', c: [
      ['Try it', 'You agree to a month.', { coach: 10 }, (s) => { const P = cfg(s).pos, i = P.findIndex((p) => p.id === s.pos), j = i === 0 ? 1 : i === P.length - 1 ? i - 1 : i + (R() < 0.5 ? -1 : 1); s.pos = P[j].id; return [`A month becomes for good. You are a ${P[j].n.toLowerCase()} now.`, {}]; }],
      ['Refuse', 'You tell him you know who you are. He writes something down.', { coach: -12, cmp: 1 }],
    ] },
    { id: 'fan', when: (s) => s.fame > 20, title: 'After the game', text: 'A boy in a {adj} shirt has waited three hours in the rain by the team bus. He is holding a drawing of you.', c: [
      ['Stop and talk', 'You sign the drawing, his shirt and his mum\u2019s arm. He will remember this when he is forty.', { morale: 8, fame: 2 }],
      ['Wave from the bus', 'The bus pulls away. You see his face in the window for a long time.', { morale: -4 }],
    ] },
    { id: 'mum', when: (s) => s.seasons.length >= 1 && s.morale < 50, title: 'A call from home', text: 'Your mother has seen the papers. She does not ask about the game. She asks if you are eating.', c: [
      ['Tell her the truth', 'You talk for an hour and feel twelve years old, in a good way.', { morale: 14 }],
      ['Say everything is fine', 'She knows. She lets you have it.', { morale: 3 }],
    ] },
    { id: 'flats', once: 1, when: (s) => s.money > 400, title: 'Bricks and mortar', text: 'A developer in {city} is selling a block of flats. He wants $400k and a photo for the brochure.', c: [
      ['Buy the block', 'Forty flats, a caretaker and a lot of paperwork. The rent comes in every year.', { money: -400 }, (s) => { s.inv.push({ n: 'Flats in ' + home(s).city, amt: 400, kind: 'prop' }); }],
      ['Pass', 'Your adviser says you dodged one. Or missed one. He is not sure.', {}],
    ] },
    { id: 'coin', when: (s) => s.money > 150 && s.fame > 30, title: 'Your own coin', text: 'Some men in hoodies want to launch a crypto coin with your face on it. You would not have to do anything, they say.', c: [
      ['Put your face on it', 'It rises for nine days, then it does not.', { money: 120 }, (s) => (R() < 0.6 ? ['The fans who bought in lost everything. They remember your face.', { fame: -12, morale: -10 }] : ['You sold in time. You try not to think about who bought.', { morale: -4 }])],
      ['Show them the door', 'They try a teammate next. He says yes.', { cmp: 1 }],
    ] },
    { id: 'franchise', once: 1, when: (s) => s.money > 250, title: 'A franchise', text: 'A chicken chain wants a famous partner for its first ten restaurants in {country}.', c: [
      ['Buy in for $250k', 'Your face goes on the menu boards. The chicken is fine.', { money: -250, fame: 3 }, (s) => { s.inv.push({ n: 'Chicken franchise', amt: 250, kind: 'franchise' }); }],
      ['Not your thing', 'You stick to the day job.', {}],
    ] },
    { id: 'after', when: () => false, title: 'What next?', text: 'The boots are off for good. You have a phone full of offers and the whole rest of your life.', c: [
      ['Become a coach', 'You start with the under-16s in {city}.', {}, (s) => (R() < 0.3 + s.st.cmp / 300 ? ['Five years later you are a head coach, and your players say you are fair.', { fame: 6 }] : ['It turns out explaining it is harder than doing it. You go back to the youth teams, happily.', { morale: 4 }])],
      ['Go into television', 'Suits, opinions and a catchphrase you come to regret.', { fame: 8, money: 300 }],
      ['Buy into a club', 'You make the call.', {}, (s) => (s.money >= 1500 ? (s.money -= 1500, s.inv.push({ n: 'Club stake', amt: 1500, kind: 'prop' }), ['You buy a stake in a club in {city}. The fans sing your name at the first game.', { fame: 6, morale: 10 }]) : ['They laugh politely. A club costs more than you have.', { morale: -4 }])],
      ['Disappear and enjoy it', 'A long table, family, {food}. Nobody asks you about the game.', { morale: 20 }],
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
  function create({ name, sport, pos, country, origin, story, look }) {
    const s = {
      v: 3, country: CTRY[country] ? country : 'NG', pos: SPORTS[sport].pos.some((p) => p.id === pos) ? pos : SPORTS[sport].pos[0].id, cap: {}, src: {}, h: 0, look: Object.assign({ skin: 4, hair: 'fade', beard: 0, band: 0 }, look), name: (name || '').trim().slice(0, 18) || 'The Kid', sport, age: 18,
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
    // ratings can come from anyone, all equally likely; the frame comes from someone who plays your position
    const from = c.left.length ? POOL[s.sport] : POOL[s.sport].filter((x) => x[1] === s.pos);
    const p = pick(from.filter((x) => !c.used.includes(x[0])));
    c.used.push(p[0]);
    c.card = { n: p[0], pos: p[1], r: Object.fromEntries(KEYS.map((k, i) => [k, p[i + 2]])), h: p[8] };
    c.reel = Array.from({ length: 11 }, () => pick(from)[0]).concat(p[0]); // names that fly past
  }

  // Throw the build away and draw again. Only before the first season starts.
  function redraw(s) {
    if (s.cur.t !== 'draw' && s.cur.t !== 'signed') return;
    Object.assign(s, { st: {}, cap: {}, src: {}, h: 0, team: '', teams: 0, log: [], cur: { t: 'draw', left: KEYS.slice(), card: null, respin: 2, used: [] } });
  }

  const posOf = (s) => cfg(s).pos.find((p) => p.id === s.pos) || cfg(s).pos[0];

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
    const m = {};
    for (const add of [ORIG[s.origin].st, cfg(s).body.mods[build(s)], posOf(s).m]) for (const k in add) m[k] = (m[k] || 0) + add[k];
    for (const k in m) { s.st[k] = clamp(s.st[k] + m[k], 30, 99); s.cap[k] = clamp(s.cap[k] + m[k], 30, 99); }
    const o = ovr(s);
    s.tier = o >= 74 ? 2 : 3; // good prospects still start low: room to climb
    s.team = pick(cfg(s).teams[s.tier]); s.teams = 1; s.salary = salaryFor(s.tier, o); s.peak = o;
    say(s, cfg(s).joined);
    s.cur = { t: 'signed', text: cfg(s).entryText(s.team, clamp(Math.round(60 - (o - 55) * 2.4), 1, 60)) };
  }

  // ---------- season script ----------
  function buildSeason(s) {
    const mid = shuffle(['event', 'event', 'match:Rivalry game'].concat(R() < 0.5 ? ['event'] : []));
    s.steps = ['arc', 'event', 'match:Opening night', ...mid, 'cut', 'report'];
    s.si = -1; s.grades = []; s.days = 3; s.note = ''; s.final = null;
  }

  function teamStr(s) {
    const g = s.grades.length ? avg(s.grades) : 0.5;
    return [0, 82, 72, 62][s.tier] + (ovr(s) - 72) * 0.6 + (s.mates - 50) * 0.08 + (g - 0.5) * 10;
  }

  function advance(s) {
    if (s.cur.t === 'event' && s.cur.id === 'after') { s.cur = { t: 'end', l: legacy(s) }; return; }
    if (s.cur.t === 'signed') buildSeason(s);
    if (s.cur.t === 'report') {
      if (s.cur.r.last) { s.cur = { t: 'event', id: 'after' }; return; }
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
      if (s.f.injured) { say(s, `${step.slice(6)}: watched from the stands.`); return advance(s); }
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
    if (e.id === 'after') s.after = s.cur.out.text;
    say(s, `${tx(s, e.title)}: ${tx(s, label).toLowerCase().replace(/[“”]/g, '')}.`);
  }

  // ---------- matches: a handful of timed moments, each one against a real player ----------
  // Better teams field better players. def: he is attacking you, so in soccer he is not a defender.
  function foe(s, tier, def) {
    const r = RANKED[s.sport], n = r.length, [a, b] = [[0, 0.2], [0, 0.35], [0.25, 0.7], [0.5, 1]][tier];
    const band = r.slice(Math.floor(a * n), Math.ceil(b * n));
    const fit = s.sport === 'soc' ? band.filter((p) => (def ? p[1] !== 'DF' : p[1] === 'DF' || p[1] === 'CM')) : band;
    return pick(fit.length ? fit : band);
  }
  const rate = (p, k) => p[2 + KEYS.indexOf(k)];

  // f is how far through the game, 0 to 1.
  function clock(s, f) {
    if (s.sport === 'soc') return `${Math.max(1, Math.round(f * 88))}′`;
    const el = f * 48, q = Math.min(4, Math.floor(el / 12) + 1), left = q * 12 - el, mm = Math.floor(left);
    return `Q${q} ${mm}:${String(Math.floor((left - mm) * 60)).padStart(2, '0')}`;
  }

  // The moves on offer: up to two that fit what is happening, topped up with your position's own, in a fresh order.
  function moves(s, k, fit = []) {
    const ids = [...new Set([...shuffle(fit.filter((id) => cfg(s).opts[id])).slice(0, 2), ...shuffle(posOf(s)[k])])].slice(0, R() < 0.25 ? 2 : 3);
    return shuffle(ids);
  }

  function moment(s, m, k, f) {
    const c = cfg(s), vs = foe(s, m.tier, k === 'def'), [what, fit] = pick(c.sit[k]);
    const dbl = k === 'off' && R() < (s.fame - 40) / 150; // once you are famous, they send two
    return { k, vs, dbl, f, o: moves(s, k, dbl ? fit.concat('kick') : fit), clock: clock(s, f), x: ri(22, 78), text: what.replace('{star}', vs[0]) + (dbl ? ' ' + c.sit.dbl : '') };
  }

  function newMatch(s, kind) {
    const c = cfg(s), isFinal = kind === c.final;
    const oppTier = isFinal ? 1 : ri(1, 3);
    const opp = kind === 'Rivalry game' ? `${s.names.rival}’s ${pick(c.teams[oppTier].filter((t) => t !== s.team)).split(' ').pop()}` : pick(c.teams[oppTier].filter((t) => t !== s.team));
    const [us, them] = c.base(teamStr(s), [0, 82, 72, 62][oppTier] + (isFinal ? 4 : 0));
    const m = { kind, opp, us, them, bu: us, bt: them, tier: isFinal ? 0 : oppTier, i: 0, hits: 0, mine: 0, opt: null, res: null, done: null, isFinal, moments: [] };
    const n = ri(3, 5), att = posOf(s).att;
    const ks = Array.from({ length: n }, () => (R() < att ? 'off' : 'def'));
    if (ks.every((k) => k === ks[0])) ks[ri(0, n - 1)] = ks[0] === 'off' ? 'def' : 'off'; // always some of each
    const fs = ks.map(() => R() * 0.9).sort((a, b) => a - b);
    m.moments = ks.map((k, i) => moment(s, m, k, fs[i]));
    m.moments.push({ k: 'last' }); // decided by the score when you get there
    return m;
  }

  // A close game ends on a clutch moment: with the ball if you are level or behind, guarding their best if you are ahead.
  function settle(s, m) {
    if (m.moments[m.i].k !== 'last') return;
    const c = cfg(s), gap = m.us - m.them;
    if (Math.abs(gap) > (s.sport === 'bb' ? 3 : 1)) { m.moments[m.i] = moment(s, m, R() < posOf(s).att ? 'off' : 'def', 0.92 + R() * 0.07); return; }
    const k = gap > 0 ? 'def' : 'off', vs = foe(s, Math.max(0, m.tier - 1), k === 'def'), secs = ri(4, 12);
    const text = c.sit[gap > 0 ? 'ahead' : gap < 0 ? 'behind' : 'level'].replace('{gap}', Math.abs(gap)).replace('{secs}', secs).replace('{star}', vs[0]);
    m.moments[m.i] = { k, vs, o: moves(s, k), clutch: 1, dbl: false, f: 1, x: ri(30, 70), text, clock: s.sport === 'bb' ? `Q4 0:${String(secs).padStart(2, '0')}` : `90+${ri(1, 5)}′` };
  }

  // The score on screen grows with the clock; m.us and m.them are what it will be at full time.
  function scoreAt(m) {
    const mo = m.moments[m.i], f = m.done || !mo || mo.f === undefined ? 1 : mo.f;
    return [Math.round(m.us - (m.bu || 0) * (1 - f)), Math.round(m.them - (m.bt || 0) * (1 - f))];
  }

  function optsFor(s, mo) {
    const c = cfg(s);
    return (mo.o || posOf(s)[mo.k === 'def' ? 'def' : 'off']).filter((id) => c.opts[id]).map((id) => (id === 'drive' && build(s) === 'tall'
      ? Object.assign({}, c.opts[id], { l: 'Rise up and dunk', ok: 'You hammer it down. The bench is on its feet.', no: 'Met at the rim and sent back.', bonus: 4 })
      : c.opts[id]));
  }

  // The green grows with your rating against his and shrinks when they double you.
  // The marker gets quicker as you get famous (they scout you) and in the clutch.
  function zone(s, o, mo) {
    const edge = s.st[o.k] - rate(mo.vs, o.vs);
    const g = clamp(13 + edge * 0.45 + (o.bonus || 0) - (mo.dbl ? 5 : 0) + (o.mech === 'double' ? 3 : 0), 4, 30);
    const y = clamp(6 + edge * 0.12, 3, 9);
    const period = 1100 * (0.85 + s.st.cmp / 400) / (1 + s.fame / 250) * (mo.clutch ? 0.8 : 1) * (s.health < 50 ? 0.88 : 1) * (o.mech === 'react' ? 1.25 : 1);
    const a = o.mech === 'drift' ? ri(12, 20) : 0, lo = Math.ceil(g / 2 + y + a);
    const c = o.mech === 'react' ? ri(45, Math.floor(100 - g / 2 - y)) : ri(lo, 100 - lo);
    return { mech: o.mech, c, g, y, a, dp: ri(1300, 1900), period, need: o.mech === 'double' ? 2 : 1, marks: [] };
  }
  // Where the green is centred t ms after the meter started. The screen draws it with this too.
  const zoneAt = (z, t) => (z.a ? z.c + z.a * Math.sin((t / z.dp) * 2 * Math.PI) : z.c);

  function pickOpt(s, i) {
    const m = s.cur.m, mo = m.moments[m.i];
    m.opt = i; m.z = zone(s, optsFor(s, mo)[i], mo);
  }

  // pos is where the marker stopped, 0 to 100; t is ms since the meter started.
  function stop(s, pos, t = 0) {
    const m = s.cur.m, mo = m.moments[m.i], z = m.z;
    const o = optsFor(s, mo)[m.opt];
    const dist = Math.abs(pos - zoneAt(z, t));
    z.marks.push(dist <= z.g / 2 ? 'g' : dist <= z.g / 2 + z.y ? 'y' : 'r');
    if (z.marks.length < z.need) { const lo = Math.ceil(z.g / 2 + z.y); z.c = ri(lo, 100 - lo); return; } // second touch, somewhere new
    const q = z.marks.includes('r') ? 'r' : z.marks.includes('y') ? 'y' : 'g';
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
    m.res = { q, hit, late: z.mech === 'react' && pos >= 100, text: text.replace('{star}', mo.vs[0]) };
  }

  function nextMoment(s) {
    const m = s.cur.m;
    m.opt = null; m.res = null; m.z = null;
    if (++m.i < m.moments.length) return settle(s, m);
    const bb = s.sport === 'bb';
    if (bb && m.us === m.them) (R() < 0.5 ? (m.us += 2) : (m.them += 2)); // overtime
    const g = m.hits / m.moments.length;
    const grade = g >= 1 ? 'A+' : g >= 0.8 ? 'A' : g >= 0.6 ? 'B' : g >= 0.4 ? 'C' : g > 0 ? 'D' : 'F';
    const win = m.us > m.them, draw = m.us === m.them;
    s.grades.push(g);
    const d = ch(s, { coach: Math.round((g - 0.5) * 16), fame: win ? 2 + (m.isFinal ? 8 : 0) : 0, morale: win ? 5 : draw ? 0 : -5, heat: m.kind === 'Rivalry game' ? 6 : 0 });
    if (m.isFinal) s.final = win ? 'won' : 'lost';
    m.done = { grade, win, draw, d };
    say(s, `${m.kind}: ${win ? 'beat' : draw ? 'drew with' : 'lost to'} ${m.opp} ${m.us}–${m.them}. Grade ${grade}.`);
  }

  // Saves from before positions: give them one and restart any match in progress.
  function migrate(s) {
    if (s.v !== 2) return;
    s.v = 3; s.pos = cfg(s).pos[s.sport === 'bb' ? 2 : 0].id;
    if (s.cur.t === 'match') s.cur.m = newMatch(s, s.cur.m.kind);
  }

  // ---------- end of season ----------
  function endSeason(s) {
    const c = cfg(s), o = ovr(s), g = s.grades.length ? avg(s.grades) : 0.5, last = s.name.split(' ').pop().toUpperCase();
    const mf = clamp(0.55 + s.coach / 250 + (o - 70) / 120 + (g - 0.5) * 0.2 + (s.morale - 50) / 400, 0.3, 1.1) * (s.f.injured ? 0.45 : 1);
    const line = c.line(s.st, mf, posOf(s).w), str = teamStr(s);
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
      else if (i.kind === 'bond') i.amt = Math.round(i.amt * 1.03);
      else if (i.kind === 'car') i.amt = Math.round(i.amt * 0.85);
      else if (i.kind === 'crypto') { const r = R(); i.amt = Math.round(i.amt * (r < 0.15 ? 3 : r < 0.5 ? 1.2 : 0.45)); }
      else if (i.kind === 'franchise') { if (R() < 0.08) { i.amt = Math.round(i.amt * 0.5); notes.push(`Half the ${i.n.toLowerCase()} branches closed.`); } s.money += Math.round(i.amt * 0.1); }
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
    dating: { n: 'Go on a date', need: (s) => !s.partner && s.age >= 19, run: (s) => (R() < 0.4 ? (s.partner = { name: pick(PARTNERS), bond: 50, kind: 'date' }, ['It goes well. You see {partner} again, and again.', { morale: 8 }]) : ['Polite conversation and a split bill.', {}]) },
    family: { n: 'Visit family', need: () => true, run: (s) => ['{food} on the table and everyone talking at once.', { morale: 10, health: 3 }] },
    party: { n: 'Hit the clubs', need: () => true, run: (s) => (R() < 0.25 ? ['Someone had a camera. The photos are online by morning.', { morale: 4, fame: 3, coach: -8, health: -6 }] : ['A great night, and nobody saw a thing.', { morale: 10, health: -6 }]) },
    charity: { n: 'Charity visit', need: () => true, run: (s) => ['A children\u2019s ward and a bag of signed shirts. You sit with one kid for an hour.', { fame: 3, morale: 6, money: -10 }] },
    post: { n: 'Post online', need: () => true, run: (s) => (R() < 0.3 ? ['It goes viral for the wrong reasons.', { fame: 4, coach: -5, morale: -4 }] : ['A training clip. People like it.', { fame: 3 }]) },
    mind: { n: 'See a sports psychologist', need: (s) => s.money >= 15, run: (s) => ['An hour about pressure. Some of it sticks.', { cmp: 1, morale: 6, money: -15 }] },
    coach1: { n: 'Hire a private coach ($60k)', need: (s) => s.money >= 60, run: (s) => { const k = KEYS.reduce((a, b) => (s.st[a] <= s.st[b] ? a : b)); return ['A week of drills on your weakest part.', { [k]: 2, money: -60 }]; } },
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
    bond: { n: 'Government bonds', d: 'Safe and slow. About three per cent.' },
    crypto: { n: 'Crypto', d: 'Up a lot, down a lot. Mostly down.' },
  };
  function invest(s, kind) {
    const amt = Math.floor(s.money / 4);
    if (amt < 10) return;
    s.money -= amt;
    const have = s.inv.find((i) => i.kind === kind && i.n === FUNDS[kind].n && kind !== 'vc');
    if (have) have.amt += amt; else s.inv.push({ n: FUNDS[kind].n, amt, kind });
  }
  const BUY = {
    car: { n: 'A fast car', cost: 150, kind: 'car', d: 'Loses value every year. Feels incredible.', fx: { fame: 3, morale: 6 } },
    house: { n: 'A house of your own', cost: 600, kind: 'prop', d: 'Somewhere that is yours. Usually goes up.', fx: { morale: 10 } },
    parents: { n: 'A house for your parents', cost: 300, d: 'Not an investment. Worth it anyway.', fx: { morale: 18 } },
  };
  function buy(s, id) {
    const b = BUY[id];
    if (s.money < b.cost) return;
    s.money -= b.cost;
    if (b.kind) s.inv.push({ n: b.n.replace(/^A /, 'Your ').replace('Your house of your own', 'Your house'), amt: b.cost, kind: b.kind });
    ch(s, b.fx);
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

  const G = { SPORTS, KEYS, ORIGINS, ORIG, COUNTRIES, home, BUY, buy, POOL, optsFor, scoreAt, posOf, rate, zoneAt, redraw, migrate, build, fmtH, ARC, EV, ACTS, FUNDS, create, spin, place, advance, takeArc, choose, pickOpt, stop, nextMoment, act, invest, cashOut, legacy, ovr, worth, money, tx };
  if (typeof module !== 'undefined') module.exports = G; else root.G = G;
})(this);
