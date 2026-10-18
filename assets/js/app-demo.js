/* A working replica of werkbord: the Mac app (Universal, Individual and a Team) and the phone, sharing one controller.
   The markup, wording and states follow the product's Svelte components (web/src) so the simulator looks and behaves
   like the app. Start an agent on the desktop and it shows up on the phone; answer on the phone and the desktop moves on.
   The guided story walks through it with quiet notes (demo-guide.js), and nothing is locked. Nothing leaves the page. */
(function () {
  'use strict';
  var esc = WB.esc;
  var deskMount = document.getElementById('app-demo');
  var phoneMount = document.getElementById('phone-demo');
  if (!deskMount && !phoneMount) return;

  /* ---------- the product's icons: 16px grid, 1.4px stroke ---------- */
  var IC = {
    control: '<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>',
    overview: '<rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M2 6.5h12M6.5 6.5V14"/>',
    board: '<rect x="2" y="2.5" width="3.2" height="11" rx="0.8"/><rect x="6.4" y="2.5" width="3.2" height="7.5" rx="0.8"/><rect x="10.8" y="2.5" width="3.2" height="5" rx="0.8"/>',
    calendar: '<rect x="2" y="3" width="12" height="11" rx="1.2"/><path d="M5 1.8v2.4M11 1.8v2.4M2 7h12"/>',
    git: '<circle cx="4.5" cy="3.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="11.5" cy="5.5" r="1.5"/><path d="M4.5 5v6M11.5 7c0 2.5-3 2.8-7 4"/>',
    runs: '<path d="M2.5 4h11M2.5 8h11M2.5 12h7"/><circle cx="12.5" cy="12" r="1.2"/>',
    folder: '<path d="M2 4.5A1 1 0 0 1 3 3.5h3L7.5 5H13a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>',
    runner: '<rect x="2" y="2.5" width="12" height="8.5" rx="1"/><path d="M5.5 13.5h5M8 11v2.5"/>',
    settings: '<path d="M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7"/><circle cx="10.5" cy="4.5" r="1.5"/><circle cx="5.5" cy="11.5" r="1.5"/>',
    bug: '<rect x="4.5" y="5" width="7" height="8" rx="3.5"/><path d="M6 5V3h4v2M8 6v7M2 5l2.5 2M1.5 9h3M2 13l2.5-2M14 5l-2.5 2M14.5 9h-3M14 13l-2.5-2"/>',
    search: '<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>',
    plus: '<path d="M8 3v10M3 8h10"/>',
    left: '<path d="M10 3L5 8l5 5"/>', right: '<path d="M6 3l5 5-5 5"/>', down: '<path d="M4 6l4 4 4-4"/>',
    close: '<path d="M4 4l8 8M12 4l-8 8"/>',
    sun: '<circle cx="8" cy="8" r="3"/><path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/>',
    moon: '<path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"/>',
    play: '<path d="M4.5 3v10l8.5-5z"/>', stop: '<rect x="4" y="4" width="8" height="8" rx="1"/>',
    check: '<path d="M3 8.5l3 3 7-7"/>',
    reply: '<path d="M6.5 4L2.5 8l4 4"/><path d="M2.5 8H10a3.5 3.5 0 0 1 3.5 3.5V13"/>',
    merge: '<circle cx="4.5" cy="3.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="11.5" cy="10.5" r="1.5"/><path d="M4.5 5v6M4.5 5c0 3 2.5 5.5 5.5 5.5"/>',
    grip: '<circle cx="6" cy="4" r="0.5"/><circle cx="10" cy="4" r="0.5"/><circle cx="6" cy="8" r="0.5"/><circle cx="10" cy="8" r="0.5"/><circle cx="6" cy="12" r="0.5"/><circle cx="10" cy="12" r="0.5"/>',
    pr: '<circle cx="4.5" cy="3.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="11.5" cy="12.5" r="1.5"/><path d="M4.5 5v6M11.5 11V7.5a2 2 0 0 0-2-2H7"/>',
    changes: '<path d="M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7"/><circle cx="10.5" cy="4.5" r="1.5"/><circle cx="5.5" cy="11.5" r="1.5"/>',
    assistant: '<path d="M6 2.5l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z"/><path d="M12 9.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
    people: '<circle cx="6" cy="5.5" r="2.3"/><path d="M1.8 13c0-2.3 1.9-3.8 4.2-3.8s4.2 1.5 4.2 3.8M10.6 3.6a2.2 2.2 0 0 1 0 3.8M12.4 9.5c1.2.5 1.8 1.6 1.8 3.5"/>',
    analytics: '<path d="M2 2v12h12M5 11V8M8 11V5M11 11V3"/>',
    activity: '<path d="M1.5 8h3l2-5 3 10 2-5h3"/>',
    edit: '<path d="M10.5 2.5l3 3L5.5 13.5l-3.5.5.5-3.5z"/><path d="M2 14.5h12"/>',
    help: '<circle cx="8" cy="8" r="5.8"/><path d="M6.3 6.4a1.8 1.8 0 1 1 2.5 1.6c-.5.3-.8.6-.8 1.1v.3"/><path d="M8 11.7v.1"/>'
  };
  function ic(n, size) { size = size || 16; return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>'; }
  function mark(h) { var w = Math.round(h * 130 / 94); return '<span class="w-mark"><img class="mark-l" src="assets/img/mark-light.svg" alt="" width="' + w + '" height="' + h + '"><img class="mark-d" src="assets/img/mark-dark.svg" alt="" width="' + w + '" height="' + h + '"></span>'; }
  function dot(tone, cls) { return '<span class="w-dot' + (cls ? ' ' + cls : '') + '" data-tone="' + tone + '"></span>'; }

  /* ---------- time: Wednesday 7 October 2026, a little before eleven ---------- */
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var TODAY = 2, HOUR = 48, H0 = 7, H1 = 19, LIMIT = 3;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(m) { m = Math.floor(m); m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function dur(min) { min = Math.max(0, Math.floor(min)); return min < 1 ? 'just now' : min < 60 ? min + 'm' : Math.floor(min / 60) + 'h ' + pad(min % 60) + 'm'; }
  function ago(min) { min = Math.max(0, Math.floor(min)); return min < 1 ? 'just now' : min < 60 ? min + 'm ago' : min < 1440 ? Math.floor(min / 60) + 'h ago' : Math.floor(min / 1440) + 'd ago'; }
  function dateOf(d) { return new Date(2026, 9, 5 + d); }
  function dayLabel(d) { var x = dateOf(d); return DAYS[(d % 7 + 7) % 7] + ' ' + MONTHS[x.getMonth()] + ' ' + x.getDate(); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 34).replace(/-$/, ''); }

  /* ---------- the controller's state ---------- */
  var S = {
    now: 10 * 60 + 42, nextId: 13, seq: 0x4f2a,
    finding: true,
    // The rest of Individual and a Team: a backdrop that Universal reads beside my-app. See "the other workspaces" below.
    ext: {
      run: { title: 'Rate-limit the webhook endpoint', project: 'api-server', agent: 'Codex', el: 31 },
      ask: { id: 'x2', title: 'Fix flaky auth test', project: 'api-server', agent: 'Claude Code', prio: 'high', st: 'needs', asked: 9 * 60 + 52,
        q: 'The session test passes alone and fails in the full suite. Fix the shared clock, or skip the test for now?', choices: ['Fix the shared clock', 'Skip it for now'] },
      cal: [
        { title: 'Audit dependencies for advisories', project: 'api-server', tag: 'Individual', d: 2, s: 15 * 60, dur: 90 },
        { title: 'WB-44 Rate-limit login attempts', project: 'storefront', tag: 'Northwind', d: 3, s: 10 * 60, dur: 120 }
      ]
    },
    team: {
      name: 'Northwind', project: 'storefront', role: 'Admin', nextN: 47,
      members: [['Sam Okafor', 'Owner', 'Runner online'], ['You', 'Admin', 'This computer'], ['Maya Chen', 'Member', 'Runner online'], ['Jonas Weber', 'Member', 'Runner online'], ['Priya Nair', 'Member', 'Writes tickets from the browser']],
      tickets: [
        { n: 36, title: 'Upgrade the payments client', st: 'done', who: 'Jonas Weber', branch: 'wb-36-upgrade-the-payments-client', ahead: 2, pr: { n: 205, state: 'merged' } },
        { n: 40, title: 'Add audit log filters', st: 'progress', who: 'You', branch: 'wb-40-add-audit-log-filters', ahead: 2, pr: { n: 212, state: 'open' }, exec: 'running' },
        { n: 42, title: 'Show cart total with tax', st: 'review', who: 'Maya Chen', reviewer: 'You', branch: 'wb-42-show-cart-total-with-tax', ahead: 4, pr: { n: 216, state: 'merged' } },
        { n: 44, title: 'Rate-limit login attempts', st: 'progress', who: 'Jonas Weber', branch: 'wb-44-rate-limit-login-attempts', ahead: 3, pr: { n: 219, state: 'draft' } },
        { n: 45, title: 'Landing page copy for reports', st: 'available', by: 'Priya Nair' },
        { n: 46, title: 'Pick a date range on reports', st: 'backlog', by: 'Priya Nair' }
      ]
    },
    tasks: [
      T(1, 'Fix flaky auth test', 'doing', 'Claude Code', 'high', {
        desc: 'The session test fails about one run in ten. Find the race, fix it, and keep the test.',
        sched: { d: 2, s: 600, dur: 60 },
        run: run('running', 14, { left: 13, logs: ['Reading internal/auth/session_test.go', 'The test reads time.Now twice; the second read can cross a second boundary', 'Editing internal/auth/session.go to take an injected clock', 'Running go test ./internal/auth -run Session -count=50', '50 passed in 4.1s', 'Running go test ./...'] })
      }),
      T(2, 'Migrate runs table to WAL', 'doing', 'Claude Code', 'high', {
        desc: 'Readers block while the scheduler writes. Switch the runs table to write-ahead logging.',
        sched: { d: 2, s: 630, dur: 60 },
        run: run('needs', 9, { asked: 10 * 60 + 38, q: 'Two callers still read the old 24-hour session TTL. Keep it for them, or move both to the new 12-hour default?', choices: ['Keep 24 hours', 'Move both to 12 hours'], left: 8,
          logs: ['Reading internal/store/sqlite/open.go', 'The runs table is opened in rollback-journal mode', 'Searching for callers of SessionTTL'],
          after: ['Enabling WAL in internal/store/sqlite/open.go', 'Running go test ./internal/store/...', '31 passed in 2.7s', 'Checking that readers no longer wait on the scheduler'] })
      }),
      T(3, 'Handle missed schedules after sleep', 'doing', 'Codex', 'normal', {
        run: run('blocked', 6, { asked: 10 * 60 + 31, q: 'config.json says UTC, but this project is set to Europe/Amsterdam. A run missed during sleep would start an hour apart depending on which one wins.', choices: ['Use the project’s zone', 'Use UTC'], left: 9,
          logs: ['Reading internal/service/orchestration.go', 'Comparing the two timezone settings'],
          after: ['Using the project’s timezone for missed runs', 'Adding a test for a Mac that slept past 09:00', 'Running go test ./internal/service/...', '64 passed'] })
      }),
      T(4, 'Refactor settings page', 'doing', 'Claude Code', 'normal', {
        run: run('completed', 23, { branch: 'refactor-settings-page', ahead: 3, files: 6, add: 142, del: 61, commit: 'Show one settings section at a time', tokens: '61.4k', cost: '$0.52', ended: 10 * 60 + 12 })
      }),
      T(5, 'Fix date picker off-by-one', 'review', 'Codex', 'normal', {
        run: run('completed', 11, { branch: 'fix-date-picker-off-by-one', ahead: 1, files: 2, add: 12, del: 3, commit: 'Count the picker’s days from local midnight', ended: 9 * 60 + 48 })
      }),
      T(6, 'Add CSV export to reports', 'backlog', 'Claude Code', 'normal', { sched: { d: 3, s: 540, dur: 60 },
        script: { work: 12, ask: { at: 5, q: 'Two of your largest customers open these files in German Excel. Use semicolons instead of commas?', choices: ['Use semicolons', 'Keep commas'] },
          logs: ['Reading internal/reports/export.go', 'Adding a CSV writer beside the PDF one', 'Writing tests for quoting and line endings', 'Running go test ./internal/reports/...', '18 passed'] } }),
      T(7, 'Upgrade vite to the latest minor', 'backlog', 'Claude Code', 'low', { deps: [1], sched: { d: 4, s: 840, dur: 60 },
        script: { work: 9, logs: ['Reading package.json', 'vite 5.3.1 → 5.4.8: no breaking changes listed', 'Running npm install', 'Running npm run build', 'Build passed in 6.2s'] } }),
      T(8, 'Write onboarding copy for setup', 'backlog', 'Claude Code', 'low', {
        script: { work: 10, logs: ['Reading web/src/routes/Onboarding.svelte', 'Rewriting the three setup steps in plain language', 'Checking each sentence fits the card', 'Running npm test', '42 passed'] } }),
      T(9, 'Investigate slow search on large repos', 'backlog', 'Codex', 'normal', {
        script: { work: 14, logs: ['Profiling search on a 40,000-file repository', 'Most of the time goes to re-reading ignored folders', 'Caching ignore rules per directory', 'Running go test -bench ./internal/search', 'Search is 6.1× faster on the large fixture'] } }),
      T(10, 'Audit dependencies for advisories', 'backlog', 'Codex', 'low', { sched: { d: 2, s: 900, dur: 90 },
        script: { work: 10, logs: ['Running npm audit', 'Running govulncheck ./...', 'One advisory, in a dev dependency only', 'Writing docs/advisories.md'] } }),
      T(11, 'Add project switcher', 'done', 'Claude Code', 'normal', { doneAt: 8 * 60 + 30, run: run('merged', 18, { branch: 'add-project-switcher', ahead: 2, tokens: '44.9k', cost: '$0.37', ended: 8 * 60 + 20 }) }),
      T(12, 'Verify installer checksums', 'done', 'Codex', 'normal', { doneAt: -600, run: run('merged', 7, { branch: 'verify-installer-checksums', ahead: 1, ended: -640 }) })
    ],
    log: [
      { t: 10 * 60 + 38, x: 'Claude Code asked a question on “Migrate runs table to WAL”' },
      { t: 10 * 60 + 31, x: 'Codex stopped rather than guess on “Handle missed schedules after sleep”' },
      { t: 10 * 60 + 28, x: 'Claude Code started on “Fix flaky auth test”' },
      { t: 10 * 60 + 12, x: '“Refactor settings page” finished' },
      { t: 9 * 60 + 48, x: '“Fix date picker off-by-one” is ready for review' },
      { t: 8 * 60 + 30, x: 'You merged werkbord/add-project-switcher into main' }
    ]
  };
  function run(st, el, o) {
    var r = { st: st, el: el, id: 'run-' + (S ? S.seq++ : 0).toString(36), logs: [], li: 0, feed: [] };
    for (var k in o) r[k] = o[k];
    return r;
  }
  function T(id, title, state, agent, prio, o) {
    var t = { id: id, title: title, state: state, agent: agent, prio: prio, desc: '', deps: [], sched: null, run: null, script: null, doneAt: null, interaction: 'Ask me when needed' };
    for (var k in o) t[k] = o[k];
    return t;
  }
  // run ids and feeds, now that S exists
  S.tasks.forEach(function (t, i) {
    if (!t.run) return;
    t.run.id = 'run-' + (0x6c1f + i * 977).toString(36).slice(-4);
    var start = t.run.ended != null ? t.run.ended - t.run.el : S.now - t.run.el;
    t.run.started = start;
    var f = [{ k: 'sys', x: 'Agent started', t: start }];
    (t.run.logs || []).forEach(function (l, j) { if (t.run.st !== 'running' || j <= 2) f.push({ k: 'out', x: l, t: start + 1 + j }); });
    if (t.run.st === 'running') t.run.li = 3;
    if (t.run.st === 'needs') f.push({ k: 'q', x: t.run.q, t: t.run.asked });
    if (t.run.st === 'blocked') f.push({ k: 'block', x: t.run.q, t: t.run.asked });
    if (t.run.st === 'completed' || t.run.st === 'merged') { f.push({ k: 'out', x: 'Committed: ' + (t.run.commit || 'the change'), t: (t.run.ended || start) - 1 }); f.push({ k: 'sys', x: 'Session finished', t: t.run.ended || start }); }
    t.run.feed = f;
  });

  /* ---------- views: each surface has its own navigation ---------- */
  var D = { ws: 'universal', uv: 'mywork', tv: 'board', view: 'control', sw: false, task: null, ptab: 'activity', sheet: null, pal: null, week: 0, mode: 'week', pick: null, cc: 'all', drag: null, scroll: {} };
  var P = { scope: 'individual', teamTab: 'board', deckAdded: false, repo: null, at: 'deck', tab: 'board', task: null, ptab: 'activity', sheet: null, col: 'backlog', day: TODAY, mode: 'day', cc: 'all', wf: null, af: 'all', scroll: {} };

  // Start with a clean project so the visitor sees an idea become a working board.
  S.tasks = []; S.log = []; S.finding = false;
  var initialState = JSON.stringify(S);
  var G = { mode: 'core', active: false, f: {}, s: {}, floor: 0, cur: null, where: null, hide: null };

  function get(id) { for (var i = 0; i < S.tasks.length; i++) if (S.tasks[i].id == id) return S.tasks[i]; }
  function isActive(t) { return t.run && ['running', 'needs', 'blocked', 'idle'].indexOf(t.run.st) > -1; }
  function active() { return S.tasks.filter(isActive).length; }
  function waitingFor(t) { return (t.deps || []).map(get).filter(function (d) { return d && d.state !== 'review' && d.state !== 'done'; }); }
  function questions() { return S.tasks.filter(function (t) { return t.run && t.run.st === 'needs'; }); }
  function needsYou() { return S.tasks.filter(function (t) { return t.run && (t.run.st === 'needs' || t.run.st === 'blocked'); }).length; }
  function say(x) { S.log.unshift({ t: S.now, x: x }); if (S.log.length > 30) S.log.pop(); }
  function feed(t, k, x) { if (!t.run) return; var e = { k: k, x: x, t: S.now }; t.run.feed.push(e); if (t.run.feed.length > 40) t.run.feed.shift(); appendFeed(t, e); }
  function branchOf(t) { return t.run && t.run.branch ? 'werkbord/' + t.run.branch : ''; }
  function aheadText(t) { return branchOf(t) + ' · ' + t.run.ahead + ' commit' + (t.run.ahead === 1 ? '' : 's') + ' ahead'; }

  /* ---------- what a card says (lib/board.ts cardStatus) ---------- */
  function status(t) {
    var r = t.run;
    if (t.state === 'done') return { tone: 'ok', text: 'Done · ' + ago(S.now - t.doneAt), detail: '' };
    if (r) {
      if (r.st === 'running') return { tone: 'work', text: 'Running · ' + dur(r.el) + ' · this computer', detail: '› ' + (r.logs[Math.max(0, r.li - 1)] || 'Reading the task'), live: true };
      if (r.st === 'needs') return { tone: 'ask', text: 'Needs you · ' + dur(S.now - r.asked), detail: r.q };
      if (r.st === 'blocked') return { tone: 'block', text: 'Blocked · stopped rather than guess', detail: r.q };
      if (r.st === 'queued') return { tone: 'neutral', text: 'Waiting for Capacity', detail: 'Project concurrency limit (' + LIMIT + ') is occupied. It starts when a slot frees up.' };
      if (r.st === 'stopped') return { tone: 'neutral', text: 'Stopped', detail: 'You stopped the agent. The worktree is kept.' };
      if (r.st === 'completed') return { tone: 'ok', text: t.state === 'review' ? 'Ready for review' : 'Session finished · ready to review', detail: aheadText(t) };
    }
    var w = waitingFor(t);
    if (w.length) return { tone: 'neutral', text: 'Waits for ' + w.map(function (d) { return d.title; }).join(', '), detail: '' };
    if (t.sched) return { tone: 'neutral', text: 'Scheduled', detail: 'Waiting for scheduled time' };
    return { tone: 'neutral', text: 'Not started', detail: '' };
  }
  function prioLabel(p) { return p === 'high' ? 'High' : p === 'low' ? 'Low' : ''; }

  function cardHTML(t, sel) {
    var s = status(t), r = t.run, acts = '';
    if (r && (r.st === 'needs' || r.st === 'blocked')) {
      acts = r.choices.map(function (c) { return '<button class="w-btn sm" type="button" data-a="answer" data-id="' + t.id + '" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') +
        '<button class="w-btn sm" type="button" data-a="open" data-id="' + t.id + '">' + ic('reply', 14) + 'Reply</button>';
    } else if (r && r.st === 'completed' && t.state === 'review') {
      acts = '<button class="w-btn sm pri" type="button" data-a="merge" data-id="' + t.id + '">' + ic('merge', 14) + 'Merge…</button><button class="w-btn sm" type="button" data-a="open" data-id="' + t.id + '">Review</button>';
    } else if (r && r.st === 'completed' && t.state === 'doing') {
      acts = '<button class="w-btn sm pri" type="button" data-a="toreview" data-id="' + t.id + '">' + ic('right', 14) + 'Move to Review</button>';
    } else if (t.state === 'backlog' && !waitingFor(t).length && (!r || r.st === 'stopped')) {
      acts = '<button class="w-btn sm" type="button" data-a="start" data-id="' + t.id + '" aria-label="Start an agent on “' + esc(t.title) + '”">' + ic('play', 12) + (r ? 'Run again' : 'Start agent') + '</button>';
    }
    var drag = t.state === 'backlog' || t.state === 'review' || (t.state === 'doing' && r && r.st === 'completed');
    return '<li class="w-card w-task' + (s.live ? ' live' : '') + (t.state === 'done' ? ' settled' : '') + (sel ? ' selected' : '') + (t.fresh ? ' fresh' : '') + '" data-tone="' + s.tone + '" data-card="' + t.id + '"' + (drag ? ' draggable="true"' : '') + '>' +
      '<button class="title" type="button" data-a="open" data-id="' + t.id + '" draggable="false">' + esc(t.title) + '</button>' +
      '<p class="w-st">' + dot(s.tone, (s.tone === 'neutral' ? 'hollow' : '') + (s.tone === 'work' ? ' pulse' : '')) + '<span data-st="' + t.id + '">' + esc(s.text) + '</span></p>' +
      (s.detail ? '<p class="w-well detail" data-lg="' + t.id + '">' + esc(s.detail) + '</p>' : '') +
      (acts ? '<div class="acts">' + acts + '</div>' : '') +
      '<div class="mt"><span class="w-chip">' + t.agent + '</span>' + (prioLabel(t.prio) ? '<span class="w-prio" data-p="' + t.prio + '">' + prioLabel(t.prio) + '</span>' : '') + '</div></li>';
  }

  /* ---------- what needs a person (lib/attention.ts) ---------- */
  function attention() {
    var out = [];
    S.tasks.forEach(function (t) {
      if (!t.run) return;
      if (t.run.st === 'needs') out.push({ kind: 'question', t: t });
      else if (t.run.st === 'blocked') out.push({ kind: 'blocked', t: t });
    });
    S.tasks.forEach(function (t) { if (t.run && t.run.st === 'completed') out.push({ kind: 'review', t: t }); });
    return out;
  }
  function itemHTML(it, showProject) {
    var t = it.t, r = t.run;
    if (it.kind === 'review') {
      return '<li class="w-card w-row">' + dot('ok') + '<div class="what"><button class="rtitle" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button><p class="w-mm">Ready for review' + (showProject ? ' · my-app' : '') + ' · ' + t.agent + '</p></div>' +
        '<button class="w-btn sm" type="button" data-a="' + (t.state === 'review' ? 'merge' : 'toreview') + '" data-id="' + t.id + '">' + (t.state === 'review' ? 'Merge…' : 'Move to Review') + '</button></li>';
    }
    var label = it.kind === 'question' ? 'Needs input' : 'Blocked', tone = it.kind === 'question' ? 'ask' : 'block';
    return '<li class="w-card w-item" data-kind="' + it.kind + '"><p class="w-kind">' + dot(tone) + '<b>' + label + '</b><span>' + (showProject ? (it.project || 'my-app') + ' · ' : '') + '<span data-wait="' + t.id + '">' + dur(S.now - r.asked).toUpperCase() + '</span></span><span class="agent">' + t.agent + '</span></p>' +
      '<button class="ititle" type="button" data-a="' + (t.project && t.project !== 'my-app' ? 'other' : 'open') + '" data-id="' + t.id + '">' + esc(t.title) + '</button>' +
      (it.kind === 'question' ? '<p class="w-q">' + esc(r.q) + '</p>' : '<p class="w-well">Stopped rather than guess.<br>' + esc(r.q) + '</p>') +
      '<div class="acts">' + r.choices.map(function (c) { return '<button class="w-btn sm" type="button" data-a="answer" data-id="' + t.id + '" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') +
      (it.kind === 'blocked' ? '<button class="w-btn sm" type="button" data-a="open" data-id="' + t.id + '">' + ic('reply', 14) + 'Reply</button>' : '') + '</div></li>';
  }

  /* ---------- actions ---------- */
  var startScript = {
    work: 10, logs: ['Reading the project layout', 'Finding where this change belongs', 'Editing the implementation', 'Running the tests', 'All tests pass']
  };
  function startTask(id, quiet) {
    var t = get(id); if (!t || t.state !== 'backlog') return;
    var w = waitingFor(t);
    if (w.length) { toast('“' + t.title + '” waits for “' + w[0].title + '”. It becomes ready when that one does.'); return; }
    var sc = t.script || startScript;
    var seconds = 38 + t.id % 7;
    t.state = 'doing'; t.fresh = true;
    t.run = run('queued', 0, { left: seconds, phaseDuration: seconds, phaseElapsed: 0, logs: sc.logs.slice(), ask: sc.ask, li: 0, feed: [] });
    t.run.id = 'run-' + (S.seq++).toString(36);
    if (active() < LIMIT) begin(t);
    else { say('“' + t.title + '” is queued: the project runs ' + LIMIT + ' agents at once'); if (!quiet) toast(LIMIT + ' agents are already working. “' + t.title + '” starts the moment one finishes.'); }
  }
  function begin(t) {
    t.run.st = 'running'; t.run.started = S.now; t.fresh = true;
    t.run.feed = [{ k: 'sys', x: 'Agent started', t: S.now }];
    say(t.agent + ' started on “' + t.title + '”');
  }
  function pump() {
    S.tasks.forEach(function (t) { if (t.run && t.run.st === 'queued' && active() < LIMIT) begin(t); });
  }
  function answer(id, v) {
    if (id === S.ext.ask.id) { answerExt(v); return; }
    var t = get(id); if (!t || !t.run) return;
    var was = t.run.st;
    if (was !== 'needs' && was !== 'blocked') return;
    t.run.st = 'running'; t.fresh = true;
    t.run.left = t.run.phaseDuration = 34 + t.id % 7; t.run.phaseElapsed = 0;
    if (t.run.after) { t.run.logs = t.run.logs.concat(t.run.after); t.run.after = null; }
    feed(t, 'me', v);
    say('You answered “' + t.title + '”: ' + v);
    toast('Sent. ' + t.agent + ' carries on with “' + v + '”.');
  }
  function finish(t) {
    var r = t.run;
    r.st = 'completed'; r.ended = S.now; t.fresh = true;
    r.branch = slug(t.title); r.ahead = 1 + (t.id % 3); r.files = 2 + (t.id % 5); r.add = 18 + (t.id * 37) % 120; r.del = Math.floor(r.add / 4);
    r.commit = r.commit || t.title;
    if (t.agent === 'Claude Code') { r.tokens = (20 + (t.id * 13) % 50) + '.' + (t.id % 9) + 'k'; r.cost = '$0.' + pad(18 + (t.id * 7) % 60); }
    feed(t, 'out', 'Committed: ' + r.commit); feed(t, 'sys', 'Session finished');
    say('“' + t.title + '” finished');
    if (t.story) { t.state = 'review'; say('“' + t.title + '” is ready for review'); }
    toast('“' + t.title + '” is ready for your review.');
    pump();
  }
  function toReview(id) {
    var t = get(id); if (!t || !t.run || t.run.st !== 'completed') return;
    t.state = 'review'; t.fresh = true;
    say('You moved “' + t.title + '” to Review');
  }
  function mergeTask(id) {
    var t = get(id); if (!t || !t.run) return;
    t.state = 'done'; t.run.st = 'merged'; t.doneAt = S.now; t.fresh = true;
    if (t.id === 4) S.finding = false;
    say('You merged ' + branchOf(t) + ' into main');
    toast('Merged into main on this computer. Nothing was pushed.');
  }
  function stopTask(id) {
    var t = get(id); if (!t || !isActive(t)) return;
    t.run.st = 'stopped'; t.state = 'backlog';
    feed(t, 'sys', 'Stopped by you');
    say('You stopped the agent on “' + t.title + '”');
    pump();
  }
  function newTask(title, agent, prio, startNow) {
    var t = T(S.nextId++, title, 'backlog', agent, prio, { fresh: true });
    S.tasks.push(t);
    say('You added “' + title + '” to Backlog');
    if (startNow) startTask(t.id);
    return t;
  }
  function schedule(id, d, m) {
    var t = get(id); if (!t) return;
    var dd = t.sched ? t.sched.dur : 60;
    m = Math.max(H0 * 60, Math.min(H1 * 60 - dd, Math.round(m / 15) * 15));
    t.sched = { d: d, s: m, dur: dd }; t.fresh = true;
    D.pick = null;
    say('“' + t.title + '” scheduled for ' + dayLabel(d) + ' ' + clock(m));
    toast('Scheduled for ' + dayLabel(d) + ', ' + clock(m) + '. It starts by itself, even with this window closed.');
  }

  /* ---------- Salie: predefined messages, scripted replies ----------
     The person picks one of the messages on offer; there is no text box. Each message has a reply written in advance, which
     streams in word by word, and the next messages on offer follow from it. A reply can carry generated interface (the
     OpenUI blocks the product draws inline: figures, a chart, a table that sorts and filters here, all read only) and
     changes to confirm. Nothing changes until the person confirms it, one card at a time or all at once. Each surface keeps
     its own conversation, as in the product: the desktop assistant reaches the Team workspaces connected to the window, and
     a phone sees Individual only. The replies read the demo's current state. */
  var CARD_LEAD = 'Here is what I will do. Nothing changes until you confirm.';
  var NOT_OPEN = 'That is already settled, so nothing needs to change.';
  var AS = { msgs: [], opts: null, busy: false, timer: null, open: false };
  function asstFresh() { clearTimeout(AS.timer); AS.msgs = []; AS.opts = null; AS.busy = false; AS.timer = null; }
  function waitingChanges() {
    var n = 0;
    AS.msgs.forEach(function (m) { (m.cards || []).forEach(function (c) { if (!c.state) n++; }); });
    return n;
  }
  function rootOpts() {
    return ['What is on my plate this week?', 'Plan CSV export for reports', 'What needs me today?'];
  }
  function backOpts(extra) {
    var o = (extra || []).concat(['What is on my plate this week?', 'What needs me today?']);
    if (!planned()) o.unshift('Plan CSV export for reports');
    return o.filter(function (l, i) { return o.indexOf(l) === i; }).slice(0, 3);
  }
  function optsNow() { return AS.opts || rootOpts(); }

  function rowSentence(r) {
    if (r.kind === 'question') return '“' + r.t.title + '” (' + r.project + ') has a question for you: ' + r.t.run.q;
    if (r.kind === 'blocked') return '“' + r.t.title + '” (' + r.project + ') stopped rather than guess: ' + r.t.run.q;
    if (r.ws === 'team') return r.k.who + ' asked for your review of “WB-' + r.k.n + ' ' + r.k.title + '” in ' + S.team.name + '.';
    return '“' + r.t.title + '” (' + r.project + ') is finished and ready for review.';
  }
  function needsText() {
    var rows = rowsAll();
    if (!rows.length) return 'Nothing needs you right now.';
    return (rows.length === 1 ? 'One thing needs you. ' : rows.length + ' things need you. ') + rows.map(rowSentence).join(' ');
  }
  function agendaText() {
    var rows = S.tasks.filter(function (t) { return t.sched && t.state !== 'done'; }).map(function (t) { return { at: schedAbs(t), d: t.sched.d, s: t.sched.s, title: t.title }; });
    S.ext.cal.forEach(function (e) { if (e.tag === 'Individual') rows.push({ at: e.d * 1440 + e.s, d: e.d, s: e.s, title: e.title }); });
    rows.sort(function (a, b) { return a.at - b.at; });
    if (!rows.length) return 'Nothing is scheduled in Individual yet.';
    return 'Here is the schedule across your projects, in order. ' + rows.map(function (r) { return dayLabel(r.d) + ' at ' + clock(r.s) + ': ' + r.title; }).join('. ') + '.';
  }
  function plateText() {
    var n = rowsAll().length;
    return 'Here is your week across Individual and ' + S.team.name + '. ' + (n ? n + (n === 1 ? ' thing is' : ' things are') + ' waiting on you, and the rest is moving.' : 'Nothing is waiting on you, and the rest is moving.');
  }

  /* The generated interface for "What is on my plate this week?": what the registry's blocks make from the same rows My Work
     and the calendar read. It is a snapshot, stamped with the time it was read. */
  function execWord(x) { return ({ running: 'Running', needs_input: 'Needs you', blocked: 'Blocked', queued: 'Queued', completed: 'Ready for review' })[x] || ''; }
  function plateRows() {
    var rows = [];
    myWorkRows().forEach(function (r) { rows.push([r.title, r.wsName, r.project, execWord(r.exec) || (r.status === 'review' ? 'In review' : 'In progress')]); });
    S.team.tickets.forEach(function (k) { if (k.st === 'review' && k.who !== ME) rows.push(['WB-' + k.n + ' ' + k.title, S.team.name, S.team.project, 'Needs you']); });
    S.tasks.forEach(function (t) { if (t.sched && t.state === 'backlog') rows.push([t.title, 'Individual', 'my-app', 'Planned ' + dayLabel(t.sched.d).split(' ')[0] + ' ' + clock(t.sched.s)]); });
    S.ext.cal.forEach(function (e) { if (e.tag === 'Individual') rows.push([e.title, 'Individual', e.project, 'Planned ' + dayLabel(e.d).split(' ')[0] + ' ' + clock(e.s)]); });
    return rows;
  }
  function plateUI() {
    var rows = plateRows(), by = {};
    rows.forEach(function (r) { by[r[2]] = (by[r[2]] || 0) + 1; });
    var count = function (w) { return rows.filter(function (r) { return r[3] === w; }).length; };
    return { at: clock(S.now), cols: ['Item', 'Workspace', 'Project', 'Status'], rows: rows, sort: -1, dir: 1, q: '',
      metrics: [['Needs you', String(rowsAll().length), 'in 2 workspaces'], ['Running', String(count('Running')), 'on your runners'], ['In review', String(count('In review') + count('Ready for review')), 'waiting for a person'], ['Planned', String(rows.filter(function (r) { return /^Planned/.test(r[3]); }).length), 'this week']],
      bars: Object.keys(by).map(function (k) { return [k, by[k]]; }).sort(function (a, b) { return b[1] - a[1]; }) };
  }
  function uiRows(u) {
    var q = u.q.trim().toLowerCase(), c = u.sort;
    var rows = u.rows.filter(function (r) { return !q || r.some(function (x) { return x.toLowerCase().indexOf(q) > -1; }); });
    if (c >= 0) rows = rows.slice().sort(function (a, b) { return a[c].localeCompare(b[c], undefined, { numeric: true, sensitivity: 'base' }) * u.dir; });
    return rows;
  }
  function uiBodyHTML(u) {
    var rows = uiRows(u);
    if (u.progress != null) rows = rows.slice(0, Math.max(0, u.progress - 5 - u.bars.length));
    return rows.length ? rows.map(function (r) { return '<tr>' + r.map(function (x, j) { return '<td' + (j === 3 && x === 'Needs you' ? ' class="hot"' : '') + '>' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="4" class="none">' + (u.progress != null ? 'Adding work items…' : 'No rows match the filter.') + '</td></tr>';
  }
  function uiHTML(u, i) {
    var peak = Math.max.apply(null, u.bars.map(function (b) { return b[1]; }).concat(1));
    return '<section class="w-ui' + (u.progress != null ? ' is-building' : '') + '" aria-label="Interface generated by Salie">' +
      '<div class="w-uimetrics">' + u.metrics.slice(0, u.progress == null ? 4 : Math.min(4, u.progress)).map(function (m) { return '<div class="w-metric"><p class="l">' + esc(m[0]) + '</p><p class="v">' + esc(m[1]) + '</p><p class="d">' + esc(m[2]) + '</p></div>'; }).join('') + '</div>' +
      (u.progress == null || u.progress > 4 ? '<div class="w-uichart"><h3>Open work by project</h3>' + u.bars.slice(0, u.progress == null ? u.bars.length : u.progress - 4).map(function (b) { return '<div class="bar"><span class="c">' + esc(b[0]) + '</span><span class="track"><span style="width:' + Math.round(b[1] / peak * 100) + '%"></span></span><span class="n">' + b[1] + '</span></div>'; }).join('') + '</div>' : '') +
      (u.progress == null || u.progress > 4 + u.bars.length ? '<div class="w-uitable"><div class="hd"><h3>Everything open</h3><label class="f"><span>Filter rows</span><input type="search" data-ui-q="' + i + '" value="' + esc(u.q) + '" aria-label="Filter everything open"></label></div>' +
      '<div class="scroll"><table><thead><tr>' + u.cols.map(function (c, j) {
        return '<th scope="col" aria-sort="' + (u.sort === j ? (u.dir > 0 ? 'ascending' : 'descending') : 'none') + '"><button type="button" data-a="ui-sort" data-id="' + i + '" data-v="' + j + '" aria-label="Sort by ' + esc(c) + '">' + esc(c) + '<i class="sort' + (u.sort === j ? ' on ' + (u.dir > 0 ? 'asc' : 'desc') : '') + '" aria-hidden="true"></i></button></th>';
      }).join('') + '</tr></thead><tbody data-uitbody="' + i + '">' + uiBodyHTML(u) + '</tbody></table></div></div>' : '') +
      (u.progress == null ? '<p class="stamp">Read at ' + u.at + ' · a snapshot, not live</p>' : '') + '</section>';
  }

  /* Changes Salie proposes: each is a card with its own Confirm, and several at once can be confirmed together. */
  var PLAN = [
    { title: 'Build the reports CSV endpoint', agent: 'Claude Code', desc: 'Add a CSV endpoint for filtered reports. Include headers, quote values safely, and keep the active filters.' },
    { title: 'Add the CSV export button', agent: 'Codex', desc: 'Add Export CSV to the reports toolbar. Call the endpoint, show progress, and show a useful error message.' },
    { title: 'Test the CSV export workflow', agent: 'Claude Code', desc: 'After the endpoint and the button are merged, test the whole export: filters, quoting, empty reports and spreadsheet compatibility.' }
  ];
  var DOC = { title: 'Document the CSV export in the API reference', desc: 'Describe the endpoint, its filters and the separator option for API users.' };
  function makeTask(i) {
    var item = PLAN[i], t = newTask(item.title, item.agent, 'high');
    t.desc = item.desc; t.guided = true; t.story = i + 1;
    if (i === 0) t.script = { work: 9, ask: { at: 3, q: 'Some customers open reports in European spreadsheets. Which separator should the export use?', choices: ['Use semicolons', 'Keep commas'] },
      logs: ['Reading the reports API and filter logic', 'Adding a CSV writer with quoted values', 'Testing filtered reports and empty results', 'Running the reports export tests', '18 tests passed. CSV endpoint ready for review.'] };
    if (i === 1) t.script = { work: 11, logs: ['Reading the reports toolbar', 'Adding Export CSV beside the filters', 'Showing progress and an error message', 'Running the web tests', '24 tests passed. Export button ready for review.'] };
    if (i === 2) {
      t.script = { work: 8, logs: ['Reading the export endpoint and the button', 'Writing tests for filters and quoting', 'Opening a sample in a spreadsheet', 'Running the full report tests', '31 tests passed.'] };
      t.deps = [story(1), story(2)].filter(Boolean).map(function (x) { return x.id; });
    } else { var last = story(3); if (last) last.deps.push(t.id); }
    return t;
  }
  function makeTicket() {
    var k = { n: S.team.nextN++, title: DOC.title, st: 'backlog', by: ME, story: true, desc: DOC.desc };
    S.team.tickets.push(k); return k;
  }
  function taskCard(i) {
    return { op: 'task', i: i, title: PLAN[i].title, dest: 'my-app · Backlog', detail: PLAN[i].agent + '. ' + PLAN[i].desc, done: 'Added to Backlog.',
      ok: function () { return !story(i + 1); }, run: function () { makeTask(i); } };
  }
  function ticketCard() {
    return { op: 'ticket', title: DOC.title, dest: S.team.name + ' · ' + S.team.project + ' · Backlog', detail: DOC.desc, done: 'Added to Backlog.',
      ok: function () { return !storyTicket(); }, run: makeTicket };
  }
  function planCards() { var c = [0, 1, 2].map(taskCard); c.push(ticketCard()); return c; }
  /* The chapter skip and the phone may need the plan without the conversation: this makes what confirming all would. */
  function seedPlan() {
    if (!story(1)) makeTask(0); if (!story(2)) makeTask(1); if (!story(3)) makeTask(2);
    if (!storyTicket()) makeTicket();
  }
  function answerCard(v) {
    var a = S.ext.ask;
    return { op: 'answer', title: 'Answer “' + a.title + '” with “' + v + '”', dest: a.project, detail: '', done: 'Sent. ' + a.agent + ' carries on with “' + v + '”.',
      ok: function () { return S.ext.ask.st === 'needs'; }, run: function () { answerExt(v); } };
  }

  /* Each key is a message the person can pick. text: the scripted reply (a string, or a function that reads the state).
     next: the messages offered after it. ok and gone: the message is only open while ok() holds. ui: generated interface.
     cards: changes to confirm. */
  var REPLY = {
    'What is on my plate this week?': { reads: 'Read My Work, the schedules and Needs you in Individual and Northwind', text: plateText, ui: plateUI,
      next: function () { return backOpts(); } },
    'Plan CSV export for reports': { reads: 'Read the reports tasks and project context',
      ok: function () { return !story(1); }, gone: 'The CSV export is already planned. You will find it in Backlog.',
      text: function () { return 'Let’s split this into three scoped tasks for my-app: the endpoint, an export button and tests. ' + ('The API reference needs a page too, so I will add a ticket for ' + S.team.name + '. ') + 'Each task has an agent and clear acceptance criteria, and the tests wait for the other two.'; },
      cards: planCards },
    'What needs me today?': { reads: 'Read the attention lists', text: needsText,
      next: function () { return backOpts(S.ext.ask.st === 'needs' ? ['Answer the auth test question'] : []); } },
    'What is planned for this week?': { reads: 'Read the schedules in Individual', text: agendaText, next: function () { return backOpts(); } },
    'Answer the auth test question': { reads: 'Read “Fix flaky auth test” and its question',
      text: 'There are two options. Fix the shared clock so the test passes in the full suite, or skip the test for now. Which one should the agent use?',
      ok: function () { return S.ext.ask.st === 'needs'; }, gone: NOT_OPEN, next: function () { return ['Fix the shared clock', 'Skip it for now', 'What needs me today?']; } },
    'Fix the shared clock': { reads: 'Read the task and its question', text: CARD_LEAD, ok: function () { return S.ext.ask.st === 'needs'; }, gone: NOT_OPEN, cards: function () { return [answerCard('Fix the shared clock')]; } },
    'Skip it for now': { reads: 'Read the task and its question', text: CARD_LEAD, ok: function () { return S.ext.ask.st === 'needs'; }, gone: NOT_OPEN, cards: function () { return [answerCard('Skip it for now')]; } }
  };

  function askAsst(label) {
    var e = REPLY[label];
    if (!e || AS.busy) return;
    if (label === 'What is on my plate this week?') G.f.plate = true;
    if (label === 'Plan CSV export for reports') G.f.planAsk = true;
    AS.msgs.push({ r: 'me', x: label });
    AS.opts = [];
    if (e.ok && !e.ok()) { replyAsst({ text: e.gone, next: backOpts }); return; }
    replyAsst(e);
  }
  /* One cancellable timeline streams text, then builds generated blocks and proposals in order.
     Reduced motion changes presentation, never the amount of simulated work. */
  function replyAsst(e) {
    var as = AS, text = typeof e.text === 'function' ? e.text() : e.text;
    var m = { r: 'ai', x: '', reads: e.reads || '', done: false, cards: null, ui: null, open: false, stage: 'Reading workspace context…' };
    var words = text.split(' '), events = [], complex = !!(e.ui || e.cards);
    as.msgs.push(m); as.busy = true;
    function at(time, fn) { events.push({ time: time, fn: fn }); }
    function redraw() {
      var chat = guideSurface().querySelector('.w-achat');
      var stick = !chat || chat.scrollHeight - chat.scrollTop - chat.clientHeight < 90;
      renderAsst(stick); renderPhone();
    }
    var textEnd = complex ? 11500 : Math.max(5000, Math.min(12000, words.length * 155));
    var chunk = WB.reduced ? 7 : 1;
    for (var i = chunk; i < words.length + chunk; i += chunk) (function (n) {
      at(1800 + (textEnd - 1800) * n / words.length, function () {
        m.x = words.slice(0, n).join(' '); m.stage = 'Writing the reply…'; paintReply(m);
      });
    })(Math.min(i, words.length));
    if (e.ui) {
      var u = e.ui(), count = 4 + u.bars.length + 1 + u.rows.length;
      u.progress = 0;
      for (var j = 1; j <= count; j++) (function (n) {
        at(13500 + (32000 - 13500) * (n - 1) / Math.max(1, count - 1), function () {
          m.ui = u; u.progress = n;
          m.stage = n <= 4 ? 'Building your overview…' : n <= 4 + u.bars.length ? 'Grouping work by project…' : 'Adding your work items…'; redraw();
        });
      })(j);
    }
    if (e.cards) {
      var cards = e.cards(); m.cards = [];
      cards.forEach(function (c, j) { at(15000 + j * 5000, function () {
        m.cards.push(c); m.stage = 'Preparing proposed changes · ' + (j + 1) + ' of ' + cards.length; redraw();
      }); });
    }
    at(complex ? 35000 : textEnd + 800, function () {
      as.busy = false; as.timer = null; m.done = true; m.x = text;
      if (m.ui) delete m.ui.progress;
      as.opts = e.cards ? [] : typeof e.next === 'function' ? e.next() : (e.next || backOpts());
      redraw(); render();
    });
    events.sort(function (a, b) { return a.time - b.time; });
    var previous = 0;
    function next() {
      if (!events.length) return;
      var event = events.shift(), delay = event.time - previous; previous = event.time;
      as.timer = setTimeout(function () { if (as.msgs.indexOf(m) < 0) return; event.fn(); next(); }, delay);
    }
    renderAsst(true); renderPhone(); next();
  }
  /* Redraws the words of a reply that is still streaming, in each surface that shows the conversation. */
  function paintReply(m) {
    var at = AS.msgs.indexOf(m);
    [deskRoot, phoneRoot].forEach(function (root) {
      var o = root && root.querySelector('[data-overlay]'), chat = o && o.querySelector('.w-achat');
      var node = chat && chat.querySelector('[data-m="' + at + '"] .w-atext');
      if (!node) return;
      var stick = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 80;
      var statusNode = node.closest('.w-aai').querySelector('.w-astat');
      if (statusNode) statusNode.textContent = m.stage;
      node.innerHTML = esc(m.x) + '<span class="w-acur" aria-hidden="true"></span>';
      if (stick) chat.scrollTop = chat.scrollHeight;
    });
  }
  function settle() { if (!waitingChanges()) AS.opts = backOpts(); }
  function decideCard(mi, ci, yes) {
    var m = AS.msgs[mi], c = m && m.cards && m.cards[ci];
    if (!c || c.state || AS.busy) return;
    if (yes && c.ok()) { c.run(); c.state = 'yes'; } else c.state = yes ? 'gone' : 'no';
    settle(); renderAsst(false); render();
  }
  /* Confirm all, or Not now, takes the changes that were waiting when it was pressed. Each is still its own change. */
  function decideAll(mi, yes) {
    var m = AS.msgs[mi]; if (!m || !m.cards || AS.busy) return;
    var added = 0, failed = 0;
    m.cards.forEach(function (c) {
      if (c.state) return;
      if (yes && c.ok()) { c.run(); c.state = 'yes'; added++; } else { c.state = yes ? 'gone' : 'no'; if (yes) failed++; }
    });
    m.result = yes ? [added ? added + ' added' : '', failed ? failed + ' not sent' : ''].filter(Boolean).join(' · ') : 'Not now. Nothing changed.';
    settle(); renderAsst(false); render();
  }
  function startOverAsst() { asstFresh(); renderAsst(false); render(); }
  /* One conversation per surface, drawn over its window. Opening it clears any sheet, menu or the palette. */
  function openAsst(where) {
    var root = where === 'desk' ? deskRoot : phoneRoot;
    D.sheet = P.sheet = null; D.pal = null; D.sw = false;
    AS.open = true;
    renderPhone();
    renderAsst(false);
    var first = root && root.querySelector('.w-asst .w-apill, .w-asst [data-a="asst-x"]');
    if (first) first.focus({ preventScroll: true });
  }
  function closeAsst(where) {
    var root = where === 'desk' ? deskRoot : phoneRoot;
    AS.open = false;
    renderPhone();
    renderAsst(false);
    var opener = root && root.querySelector('[data-a="asst-open"]');
    if (opener) opener.focus({ preventScroll: true });
  }
  /* "Open task" on a confirmed card leaves Salie for the place the change landed in. */
  function openFromAssistant(where, mi, ci) {
    var m = AS.msgs[mi], c = m && m.cards && m.cards[ci];
    AS.open = false; renderAsst(false);
    if (where === 'desk') {
      if (c && c.op === 'ticket') { D.ws = 'team'; D.tv = 'board'; } else { D.ws = 'individual'; D.view = 'board'; D.task = null; }
    } else { P.at = c && c.op === 'ticket' ? 'team' : 'project'; P.teamTab = 'board'; P.tab = 'board'; P.task = null; P.col = 'backlog'; }
    render();
  }
  /* Both surfaces draw the conversation while it is open. Each keeps its own scroll. */
  function renderAsst(stick) {
    [[deskRoot, D], [phoneRoot, P]].forEach(function (pair) {
      var root = pair[0], V = pair[1], o = root && root.querySelector('[data-overlay]');
      if (!o) return;
      if (!AS.open) { if (o.querySelector('.w-asst')) setOverlay(root, ''); return; }
      var store = V === P ? P.scroll : D.scroll, fk = focusKey(o);
      keepScroll(o, store);
      o.innerHTML = assistantHTML(V === P);
      restoreScroll(o, store);
      var chat = o.querySelector('.w-achat');
      if (chat && stick) chat.scrollTop = chat.scrollHeight;
      if (fk) { var n = o.querySelector(fk); if (n) n.focus({ preventScroll: true }); }
    });
    guideRefresh();
  }
  function assistantHTML(phone) {
    var newBtn = AS.msgs.length ? '<button class="w-btn quiet sm" type="button" data-a="asst-new" aria-label="Start a new conversation">' + ic('plus', 14) + (phone ? '' : 'New') + '</button>' : '';
    var closeBtn = phone ? ''
      : '<button class="w-btn quiet sm" type="button" data-a="asst-x" aria-label="Close Salie">' + ic('close', 14) + 'Close<kbd class="w-key">Esc</kbd></button>';
    var top = '<header class="w-atop"><div class="w-awho"><h2>Salie</h2><button class="w-amodel" type="button" data-a="asst-model">Claude Code<span>· Default</span>' + ic('down', 14) + '</button></div><div class="w-aacts">' + newBtn + closeBtn + '</div></header>';
    return '<div class="w-asst" role="dialog" aria-modal="true" aria-label="Salie">' + top +
      '<div class="w-achat" data-keep="achat"><div class="w-acol">' + chatHTML() + '</div></div>' + dockHTML() + '</div>';
  }
  function chatHTML() {
    if (!AS.msgs.length) return '<div class="w-aempty">' + mark(40) + '<h2>What can I help with?</h2><p>Pick a message below. I will ask you before I change anything.</p></div>';
    return AS.msgs.map(function (m, i) {
      if (m.r === 'me') return '<div class="w-ame"><p>' + esc(m.x) + '</p></div>';
      var cursor = m.done ? '' : '<span class="w-acur" aria-hidden="true"></span>';
      var words = m.x ? esc(m.x) + cursor : '<span class="w-dots" role="img" aria-label="Working on it"><i></i><i></i><i></i></span>';
      var cards = m.cards ? m.cards.map(function (c, ci) { return assistCardHTML(c, i, ci); }).join('') : '';
      var left = m.done && m.cards ? m.cards.filter(function (c) { return !c.state; }).length : 0;
      var bar = left >= 2 ? '<div class="w-aall" role="group" aria-label="All the changes waiting"><span>' + left + ' changes are waiting for you.</span><button class="w-btn pri sm" type="button" data-a="asst-all" data-id="' + i + '" data-v="yes">Confirm all ' + left + '</button><button class="w-btn sm" type="button" data-a="asst-all" data-id="' + i + '" data-v="no">Not now</button></div>' : '';
      return '<div class="w-aai" data-m="' + i + '"><p class="w-atext">' + words + '</p>' + (m.ui ? uiHTML(m.ui, i) : '') +
        (m.reads ? '<details class="w-reads" data-i="' + i + '"' + (m.open ? ' open' : '') + '><summary>What I looked at</summary><p>' + esc(m.reads) + '</p></details>' : '') +
        '<p class="w-astat">' + (m.done ? 'Reply finished.' : esc(m.stage || 'Working on it…')) + '</p>' + cards + bar + (m.result ? '<p class="w-aresult" role="status">' + esc(m.result) + '</p>' : '') + '</div>';
    }).join('');
  }
  function assistCardHTML(c, mi, ci) {
    var label = ({ task: 'Create task', ticket: 'Create ticket', answer: 'Answer a question' })[c.op];
    var st = !c.state ? 'Needs you' : c.state === 'yes' ? 'Done' : c.state === 'no' ? 'Declined' : 'Not sent';
    var body;
    if (AS.busy && !c.state) body = '<p class="w-mm">Preparing proposal…</p>';
    else if (!c.state) body = '<div class="acts"><button class="w-btn pri sm" type="button" data-a="asst-ok" data-id="' + mi + '" data-v="' + ci + '">Confirm</button><button class="w-btn sm" type="button" data-a="asst-no" data-id="' + mi + '" data-v="' + ci + '">Not now</button></div><p class="w-muted fine">Nothing changes until you confirm. Open until ' + clock(S.now + 15) + '.</p>';
    else if (c.state === 'yes') body = '<p class="res ok">' + ic('check', 14) + c.done + (c.op === 'answer' ? '' : ' <button class="link" type="button" data-a="asst-opentask" data-id="' + mi + '" data-v="' + ci + '">Open task</button>') + '</p>';
    else body = '<p class="res">' + (c.state === 'no' ? 'Not done. You said no.' : 'This changed before you confirmed, so nothing was sent.') + '</p>';
    return '<section class="w-acard" data-state="' + (c.state || 'wait') + '" aria-label="' + label + ': ' + st + '"><p class="w-lab">' + label + '<span class="st"><i></i>' + st + '</span></p><h3>' + esc(c.title) + '</h3>' +
      '<p class="dest">' + esc(c.dest) + '</p>' + (c.detail ? '<p class="detail">' + esc(c.detail) + '</p>' : '') + body + '</section>';
  }
  function dockHTML() {
    var pills = (waitingChanges() ? [] : optsNow()).map(function (o) { return '<button class="w-apill" type="button" data-a="asst-ask" data-id="" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('');
    var note = AS.busy ? 'Working on it.' : waitingChanges() ? 'Confirm or decline the changes above to continue.' : 'Pick a message. Replies are scripted in this demo, and nothing is sent to a model.';
    return '<div class="w-acol w-adock">' + (pills ? '<div class="w-apills" role="group" aria-label="Predefined messages">' + pills + '</div>' : '') + '<p class="w-anote">' + note + '</p></div>';
  }

  /* ---------- toasts ---------- */
  var toastTimer;
  function toast(m) {
    [deskMount, phoneMount].forEach(function (root) {
      var el = root && root.querySelector('.w-toast');
      if (!el) return;
      el.textContent = m; el.classList.add('show');
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { document.querySelectorAll('.w-toast').forEach(function (el) { el.classList.remove('show'); }); }, 3600);
  }

  /* ---------- the other workspaces: the story's backdrop ----------
     The window holds three places to be: Universal (your work from every workspace), Individual (this computer) and a Team.
     The guided story is about my-app, so the rest of Individual (api-server) and the Team are a fixed backdrop that Universal
     reads beside it. What the story creates, and what the visitor answers, claims or signs off, shows up there too. */
  var ME = 'You';
  function story(i) { for (var j = 0; j < S.tasks.length; j++) if (S.tasks[j].story === i) return S.tasks[j]; return null; }
  function storyTicket() { for (var j = 0; j < S.team.tickets.length; j++) if (S.team.tickets[j].story) return S.team.tickets[j]; return null; }
  function planned() { return !!(story(1) || story(2) || story(3)); }
  function lead() { return story(1) || story(2); }
  function tix(n) { for (var j = 0; j < S.team.tickets.length; j++) if (S.team.tickets[j].n == n) return S.team.tickets[j]; return null; }
  function initials(n) { return n.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase(); }
  function execOf(r) { return !r ? null : ({ running: 'running', needs: 'needs_input', blocked: 'blocked', queued: 'queued', completed: 'completed' })[r.st] || null; }

  /* api-server has two agents beside my-app. The question is answered from Needs you, from Universal or by Salie. */
  function extTask() {
    var a = S.ext.ask;
    return { id: a.id, title: a.title, agent: a.agent, project: a.project, prio: a.prio, state: 'doing', run: { st: a.st, q: a.q, choices: a.choices, asked: a.asked, el: S.now - a.asked } };
  }
  function answerExt(v) {
    var a = S.ext.ask; if (a.st !== 'needs') return;
    a.st = 'running'; a.answer = v;
    toast('Sent. ' + a.agent + ' carries on with “' + v + '”.');
  }
  function needsInd() { return needsYou() + (S.ext.ask.st === 'needs' ? 1 : 0); }
  /* What waits for the person, as the shell lists it: Individual's (every project), a Team's reviews, then both together. */
  function rowsInd() {
    var out = [];
    if (S.ext.ask.st === 'needs') out.push({ ws: 'individual', project: S.ext.ask.project, kind: 'question', t: extTask() });
    attention().forEach(function (it) { out.push({ ws: 'individual', project: 'my-app', kind: it.kind, t: it.t }); });
    return out;
  }
  function rowsTeam() {
    return S.team.tickets.filter(function (k) { return k.st === 'review' && k.reviewer === ME && k.who !== ME; }).map(function (k) { return { ws: 'team', project: S.team.project, kind: 'review', k: k }; });
  }
  function rowsAll() { return rowsInd().concat(rowsTeam()); }
  function needsAll() { return rowsAll().length; }
  /* The person's own work: the agents' tasks in Individual and the tickets they hold in the Team. */
  function myWorkRows() {
    var rows = [], a = S.ext.ask, r = S.ext.run;
    rows.push({ ws: 'individual', wsName: 'Individual', project: r.project, title: r.title, status: 'doing', exec: 'running', go: 'other' });
    rows.push({ ws: 'individual', wsName: 'Individual', project: a.project, title: a.title, status: 'doing', exec: a.st === 'needs' ? 'needs_input' : 'running', go: 'other' });
    S.tasks.forEach(function (t) {
      if ((t.state === 'doing' || t.state === 'review') && t.run && t.run.st !== 'stopped') rows.push({ ws: 'individual', wsName: 'Individual', project: 'my-app', title: t.title, status: t.state, exec: execOf(t.run), go: 'ind:' + t.id });
    });
    S.team.tickets.forEach(function (k) {
      if (k.who === ME && (k.st === 'progress' || k.st === 'review')) rows.push({ ws: 'team', wsName: S.team.name, project: S.team.project, title: 'WB-' + k.n + ' ' + k.title, status: k.st === 'progress' ? 'doing' : 'review', exec: k.exec || null, go: 'team' });
    });
    return rows;
  }

  /* Team actions. Claiming is one guarded step; a reviewer cannot sign off their own work; Done waits for a merged pull request. */
  function claim(n) {
    var k = tix(n); if (!k || (k.st !== 'backlog' && k.st !== 'available')) return;
    k.st = 'progress'; k.who = ME; k.fresh = true; k.branch = 'wb-' + k.n + '-' + slug(k.title);
    toast('Claimed. Your branch will be ' + k.branch + '. Open it in your runner to start.');
  }
  function signoff(n) {
    var k = tix(n); if (!k || k.st !== 'review' || !k.pr || k.pr.state !== 'merged') return;
    k.st = 'done'; k.fresh = true;
    toast('WB-' + k.n + ' is done. Its pull request was already merged on the Git host.');
  }

  /* ================= the window's sidebar and the workspace switcher ================= */
  function wsName() { return D.ws === 'universal' ? 'Universal' : D.ws === 'individual' ? 'Individual' : S.team.name; }
  function navBtn(attrs, icon, label, cur, badge) {
    return '<button class="w-nav" type="button" ' + attrs + (cur ? ' aria-current="page"' : '') + '>' + ic(icon) + label + (badge ? '<span class="w-num pend">' + badge + '</span>' : '') + '</button>';
  }
  function railHTML() {
    var n = needsYou(), act = active(), ni = needsInd(), name = wsName();
    var head = '<button class="w-switch" type="button" data-a="sw" aria-haspopup="menu" aria-expanded="' + !!D.sw + '" aria-label="Switch workspace. Showing ' + esc(name) + '"><span class="brand">' + mark(20) + '<span class="w-wm">werkbord</span></span><span class="mode"><span class="mn">' + esc(name) + '</span>' + ic('down', 14) + '</span></button>' +
      '<div class="w-ask"><button class="w-askbtn" type="button" data-a="asst-open" aria-haspopup="dialog">' + ic('assistant') + '<span class="w-askl">Salie</span>' + (waitingChanges() ? '<span class="w-num pend">' + waitingChanges() + '</span>' : '') + '</button></div>';
    var body = '';
    if (D.ws === 'universal') {
      body = [['mywork', 'My Work', 'check', 0], ['calendar', 'Calendar', 'calendar', 0], ['inbox', 'Needs you', 'control', needsAll()]].map(function (p) {
        return navBtn('data-a="uv" data-id="' + p[0] + '"', p[2], p[1], D.uv === p[0], p[3]);
      }).join('');
    } else if (D.ws === 'individual') {
      var ask = S.ext.ask.st === 'needs';
      body = '<div class="w-sec"><span>Individual</span></div>' +
        navBtn('data-a="view" data-id="control"', 'overview', 'Needs you', D.view === 'control', ni) +
        navBtn('data-a="other"', 'folder', 'Projects', false, 0) +
        '<button class="w-nav proj" type="button" data-a="other"><span class="sq"></span><span class="name">api-server</span>' + (ask ? '<span class="w-num pend">1</span>' : '<span class="n">2</span>') + '</button>' +
        '<button class="w-nav proj" type="button" data-a="other"><span class="sq"></span><span class="name">marketing-site</span></button>' +
        '<button class="w-nav proj" type="button" data-a="view" data-id="board"' + (D.view !== 'control' ? ' aria-current="page"' : '') + '><span class="sq"></span><span class="name">my-app</span>' + (n ? '<span class="w-num pend">' + n + '</span>' : act ? '<span class="n">' + act + '</span>' : '') + '</button>' +
        '<button class="w-nav proj add" type="button" data-a="other">' + ic('plus', 14) + 'Add project</button>' +
        navBtn('data-a="toast" data-v="Analytics shows where agent time and cost go. It is not part of this demo."', 'analytics', 'Analytics', false, 0);
    } else {
      var reviews = rowsTeam().length;
      body = '<div class="w-sec"><span>' + esc(S.team.name) + '</span></div>' +
        navBtn('data-a="tv" data-id="home"', 'overview', 'Needs you', D.tv === 'home', reviews) +
        navBtn('data-a="tvp"', 'folder', 'Projects', false, 0) +
        '<button class="w-nav proj" type="button" data-a="tv" data-id="board"' + (D.tv === 'board' ? ' aria-current="page"' : '') + '><span class="sq"></span><span class="name">' + esc(S.team.project) + '</span></button>' +
        navBtn('data-a="tv" data-id="reviews"', 'merge', 'Reviews', D.tv === 'reviews', reviews) +
        navBtn('data-a="tv" data-id="members"', 'people', 'Members', D.tv === 'members', 0) +
        navBtn('data-a="toast" data-v="Analytics shows how work moves through the Team. It is not part of this demo."', 'analytics', 'Analytics', false, 0);
    }
    var foot = '<div class="w-rfoot">' + (D.ws !== 'universal' ? '<button class="w-nav" type="button" data-a="settings">' + ic('settings') + 'Settings</button>' : '') +
      '<div class="w-rrow"><button class="w-nav w-devices" type="button" data-a="toast" data-v="Workspaces &amp; Devices lists each workspace, this computer and the runners you have paired."><span class="w-ic">' + ic('runner') + '</span><span>Workspaces &amp; Devices</span></button>' +
      '<button class="w-btn quiet sm ic" type="button" data-a="theme" aria-label="Switch theme">' + ic(WB.theme() === 'dark' ? 'sun' : 'moon') + '</button></div></div>';
    return '<aside class="w-rail" aria-label="werkbord">' + head + body + foot + '</aside>';
  }
  /* The switcher opens under the product name, as in the app: Universal first, Individual, then each Team, then adding one. */
  function switcherHTML() {
    function item(id, name, sub, on, live) {
      return '<button class="w-mi" type="button" role="menuitem" data-a="ws" data-id="' + id + '"' + (on ? ' aria-current="true"' : '') + '><span class="ck">' + (on ? ic('check', 14) : '') + '</span><span class="tx"><b>' + esc(name) + '</b><span>' + esc(sub) + '</span></span>' + (live ? '<i class="w-dot" data-tone="ok"></i>' : '') + '</button>';
    }
    return '<div class="w-scrim clear" data-a="swx"></div><div class="w-menu" role="menu" aria-label="Switch workspace">' +
      item('universal', 'Universal', 'All your workspaces', D.ws === 'universal', false) + item('individual', 'Individual', 'This computer', D.ws === 'individual', true) +
      '<div class="rule" role="separator"></div>' + item('team', S.team.name, 'Team · ' + S.team.role + ' · early access', D.ws === 'team', true) +
      '<div class="rule" role="separator"></div><button class="w-mi add" type="button" role="menuitem" data-a="addteam"><span class="ck">' + ic('plus', 14) + '</span><span class="tx"><b>Add a Team…</b></span></button></div>';
  }
  function goWs(id) {
    dropOverlay();
    D.ws = id; D.task = null; D.pick = null;
    render();
  }
  /* Where a row of Universal opens: the place it lives in. */
  function jump(dest) {
    dropOverlay();
    if (dest === 'other') { toast('This demo opens one project. In the app, every repository you add gets its own board, calendar and Git view.'); return; }
    if (dest.indexOf('ind:') === 0) { D.ws = 'individual'; D.view = 'board'; D.task = +dest.slice(4); D.ptab = 'activity'; }
    else if (dest === 'team:reviews') { D.ws = 'team'; D.tv = 'reviews'; }
    else if (dest === 'team') { D.ws = 'team'; D.tv = 'board'; }
    render();
  }

  /* ================= Universal: My Work, Calendar and Needs you across workspaces ================= */
  function wsTag(kind, name) { return '<span class="w-ws" data-kind="' + kind + '" title="' + (kind === 'team' ? 'A Team workspace' : 'Your own werkbord on this computer') + '">' + esc(name) + '</span>'; }
  function upage(h, lede, body, head) {
    return '<header class="w-ghead"><div class="w-uh"><h1>' + h + '</h1><p class="w-lede">' + lede + '</p></div>' + (head || '') + '</header><main class="w-main" data-keep="main-u-' + D.uv + '"><div class="w-upage">' + body + '</div></main>';
  }
  var EXECWORD = { running: 'Running', needs_input: 'Waiting for an answer', blocked: 'Blocked', queued: 'Queued', completed: 'Session finished' };
  var EXECTONE = { running: 'work', needs_input: 'ask', blocked: 'block', queued: 'idle', completed: 'ok' };
  function myWorkHTML() {
    var rows = myWorkRows(), n = function (x) { return rows.filter(function (r) { return r.exec === x; }).length; };
    var lede = n('running') + ' reported running · ' + n('queued') + ' queued · across 2 workspaces';
    var status = { doing: 'In progress', review: 'In review' };
    var groups = [['individual', 'Individual'], ['team', S.team.name]].map(function (g) {
      var rs = rows.filter(function (r) { return r.ws === g[0]; });
      if (!rs.length) return '';
      return '<section class="w-ugroup" aria-label="' + esc(g[1]) + '"><h2>' + wsTag(g[0], g[1]) + '<span class="count">' + rs.length + '</span></h2><ul class="w-ulist">' + rs.map(function (w) {
        var badge = w.exec ? '<span class="w-xb" data-tone="' + EXECTONE[w.exec] + '"><i class="w-dot" data-tone="' + EXECTONE[w.exec] + '"></i>Reported: ' + EXECWORD[w.exec] + '</span>' : '<span></span>';
        return '<li><button class="w-wrow" type="button" data-a="go" data-v="' + w.go + '"><span class="ti">' + esc(w.title) + '</span><span class="pj">' + esc(w.project) + '</span><span class="stt">' + status[w.status] + '</span>' + badge + '</button></li>';
      }).join('') + '</ul></section>';
    }).join('');
    return upage('My Work', lede, groups);
  }
  function inboxRowHTML(r) {
    if (r.ws === 'team') {
      var k = r.k;
      return '<li><div class="w-irow"><i class="w-dot" data-tone="ok"></i><span class="tx"><span class="ti">WB-' + k.n + ' ' + esc(k.title) + '</span><span class="cx">' + wsTag('team', S.team.name) + '<span>' + esc(S.team.project) + '</span></span><span class="dt">' + esc(k.who) + ' asked for your review. Pull request #' + k.pr.n + ' is merged.</span></span><span class="ac"><button class="w-btn sm pri" type="button" data-a="go" data-v="team:reviews">Review changes</button></span></div></li>';
    }
    var t = r.t, q = r.kind === 'question';
    return '<li><div class="w-irow"><i class="w-dot" data-tone="' + (q ? 'ask' : 'ok') + '"></i><span class="tx"><span class="ti">' + esc(t.title) + '</span><span class="cx">' + wsTag('individual', 'Individual') + '<span>' + esc(r.project) + '</span></span><span class="dt">' +
      (q ? (t.prio === 'high' ? 'High priority. ' : '') + esc(t.agent) + ' asks: ' + esc(t.run.q) : r.kind === 'blocked' ? 'Stopped rather than guess. ' + esc(t.run.q) : 'Finished and ready for review.') + '</span></span><span class="ac">' +
      (q || r.kind === 'blocked' ? t.run.choices.map(function (c) { return '<button class="w-btn sm" type="button" data-a="answer" data-id="' + t.id + '" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('')
        : '<button class="w-btn sm pri" type="button" data-a="go" data-v="ind:' + t.id + '">Review changes</button>') + '</span></div></li>';
  }
  function inboxHTML() {
    var rows = rowsAll();
    return upage('Needs you', 'Questions, blockers and reviews from all your workspaces',
      rows.length ? '<section class="w-ugroup" aria-label="Action needed"><h2>Action needed<span class="count">' + rows.length + '</span></h2><ul class="w-ulist">' + rows.map(inboxRowHTML).join('') + '</ul></section>' : '<p class="w-uempty">Nothing needs you.</p>');
  }
  function ucalHTML() {
    var seg = '<div class="w-seg" role="group" aria-label="Calendar presentation"><button type="button" aria-pressed="true">Calendar</button><button type="button" data-a="toast" data-v="Timeline shows planned dates, milestones and dependencies, and warns about conflicts. It never reschedules anything.">Timeline</button></div>';
    return '<header class="w-ghead"><div class="w-uh"><h1>Calendar</h1><p class="w-lede">Scheduled and planned work across all projects</p></div>' + seg + '</header><main class="w-main" style="overflow:hidden">' + calMainHTML(true) + '</main>';
  }

  /* ================= a Team: board, reviews, members ================= */
  var TCOLS = [['backlog', 'Backlog'], ['available', 'Available'], ['progress', 'In Progress'], ['review', 'Review'], ['done', 'Done']];
  function tcardHTML(k) {
    var mine = k.who === ME, acts = '';
    if (k.st === 'backlog' || k.st === 'available') acts = '<button class="w-btn sm' + (k.story ? ' pri' : '') + '" type="button" data-a="claim" data-id="' + k.n + '" aria-label="Claim WB-' + k.n + ' ' + esc(k.title) + '">Claim</button>';
    else if (mine && k.st === 'progress') acts = '<button class="w-btn sm" type="button" data-a="runner" data-id="' + k.n + '">' + ic('runner', 14) + 'Open in my runner</button>';
    var who = k.who ? '<span class="w-av' + (mine ? ' me' : '') + '" aria-hidden="true">' + initials(k.who) + '</span>' + esc(k.who) : '<span class="w-muted">Unclaimed · ' + esc(k.by) + ' wrote it</span>';
    var git = k.branch ? '<p class="w-tbranch">' + esc(k.branch) + '</p><p class="w-tchips">' + (k.ahead ? '<span class="w-chip">' + k.ahead + ' commits</span>' : '<span class="w-chip">no commits yet</span>') + (k.pr ? '<span class="w-chip">' + ic('pr', 12) + '#' + k.pr.n + ' ' + k.pr.state + '</span>' : '') + '</p>' : '';
    var tone = k.st === 'review' ? 'ask' : k.st === 'progress' ? 'work' : k.st === 'done' ? 'ok' : 'neutral';
    return '<li class="w-card w-task w-tix' + (k.st === 'done' ? ' settled' : '') + (k.fresh ? ' fresh' : '') + '" data-tone="' + tone + '" data-ticket="' + k.n + '"><p class="w-tid">WB-' + k.n + '</p><p class="w-ttitle">' + esc(k.title) + '</p><p class="w-st">' + who + '</p>' + git + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</li>';
  }
  function teamHeadHTML() {
    return '<header class="w-head"><div class="w-where"><span class="w-pname"><h1>' + esc(S.team.project) + '</h1></span><p class="w-path">' + esc(S.team.name) + ' · Team workspace · early access</p></div>' +
      '<div class="w-acts"><button class="w-btn" type="button" data-a="toast" data-v="Jump to searches projects, sections and tickets.">' + ic('search') + 'Jump to</button><button class="w-btn pri" type="button" data-a="toast" data-v="New ticket adds work to Backlog. Anyone on the Team can claim it.">' + ic('plus') + 'New ticket</button></div></header>' +
      '<nav class="w-tabs" aria-label="' + esc(S.team.project) + ' sections">' + navTab('data-a="tv" data-id="board"', 'Board', true) + navTab('data-a="toast" data-v="Git shows the branches and pull requests each member\'s werkbord reports."', 'Git') + navTab('data-a="toast" data-v="Activity lists who changed what on the board."', 'Activity') + '</nav>';
  }
  function navTab(attrs, label, cur) { return '<button class="w-tab" type="button" ' + attrs + (cur ? ' aria-current="page"' : '') + '>' + label + '</button>'; }
  function teamBoardHTML() {
    var tk = S.team.tickets, n = function (s) { return tk.filter(function (k) { return k.st === s; }).length; };
    var legend = '<ul class="w-legend" aria-label="The team at a glance"><li>' + dot('work') + n('progress') + ' in progress</li><li>' + dot('ask') + n('review') + ' in review</li><li>' + dot('ok') + n('done') + ' done</li></ul>';
    return teamHeadHTML() + '<main class="w-main" style="overflow:hidden"><div class="w-bview"><div class="w-bar"><div class="w-filters"><label class="w-pick"><span>Owner</span><select aria-label="Filter by owner"><option>anyone</option><option>You</option></select></label></div>' + legend + '</div><div class="w-cols five">' + TCOLS.map(function (c) {
      var ts = tk.filter(function (k) { return k.st === c[0]; }).sort(function (a, b) { return Number(!!b.story) - Number(!!a.story) || b.n - a.n; });
      return '<section class="w-col w-tray" data-col="' + c[0] + '" aria-label="' + c[1] + '"><header class="w-ch"><h2>' + c[1] + '</h2><span class="w-chip">' + ts.length + '</span></header><ul class="w-list" data-keep="tcol-' + c[0] + '">' + (ts.length ? ts.map(tcardHTML).join('') : '<li class="w-none">Nothing here.</li>') + '</ul></section>';
    }).join('') + '</div></div></main>';
  }
  function teamReviewsHTML() {
    var rs = S.team.tickets.filter(function (k) { return k.st === 'review'; }).sort(function (a, b) { return Number(b.reviewer === ME) - Number(a.reviewer === ME); });
    var list = rs.length ? '<ul class="w-ulist">' + rs.map(function (k) {
      var asked = k.reviewer === ME && k.who !== ME;
      return '<li class="w-rv"><div class="tx"><p class="w-tid">WB-' + k.n + '</p><p class="w-ttitle">' + esc(k.title) + '</p><p class="w-mm">' + esc(k.who) + ' · ' + esc(k.branch) + ' · ' + k.ahead + ' commits</p><p class="w-mm">' + ic('pr', 12) + 'Pull request #' + k.pr.n + ' · ' + k.pr.state + ' on the Git host · no conflicts</p></div><div class="acts">' +
        (asked ? '<button class="w-btn sm" type="button" data-a="toast" data-v="Request changes sends the ticket back to its author with your note.">Request changes</button><button class="w-btn sm pri" type="button" data-a="signoff" data-id="' + k.n + '">Mark done</button>' : '<span class="w-mm">Waiting for ' + esc(k.reviewer || 'a reviewer') + '</span>') + '</div></li>';
    }).join('') + '</ul>' : '<p class="w-uempty">Nothing is waiting for review.</p>';
    return '<header class="w-ghead"><div class="w-uh"><h1>Reviews</h1><p class="w-lede">Tickets in review, those asked of you first. The diff itself is on your Git host.</p></div></header><main class="w-main" data-keep="main-t-reviews"><div class="w-upage">' + list + '</div></main>';
  }
  function teamHomeHTML() {
    var rs = rowsTeam();
    return '<header class="w-ghead"><div class="w-uh"><h1>Needs you</h1><p class="w-lede">' + esc(S.team.name) + ' · what is waiting for you in this Team</p></div></header><main class="w-main" data-keep="main-t-home"><div class="w-upage">' +
      (rs.length ? '<section class="w-ugroup"><h2>Action needed<span class="count">' + rs.length + '</span></h2><ul class="w-ulist">' + rs.map(inboxRowHTML).join('') + '</ul></section>' : '<p class="w-uempty">Nothing needs you in ' + esc(S.team.name) + '.</p>') + '</div></main>';
  }
  function teamMembersHTML() {
    return '<header class="w-ghead"><div class="w-uh"><h1>Members</h1><p class="w-lede">One Owner, any number of Admins, and Members. Each person keeps their own computer, runner and credentials.</p></div></header><main class="w-main" data-keep="main-t-members"><div class="w-upage"><ul class="w-ulist">' +
      S.team.members.map(function (m) { return '<li><div class="w-irow"><span class="w-av' + (m[0] === ME ? ' me' : '') + '" aria-hidden="true">' + initials(m[0]) + '</span><span class="tx"><span class="ti">' + esc(m[0]) + (m[0] === ME ? ' <span class="w-mm">(you)</span>' : '') + '</span><span class="dt">' + esc(m[2]) + '</span></span><span class="ac"><span class="w-chip">' + m[1] + '</span></span></div></li>'; }).join('') + '</ul></div></main>';
  }
  function teamMain() {
    return ({ board: teamBoardHTML, reviews: teamReviewsHTML, home: teamHomeHTML, members: teamMembersHTML })[D.tv]();
  }

  /* ================= desktop ================= */
  function bannerHTML() {
    var q = questions(); if (!q.length) return '';
    var t = q[0];
    return '<button class="w-banner" type="button" data-a="open" data-id="' + t.id + '"><span class="w-num pend">' + q.length + '</span><span class="text"><strong>' + (q.length === 1 ? '1 question needs your input' : q.length + ' questions need your input') + '</strong><span class="what">my-app · ' + esc(t.title) + ': ' + esc(t.run.q) + '</span></span><span class="go">' + (q.length === 1 ? 'Answer' : 'Review') + ' →</span></button>';
  }
  function headHTML() {
    return '<header class="w-head"><div class="w-where"><button class="w-pname" type="button" data-a="pal"><h1>my-app</h1><span class="chev">' + ic('down', 14) + '</span></button><p class="w-path">~/code/my-app · main</p></div>' +
      '<div class="w-acts"><button class="w-btn" type="button" data-a="pal">' + ic('search') + 'Jump to<kbd class="w-key">⌘ K</kbd></button>' +
      '<button class="w-btn ic" type="button" data-a="settings" aria-label="Project settings">' + ic('settings') + '</button>' +
      '<button class="w-btn pri" type="button" data-a="new">' + ic('plus') + 'New task</button></div></header>' +
      '<nav class="w-tabs" aria-label="my-app sections">' + [['overview', 'Overview'], ['board', 'Board'], ['calendar', 'Calendar'], ['git', 'Git'], ['runs', 'Runs']].map(function (s) {
        var badge = s[0] === 'git' && gitItems().length ? '<span class="w-num pend">' + gitItems().length + '</span>' : '';
        return '<button class="w-tab" type="button" data-a="view" data-id="' + s[0] + '"' + (D.view === s[0] ? ' aria-current="page"' : '') + '>' + s[1] + badge + '</button>';
      }).join('') + '</nav>';
  }

  function legendHTML(phone) {
    var c = function (f) { return S.tasks.filter(f).length; };
    var items = [['work', c(function (t) { return t.run && t.run.st === 'running'; }), 'running'], ['ask', c(function (t) { return t.run && t.run.st === 'needs'; }), 'needs you'],
      ['block', c(function (t) { return t.run && t.run.st === 'blocked'; }), 'blocked'], ['ok', c(function (t) { return t.state === 'review'; }), 'ready for review']];
    return '<ul class="w-legend" aria-label="Agents at a glance">' + items.filter(function (i) { return !phone || i[1]; }).map(function (i) { return '<li' + (i[1] ? '' : ' class="zero"') + '>' + dot(i[0]) + i[1] + ' ' + i[2] + '</li>'; }).join('') + '</ul>';
  }
  function filtersHTML() {
    return '<div class="w-filters"><label class="w-pick"><span>Agent</span><select aria-label="Filter by agent"><option>any</option><option>Claude Code</option><option>Codex</option></select></label>' +
      '<label class="w-pick"><span>Priority</span><select aria-label="Filter by priority"><option>any</option><option>high</option><option>normal</option><option>low</option></select></label>' +
      '<button class="w-btn sm" type="button" data-a="archive">Archive (0)</button><button class="w-btn sm" type="button" data-a="cleardone">Clear Done</button></div>';
  }
  var COLS = [['backlog', 'Backlog'], ['doing', 'Doing'], ['review', 'Review'], ['done', 'Done']];
  var ORDER = { high: 0, normal: 1, low: 2 };
  function inCol(c) {
    return S.tasks.filter(function (t) { return t.state === c; }).sort(function (a, b) {
      if (c === 'done') return b.doneAt - a.doneAt;
      return Number(!!b.guided) - Number(!!a.guided) || ORDER[a.prio] - ORDER[b.prio] || a.id - b.id;
    });
  }
  function emptyCol(c) {
    return c === 'backlog' ? 'Nothing waiting. Add a task with <kbd class="w-key">N</kbd>.' : c === 'doing' ? 'No agent is working. Start one from Backlog.' : c === 'review' ? 'Finished work lands here for you to review.' : 'Merged work lands here.';
  }
  function boardHTML() {
    return '<div class="w-bview"><div class="w-bar">' + filtersHTML() + legendHTML() + '</div><div class="w-cols">' + COLS.map(function (c) {
      var ts = inCol(c[0]);
      return '<section class="w-col w-tray" data-col="' + c[0] + '" aria-label="' + c[1] + '"><header class="w-ch"><h2>' + c[1] + '</h2><span class="w-chip">' + ts.length + '</span>' +
        (c[0] === 'backlog' ? '<button class="w-btn quiet sm ic add" type="button" data-a="new" aria-label="Add a task to Backlog">' + ic('plus') + '</button>' : '') + '</header>' +
        '<div data-hint="' + c[0] + '"></div><ul class="w-list" data-keep="col-' + c[0] + '">' + (ts.length ? ts.map(function (t) { return cardHTML(t, D.task == t.id); }).join('') : '<li class="w-none">' + emptyCol(c[0]) + '</li>') + '</ul></section>';
    }).join('') + '</div></div>';
  }

  function controlHTML(phone) {
    var items = rowsInd(), qs = items.filter(function (i) { return i.kind === 'question'; }), bl = items.filter(function (i) { return i.kind === 'blocked'; });
    var cur = phone ? P.cc : D.cc;
    var shown = items.filter(function (i) { return cur === 'all' || i.kind === cur; });
    var seg = '<div class="w-seg" role="group" aria-label="Show">' + [['all', 'All', items.length], ['question', 'Needs input', qs.length], ['blocked', 'Blocked', bl.length]].filter(function (s) { return s[0] === 'all' || s[2]; }).map(function (s) {
      return '<button type="button" data-a="cc" data-id="' + s[0] + '" aria-pressed="' + (cur === s[0]) + '">' + s[1] + ' <span class="w-mm">' + s[2] + '</span></button>';
    }).join('') + '</div>';
    var list = '<ul style="display:flex;flex-direction:column;gap:14px">' + (shown.length ? shown.map(function (i) { return itemHTML(i, true); }).join('') : '<li class="w-empty">Nothing needs you. Agents are working or waiting for review.</li>') + '</ul>';
    var running = S.tasks.filter(function (t) { return t.run && t.run.st === 'running'; });
    var queued = S.tasks.filter(function (t) { return (t.state === 'backlog' && t.sched) || (t.run && t.run.st === 'queued'); }).sort(function (a, b) { return schedAbs(a) - schedAbs(b); });
    var side = '<section class="w-pn" aria-label="Projects"><div class="w-ph">Projects <span class="w-chip">3</span></div><ul>' +
      '<li class="w-line"><div class="top"><span class="sq" style="width:7px;height:7px;background:var(--text)"></span><b style="font-weight:500">api-server</b><span class="w-mm">' + (S.ext.ask.st === 'needs' ? '1 running · 1 needs input' : '2 running') + '</span></div></li>' +
      '<li class="w-line"><div class="top"><span class="sq" style="width:7px;height:7px;background:var(--text)"></span><b style="font-weight:500">marketing-site</b><span class="w-mm">quiet</span></div></li>' +
      '<li class="w-line"><div class="top"><span class="sq" style="width:7px;height:7px;background:var(--text)"></span><b style="font-weight:500">my-app</b><span class="w-mm">' + [qs.length ? qs.length + ' needs input' : '', bl.length ? bl.length + ' blocked' : '', running.length ? running.length + ' running' : ''].filter(Boolean).join(' · ') + '</span>' + (qs.length + bl.length ? '<span class="w-num pend" style="margin-left:auto">' + (qs.length + bl.length) + '</span>' : '') + '</div></li></ul></section>' +
      '<section class="w-pn" aria-label="Running now"><div class="w-ph">Running now <span class="w-chip">' + (running.length + 1) + '</span></div><ul>' +
      running.map(function (t) { return '<li class="w-line"><div class="top">' + dot('work', 'pulse') + '<button class="rtitle" style="border:0;background:none;padding:0;font-weight:500;color:var(--text)" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button></div><p class="w-mm sub">my-app · ' + t.agent + ' · <span data-el="' + t.id + '">' + dur(t.run.el) + '</span></p><p class="w-mm sub" data-lg2="' + t.id + '" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">› ' + esc(t.run.logs[Math.max(0, t.run.li - 1)] || '') + '</p></li>'; }).join('') +
      '<li class="w-line"><div class="top">' + dot('work', 'pulse') + '<b style="font-weight:500">Rate-limit the webhook endpoint</b></div><p class="w-mm sub">api-server · Codex · 31m</p></li></ul></section>' +
      '<section class="w-pn" aria-label="Scheduled and queued"><div class="w-ph">Scheduled and queued <span class="w-chip">' + queued.length + '</span></div><ul>' + (queued.length ? queued.map(function (t) {
        var w = waitingFor(t);
        return '<li class="w-line"><div class="top">' + ic('calendar') + '<button style="border:0;background:none;padding:0;font-weight:500;color:var(--text);text-align:left" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button></div><p class="w-mm sub">my-app · ' + (t.run && t.run.st === 'queued' ? 'Waiting for Capacity' : w.length ? 'Waiting on Dependency' : 'Scheduled ' + dayLabel(t.sched.d) + ' ' + clock(t.sched.s)) + '</p></li>';
      }).join('') : '<li class="w-mm">Nothing planned.</li>') + '</ul></section>';
    if (!phone) side += '<section class="w-pn" aria-label="Runners"><div class="w-ph">Runners <span class="w-chip">1</span><a class="end" href="#" data-a="settings">Manage</a></div><div class="w-line" style="border:0;padding:0"><div class="top">' + dot('ok') + '<b style="font-weight:500">MacBook-Pro · this computer</b><span class="w-mm" style="margin-left:auto" data-conc>' + (active() + 1) + '/' + (LIMIT + 1) + '</span></div><p class="w-mm">darwin/arm64 · Claude Code, Codex</p></div></section>';
    if (phone) return { seg: seg, list: list, side: side, n: items.length, running: running.length + 1 };
    return '<div class="w-split w-cc"><div class="w-pane" data-keep="cc-l"><div class="w-ccbar">' + seg + '<div class="w-filters"><label class="w-pick"><span>Project</span><select><option>all</option><option>my-app</option><option>api-server</option><option>marketing-site</option></select></label><label class="w-pick"><span>Agent</span><select><option>all</option><option>Claude Code</option><option>Codex</option></select></label></div></div>' + list + '</div><div class="w-pane" data-keep="cc-r">' + side + '</div></div>';
  }
  function schedAbs(t) { return t.sched ? t.sched.d * 1440 + t.sched.s : 1e9; }

  var HIST = '..........................ggg.gg.....gggbg.ggbbab';
  function stripHTML() {
    var cells = '';
    for (var i = 0; i < 48; i++) { var ch = HIST.charAt(i); cells += '<i class="' + (ch === '.' ? '' : ch) + '"></i>'; }
    return '<div class="w-stripwrap"><div class="w-strip" role="img" aria-label="Runs over the last 24 hours, 30 minutes per cell">' + cells + '</div><span class="w-mm">30 min per cell</span></div>';
  }
  var RUNSTATE = { running: ['work', 'Running'], needs: ['ask', 'Needs input'], blocked: ['block', 'Blocked'], queued: ['neutral', 'Waiting'], completed: ['ok', 'Completed'], merged: ['ok', 'Completed'], stopped: ['neutral', 'Stopped'] };
  function runList() { return S.tasks.filter(function (t) { return t.run; }).sort(function (a, b) { return (b.run.started || 0) - (a.run.started || 0); }); }

  function overviewHTML() {
    var items = attention();
    var live = runList().filter(function (t) { return t.run.st !== 'merged'; });
    var branches = gitItems();
    return '<div class="w-split"><div class="w-pane" data-keep="ov-l">' +
      '<section class="w-pn" aria-label="Needs you"><div class="w-ph">Needs you <span class="w-chip">' + items.length + '</span></div><ul style="display:flex;flex-direction:column;gap:12px">' + (items.length ? items.map(function (i) { return itemHTML(i, false); }).join('') : '<li class="w-empty">All clear. Agents are working or waiting for review.</li>') + '</ul></section>' +
      '<section class="w-pn" aria-label="Runs"><div class="w-ph">Runs <span class="w-chip">' + live.length + '</span><span class="end w-mm">last 24 hours</span></div>' + stripHTML() +
      '<div class="w-tbl" style="--cols:110px minmax(0,1fr) 130px 70px"><div class="w-tr th"><span>Run</span><span>Task</span><span>State</span><span class="r">Time</span></div>' + live.map(function (t) {
        var st = RUNSTATE[t.run.st];
        return '<div class="w-tr"><span class="w-mm">' + t.run.id + '</span><span style="font-weight:500">' + esc(t.title) + '</span><span class="w-badge">' + dot(st[0]) + st[1] + '</span><span class="w-mm r" data-el="' + t.id + '">' + dur(t.run.el) + '</span></div>';
      }).join('') + '</div></section></div>' +
      '<div class="w-pane" data-keep="ov-r"><section class="w-pn" aria-label="Git"><div class="w-ph">Git <span class="w-chip">main</span><a class="end" href="#" data-a="view" data-id="git">Open →</a></div><div class="w-big">' + dot('neutral') + branches.length + ' werkbord branch' + (branches.length === 1 ? '' : 'es') + '</div><p class="w-mm">' + branches.filter(function (t) { return t.state === 'review'; }).length + ' ready to merge · ' + branches.length + ' unpushed · 0 to clean up</p></section>' +
      '<section class="w-pn" aria-label="Agents"><div class="w-ph">Agents</div>' + ['Claude Code', 'Codex'].map(function (a) {
        var n = S.tasks.filter(function (t) { return t.agent === a && isActive(t); }).length;
        return '<div style="display:flex;align-items:center;gap:10px;font-size:13px">' + dot('ok') + '<b style="font-weight:500">' + a + '</b><span class="w-mm">ready</span><span class="w-mm" style="margin-left:auto">' + n + ' active</span></div>';
      }).join('') + '</section>' +
      '<section class="w-pn" aria-label="Activity"><div class="w-ph">Activity</div><div style="display:flex;flex-direction:column;gap:12px">' + S.log.slice(0, 7).map(function (l) { return '<div class="w-act"><span class="w-mm">' + clock(l.t) + '</span><span>' + esc(l.x) + '</span></div>'; }).join('') + '</div></section></div></div>';
  }

  function runsHTML() {
    var rs = runList();
    return '<div style="padding:16px 24px 24px;display:flex;flex-direction:column;gap:16px"><div style="display:flex;align-items:center;gap:16px">' + stripHTML().replace('w-stripwrap', 'w-stripwrap" style="flex:1') +
      '<label class="w-pick"><span>State</span><select><option>any</option><option>running</option><option>needs input</option><option>completed</option></select></label><span class="w-mm">' + rs.length + ' of ' + rs.length + '</span></div>' +
      '<section class="w-pn" style="padding:4px 16px"><div class="w-tbl" style="--cols:84px minmax(0,1.5fr) 100px 96px 120px 92px 60px 64px 56px"><div class="w-tr th" style="padding-top:12px"><span>Run</span><span>Task</span><span>Agent</span><span>Runner</span><span>State</span><span>Started</span><span class="r">Time</span><span class="r">Tokens</span><span class="r">Cost</span></div>' + rs.map(function (t) {
        var st = RUNSTATE[t.run.st], d = t.run.started;
        return '<div class="w-tr"><span class="w-mm">' + t.run.id + '</span><button style="border:0;background:none;padding:0;text-align:left;font-weight:500;color:var(--text)" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button><span>' + t.agent + '</span><span class="w-mm">this computer</span><span class="w-badge">' + dot(st[0]) + st[1] + '</span><span class="w-mm">' + (d < 0 ? 'Tue ' + clock(d) : 'Wed ' + clock(d)) + '</span><span class="w-mm r" data-el="' + t.id + '">' + dur(t.run.el) + '</span><span class="w-mm r">' + (t.run.tokens || '–') + '</span><span class="w-mm r">' + (t.run.cost || '–') + '</span></div>';
      }).join('') + '</div></section></div>';
  }

  function gitItems() { return S.tasks.filter(function (t) { return t.run && t.run.st === 'completed'; }); }
  function branchCardHTML(t) {
    var r = t.run;
    return '<li class="w-card w-branch"><p class="w-bname">werkbord/<b>' + esc(r.branch) + '</b></p><p style="display:flex;gap:6px;flex-wrap:wrap"><span class="w-chip">' + dot('work') + r.ahead + ' ahead</span><span class="w-chip">' + dot('ask') + 'not on any remote</span></p>' +
      '<p class="w-bwarn">' + r.ahead + ' commit' + (r.ahead === 1 ? '' : 's') + ' ready to review</p><p class="w-muted" style="font-size:13px">' + r.ahead + ' ahead of main · no upstream</p><p class="w-muted" style="font-size:13px"><span class="w-mm" style="color:var(--text)">' + (t.id * 2654435761 >>> 0).toString(16).slice(0, 8) + '</span> ' + esc(r.commit) + ' · ' + ago(S.now - (r.ended || S.now)) + '</p>' +
      '<div class="w-bfoot"><button class="link" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button><button class="w-btn" type="button" data-a="open" data-id="' + t.id + '">Review</button><button class="w-btn" type="button" data-a="merge" data-id="' + t.id + '">Merge…</button><button class="w-btn" type="button" data-a="push">Push</button></div></li>';
  }
  function gitNavHTML() {
    var n = gitItems().length;
    return '<div class="w-gnav">' + [['overview', 'Overview', null], ['check', 'Health', null], ['git', 'Branches', n + 1], ['pr', 'Pull requests', 0], ['changes', 'Changes', 0], ['folder', 'Worktrees', n + 3], ['runs', 'History', null]].map(function (b, i) {
      return '<button class="w-btn" type="button" data-a="gnav"' + (i === 0 ? ' aria-current="page"' : '') + '>' + ic(b[0]) + b[1] + (b[2] !== null ? '<span class="w-chip">' + b[2] + '</span>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function healthHTML() {
    return '<section class="w-pn" aria-label="Repository health"' + (S.finding ? ' style="border-color:color-mix(in srgb,var(--amber) 55%,var(--border))"' : '') + '><div class="w-ph"><span class="w-lab">Repository health</span><button class="w-btn sm end" type="button" data-a="toast" data-v="Health is recalculated when something changes, from Git metadata only: no network, no AI, nothing changed." style="margin-left:auto">Check now</button></div><p class="w-big" style="font-size:22px;' + (S.finding ? 'color:var(--warn-text)' : '') + '">' + (S.finding ? '1 item needs attention' : 'Healthy') + '</p><p class="w-muted" style="font-size:13px">Checked 2m ago · score ' + (S.finding ? 94 : 100) + '</p>' +
      (S.finding ? '<div class="w-slot"><b style="font-weight:600;font-size:13px">A branch is falling behind main</b><p class="w-muted" style="font-size:13px">werkbord/refactor-settings-page is 14 commits behind main. Merging it later may need a rebase first.</p><p class="w-well">git rev-list --count werkbord/refactor-settings-page..main → 14</p><div><button class="w-btn sm" type="button" data-a="finding">Create Backlog task</button></div></div>' :
        '<p class="w-muted" style="font-size:13px">11 checks passed. Findings never act on their own: you choose what becomes a task.</p>') + '</section>';
  }
  function gitHTML() {
    var items = gitItems();
    return '<div style="padding:16px 24px 0;height:100%;display:flex;flex-direction:column;gap:18px">' + gitNavHTML() + '<div class="w-split" style="padding:0;--side:420px;flex:1;min-height:0"><div class="w-pane" data-keep="git-l"><p class="w-lab" style="display:flex;justify-content:space-between">Needs you<span>' + items.length + '</span></p><ul style="display:flex;flex-direction:column;gap:12px">' + (items.length ? items.map(branchCardHTML).join('') : '<li class="w-empty">Nothing waiting. Finished work shows up here with its branch.</li>') + '</ul></div>' +
      '<div class="w-pane" data-keep="git-r">' + healthHTML() + '<section class="w-pn" aria-label="Repository"><div class="w-ph"><span class="w-lab">Repository</span><span class="end" style="display:flex;gap:6px"><button class="w-btn sm" type="button" data-a="toast" data-v="Refresh reads the repository again.">Refresh</button><button class="w-btn sm" type="button" data-a="toast" data-v="Fetch asks the remote what changed. It never pulls into your checkout.">Fetch</button></span></div><p style="font-weight:600;font-size:16px">my-app</p><div class="w-boxes"><div class="w-slot"><p class="w-lab">On this computer</p><dl class="w-kv"><dt>HEAD</dt><dd><b>main</b> · c93e343</dd><dt>Target</dt><dd><b>main</b></dd><dt>Working tree</dt><dd style="color:var(--ok-text)">clean</dd></dl></div><div class="w-slot"><p class="w-lab">On the remote</p><dl class="w-kv"><dt>origin</dt><dd>github.com/you/my-app</dd><dt>main</dt><dd>up to date</dd></dl></div></div></section></div></div></div>';
  }

  /* ---------- calendar ---------- */
  function lanes(evs) {
    evs.sort(function (a, b) { return a.sched.s - b.sched.s; });
    var out = [], cluster = [], ends = [], cEnd = 0;
    function flush() { var n = ends.length || 1; cluster.forEach(function (o) { o.n = n; }); out = out.concat(cluster); cluster = []; ends = []; }
    evs.forEach(function (t) {
      if (cluster.length && t.sched.s >= cEnd) { flush(); cEnd = 0; }
      var l = 0; while (ends[l] && ends[l] > t.sched.s) l++;
      ends[l] = t.sched.s + t.sched.dur; cEnd = Math.max(cEnd, ends[l]);
      cluster.push({ t: t, lane: l });
    });
    flush(); return out;
  }
  function evHTML(o) {
    var t = o.t, w = 100 / o.n, r = t.run, cls = r && r.st === 'running' ? ' run' : r && (r.st === 'needs' || r.st === 'blocked') ? ' ask' : waitingFor(t).length ? ' dep' : '';
    var top = (t.sched.s - H0 * 60) / 60 * HOUR, h = Math.max(22, t.sched.dur / 60 * HOUR - 3);
    var pos = 'top:' + (top + 1) + 'px;height:' + h + 'px;left:calc(' + (o.lane * w) + '% + 3px);right:auto;width:calc(' + w + '% - 6px)';
    // Another project's or workspace's event, in Universal: shown, not draggable.
    if (t.ext) return '<div class="w-ev" role="button" tabindex="0" data-a="other" style="' + pos + '"><b>' + esc(t.title) + '</b><span>' + clock(t.sched.s) + ' · ' + esc(t.agent) + '</span></div>';
    var state = r && r.st === 'running' ? 'running' : r && r.st === 'needs' ? 'needs you' : r && r.st === 'blocked' ? 'blocked' : r && r.st === 'completed' ? 'finished' : waitingFor(t).length ? 'after ' + waitingFor(t)[0].title : t.agent;
    return '<div class="w-ev' + cls + '" role="button" tabindex="0" draggable="true" data-ev="' + t.id + '" data-a="open" data-id="' + t.id + '" style="' + pos + '"><b>' + esc(t.title) + '</b><span>' + clock(t.sched.s) + ' · ' + esc(state) + '</span></div>';
  }
  /* A day's events: my-app's, and in Universal the other projects' and the Team's too. */
  function calEvents(d, uni) {
    var evs = S.tasks.filter(function (t) { return t.sched && t.sched.d === d && t.state !== 'done'; });
    if (uni) S.ext.cal.forEach(function (e, i) {
      if (e.d === d) evs.push({ id: 'e' + i, ext: true, title: e.title, sched: { d: e.d, s: e.s, dur: e.dur }, agent: e.tag, deps: [], state: 'backlog', run: null });
    });
    return evs;
  }
  function dayColHTML(d, extra, uni) {
    var now = d === TODAY && S.now >= H0 * 60 && S.now <= H1 * 60 ? '<div class="w-now" data-now style="top:' + ((S.now - H0 * 60) / 60 * HOUR) + 'px"></div>' : '';
    // With the test task picked, tomorrow at 09:00 is offered as a slot, so a click is enough to plan it.
    var t3 = story(3), slot = !uni && D.pick && t3 && D.pick === t3.id && !t3.sched && d === TODAY + 1 ?
      '<button class="w-slot" type="button" data-a="slot" data-day="' + d + '" data-m="540" style="top:' + ((540 - H0 * 60) / 60 * HOUR + 1) + 'px;height:' + (HOUR - 3) + 'px">' + ic('calendar', 14) + 'Tomorrow, 09:00</button>' : '';
    return '<div class="w-dcol' + ((d % 7 + 7) % 7 > 4 ? ' weekend' : '') + (D.pick ? ' pickable' : '') + (extra || '') + '" data-day="' + d + '" style="height:' + ((H1 - H0) * HOUR) + 'px">' + lanes(calEvents(d, uni)).map(evHTML).join('') + slot + now + '</div>';
  }
  function hoursHTML() { var h = ''; for (var i = H0; i < H1; i++) h += '<span style="top:' + ((i - H0) * HOUR + (i === H0 ? 8 : 0)) + 'px">' + pad(i) + ':00</span>'; return '<div class="w-hours">' + h + '</div>'; }
  function weekTitle(w) { var a = dateOf(7 * w), b = dateOf(7 * w + 6); return MONTHS[a.getMonth()] + ' ' + a.getDate() + ' – ' + (a.getMonth() === b.getMonth() ? '' : MONTHS[b.getMonth()] + ' ') + b.getDate() + ', ' + b.getFullYear(); }
  function calGridHTML(uni) {
    var base = 7 * D.week, days = [];
    for (var i = 0; i < 7; i++) days.push(base + i);
    return '<div class="w-calmain"><div class="w-calbar"><div class="l"><button class="w-btn" type="button" data-a="today">Today</button><button class="w-btn ic" type="button" data-a="wk" data-id="-1" aria-label="Previous week">' + ic('left') + '</button><button class="w-btn ic" type="button" data-a="wk" data-id="1" aria-label="Next week">' + ic('right') + '</button><span class="w-caltitle">' + weekTitle(D.week) + '</span></div>' +
      '<div class="r"><button class="w-btn" type="button" data-a="tz"><span class="w-mm" style="color:var(--text);font-size:12px">Europe/Amsterdam</span></button><div class="w-seg"><button type="button" data-a="mode" data-id="day" aria-pressed="false">Day</button><button type="button" aria-pressed="true">Week</button></div></div></div>' +
      '<div class="w-calhead"><div></div>' + days.map(function (d) { return '<div class="w-dh">' + DAYS[(d % 7 + 7) % 7].toUpperCase() + '<b' + (d === TODAY ? ' class="today"' : '') + '>' + dateOf(d).getDate() + '</b></div>'; }).join('') + '</div>' +
      '<div class="w-calscroll" data-keep="cal' + (uni ? '-u' : '') + '"><div class="w-calgrid">' + hoursHTML() + days.map(function (d) { return dayColHTML(d, '', uni); }).join('') + '</div></div></div>';
  }
  /* Universal's calendar: every project of every workspace on one week, read only. */
  function calMainHTML() { return '<div class="w-cal single">' + calGridHTML(true) + '</div>'; }
  function calendarHTML() {
    var unsched = S.tasks.filter(function (t) { return !t.sched && t.state !== 'done'; });
    var queue = S.tasks.filter(function (t) { return t.sched && t.state === 'backlog'; }).sort(function (a, b) { return schedAbs(a) - schedAbs(b); });
    var waiting = S.tasks.filter(function (t) { return t.state === 'backlog' && waitingFor(t).length; });
    return '<div class="w-cal">' + calGridHTML(false) +
      '<aside class="w-calside" data-keep="calside" aria-label="Unscheduled and queue"><h3>Unscheduled <span class="w-chip">' + unsched.length + '</span></h3>' +
      unsched.map(function (t) { return '<div class="w-card w-unit" role="button" tabindex="0" draggable="true" data-un="' + t.id + '" data-a="pick" data-id="' + t.id + '" aria-pressed="' + (D.pick == t.id) + '"><span class="grip">' + ic('grip') + '</span><span><span class="t">' + esc(t.title) + '</span><span class="w-mm">' + ({ backlog: 'Backlog', doing: 'Doing', review: 'Review' })[t.state] + (t.prio !== 'normal' ? ' · ' + t.prio : '') + '</span></span></div>'; }).join('') +
      '<p class="w-mm" style="line-height:1.6">' + (D.pick ? 'Now click a time in the week.' : 'Drag onto the week, or pick one and click a time.') + '</p>' +
      '<h3>Queue <span class="w-chip">' + queue.length + '</span></h3>' + queue.map(function (t) {
        var w = waitingFor(t), dt = dateOf(t.sched.d);
        return '<div class="w-qrow"><b>' + esc(t.title) + '</b><span class="w-mm">' + dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()) + ' ' + clock(t.sched.s) + ' · ' + (w.length ? 'Waiting on Dependency' : 'Scheduled') + '</span>' + (w.length ? '<span class="w-muted" style="font-size:12.5px">Waiting for ' + esc(w[0].title) + ' to finish</span>' : '') + '</div>';
      }).join('') +
      (waiting.length ? '<h3>Waiting on</h3>' + waiting.map(function (t) { return '<div class="w-qrow"><b>' + esc(t.title) + '</b><span class="w-mm">after ' + esc(waitingFor(t)[0].title) + '</span></div>'; }).join('') : '') +
      '<h3>Concurrency</h3><p class="w-mm" data-conc2>' + active() + ' of ' + LIMIT + ' running in my-app</p></aside></div>';
  }

  /* ---------- the task panel (routes/TaskPanel.svelte) ---------- */
  function feedHTML(t) {
    if (!t.run) return '<p class="w-muted">No run yet. Start an agent and its work appears here as it happens.</p>';
    return '<div class="w-feed" data-feed="' + t.id + '">' + t.run.feed.map(feedItem).join('') + '</div>';
  }
  function feedItem(e) {
    if (e.k === 'sys') return '<p class="sys"><b>' + esc(e.x) + '</b><span class="w-muted">' + clock(e.t) + '</span></p>';
    if (e.k === 'me') return '<div class="me"><p>' + esc(e.x) + '</p><time>' + clock(e.t) + '</time></div>';
    if (e.k === 'q' || e.k === 'block') return '<div class="w-card w-qbox"><p class="lbl">' + (e.k === 'q' ? 'Decision for you' : 'Stopped rather than guess') + '</p><p>' + esc(e.x) + '</p></div>';
    return '<div class="out"><p>' + esc(e.x) + '</p><time>' + clock(e.t) + '</time></div>';
  }
  function panelInner(t, tab, phone) {
    var r = t.run, st = status(t), stateLabel = { backlog: 'Backlog', doing: 'Doing', review: 'Review', done: 'Done' }[t.state];
    var stTone = { backlog: 'neutral', doing: 'work', review: 'ask', done: 'ok' }[t.state];
    var top = '<div class="top">' + (phone ? '<button class="w-btn quiet ic" type="button" data-a="close" aria-label="Back">' + ic('left', 18) + '</button>' : '') + '<span class="w-pill">' + dot(stTone) + stateLabel + '</span><span class="sp"></span>' +
      (isActive(t) ? '<button class="w-btn' + (phone ? ' sm' : '') + ' danger" type="button" data-a="stop" data-id="' + t.id + '">' + ic('stop', 14) + 'Stop agent</button>' : '') +
      (phone ? '' : '<button class="w-btn" type="button" data-a="closetask">Close task</button>') + '<button class="w-btn' + (phone ? ' sm' : '') + '" type="button" data-a="edit">Edit</button>' +
      (phone ? '' : '<button class="w-btn quiet ic" type="button" data-a="close" aria-label="Close">' + ic('close') + '</button>') + '</div>';
    var head = '<header class="w-phead">' + top + '<h2>' + esc(t.title) + '</h2><p class="w-meta">Runs with <b>' + t.agent + '</b> · ' + t.interaction + ' · ' + ({ high: 'High', normal: 'Normal', low: 'Low' })[t.prio] + ' priority</p></header>';
    var tabs = '<div class="w-ptabs" role="tablist">' + [['activity', 'Activity'], ['details', 'Details'], ['execution', 'Execution'], ['schedule', 'Schedule'], ['runs', 'Runs (' + (r ? 1 : 0) + ')']].map(function (x) {
      return '<button type="button" role="tab" data-a="ptab" data-id="' + x[0] + '" aria-selected="' + (tab === x[0]) + '">' + x[1] + '</button>';
    }).join('') + '</div>';
    var body;
    if (tab === 'activity') {
      body = (r ? '<div class="w-card w-runcard' + (r.st === 'running' ? ' live' : '') + '">' + dot((RUNSTATE[r.st] || ['neutral'])[0], r.st === 'running' ? 'pulse' : '') + '<b style="font-weight:500">' + (RUNSTATE[r.st] || ['', 'Run'])[1] + '</b><span class="w-mm">' + t.agent + ' · <span data-el="' + t.id + '">' + dur(r.el) + '</span></span></div>' +
        '<p class="w-muted" style="font-size:13px">' + ({ running: 'The agent is working in its own worktree. Your checkout is untouched.', needs: 'The agent is waiting for your answer.', blocked: 'The agent stopped rather than guess. Pick an answer or reply in your own words.', completed: 'The session is finished. Read the change, then merge it or ask for another pass.', merged: 'Merged into main by you.', queued: 'Queued until a slot frees up.', stopped: 'Stopped. The worktree is kept, so the next run can pick up from here.' })[r.st] + '</p>' : '') + feedHTML(t) +
        (r && r.st === 'completed' ? '<div class="w-card" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px"><p class="w-lab">The change</p><p style="font-size:13px"><span class="w-mm" style="color:var(--text)">' + branchOf(t) + '</span> · ' + r.files + ' files · <span class="w-add">+' + r.add + '</span> <span class="w-del">−' + r.del + '</span></p><div style="display:flex;gap:8px;flex-wrap:wrap">' + (t.state === 'review' ? '<button class="w-btn sm pri" type="button" data-a="merge" data-id="' + t.id + '">' + ic('merge', 14) + 'Merge…</button>' : '<button class="w-btn sm pri" type="button" data-a="toreview" data-id="' + t.id + '">' + ic('right', 14) + 'Move to Review</button>') + '<button class="w-btn sm" type="button" data-a="continue">Continue with…</button></div></div>' : '');
    } else if (tab === 'details') {
      body = '<p class="w-lab">Description</p><p style="font-size:14px">' + esc(t.desc || 'No description. The title is the instruction.') + '</p><dl class="w-kv" style="margin-top:8px"><dt>Task</dt><dd class="w-mm" style="color:var(--text)">tsk_' + (t.id * 7919).toString(36) + '</dd><dt>State</dt><dd>' + stateLabel + '</dd><dt>Status</dt><dd>' + esc(st.text) + '</dd>' + (r && r.branch ? '<dt>Branch</dt><dd class="w-mm" style="color:var(--text)">' + branchOf(t) + '</dd>' : '') + '</dl>';
    } else if (tab === 'execution') {
      body = '<dl class="w-kv"><dt>Agent</dt><dd>' + t.agent + ' <span class="w-mm">from the project</span></dd><dt>Model</dt><dd>Agent default</dd><dt>Reasoning</dt><dd>Agent default</dd><dt>Interaction</dt><dd>' + t.interaction + '</dd><dt>Priority</dt><dd>' + ({ high: 'High', normal: 'Normal', low: 'Low' })[t.prio] + '</dd><dt>Runner</dt><dd>Automatic · this computer</dd></dl><p class="w-muted" style="font-size:13px">Settings are inherited: global, then project, then task, then a one-run override. The most specific wins.</p>';
    } else if (tab === 'schedule') {
      body = t.sched ? '<dl class="w-kv"><dt>Starts</dt><dd>' + dayLabel(t.sched.d) + ', ' + clock(t.sched.s) + '</dd><dt>Timezone</dt><dd>Europe/Amsterdam</dd><dt>If missed</dt><dd>Run late, within the grace period</dd>' + (t.deps.length ? '<dt>After</dt><dd>' + t.deps.map(function (d) { return esc(get(d).title); }).join(', ') + '</dd>' : '') + '</dl><p class="w-muted" style="font-size:13px">One attempt per schedule. Rearm it to ask for another run.</p>' :
        '<p class="w-muted" style="font-size:13px">Not scheduled. Drag it onto the Calendar, or set a time here, and it starts by itself at that time, even with this window closed.</p><div><button class="w-btn sm" type="button" data-a="view" data-id="calendar">Open Calendar</button></div>';
    } else {
      body = r ? '<div class="w-card" style="padding:4px 14px"><div class="w-tbl" style="--cols:84px minmax(0,1fr) 70px"><div class="w-tr">' + '<span class="w-mm">' + r.id + '</span><span class="w-badge">' + dot(RUNSTATE[r.st][0]) + RUNSTATE[r.st][1] + '</span><span class="w-mm r" data-el="' + t.id + '">' + dur(r.el) + '</span></div></div></div>' : '<p class="w-muted">No runs yet.</p>';
    }
    var dock;
    if (r && (r.st === 'needs' || r.st === 'blocked')) {
      dock = '<div class="w-dock ask"><div class="w-card w-qd"><p class="h"><span class="w-lab">' + (r.st === 'needs' ? 'Needs your decision' : 'Stopped rather than guess') + '</span><span>asked <span data-wait="' + t.id + '">' + dur(S.now - r.asked) + '</span> ago</span></p><p class="w-q">' + esc(r.q) + '</p><div class="acts">' + r.choices.map(function (c) { return '<button class="w-btn" type="button" data-a="answer" data-id="' + t.id + '" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div></div></div>';
    } else {
      dock = '<div class="w-dock"><form class="w-compose" data-form="msg" data-id="' + t.id + '"><input class="w-input" name="m" placeholder="' + (r && r.st === 'running' ? 'Add a message. It is queued for the agent' : 'Continue with new instructions') + '" autocomplete="off" aria-label="Message to the agent"><button class="w-btn pri" type="submit">Send</button></form>' + (phone ? '' : '<p class="w-hint">Enter to send · Shift+Enter for a new line</p>') + '</div>';
    }
    return head + tabs + '<div class="w-pbody" data-keep="pbody-' + t.id + '">' + body + '</div>' + dock;
  }

  /* ---------- sheets and the switcher ---------- */
  function sheetHTML(sh, phone) {
    if (!sh) return '';
    if (sh.kind === 'workflow-report' && P.wf) {
      var findings = {
        'my-app': [['An empty report crashes the CSV export', 'Return a file with the header row only when no rows match.'], ['A comma inside a field splits the CSV row', 'Quote every field, and double any quote inside one.']],
        'api-server': [['An empty request body returns a 500', 'Answer with a 400 and a validation message.'], ['Rate limits reset a second late at the window edge', 'Measure from the window’s start, not from the last request.']],
        'marketing-site': [['Signup errors are not announced to screen readers', 'Put the message in a polite live region.'], ['The theme resets after navigating', 'Read the saved theme before the first paint.']] }[P.wf.repo];
      return '<div class="w-scrim" data-a="sheetx"></div><section class="w-sheet" role="dialog" aria-label="Find Bugs report"><header><h2>Find Bugs · ' + esc(P.wf.repo) + '</h2><button class="w-btn ic" type="button" data-a="sheetx" aria-label="Close report">' + ic('close') + '</button></header><div class="body"><p>Finished on MacBook-Pro: two bugs it could reproduce, each with a suggested fix. No files were changed.</p><p class="w-mm">A scripted report in this demo · Claude Code</p><ol class="w-workflows">' + findings.map(function (f) { return '<li class="w-card w-pn"><strong>' + esc(f[0]) + '</strong><p class="w-mm">Suggested fix: ' + esc(f[1]) + '</p></li>'; }).join('') + '</ol></div><footer><button class="w-btn pri" type="button" data-a="sheetx">' + (phone ? 'Back to the deck' : 'Close') + '</button></footer></section>';
    }
    if (sh.kind === 'new') {
      return '<div class="w-scrim" data-a="sheetx"></div><form class="w-sheet" data-form="new" role="dialog" aria-label="New task in my-app" style="--w:640px"><header><h2>New task in my-app</h2><button class="w-btn quiet sm ic" type="button" data-a="sheetx" aria-label="Close">' + ic('close') + '</button></header>' +
        '<div class="body"><label class="w-field"><span class="w-lab">What should an agent do?</span><input class="w-input big" name="title" maxlength="200" placeholder="Fix the flaky auth test" autocomplete="off" required></label>' +
        '<label class="w-field"><span class="w-lab">Details <span class="opt">optional</span></span><textarea class="w-input" name="desc" rows="3" placeholder="Context, constraints, where to look…"></textarea></label>' +
        '<div class="w-exec"><label class="w-field"><span class="w-lab">Agent</span><select class="w-select" name="agent"><option>Claude Code</option><option>Codex</option></select></label><label class="w-field"><span class="w-lab">Priority</span><select class="w-select" name="prio"><option value="normal">Normal</option><option value="high">High</option><option value="low">Low</option></select></label><label class="w-field"><span class="w-lab">Interaction</span><select class="w-select" name="inter"><option>Ask me when needed</option><option>Autonomous</option><option>Stop if blocked</option></select></label></div></div>' +
        '<footer><span class="tip"><kbd class="w-key">⌘</kbd><kbd class="w-key">↵</kbd> start</span><button class="w-btn" type="button" data-a="sheetx">Cancel</button><button class="w-btn" type="submit" name="go" value="add">Add to Backlog</button><button class="w-btn pri" type="submit" name="go" value="start">Add and start agent</button></footer></form>';
    }
    if (sh.kind === 'merge') {
      var t = get(sh.id), r = t.run;
      return '<div class="w-scrim" data-a="sheetx"></div><div class="w-sheet" role="dialog" aria-label="Merge" style="--w:560px"><header><h2>Merge ' + branchOf(t) + '</h2><button class="w-btn quiet sm ic" type="button" data-a="sheetx" aria-label="Close">' + ic('close') + '</button></header>' +
        '<div class="body"><p>Merge <strong>' + branchOf(t) + '</strong> into <strong>main</strong>, on this computer only. <span class="w-muted">Nothing is pushed, and no pull request is changed.</span></p>' +
        '<dl class="w-kv"><dt>Commits</dt><dd>' + r.ahead + ' from the branch</dd><dt>Files</dt><dd>' + r.files + ' changed, <span class="w-add">+' + r.add + '</span> <span class="w-del">−' + r.del + '</span></dd><dt>Reviewed</dt><dd class="w-mm" style="color:var(--text)">' + (t.id * 2654435761 >>> 0).toString(16).slice(0, 7) + ' into c93e343</dd><dt>Conflicts</dt><dd>Git merged them in memory: no conflicts.</dd></dl>' +
        '<fieldset style="border:0;padding:0;margin:0;display:grid;gap:6px"><legend class="w-muted" style="font-size:12px;padding:0;margin-bottom:6px">How</legend><label class="w-radio"><input type="radio" name="how" checked> Merge commit <span class="w-muted" style="font-size:12px">(keeps the branch’s commits)</span></label><label class="w-radio"><input type="radio" name="how"> Fast-forward only <span class="w-muted" style="font-size:12px">(no new commit; refused if main moved)</span></label></fieldset>' +
        '<p class="w-muted" style="font-size:12px">Checked just now. It is checked again the moment you confirm, and refused if anything moved.</p></div>' +
        '<footer><button class="w-btn" type="button" data-a="sheetx">Cancel</button><button class="w-btn pri" type="button" data-a="mergego" data-id="' + t.id + '">' + ic('merge', 14) + 'Merge into main</button></footer></div>';
    }
    return '';
  }
  function palItems(q) {
    q = (q || '').toLowerCase();
    var items = [['view', 'control', 'Needs you', 'everywhere'], ['view', 'overview', 'Overview', 'my-app'], ['view', 'board', 'Board', 'my-app'], ['view', 'calendar', 'Calendar', 'my-app'], ['view', 'git', 'Git', 'my-app'], ['view', 'runs', 'Runs', 'my-app'], ['new', '', 'New task', 'action']]
      .concat(S.tasks.filter(function (t) { return t.state !== 'done'; }).map(function (t) { return ['open', t.id, t.title, 'task']; }));
    return items.filter(function (i) { return i[2].toLowerCase().indexOf(q) > -1; }).slice(0, 9);
  }
  function palListHTML(q) {
    var it = palItems(q);
    return it.length ? it.map(function (i) { return '<li><button type="button" data-a="' + i[0] + '" data-id="' + i[1] + '">' + esc(i[2]) + '<span class="w-mm">' + i[3] + '</span></button></li>'; }).join('') : '<li class="w-empty">No match</li>';
  }

  /* ---------- render: desktop ---------- */
  var deskRoot, phoneRoot;
  function keepScroll(root, store) { if (!root) return; root.querySelectorAll('[data-keep]').forEach(function (el) { store[el.dataset.keep] = [el.scrollTop, el.scrollLeft]; }); }
  function restoreScroll(root, store) { if (!root) return; root.querySelectorAll('[data-keep]').forEach(function (el) { var v = store[el.dataset.keep]; if (v) { el.scrollTop = v[0]; el.scrollLeft = v[1]; } }); }
  function focusKey(root) {
    var a = document.activeElement; if (!root || !a || !root.contains(a)) return null;
    if (a.matches('input,textarea,select')) return null;
    return a.dataset && a.dataset.a ? '[data-a="' + a.dataset.a + '"]' + (a.dataset.id != null ? '[data-id="' + a.dataset.id + '"]' : '') + (a.dataset.v ? '[data-v="' + CSS.escape(a.dataset.v) + '"]' : '') : null;
  }
  function renderDesk() {
    if (!deskRoot) return;
    if (D.drag) { D.dirty = true; return; }
    keepScroll(deskRoot, D.scroll);
    var fk = focusKey(deskRoot);
    var main, panel = '';
    if (D.ws === 'universal') main = ({ mywork: myWorkHTML, calendar: ucalHTML, inbox: inboxHTML })[D.uv]();
    else if (D.ws === 'team') main = teamMain();
    else {
      if (D.view === 'control') main = '<header class="w-ghead"><h1>Needs you</h1><button class="w-btn" type="button" data-a="pal">' + ic('search') + 'Jump to</button></header><main class="w-main" data-keep="main-cc">' + controlHTML(false) + '</main>';
      else main = headHTML() + bannerHTML() + '<main class="w-main" data-keep="main-' + D.view + '"' + (D.view === 'runs' ? '' : ' style="overflow:hidden"') + '>' + ({ board: boardHTML, overview: overviewHTML, calendar: calendarHTML, git: gitHTML, runs: runsHTML })[D.view]() + '</main>';
      panel = D.task && get(D.task) && D.view !== 'control' ? '<section class="w-panel" role="dialog" aria-label="Task">' + panelInner(get(D.task), D.ptab, false) + '</section>' : '';
    }
    // Sheets, the switcher and toasts live outside this part, so an open form keeps what was typed.
    deskRoot.querySelector('[data-app]').innerHTML = '<div class="w-shell">' + railHTML() + '<div class="w-mainarea">' + (P.wf ? wfBanner() : '') + main + panel + '</div></div>';
    restoreScroll(deskRoot, D.scroll);
    S.tasks.forEach(function (t) { t.fresh = false; });
    S.team.tickets.forEach(function (k) { k.fresh = false; });
    if (fk) { var n = deskRoot.querySelector(fk); if (n) n.focus({ preventScroll: true }); }
  }
  function palHTML() {
    return '<div class="w-scrim" data-a="palx"></div><div class="w-pal" role="dialog" aria-label="Jump to"><input class="w-input" data-pal placeholder="Jump to a project, section or task" autocomplete="off" aria-label="Jump to"><ul data-pallist>' + palListHTML('') + '</ul></div>';
  }
  function overlayOf(root) { return root && root.querySelector('[data-overlay]'); }
  function setOverlay(root, html, focusSel) {
    var o = overlayOf(root); if (!o) return;
    o.innerHTML = html;
    var f = focusSel && o.querySelector(focusSel); if (f) f.focus({ preventScroll: true });
    guideRefresh();
  }
  function openOverlay(html, focusSel) { setOverlay(deskRoot, html, focusSel); }
  /* Clears whatever sits over either simulator: a sheet, the palette or Salie. Only one surface is on screen at a
     time, so this closes the one the visitor sees. */
  function dropOverlay() {
    D.sheet = P.sheet = null; D.pal = null; D.sw = false;
    AS.open = false;
    renderAsst(false);
    setOverlay(deskRoot, ''); setOverlay(phoneRoot, '');
  }
  function closeOverlay() { dropOverlay(); }

  /* ================= phone =================
     The phone opens on the Control Deck (web/src/lib/mobile/): nine keys you set up yourself (a workflow key starts an agent on a repository), a row of tools for editing the deck, search, help
     and Settings, and a bottom bar with two places, the deck and Salie. Everything else is a page reached from a key, with Back. A
     project is under Projects and keeps its own sections as a row of tabs. It reads the same state as the desktop window. */
  var PLACES = { bugs: 'Find Bugs', control: 'Needs you', calendar: 'Calendar', projects: 'Projects', mywork: 'My Work', agents: 'Agents', analytics: 'Analytics', reviews: 'Reviews', git: 'Git', runners: 'Runners' };
  /* Eight navigation keys and one empty position, where the visitor adds a workflow key. */
  var KEYS = [['control', 'control', 'wait'], ['calendar', 'calendar'], ['projects', 'folder'], ['mywork', 'check'], ['agents', 'activity', 'work'], ['analytics', 'analytics'], ['reviews', 'merge', 'work'], ['git', 'git', 'wait'], ['bugs', 'bug']];
  /* The product's workflow buttons (web/src/lib/mobile/layout.ts WORKFLOWS). The demo runs Find Bugs only. */
  var WORKFLOWS = [['bugs', 'bug', 'Find Bugs', 'Report reproducible bugs and suggested fixes. Leaves files unchanged.'],
    ['tests', 'check', 'Improve Tests', 'Find coverage gaps, propose tests and validate approved changes.'],
    ['security', 'control', 'Security Audit', 'Report security risks and remediation. Leaves files unchanged.'],
    ['deps', 'git', 'Dependency Check', 'Report dependency risks and recommended updates. Does not update packages.'],
    ['refactor', 'edit', 'Refactor Codebase', 'Propose targeted refactors and validate approved changes.'],
    ['summary', 'runs', 'Sprint Summary', 'Summarise tasks, blockers, agent activity and Git activity from the last 14 days.']];
  var REPOS = ['my-app', 'api-server', 'marketing-site'];
  var WF_STAGES = ['Reading the repository', 'Reproducing each finding', 'Writing suggested fixes', 'Writing the report'];
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many || one + 's'); }
  function reviewTasks() { return S.tasks.filter(function (t) { return t.run && t.run.st === 'completed'; }); }
  /* Agents at work now: this project's, plus the Codex run and the waiting question the rest of Individual has. */
  function fleet() {
    var run = S.tasks.filter(function (t) { return t.run && t.run.st === 'running'; }), ask = S.tasks.filter(function (t) { return t.run && (t.run.st === 'needs' || t.run.st === 'blocked'); });
    var names = {};
    run.concat(ask).forEach(function (t) { names[t.agent] = 1; });
    names[S.ext.run.agent] = 1; if (S.ext.ask.st === 'needs') names[S.ext.ask.agent] = 1;
    return { running: run.length + 1, waiting: ask.length + (S.ext.ask.st === 'needs' ? 1 : 0), names: Object.keys(names) };
  }
  function keyCounts() { var f = fleet(); return { control: needsInd(), agents: f.running, reviews: reviewTasks().length, git: gitItems().length }; }
  function wfStep() { return P.wf ? Math.min(WF_STAGES.length, Math.floor((P.wf.elapsed || 0) / 10500)) : 0; }
  function wfLines() {
    var i = wfStep(), done = P.wf && (P.wf.stopped || i >= WF_STAGES.length);
    return { status: P.wf && P.wf.stopped ? 'Stopped' : done ? 'Completed' : 'Running', stage: done ? 'Execution ended' : WF_STAGES[i], count: (P.wf && P.wf.stopped ? i : done ? WF_STAGES.length : i) + ' of ' + WF_STAGES.length + ' stages reported complete', ended: !!done };
  }
  /* The workflow's progress strip above the deck (WorkflowBanner.svelte): what it is doing, how many stages have reported, Stop. */
  function wfBanner() {
    if (!P.wf || P.wf.dismissed) return '';
    var l = wfLines();
    return '<section class="w-wfb" aria-label="Workflow progress"><div class="ex"><div class="open"><strong>Find Bugs</strong><span data-wf="status">' + l.status + '</span><span data-wf="stage">' + l.stage + ' · ' + esc(P.wf.repo) + '</span><span class="w-mm" data-wf="count">Claude Code · ' + l.count + '</span></div>' +
      (l.ended && !P.wf.stopped ? '<button class="w-btn" type="button" data-a="wfreport">View report</button>' : '') + (l.ended ? '<button class="w-btn" type="button" data-a="wfx" aria-label="Dismiss finished workflow">' + ic('close') + '</button>' : '<button class="w-btn" type="button" data-a="wfstop" aria-label="Stop Find Bugs">' + ic('stop', 14) + 'Stop</button>') + '</div></section>';
  }
  /* The deck's three sheets for a workflow key: the button library (an empty position, or the pencil), the repository
     picker (a tap, while the key asks every time) and the key's settings (a hold, or Shift+F10). P.repo is the saved
     repository, or null to ask every time. */
  function workflowSheet(kind) {
    P.sheet = { kind: kind };
    var title, body, foot = '', focus;
    if (kind === 'decklibrary') {
      title = 'Add a button'; focus = '[data-a="deckadd"]';
      body = '<p>Workflow buttons turn a task you repeat into one tap. Your paired computer does the work: no new task to write, no settings to fill in each time.</p><div class="w-workflows">' + WORKFLOWS.map(function (w) {
        var on = w[0] === 'bugs';
        return '<button class="w-card w-workflow-option" type="button"' + (on ? ' data-a="deckadd"' : ' disabled') + '>' + ic(w[1], 20) + '<span><strong>' + w[2] + '</strong><span>' + w[3] + '</span><small>' + (on ? (P.deckAdded ? 'On your deck · settings' : 'Add to your deck') : 'Not in this demo') + '</small></span></button>';
      }).join('') + '</div><p class="w-mm">Navigation keys open a page. In the app, the pencil above the deck replaces, removes or moves any of the nine.</p>';
    } else if (kind === 'wfpick') {
      title = 'Run Find Bugs'; focus = 'input[name="wfrepo"]:checked';
      body = '<p>Choose a repository. Your computer looks for bugs it can reproduce and suggests fixes. No files are changed.</p><fieldset class="w-repos"><legend class="w-lab">Repository</legend>' +
        REPOS.map(function (r, i) { return '<label class="w-radio"><input type="radio" name="wfrepo" value="' + r + '"' + (i === 0 ? ' checked' : '') + '> ' + r + '</label>'; }).join('') + '</fieldset><p class="w-mm">Claude Code · MacBook-Pro</p>';
      foot = '<footer><button class="w-btn" type="button" data-a="sheetx">Cancel</button><button class="w-btn pri" type="button" data-a="wfrun">' + ic('play', 12) + 'Run Find Bugs</button></footer>';
    } else {
      title = 'Find Bugs settings'; focus = '[data-workflow-repo]';
      body = '<p>Holding a workflow button opens its settings. Save a repository, and a tap runs it there straight away.</p><label class="w-field"><span class="w-lab">Repository</span><select class="w-select" data-workflow-repo><option value=""' + (P.repo ? '' : ' selected') + '>Ask every time</option>' +
        REPOS.map(function (r) { return '<option value="' + r + '"' + (P.repo === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></label>' +
        '<dl class="w-kv"><dt>Agent</dt><dd>Claude Code</dd><dt>Runner</dt><dd>MacBook-Pro</dd><dt>Result</dt><dd>A report. Leaves files unchanged.</dd></dl>';
      foot = '<footer><button class="w-btn" type="button" data-a="sheetx">Cancel</button><button class="w-btn pri" type="button" data-a="wfsave">Save</button></footer>';
    }
    setOverlay(phoneRoot, '<div class="w-scrim" data-a="sheetx"></div><section class="w-sheet" role="dialog" aria-label="' + title + '"><header><h2>' + title + '</h2><button class="w-btn ic" type="button" data-a="sheetx" aria-label="Close">' + ic('close') + '</button></header><div class="body">' + body + '</div>' + foot + '</section>', focus);
  }
  function wfRunning() { return !!P.wf && !wfLines().ended; }
  function saveWorkflow() {
    var select = phoneRoot.querySelector('[data-workflow-repo]');
    if (select) P.repo = select.value || null;
    G.f['phone-config'] = true;
    toast(P.repo ? 'Saved. A tap on Find Bugs now runs it on ' + P.repo + '.' : 'Saved. Find Bugs asks for a repository each time.');
  }
  function runWorkflow(repo) {
    if (wfRunning()) { toast('Find Bugs is already running on ' + P.wf.repo + '. Its progress is above the deck.'); return; }
    P.wf = { elapsed: 0, repo: repo };
    G.f['phone-run'] = true;
    toast('Find Bugs started on ' + repo + '. Your computer is doing the work.');
  }
  /* A tap runs the key: on its saved repository, or after asking for one. */
  function tapWorkflow() {
    if (wfRunning()) { toast('Find Bugs is already running on ' + P.wf.repo + '. Its progress is above the deck.'); return; }
    if (P.repo) { runWorkflow(P.repo); render(); } else workflowSheet('wfpick');
  }
  function phoneDeck() {
    var c = keyCounts();
    var keys = KEYS.map(function (k) {
      if (k[0] === 'bugs') {
        if (!P.deckAdded) return '<button class="w-dkey empty" type="button" data-a="decklibrary" aria-label="Add a button to position 9"><span class="cap"><span class="face"><span class="glyph">' + ic('plus', 26) + '</span><span class="name">Add button</span></span></span></button>';
        // A workflow key: tap to run, hold to configure. It names where it runs, and says so while it is running.
        // "Ask every time" in its settings; the key has room for nine characters.
        var busy = wfRunning(), where = busy ? 'Running' : P.repo || 'Pick repo';
        return '<a class="w-dkey workflow" href="#" data-a="wftap" data-key="bugs" aria-keyshortcuts="Shift+F10"' + (busy ? ' data-run="on"' : '') + ' aria-label="Find Bugs, ' + (busy ? 'running on ' + esc(P.wf.repo) : P.repo ? 'runs on ' + esc(P.repo) : 'asks for a repository') + '. Hold to change its settings."><span class="cap"><span class="face targeted"><span class="glyph">' + ic('bug', 22) + '</span><span class="name">Find Bugs</span><span class="target">' + (busy ? dot('work', 'pulse') : '') + esc(where) + '</span></span></span></a>';
      }
      var count = c[k[0]] || 0, tone = k[2] || 'plain', lit = count > 0;
      return '<a class="w-dkey" href="#" data-a="pgo" data-id="' + k[0] + '" data-key="' + k[0] + '"' + (lit ? ' data-lit="on" data-tone="' + tone + '"' : '') + ' aria-label="' + PLACES[k[0]] + (lit ? ', ' + count : '') + '"><span class="cap"><span class="face"><span class="glyph">' + ic(k[1], 26) + '</span><span class="name">' + PLACES[k[0]] + '</span></span>' +
        (lit ? '<span class="w-num' + (tone === 'wait' ? ' pend' : '') + '" aria-hidden="true">' + count + '</span>' : '') + '</span></a>';
    }).join('');
    return '<div class="w-deckpage"><header class="w-dtop"><div class="id"><p class="brand">' + mark(20) + '<span class="wm">werkbord</span></p><p class="w-mm status"><span class="conn">' + dot('ok') + 'Connected</span> · 1 runner</p></div>' +
      '<nav class="tools" aria-label="Deck tools"><button class="w-btn ic" type="button" data-a="decklibrary" aria-label="Edit Deck">' + ic('edit') + '</button>' +
      '<button class="w-btn ic" type="button" data-a="toast" data-v="Jump to searches projects, sections and tasks." aria-label="Jump to">' + ic('search') + '</button>' +
      '<button class="w-btn ic" type="button" data-a="help" aria-label="Help and shortcuts">' + ic('help') + '</button>' +
      '<button class="w-btn ic" type="button" data-a="settings" aria-label="Settings">' + ic('settings') + '</button></nav></header>' +
      wfBanner() +
      '<section class="w-housing" aria-label="Control Deck"><div class="w-keys">' + keys + '</div></section>' + (P.wf ? '<section class="w-deckhistory" aria-label="Workflow executions"><h2>Workflow executions</h2><p>Find Bugs · ' + esc(P.wf.repo) + '</p><p class="w-mm" data-wf="count">Claude Code · ' + wfLines().count + '</p><p data-wf="stage">' + wfLines().stage + ' · ' + esc(P.wf.repo) + '</p>' + (P.wf.ended && !P.wf.stopped ? '<p>2 bugs found · 2 suggested fixes · no files changed</p><button class="w-btn" type="button" data-a="wfreport">View report</button>' : '') + '</section>' : '') + '</div>';
  }
  /* A page under the deck: Back, its name, and one line on how its subject stands (the app's subtitle.ts). */
  function pageHead(title, sub, back, tone) {
    return '<header class="w-phh"><button class="w-btn ic" type="button" data-a="pback" aria-label="Back to ' + back + '">' + ic('left', 18) + '</button><div class="t"><h1>' + title + '</h1>' + (sub ? '<p class="w-mm">' + (tone ? dot(tone) : '') + sub + '</p>' : '') + '</div>' +
      '<button class="w-btn ic" type="button" data-a="toast" data-v="Jump to searches projects, sections and tasks." aria-label="Jump to">' + ic('search') + '</button></header>';
  }
  function phoneControl() {
    var c = controlHTML(true);
    return '<div class="w-mpage">' + c.seg + '<div class="w-filters"><label class="w-pick"><span>Project</span><select><option>all</option></select></label><label class="w-pick"><span>Agent</span><select><option>all</option></select></label></div>' + c.list + c.side + '</div>';
  }
  function phoneBoard() {
    var cols = COLS.map(function (c) { return [c[0], c[1], inCol(c[0])]; });
    return '<div class="w-mpage"><div class="w-seg full" role="group" aria-label="Board column">' + cols.map(function (c) { return '<button type="button" data-a="col" data-id="' + c[0] + '" aria-pressed="' + (P.col === c[0]) + '">' + c[1] + '<span class="w-mm">' + c[2].length + '</span></button>'; }).join('') + '</div>' +
      filtersHTML() + legendHTML(true) +
      '<ul style="display:flex;flex-direction:column;gap:12px">' + (function () { var ts = inCol(P.col); return ts.length ? ts.map(function (t) { return cardHTML(t, false); }).join('') : '<li class="w-none">' + emptyCol(P.col) + '</li>'; })() + '</ul></div>';
  }
  function phoneCalendar() {
    var d = P.day, x = dateOf(d);
    var head = '<div class="w-mcal"><div class="bar"><button class="w-btn" type="button" data-a="pday" data-id="0">Today</button><button class="w-btn ic" type="button" data-a="pday" data-id="-1" aria-label="Previous day">' + ic('left') + '</button><button class="w-btn ic" type="button" data-a="pday" data-id="1" aria-label="Next day">' + ic('right') + '</button><span class="w-caltitle">' + DAYS[(d % 7 + 7) % 7] + ', ' + MONTHS[x.getMonth()] + ' ' + x.getDate() + ', 2026</span></div>' +
      '<div class="bar"><button class="w-btn" type="button" data-a="tz"><span class="w-mm" style="color:var(--text);font-size:13px">Europe/Amsterdam</span></button><div class="w-seg"><button type="button" aria-pressed="true">Day</button><button type="button" data-a="toast" data-v="Week and Month are in the app. The demo shows the day.">Week</button></div></div>' +
      '<div class="w-dh" style="padding-left:52px">' + DAYS[(d % 7 + 7) % 7].toUpperCase() + '<b' + (d === TODAY ? ' class="today"' : '') + '>' + x.getDate() + '</b></div>' +
      '<div class="w-mday">' + hoursHTML() + dayColHTML(d) + '</div></div>';
    var task = story(3);
    return '<div class="w-mpage">' + (task && !task.sched ? '<section class="w-card w-pn"><p>' + esc(task.title) + '</p><button class="w-btn" type="button" data-a="pschedule">Schedule tomorrow at 09:00</button></section>' : '') + head + '</div>';
  }
  function phoneGit() {
    var items = gitItems();
    return '<div class="w-mpage">' + gitNavHTML() + '<p class="w-lab" style="display:flex;justify-content:space-between">Needs you<span>' + items.length + '</span></p><ul style="display:flex;flex-direction:column;gap:12px">' + (items.length ? items.map(branchCardHTML).join('') : '<li class="w-empty">Nothing waiting. Finished work shows up here with its branch.</li>') + '</ul>' + healthHTML() + '</div>';
  }
  function phoneRuns() {
    var rs = runList();
    return '<div class="w-mpage">' + stripHTML().replace('w-strip"', 'w-strip" style="grid-template-columns:repeat(24,1fr)"') + '<div style="display:flex;align-items:center;gap:12px"><label class="w-pick"><span>State</span><select><option>any</option></select></label><span class="w-mm">' + rs.length + ' of ' + rs.length + '</span></div>' +
      '<section class="w-card" style="overflow:hidden">' + rs.map(function (t) { var st = RUNSTATE[t.run.st]; return '<div class="w-runrow"><div class="top"><b>' + esc(t.title) + '</b><span class="w-muted">' + t.agent + '</span></div><div class="bot"><span class="w-badge" style="font-size:14px;font-weight:400">' + dot(st[0]) + st[1] + '</span><span class="w-mm" data-el="' + t.id + '">' + dur(t.run.el) + '</span></div></div>'; }).join('') + '</section></div>';
  }
  function phoneProjects() {
    var n = needsYou();
    var mine = [n ? n + ' needs you' : '', S.tasks.filter(function (t) { return t.run && t.run.st === 'running'; }).length ? S.tasks.filter(function (t) { return t.run && t.run.st === 'running'; }).length + ' running' : ''].filter(Boolean).join(' · ') || 'quiet';
    function row(name, path, note, act, num) { return '<li><button class="w-prow" type="button" data-a="' + act + '"><span class="tile" aria-hidden="true">' + ic('folder', 18) + '</span><span class="who"><b>' + name + '</b><span class="w-mm">' + path + ' · main</span><span class="w-mm">' + note + '</span></span>' + (num ? '<span class="w-num pend">' + num + '</span>' : '') + '</button></li>'; }
    return '<div class="w-mpage">' + '<div class="w-seg full" role="group" aria-label="Workspace">' + [['individual', 'Individual'], ['team', 'Team']].map(function (w) { return '<button type="button" data-a="pscope" data-id="' + w[0] + '" aria-pressed="' + (P.scope === w[0]) + '">' + w[1] + '</button>'; }).join('') + '</div>' + (P.scope === 'team' ? '<section class="w-card w-plist"><h2 class="w-ph">' + esc(S.team.name) + '</h2><ul>' + row(S.team.project, 'Team workspace', 'Shared tickets, branches and reviews', 'pteam', 0) + '</ul></section></div>' : '<section class="w-card w-plist" aria-label="Projects"><h2 class="w-ph">Projects <span class="w-chip">3</span></h2><ul>' + row('my-app', '~/code/my-app', mine, 'pproject', n) + row('api-server', '~/code/api-server', S.ext.ask.st === 'needs' ? '1 running · 1 needs input' : '2 running', 'other', S.ext.ask.st === 'needs' ? 1 : 0) + row('marketing-site', '~/code/marketing-site', 'quiet', 'other', 0) + '</ul></section></div>');
  }
  function phoneTeam() {
    return pageHead(S.team.project, S.team.name + ' · Team workspace', 'Projects') + '<nav class="w-ptabs" aria-label="Team sections">' + [['board', 'Board'], ['reviews', 'Reviews']].map(function (t) { return '<button type="button" data-a="pteamtab" data-id="' + t[0] + '" aria-current="' + (P.teamTab === t[0] ? 'page' : 'false') + '">' + t[1] + '</button>'; }).join('') + '</nav>' + (P.teamTab === 'reviews' ? '<div class="w-phone-team">' + teamReviewsHTML() + '</div>' : '<div class="w-mpage w-phone-team">' + TCOLS.map(function (c) { var tickets = S.team.tickets.filter(function (t) { return t.st === c[0]; }); return '<section class="w-col" data-col="' + c[0] + '"><h2 class="w-ph">' + c[1] + '</h2><ul class="w-list">' + tickets.map(tcardHTML).join('') + '</ul></section>'; }).join('') + '</div>');
  }
  function phoneMyWork() {
    var rows = myWorkRows(), status = { doing: 'In progress', review: 'In review' };
    return '<div class="w-mpage"><ul style="display:flex;flex-direction:column;gap:12px">' + (rows.length ? rows.map(function (w) {
      var open = w.go.indexOf('ind:') === 0;
      return '<li><button class="w-card w-prow" type="button" data-a="' + (open ? 'open' : w.ws === 'team' ? 'pteam' : 'other') + '"' + (open ? ' data-id="' + w.go.slice(4) + '"' : '') + '><span class="who"><b>' + esc(w.title) + '</b><span class="w-mm">' + esc(w.wsName) + ' · ' + esc(w.project) + ' · ' + status[w.status] + '</span></span>' +
        (w.exec ? '<span class="w-xb" data-tone="' + EXECTONE[w.exec] + '"><i class="w-dot" data-tone="' + EXECTONE[w.exec] + '"></i>' + EXECWORD[w.exec] + '</span>' : '') + '</button></li>';
    }).join('') : '<li class="w-empty">Nothing is in progress.</li>') + '</ul></div>';
  }
  function agentCards() {
    var ext = S.ext, extAsk = ext.ask.st === 'needs';
    return ['Claude Code', 'Codex'].map(function (name) {
      var mine = S.tasks.filter(function (t) { return isActive(t) && t.agent === name; });
      var asks = mine.filter(function (t) { return t.run.st === 'needs' || t.run.st === 'blocked'; }).length + (extAsk && ext.ask.agent === name ? 1 : 0);
      var working = mine.some(function (t) { return t.run.st === 'running'; }) || ext.run.agent === name || (!extAsk && ext.ask.agent === name);
      var n = mine.length + (ext.run.agent === name ? 1 : 0) + (ext.ask.agent === name ? 1 : 0);
      return { name: name, tasks: mine, ext: ext.run.agent === name, ask: ext.ask.agent === name, state: asks ? 'Waiting for you' : working ? 'Working' : 'Idle', sessions: n };
    });
  }
  function phoneAgents() {
    var cards = agentCards(), tone = { 'Waiting for you': 'ask', Working: 'work', Idle: 'ok' };
    function match(c, f) { return f === 'all' || (f === 'running' && c.state === 'Working') || (f === 'waiting' && c.state === 'Waiting for you') || (f === 'idle' && c.state === 'Idle'); }
    var seg = [['all', 'All'], ['running', 'Running'], ['waiting', 'Waiting'], ['idle', 'Idle']].map(function (f) {
      return '<button type="button" data-a="af" data-id="' + f[0] + '" aria-pressed="' + (P.af === f[0]) + '">' + f[1] + '<span class="w-mm">' + cards.filter(function (c) { return match(c, f[0]); }).length + '</span></button>';
    }).join('');
    var list = cards.filter(function (c) { return match(c, P.af); }).map(function (c) {
      var inside = c.tasks.map(function (t) { return cardHTML(t, false); });
      if (c.ext) inside.push('<li class="w-card w-task" data-tone="work"><button class="title" type="button" data-a="other">' + esc(S.ext.run.title) + '</button><p class="w-st">' + dot('work', 'pulse') + 'Running · ' + dur(S.ext.run.el) + ' · this computer</p><div class="mt"><span class="w-mm">api-server</span></div></li>');
      if (c.ask && S.ext.ask.st === 'needs') inside.push(itemHTML({ kind: 'question', t: extTask(), project: 'api-server' }, true));
      if (c.ask && S.ext.ask.st !== 'needs' && !c.ext) inside.push('<li class="w-card w-task" data-tone="work"><button class="title" type="button" data-a="other">' + esc(S.ext.ask.title) + '</button><p class="w-st">' + dot('work', 'pulse') + 'Running · this computer</p><div class="mt"><span class="w-mm">api-server</span></div></li>');
      return '<li class="w-card w-agent" data-tone="' + tone[c.state] + '"><div class="head"><span class="tile" aria-hidden="true">' + ic('activity', 20) + '</span><span class="who"><b>' + c.name + '</b><span class="w-mm">' + dot(tone[c.state]) + c.state + (c.sessions > 1 ? ' · ' + c.sessions + ' sessions' : '') + '</span></span></div>' +
        (c.state === 'Idle' ? '<p class="w-muted" style="font-size:13px">Ready. Start it on a task from a project\'s Board.</p>' : '') + (inside.length ? '<ul class="inside">' + inside.join('') + '</ul>' : '') + '</li>';
    }).join('');
    return '<div class="w-mpage"><div class="w-seg full" role="group" aria-label="Show agents">' + seg + '</div><ul style="display:flex;flex-direction:column;gap:10px">' + (list || '<li class="w-empty">No agent is ' + (P.af === 'waiting' ? 'waiting for you' : P.af) + '.</li>') + '</ul></div>';
  }
  function phoneReviews() {
    var items = attention().filter(function (i) { return i.kind === 'review'; });
    return '<div class="w-mpage"><ul style="display:flex;flex-direction:column;gap:12px">' + (items.length ? items.map(function (i) { return itemHTML(i, true); }).join('') : '<li class="w-empty">Nothing is ready for review. Finished work shows up here.</li>') + '</ul></div>';
  }
  function phoneAnalytics() {
    var all = S.tasks.filter(function (t) { return t.run; }), merged = S.tasks.filter(function (t) { return t.state === 'done'; }).length;
    function tile(n, l) { return '<li class="w-card w-stat"><b>' + n + '</b><span class="w-mm">' + l + '</span></li>'; }
    return '<div class="w-mpage"><ul class="w-stats">' + tile(all.length + 2, 'Runs today') + tile(reviewTasks().length, 'Ready for review') + tile(merged, 'Merged today') + tile(fleet().running, 'Agents running') + '</ul>' + stripHTML().replace('w-strip"', 'w-strip" style="grid-template-columns:repeat(24,1fr)"') + '</div>';
  }
  function phoneRunners() {
    return '<div class="w-mpage"><section class="w-card w-pn" aria-label="MacBook-Pro"><div class="top">' + dot('ok') + '<b style="font-weight:500">MacBook-Pro · this computer</b><span class="w-mm" style="margin-left:auto">' + (active() + 1) + '/' + (LIMIT + 1) + ' slots</span></div><p class="w-mm">darwin/arm64 · Claude Code, Codex</p></section></div>';
  }
  var PAGE = { control: phoneControl, calendar: phoneCalendar, projects: phoneProjects, mywork: phoneMyWork, agents: phoneAgents, analytics: phoneAnalytics, reviews: phoneReviews, git: phoneGit, runners: phoneRunners };
  function subtitle(at) {
    var f = fleet(), r = reviewTasks().length, n = needsInd();
    var idle = agentCards().filter(function (c) { return c.state === 'Idle'; }).length;
    return ({
      control: 'Items that need your attention',
      mywork: 'Your tasks, plan and progress',
      agents: [f.running ? f.running + ' running' : '', f.waiting ? f.waiting + ' waiting for you' : '', idle ? idle + ' idle' : ''].filter(Boolean).join(' · ') || 'None running',
      reviews: r ? r + (r === 1 ? ' task is' : ' tasks are') + ' ready for you to review' : 'Work ready for you to review',
      runners: '1 online'
    })[at] || '';
  }
  function phoneProject() {
    var tabs = [['board', 'Board'], ['calendar', 'Calendar'], ['git', 'Git'], ['runs', 'Runs']];
    return '<header class="w-phh"><button class="w-btn ic" type="button" data-a="pback" aria-label="Back to Projects">' + ic('left', 18) + '</button><div class="t"><h1>my-app<span class="chev">' + ic('down', 14) + '</span></h1><p class="w-mm">~/code/my-app · main</p></div>' +
      '<button class="w-btn ic" type="button" data-a="toast" data-v="Jump to searches projects, sections and tasks." aria-label="Jump to">' + ic('search') + '</button></header>' +
      '<nav class="w-ptabs" role="tablist" aria-label="my-app">' + tabs.map(function (t) { return '<button type="button" role="tab" data-a="ptabbar" data-id="' + t[0] + '" aria-selected="' + (P.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '<button type="button" role="tab" data-a="toast" data-v="Project settings cover agents, defaults and labels. They are not part of this demo." aria-selected="false">Settings</button></nav>' +
      bannerHTML() + ({ board: phoneBoard, calendar: phoneCalendar, git: phoneGit, runs: phoneRuns })[P.tab]();
  }
  function parentOf(at) { return at === 'project' || at === 'team' ? 'projects' : 'deck'; }
  function renderPhone() {
    if (!phoneRoot) return;
    keepScroll(phoneRoot, P.scroll);
    var fk = focusKey(phoneRoot), at = P.at, page;
    if (at === 'deck') page = phoneDeck();
    else if (at === 'project') page = phoneProject();
    else if (at === 'team') page = phoneTeam();
    else page = pageHead(PLACES[at], subtitle(at), parentOf(at) === 'deck' ? 'the Control Deck' : 'Projects', at === 'agents' ? (agentCards().some(function (c) { return c.state === 'Waiting for you'; }) ? 'ask' : fleet().running ? 'ok' : 'neutral') : '') + PAGE[at]();
    var q = waitingChanges();
    var tabbar = '<nav class="w-tabbar" aria-label="Primary">' +
      '<button type="button" data-a="pdeck"' + (!AS.open ? ' aria-current="page"' : '') + '><span class="icon">' + ic('control', 22) + '</span><span>Control Deck</span></button>' +
      '<button type="button" data-a="' + (AS.open ? 'asst-x' : 'asst-open') + '" aria-haspopup="dialog"' + (AS.open ? ' aria-current="page" aria-expanded="true"' : ' aria-expanded="false"') + ' aria-label="Salie' + (q ? ', ' + q + (q === 1 ? ' change is' : ' changes are') + ' waiting for you' : AS.busy ? ', working' : '') + '"><span class="icon asst">' + ic('assistant', 22) + (q ? '<span class="w-num pend">' + q + '</span>' : AS.busy ? '<span class="w-asst-live" aria-hidden="true"></span>' : '') + '</span><span>Salie</span></button></nav>';
    var task = P.task && get(P.task) ? '<section class="w-mtask" role="dialog" aria-label="Task">' + panelInner(get(P.task), P.ptab, true) + '</section>' : '';
    phoneRoot.querySelector('[data-app]').innerHTML = '<div class="w-scroll" data-keep="pscroll-' + at + (at === 'project' ? P.tab : '') + '">' + page + '</div>' + (at === 'project' && P.tab === 'board' && !P.task ? '<button class="w-fab" type="button" data-a="new" aria-label="New task">' + ic('plus', 22) + '</button>' : '') + tabbar + task;
    restoreScroll(phoneRoot, P.scroll);
    if (fk) { var el = phoneRoot.querySelector(fk); if (el) el.focus({ preventScroll: true }); }
  }

  function render() { renderDesk(); renderPhone(); S.tasks.forEach(function (t) { t.fresh = false; }); guideRefresh(); }

  /* ---------- live, in place: elapsed times, the agent's last line, the clock ---------- */
  function updateLive() {
    [deskRoot, phoneRoot].forEach(function (root) {
      if (!root) return;
      S.tasks.forEach(function (t) {
        if (!t.run) return;
        var s = status(t);
        root.querySelectorAll('[data-st="' + t.id + '"]').forEach(function (el) { el.textContent = s.text; });
        if (t.run.st === 'running') {
          root.querySelectorAll('[data-lg="' + t.id + '"]').forEach(function (el) { el.textContent = s.detail; });
          root.querySelectorAll('[data-lg2="' + t.id + '"]').forEach(function (el) { el.textContent = s.detail; });
          root.querySelectorAll('[data-el="' + t.id + '"]').forEach(function (el) { el.textContent = dur(t.run.el); });
        }
        if (t.run.st === 'needs' || t.run.st === 'blocked') root.querySelectorAll('[data-wait="' + t.id + '"]').forEach(function (el) { el.textContent = el.closest('.w-kind') ? dur(S.now - t.run.asked).toUpperCase() : dur(S.now - t.run.asked); });
      });
      root.querySelectorAll('[data-now]').forEach(function (el) { el.style.top = ((S.now - H0 * 60) / 60 * HOUR) + 'px'; });
    });
  }
  function appendFeed(t, e) {
    [deskRoot, phoneRoot].forEach(function (root) {
      var f = root && root.querySelector('[data-feed="' + t.id + '"]');
      if (!f) return;
      var box = f.closest('.w-pbody'), near = box && box.scrollHeight - box.scrollTop - box.clientHeight < 60;
      f.insertAdjacentHTML('beforeend', feedItem(e));
      if (box && near) box.scrollTop = box.scrollHeight;
    });
  }

  /* ---------- shared demo clock: six real seconds per simulated minute ---------- */
  function wfLive() {
    if (P.wf && !P.wf.stopped && phoneRoot) { var wl = wfLines(); if (wl.ended && !P.wf.ended) { P.wf.ended = true; render(); return; } ['status', 'stage', 'count'].forEach(function (k) { document.querySelectorAll('.wbx [data-wf="' + k + '"]').forEach(function (el) { el.textContent = k === 'status' ? wl.status : k === 'stage' ? wl.stage + ' · ' + P.wf.repo : 'Claude Code · ' + wl.count; }); }); }
  }
  function tick() {
    if (P.wf && !P.wf.stopped && !P.wf.ended) P.wf.elapsed += 1000;
    wfLive();
    if (!S.tasks.some(function (t) { return t.run && t.run.st === 'running'; })) return;
    var changed = false;
    S.now += 1 / 6;
    S.tasks.forEach(function (t) {
      var r = t.run; if (!r) return;
      if (r.st === 'running') {
        r.el += 1 / 6; r.phaseElapsed = (r.phaseElapsed || 0) + 1;
        var beforeQuestion = r.ask && !r.asked2;
        var total = r.phaseDuration || 40, progress = Math.min(1, r.phaseElapsed / total);
        var startLine = beforeQuestion ? 0 : r.ask ? 2 : 0;
        var endLine = beforeQuestion ? Math.min(2, r.logs.length) : r.logs.length;
        var targetLine = startLine + Math.min(endLine - startLine, Math.floor(progress * (endLine - startLine + 1)));
        while (r.li < targetLine) { feed(t, 'out', r.logs[r.li]); r.li++; }
        if (--r.left <= 0) {
          if (beforeQuestion) {
            r.asked2 = true; r.st = 'needs'; r.q = r.ask.q; r.choices = r.ask.choices; r.asked = S.now; changed = true;
            feed(t, 'q', r.q); say(t.agent + ' asked a question on “' + t.title + '”');
            toast('Your agent has a question on “' + t.title + '”. Open the task or Needs you to answer.');
          } else { finish(t); changed = true; }
        }
      }
    });
    if (changed) render(); else updateLive();
  }
  var timer = null, seen = new Set();
  function go() { if (!timer && !document.hidden && seen.size) timer = setInterval(tick, 1000); }
  function halt() { clearInterval(timer); timer = null; }

  /* ---------- mounting and scaling ---------- */
  function mountDesk() {
    deskMount.innerHTML = '<div class="mac"><div class="mac-bar"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span class="mac-title">werkbord</span><span></span></div><div class="stage" style="--h:800px"><div class="wbx wbx-desk" data-root="desk"><div data-app style="height:100%"></div><div data-overlay></div><div class="w-toast" role="status" aria-live="polite"></div></div></div></div>';
    deskRoot = deskMount.querySelector('.wbx-desk');
    bind(deskRoot, 'desk');
  }
  /* The phone sits in an iPhone frame (drawn at 414 by 868 around the 390 by 844 screen). The frame's shell,
     status bar and island are shown by pages.css from 768px; on a phone the same markup is the bare app. */
  function mountPhone() {
    phoneMount.innerHTML =
      '<div class="device-wrap"><div class="device">' +
        '<i class="device-btn act" aria-hidden="true"></i><i class="device-btn up" aria-hidden="true"></i><i class="device-btn down" aria-hidden="true"></i><i class="device-btn pwr" aria-hidden="true"></i>' +
        '<div class="device-screen">' +
          '<div class="wbx wbx-phone" data-root="phone"><div data-app></div><div data-overlay></div><div class="w-toast" role="status" aria-live="polite"></div></div>' +
          '<div class="device-island" aria-hidden="true"></div>' +
          '<div class="device-status" aria-hidden="true"><span class="time">9:41</span>' +
            '<span class="icons">' +
              '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="0.8"/><rect x="5" y="5.5" width="3" height="6.5" rx="0.8"/><rect x="10" y="3" width="3" height="9" rx="0.8"/><rect x="15" y="0" width="3" height="12" rx="0.8"/></svg>' +
              '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.6c2.2 0 4.2.8 5.7 2.2l1.1-1.2C13 2.2 10.6 1.2 8 1.2S3 2.2 1.2 3.6l1.1 1.2C3.8 3.4 5.8 2.6 8 2.6zm0 3.2c1.3 0 2.5.5 3.4 1.3l1.1-1.2C11.3 4.8 9.7 4.2 8 4.2s-3.3.6-4.5 1.7l1.1 1.2c.9-.8 2.1-1.3 3.4-1.3zM8 9.4 9.9 11.4 8 12 6.1 11.4z"/></svg>' +
              '<svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity=".45"/></svg>' +
            '</span>' +
          '</div>' +
          '<div class="device-home" aria-hidden="true"></div>' +
        '</div>' +
      '</div></div>';
    phoneRoot = phoneMount.querySelector('.wbx-phone');
    bind(phoneRoot, 'phone');
  }
  function fit() {
    if (deskMount) {
      var stage = deskMount.querySelector('.stage');
      if (stage) { D.s = stage.clientWidth / 1280; stage.style.setProperty('--s', D.s); }
    }
    if (phoneMount) {
      var wrap = phoneMount.querySelector('.device-wrap');
      if (wrap) { P.s = wrap.clientWidth / 414; wrap.style.setProperty('--s', P.s); }
    }
  }

  /* ---------- events ---------- */
  function nav(where, id) {
    if (where === 'desk') { D.view = id; D.task = null; D.pick = null; }
    else { P.at = 'project'; P.tab = id === 'overview' ? 'board' : id; P.task = null; }
  }
  function openTask(where, id) {
    if (where === 'desk') { if (D.view === 'control') D.view = 'board'; D.task = +id; D.ptab = 'activity'; }
    else { P.task = +id; P.ptab = 'activity'; }
  }
  function bind(root, where) {
    var V = where === 'desk' ? D : P;
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (!b || !root.contains(b)) {
        var col = e.target.closest('.w-dcol');
        if (col && D.pick && where === 'desk') { var r = col.getBoundingClientRect(); schedule(D.pick, +col.dataset.day, H0 * 60 + (e.clientY - r.top) / (D.s || 1) / HOUR * 60); render(); }
        return;
      }
      if (root.dataset.held === 'yes') { delete root.dataset.held; e.preventDefault(); return; }
      var a = b.dataset.a, id = b.dataset.id, v = b.dataset.v;
      if (b.tagName === 'A') e.preventDefault();
      switch (a) {
        case 'view': nav(where, id); D.ws = where === 'desk' ? 'individual' : D.ws; dropOverlay(); render(); break;
        case 'open': openTask(where, id); dropOverlay(); render(); break;
        case 'close': V.task = null; render(); break;
        case 'ptab': V.ptab = id; render(); break;
        case 'start': startTask(+id); render(); break;
        case 'answer': answer(isNaN(+id) ? id : +id, v); render(); break;
        case 'toreview': toReview(+id); render(); break;
        case 'merge': V.sheet = { kind: 'merge', id: +id }; setOverlay(root, sheetHTML(V.sheet, where === 'phone'), '[data-a="mergego"]'); break;
        case 'mergego': mergeTask(+id); dropOverlay(); render(); break;
        case 'sheetx': dropOverlay(); break;
        case 'palx': closeOverlay(); break;
        case 'pal': D.pal = ''; openOverlay(palHTML(), '[data-pal]'); break;
        case 'new': V.sheet = { kind: 'new' }; setOverlay(root, sheetHTML(V.sheet, where === 'phone'), 'input[name=title]'); break;
        case 'stop': stopTask(+id); render(); break;
        case 'cc': V.cc = id; render(); break;
        case 'col': P.col = id; render(); break;
        case 'ptabbar': P.tab = id; P.task = null; render(); break;
        case 'pgo': P.at = id; P.task = null; dropOverlay(); render(); break;
        case 'decklibrary': workflowSheet('decklibrary'); break;
        case 'deckadd': if (P.deckAdded) workflowSheet('wfconfig'); else { P.deckAdded = true; dropOverlay(); toast('Find Bugs is on your deck. Tap to run, hold to configure.'); render(); } break;
        case 'wftap': tapWorkflow(); break;
        case 'wfrun': var picked = phoneRoot.querySelector('input[name="wfrepo"]:checked'); runWorkflow(picked ? picked.value : REPOS[0]); dropOverlay(); render(); break;
        case 'wfsave': saveWorkflow(); dropOverlay(); render(); break;
        case 'wfreport': V.sheet = { kind: 'workflow-report' }; G.f['phone-report'] = true; setOverlay(root, sheetHTML(V.sheet, where === 'phone')); break;
        case 'wfstop': if (P.wf) { P.wf.stopped = true; render(); } break;
        case 'wfx': if (P.wf) P.wf.dismissed = true; render(); break;
        case 'af': P.af = id; render(); break;
        case 'pdeck': P.at = 'deck'; P.task = null; dropOverlay(); render(); break;
        case 'pback': P.at = parentOf(P.at); P.task = null; render(); break;
        case 'pscope': P.scope = id; render(); break;
        case 'pteam': P.at = 'team'; P.teamTab = 'board'; render(); break;
        case 'pteamtab': P.teamTab = id; render(); break;
        case 'pschedule': var scheduled = story(3); if (scheduled) schedule(scheduled.id, TODAY + 1, 9 * 60); render(); break;
        case 'pproject': P.at = 'project'; P.tab = 'board'; P.task = null; render(); break;
        case 'pday': P.day = id === '0' ? TODAY : P.day + (+id); render(); break;
        case 'wk': D.week += +id; render(); break;
        case 'today': D.week = 0; render(); break;
        case 'pick': D.pick = D.pick == id ? null : +id; render(); break;
        case 'finding': S.finding = false; var nt = newTask('Rebase refactor-settings-page onto main', 'Claude Code', 'normal'); nt.desc = 'Repository health found the branch 14 commits behind main.'; toast('“' + nt.title + '” is in Backlog. Findings never act on their own: you start it when you want.'); render(); break;
        case 'theme': var next = WB.theme() === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; try { localStorage.setItem('wb-theme', next); } catch (x) {} window.dispatchEvent(new Event('themechange')); render(); break;
        case 'asst-open': openAsst(where); break;
        case 'asst-x': closeAsst(where); break;
        case 'asst-new': startOverAsst(); break;
        case 'asst-ask': askAsst(v); break;
        case 'asst-ok': decideCard(+id, +v, true); break;
        case 'asst-no': decideCard(+id, +v, false); break;
        case 'asst-all': decideAll(+id, v === 'yes'); break;
        case 'asst-opentask': openFromAssistant(where, +id, +v); break;
        case 'ui-sort': var u = AS.msgs[+id].ui, c = +v; if (u.sort === c) u.dir = -u.dir; else { u.sort = c; u.dir = 1; } renderAsst(false); break;
        case 'sw': var was = D.sw; dropOverlay(); if (!was) { D.sw = true; setOverlay(root, switcherHTML(), '.w-menu [aria-current="true"]'); } render(); break;
        case 'swx': dropOverlay(); render(); break;
        case 'ws': goWs(id); break;
        case 'uv': D.uv = id; render(); break;
        case 'tv': D.tv = id; render(); break;
        case 'tvp': D.tv = 'board'; render(); break;
        case 'go': jump(v); break;
        case 'claim': claim(+id); G.f.claimed = true; render(); break;
        case 'signoff': signoff(+id); render(); break;
        case 'runner': toast('Open in my runner hands the ticket to your own werkbord. Team never runs anything.'); break;
        case 'addteam': toast('Adding a Team installs a small background service, after you approve it. It is not part of this demo.'); break;
        case 'slot': schedule(D.pick, +b.dataset.day, +b.dataset.m); render(); break;
        case 'asst-model': toast('Replies are scripted here, so the model is fixed in this demo.'); break;
        case 'help': toast('Help opens the product docs in the app. They are not part of this demo.'); break;
        case 'toast': toast(v); break;
        case 'other': toast('This demo opens one project. In the app, every repository you add gets its own board, calendar and Git view.'); break;
        case 'settings': toast('Settings cover agents, runners, phone access and defaults. They are not part of this demo.'); break;
        case 'push': toast('Push shows what would leave this computer, and asks before anything does.'); break;
        case 'gnav': toast('Health, branches, pull requests, changes and history each open from here in the app.'); break;
        case 'archive': case 'cleardone': toast('Clear Done moves finished tasks into the Archive with their details intact.'); break;
        case 'closetask': toast('Close task archives it. Its runs and worktree stay inspectable.'); break;
        case 'edit': toast('Edit changes the title, details and execution settings.'); break;
        case 'continue': toast('Continue with… hands the worktree to another run, with new instructions or another agent.'); break;
        case 'tz': toast('Each project keeps its own timezone, so a schedule means the same thing after travel or a clock change.'); break;
        case 'mode': toast('Day view shows one day in detail.'); break;
      }
    });
    root.addEventListener('submit', function (e) {
      var f = e.target; e.preventDefault();
      if (f.dataset.form === 'new') {
        var el = f.elements, title = el.title.value.trim(); if (!title) { el.title.focus(); return; }
        var startNow = e.submitter && e.submitter.value === 'start';
        var t = newTask(title, el.agent.value, el.prio.value, false);
        t.desc = el.desc.value.trim(); t.interaction = el.inter.value;
        V.sheet = null;
        dropOverlay();
        if (where === 'desk') { if (D.view === 'control') D.view = 'board'; } else { P.at = 'project'; P.tab = 'board'; P.task = null; P.col = startNow ? 'doing' : 'backlog'; }
        if (startNow) startTask(t.id); else toast('“' + title + '” is in Backlog. Start it now, or drag it onto the Calendar.');
        render();
      } else if (f.dataset.form === 'msg') {
        var m = f.elements.m.value.trim(); if (!m) return;
        var tt = get(f.dataset.id);
        if (tt && tt.run) { feed(tt, 'me', m); say('You messaged the agent on “' + tt.title + '”'); }
        f.elements.m.value = '';
        toast(tt && tt.run && tt.run.st === 'running' ? 'Queued for the agent. It reads it at its next step.' : 'Saved. Start a run and the agent picks it up.');
      }
    });
    root.addEventListener('input', function (e) {
      if (e.target.matches('[data-ui-q]')) {
        var mi = +e.target.getAttribute('data-ui-q'), ui = AS.msgs[mi] && AS.msgs[mi].ui, body = root.querySelector('[data-uitbody="' + mi + '"]');
        if (ui && body) { ui.q = e.target.value; body.innerHTML = uiBodyHTML(ui); }
        return;
      }
      if (e.target.matches('[data-pal]')) { var l = root.querySelector('[data-pallist]'); if (l) l.innerHTML = palListHTML(e.target.value); }
    });
    /* A "What I looked at" panel stays open or shut across the re-renders of a streaming reply. */
    root.addEventListener('toggle', function (e) {
      var d = e.target, m = d.tagName === 'DETAILS' && d.dataset.i != null ? AS.msgs[+d.dataset.i] : null;
      if (m) m.open = d.open;
    }, true);
    root.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-a]')) { e.preventDefault(); e.target.click(); return; }
      if (where === 'desk' && D.ws === 'individual' && !AS.open && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); D.pal = ''; openOverlay(palHTML(), '[data-pal]'); }
      if (e.target.matches('[data-pal]') && e.key === 'Enter') { var first = root.querySelector('[data-pallist] button'); if (first) first.click(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && e.target.closest('form[data-form="new"]')) { e.preventDefault(); var sb = e.target.closest('form').querySelector('[value="start"]'); if (sb) sb.click(); }
      if (where === 'desk' && D.ws === 'individual' && e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !e.target.matches('input,textarea,select') && !D.sheet && !AS.open) { e.preventDefault(); D.sheet = { kind: 'new' }; openOverlay(sheetHTML(D.sheet), 'input[name=title]'); }
    });
    if (where === 'phone') {
      /* Hold a workflow key for its settings (lib/mobile/press.ts: 550ms, and a move of a few pixels cancels). The click that
         follows the hold is swallowed, so a hold never also runs the workflow. With a keyboard, Shift+F10 does the same. */
      var holdTimer, holdPoint;
      function cancelHold() { clearTimeout(holdTimer); holdPoint = null; }
      root.addEventListener('pointerdown', function (e) {
        delete root.dataset.held;
        if (!e.target.closest('[data-key="bugs"]') || e.button !== 0) return;
        holdPoint = [e.clientX, e.clientY];
        holdTimer = setTimeout(function () { root.dataset.held = 'yes'; workflowSheet('wfconfig'); }, 550);
      });
      root.addEventListener('pointermove', function (e) { if (holdPoint && Math.hypot(e.clientX - holdPoint[0], e.clientY - holdPoint[1]) > 8) cancelHold(); });
      ['pointercancel', 'pointerleave'].forEach(function (event) { root.addEventListener(event, cancelHold); });
      // The click comes in the same task as pointerup, so the flag is cleared only after it has been swallowed.
      root.addEventListener('pointerup', function () { cancelHold(); if (root.dataset.held) setTimeout(function () { delete root.dataset.held; }, 0); });
      root.addEventListener('contextmenu', function (e) { if (e.target.closest('[data-key="bugs"]')) e.preventDefault(); });
      root.addEventListener('keydown', function (e) {
        if (e.target.closest('[data-key="bugs"]') && ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu')) { e.preventDefault(); workflowSheet('wfconfig'); }
      });
    }
    if (where === 'desk') bindDrag(root);
  }

  /* drag and drop: board columns follow the work; the calendar takes any task */
  function dropRule(t, to) {
    if (!t || t.state === to) return null;
    if (to === 'doing' && t.state === 'backlog') return waitingFor(t).length ? { ok: false, hint: 'Waits for ' + waitingFor(t)[0].title } : { ok: true, hint: 'Drop to start an agent' };
    if (to === 'review' && t.state === 'doing' && t.run && t.run.st === 'completed') return { ok: true, hint: 'Drop to move to Review' };
    if (to === 'done' && t.state === 'review') return { ok: true, hint: 'Drop to review the merge' };
    return { ok: false, hint: to === 'done' ? 'Only reviewed work is merged' : to === 'review' ? 'An agent has to finish first' : 'Cards move forward with the work' };
  }
  function bindDrag(root) {
    root.addEventListener('dragstart', function (e) {
      var c = e.target.closest('[data-card],[data-ev],[data-un]'); if (!c) return;
      var id = +(c.dataset.card || c.dataset.ev || c.dataset.un);
      D.drag = { id: id, kind: c.dataset.card ? 'card' : 'cal', off: c.dataset.ev ? (e.clientY - c.getBoundingClientRect().top) / (D.s || 1) : 0 };
      c.classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', String(id)); e.dataTransfer.effectAllowed = 'move'; } catch (x) {}
      if (D.drag.kind === 'card') {
        var t = get(id);
        root.querySelectorAll('.w-col').forEach(function (col) { var r = dropRule(t, col.dataset.col); if (r && r.ok) { col.classList.add('target'); col.querySelector('[data-hint]').innerHTML = '<p class="w-drop">' + r.hint + '</p>'; } });
      }
    });
    function clear() {
      root.querySelectorAll('.over,.nope,.target').forEach(function (n) { n.classList.remove('over', 'nope', 'target'); });
      root.querySelectorAll('[data-hint]').forEach(function (n) { n.innerHTML = ''; });
      var g = root.querySelector('.w-ghost'); if (g) g.remove();
    }
    root.addEventListener('dragend', function () {
      clear(); root.querySelectorAll('.dragging').forEach(function (n) { n.classList.remove('dragging'); });
      D.drag = null; if (D.dirty) { D.dirty = false; render(); }
    });
    root.addEventListener('dragover', function (e) {
      if (!D.drag) return;
      var col = e.target.closest('.w-col'), day = e.target.closest('.w-dcol');
      if (col && D.drag.kind === 'card') {
        e.preventDefault(); var r = dropRule(get(D.drag.id), col.dataset.col);
        root.querySelectorAll('.over,.nope').forEach(function (n) { n.classList.remove('over', 'nope'); });
        if (r) col.classList.add(r.ok ? 'over' : 'nope');
      } else if (day && D.drag.kind === 'cal') {
        e.preventDefault();
        root.querySelectorAll('.w-dcol.over').forEach(function (n) { n.classList.remove('over'); });
        day.classList.add('over');
        var rect = day.getBoundingClientRect(), t = get(D.drag.id), dd = t.sched ? t.sched.dur : 60;
        var m = H0 * 60 + ((e.clientY - rect.top) / (D.s || 1) - D.drag.off) / HOUR * 60;
        m = Math.max(H0 * 60, Math.min(H1 * 60 - dd, Math.round(m / 15) * 15));
        var g = root.querySelector('.w-ghost'); if (!g) { g = document.createElement('div'); g.className = 'w-ghost'; }
        g.style.top = ((m - H0 * 60) / 60 * HOUR) + 'px'; g.style.height = (dd / 60 * HOUR - 3) + 'px';
        if (g.parentNode !== day) day.appendChild(g);
      }
    });
    root.addEventListener('drop', function (e) {
      if (!D.drag) return;
      e.preventDefault();
      var d = D.drag, col = e.target.closest('.w-col'), day = e.target.closest('.w-dcol');
      clear(); D.drag = null; D.dirty = false;
      if (col && d.kind === 'card') {
        var t = get(d.id), to = col.dataset.col, r = dropRule(t, to);
        if (!r) return;
        if (!r.ok) { toast(r.hint + '.'); render(); return; }
        if (to === 'doing') startTask(d.id);
        else if (to === 'review') toReview(d.id);
        else if (to === 'done') { render(); D.sheet = { kind: 'merge', id: d.id }; openOverlay(sheetHTML(D.sheet), '[data-a="mergego"]'); return; }
        render();
      } else if (day && d.kind === 'cal') {
        var rect = day.getBoundingClientRect();
        schedule(d.id, +day.dataset.day, H0 * 60 + ((e.clientY - rect.top) / (D.s || 1) - d.off) / HOUR * 60);
        render();
      } else render();
    });
  }

  /* ---------- the guided story ----------
     Nothing is locked: the visitor can click anywhere, and the story follows. Each step says what it is about, where the
     visitor has to be, what to press and how to tell it is done. The note shows the first step that is not done, so doing
     things in another order, or elsewhere, only moves the note. When the visitor is not where the step needs them, the note
     points at the next control on the way there (the switcher, a tab, a layer to close). A chapter can be skipped from the
     bar: it then makes what the skipped part would have made. Both surfaces share progress; a separate phone tour teaches
     workflow shortcuts after the core story. demo-guide.js draws the ring, the line and the note. */
  var CHAPTERS = ['Plan', 'Run', 'Review'];
  var guideSection = document.getElementById('demo');
  var guideEl = document.querySelector('[data-guide]');
  var small = window.matchMedia('(max-width: 767px)');
  function guideWhere() { return small.matches || guideSection.dataset.view === 'phone' ? 'phone' : 'desk'; }
  function guideSurface() { return guideWhere() === 'phone' ? phoneRoot : deskRoot; }
  function sheetOpen(w) { var s = w === 'phone' ? P.sheet : D.sheet; return !!(s && s.kind === 'merge'); }
  function started(t) { return !!t && t.state !== 'backlog'; }
  function claimTarget() { return storyTicket() || tix(45); }

  /* Where each step needs the visitor (need), what to press there (aim: selectors; an array inside the array means the first
     one present), and when it is done. kind 'area' outlines a region and has no control to press; wait steps show their note
     even with nothing to point at. sticky steps stay done once they have been. */
  function boardNeed(w, col) { return w === 'phone' ? { at: 'project', tab: 'board', col: col || 'backlog' } : { ws: 'individual', view: 'board' }; }
  /* On the phone a step can be done in more than one place: the deck's page for it, or my-app's own board or tab, which is
     where a switch from the desktop lands. The visitor is not sent back to the deck from a place that works. */
  function phoneNeed(page, tab, col) {
    var t = lead();
    if (t && P.task === t.id) return { task: t.id };
    return P.at === 'project' ? (tab === 'board' ? boardNeed('phone', col) : { at: 'project', tab: tab }) : { at: page };
  }
  function onDeck(w) { return w === 'phone' ? { at: 'deck' } : boardNeed(w, 'doing'); }
  var STORY = [
    { id: 'deck', ch: 0, phone: true, kind: 'area', next: true, sticky: true, kick: 'Control Deck',
      need: function () { return { at: 'deck' }; }, aim: function () { return ['.w-housing']; },
      text: 'This is your Control Deck. A key for every place, and a count on what is waiting for you.',
      done: function () { return P.at !== 'deck' || AS.open || G.f.deck || planned(); } },
    { id: 'look', ch: 0, desk: true, kind: 'area', next: true, sticky: true,
      need: function () { return { ws: 'universal', uv: 'mywork' }; }, aim: function () { return ['.w-uh']; },
      text: 'Start in Universal: your work from every workspace in one list, and what is waiting on you.',
      done: function () { return D.ws !== 'universal' || D.uv !== 'mywork' || AS.open || G.f.plate || planned(); } },
    { id: 'ask', ch: 0, kind: 'press', kick: 'Salie', sticky: true,
      need: function () { return {}; }, aim: function () { return ['[data-a="asst-open"]']; },
      text: function (h, w) { return w === 'phone' ? 'Start with an idea. Ask Salie to turn it into scoped work.' : 'Ask Salie. It works across your workspaces, from this one interface.'; },
      done: function () { return AS.open || G.f.plate || G.f.planAsk || planned(); } },
    { id: 'plate', ch: 0, kind: 'press', kick: 'Salie',
      need: function () { return { asst: true }; }, aim: function () { return ['.w-apill[data-v="What is on my plate this week?"]']; },
      text: 'Ask about your whole week, across Individual and your team.',
      done: function () { return G.f.plate || G.f.planAsk || planned(); } },
    { id: 'ui', ch: 0, kind: 'area', next: true, kick: 'Generated interface', sticky: true, wait: true, nextOk: function () { return !AS.busy; },
      need: function () { return { asst: true }; }, aim: function () { return AS.busy ? [] : [{ last: '.w-ui' }]; },
      text: function () { return AS.busy ? 'Salie is reading My Work, the schedules and Needs you in both workspaces, and building the answer as it goes.' : 'Salie can answer with interface, not only text (OpenUI). Sort it, filter it. It is read only, and stamped with when it was read.'; },
      done: function () { return G.f.planAsk || planned() || !AS.open; } },
    { id: 'plan', ch: 0, kind: 'press', kick: 'Salie', wait: true,
      need: function () { return { asst: true }; }, aim: function () { return AS.busy ? [] : ['.w-apill[data-v="Plan CSV export for reports"]']; },
      text: function () { return AS.busy ? 'Salie is splitting the idea into scoped tasks. Each proposal arrives as a card, and none of them changes anything yet.' : 'Now turn an idea into work, in one request.'; },
      done: function () { return planned() || (G.f.planAsk && !AS.busy && waitingChanges() > 0); } },
    { id: 'confirm', ch: 0, kind: 'press', kick: 'Salie',
      need: function () { return { asst: true }; }, aim: function () { return [['.w-aall [data-a="asst-all"][data-v="yes"]', '[data-a="asst-ok"]']]; },
      text: function (h, w) { return 'Three tasks for my-app and a ticket for your team.' + ' Nothing is created until you confirm.'; },
      done: function () { return planned() && waitingChanges() === 0; } },
    { id: 'open', ch: 0, kind: 'press', kick: 'Salie', sticky: true,
      need: function () { return { asst: true }; }, aim: function () { return ['.w-acard [data-a="asst-opentask"]']; },
      text: 'Added. Open the first task where it lives.',
      done: function () { return !AS.open; } },

    { id: 'board', ch: 1, kind: 'press', sticky: true, hops: true,
      need: function (w) { return boardNeed(w); }, aim: function () { return []; },
      text: function (h, w) {
        if (!h) return 'Your board.';
        if (w === 'phone') return h.kind === 'key' ? 'Open Projects, then the project you just planned.' : h.kind === 'project' ? 'Open my-app, the project you just planned.' : '';
        return h.kind === 'sw' ? 'Now Individual: your own computer and your own repositories. Open the switcher.' : h.kind === 'project' ? 'Open my-app, the project you just planned.' : '';
      },
      done: function (w) { return w === 'phone' ? P.at === 'project' && P.tab === 'board' && !P.task : D.ws === 'individual' && D.view !== 'control'; } },
    { id: 'start', ch: 1, kind: 'press',
      need: function (w) { return boardNeed(w); },
      aim: function () { return [story(1), story(2)].filter(function (t) { return t && !started(t); }).map(function (t) { return '[data-a="start"][data-id="' + t.id + '"]'; }); },
      text: 'Start two agents. Each works in its own Git worktree, so they do not collide.',
      done: function () { return !!lead() && [story(1), story(2)].every(function (t) { return !t || started(t); }); } },
    { id: 'parallel', ch: 1, kind: 'area', next: true, sticky: true,
      need: function () { return {}; }, aim: function () { return []; }, wait: true,
      text: 'Both agents are working in the background. While they read the code and build, let’s take care of something else.',
      done: function () { return !!G.f.parallel; } },
    { id: 'cal', ch: 1, kind: 'press', sticky: true, hops: true,
      need: function () { return { ws: 'individual', view: 'calendar' }; }, aim: function () { return []; },
      text: function (h) { return h && h.kind === 'tab' ? 'While the agents work, plan the third task. Open Calendar.' : ''; },
      done: function () { var t = story(3); return !t || !!t.sched || (guideWhere() === 'phone' ? P.at === 'project' && P.tab === 'calendar' : D.view === 'calendar'); } },
    { id: 'pick', ch: 1, desk: true, kind: 'press',
      need: function () { return { ws: 'individual', view: 'calendar' }; }, aim: function () { var t = story(3); return t ? ['.w-unit[data-id="' + t.id + '"]'] : []; },
      text: 'Pick the test task. It waits until the other two are merged.',
      done: function () { var t = story(3); return !t || !!t.sched || D.pick === t.id; } },
    { id: 'slot', ch: 1, kind: 'press',
      need: function () { return { ws: 'individual', view: 'calendar' }; }, aim: function (w) { return [w === 'phone' ? '[data-a="pschedule"]' : '[data-a="slot"]']; },
      text: 'Choose tomorrow at 09:00. It starts by itself, even with this window closed.',
      done: function () { var t = story(3); return !t || !!t.sched; } },
    { id: 'team', ch: 1, kind: 'press', sticky: true, hops: true,
      need: function () { return { ws: 'team', tv: 'board' }; }, aim: function () { return []; },
      text: function (h) {
        if (!h) return '';
        return ({ ws: 'Choose ' + S.team.name + ': a shared workspace, in the same window.', sw: 'While your agents work, check what your team needs. Open the switcher.',
          deck: 'While your agents work, check what your team needs. Back to the Control Deck.', key: 'Open Projects. Your Team’s projects are there too.',
          scope: 'Choose Team: ' + S.team.name + ' is a shared workspace, on the same phone.', teamproject: 'Open ' + S.team.project + ', your team’s shared project.' })[h.kind] || '';
      },
      done: function () { return !!G.f.team; } },
    { id: 'see', ch: 1, kind: 'area', next: true, sticky: true,
      need: function () { return { ws: 'team', tv: 'board' }; }, aim: function () { return ['.w-col[data-col="progress"]', '.w-col[data-col="review"]']; },
      text: 'Your team’s board: who owns what, with the branch and pull request each person’s own computer reports.',
      done: function () { return !!G.f.claimed; } },
    { id: 'claim', ch: 1, kind: 'press',
      need: function () { return { ws: 'team', tv: 'board' }; }, aim: function () { var k = claimTarget(); return k ? ['[data-a="claim"][data-id="' + k.n + '"]'] : []; },
      text: function () { return (storyTicket() ? 'Claim the ticket Salie created.' : 'Claim a ticket.') + ' Claiming is one guarded step, so only one person gets it.'; },
      done: function () { return !!G.f.claimed; } },
    { id: 'reviews', ch: 1, kind: 'press', sticky: true, hops: true,
      need: function () { return { ws: 'team', tv: 'reviews' }; }, aim: function () { return []; },
      text: function (h) { return h && h.kind === 'nav' ? 'Maya finished a change, and it is waiting for you. Open Reviews.' : ''; },
      done: function () { return !!G.f.reviews || tix(42).st === 'done'; } },
    { id: 'signoff', ch: 1, kind: 'press',
      need: function () { return { ws: 'team', tv: 'reviews' }; }, aim: function () { return ['[data-a="signoff"]']; },
      text: 'Sign off. Team never marks work done while its pull request is open. This one is already merged.',
      done: function () { return tix(42).st === 'done'; } },
    { id: 'running', ch: 1, kind: 'area', wait: true,
      need: function () { return {}; }, aim: function () { return []; },
      text: 'The agents are still working in the background. Keep exploring; we’ll let you know when one needs a decision.',
      done: function () { var t = lead(); return !t || !t.run || !!t.run.asked2 || t.run.st === 'completed' || t.state !== 'doing'; } },
    { id: 'answer', ch: 1, kind: 'press',
      need: function (w) { if (w === 'phone') return phoneNeed('control', 'board', 'doing'); var n = boardNeed(w, 'doing'); n.task = lead() ? lead().id : true; return n; },
      aim: function (w) { var t = lead(); return t ? [[(w === 'phone' ? '.w-mtask ' : '.w-panel ') + '[data-a="answer"][data-id="' + t.id + '"]', '.w-item [data-a="answer"][data-id="' + t.id + '"]', '.w-task [data-a="answer"][data-id="' + t.id + '"]']] : []; },
      hops: true, text: function (h, w) { return h && h.kind === 'key' ? 'An agent needs a decision, and the deck says so. Open Needs you.' : h && h.kind === 'deck' ? 'An agent has a question. Back to the Control Deck.' : w === 'phone' ? 'An agent needs a decision. Answer from your phone, and the desktop window moves on too.' : 'Your agent has a question. Open its task, answer the separator question, and it will carry on.'; },
      done: function () { var t = lead(); return !t || !t.run || !(t.run.st === 'needs' || t.run.st === 'blocked'); } },
    { id: 'check-git', ch: 1, kind: 'area', next: true, sticky: true, wait: true,
      need: function (w) { return w === 'phone' ? phoneNeed('git', 'git') : { ws: 'individual', view: 'git' }; },
      aim: function () { return []; },
      text: 'The agent has your answer and is testing the change. Check the repository here while it finishes. Every change stays in its own branch until you review it.',
      done: function () { var t = lead(); return !!G.f['check-git'] || !t || t.state === 'review' || t.state === 'done'; } },
    { id: 'finishing', ch: 1, kind: 'area', wait: true,
      need: function () { return {}; }, aim: function () { return []; },
      text: 'The agent is running checks and preparing its commit. You can keep exploring. We’ll bring you back when it is ready for review.',
      done: function () { var t = lead(); return !t || t.state === 'review' || t.state === 'done'; } },
    { id: 'review', ch: 2, kind: 'press',
      need: function (w) { return w === 'phone' ? phoneNeed('reviews', 'board', 'review') : boardNeed(w, 'review'); },
      aim: function (w) { var t = lead(); return t ? [['.w-row [data-a="open"][data-id="' + t.id + '"]', '.w-task[data-card="' + t.id + '"] .acts [data-a="open"]', '.w-task[data-card="' + t.id + '"] .title']] : []; },
      hops: true, text: function (h, w) { return h && h.kind === 'key' ? 'The endpoint is ready. Open Reviews.' : h && h.kind === 'deck' ? 'The endpoint is ready. Back to the Control Deck.' : w === 'phone' && P.at !== 'project' ? 'The endpoint is ready. Open it from Reviews and read what the agent did before anything merges.' : 'The endpoint is ready. Open it and read what the agent did before anything merges.'; },
      done: function (w) { var t = lead(); return !t || t.state === 'done' || (w === 'phone' ? P.task : D.task) === t.id || sheetOpen(w); } },
    { id: 'merge', ch: 2, kind: 'press',
      need: function (w) { var n = w === 'phone' ? phoneNeed('reviews', 'board', 'review') : boardNeed(w, 'review'); n.task = lead() ? lead().id : true; return n; },
      aim: function (w) { var t = lead(); return t ? [[(w === 'phone' ? '.w-mtask ' : '.w-panel ') + '[data-a="merge"][data-id="' + t.id + '"]', '.w-task [data-a="merge"][data-id="' + t.id + '"]']] : []; },
      text: 'You decide what reaches main. Choose Merge to check the branch first.',
      done: function (w) { var t = lead(); return !t || t.state === 'done' || sheetOpen(w); } },
    { id: 'merged', ch: 2, kind: 'press',
      need: function () { return { sheet: true }; }, aim: function () { return ['.w-sheet [data-a="mergego"]']; },
      text: 'Checked now, and again when you confirm. The merge is local; nothing is pushed.',
      done: function () { var t = lead(); return !t || t.state === 'done'; } },

    { id: 'home', ch: 2, desk: true, kind: 'press', sticky: true, hops: true,
      need: function () { return { ws: 'universal', uv: 'mywork' }; }, aim: function () { return []; },
      text: function (h) { return h && h.kind === 'sw' ? 'Last stop: back to Universal. Open the switcher.' : ''; },
      done: function () { return !!lead() && lead().state === 'done' && D.ws === 'universal'; } }
  ];

  /* The phone lesson, after the core story: only what is different on the phone. The deck is the way in, and a workflow key
     runs a task you repeat on the paired computer: tap it and choose a repository, or hold it and save one. Each step reads
     the sheet that is open, so a visitor who holds before tapping, or taps twice, is still on the story. */
  function wfSheet(kind) { return !!P.sheet && P.sheet.kind === kind; }
  var PHONE_STORY = [
    { id: 'phone-intro', ch: 0, kind: 'area', next: true, sticky: true, kick: 'Desktop and phone, paired',
      need: function () { return { at: 'deck' }; }, aim: function () { return ['.w-housing']; },
      text: 'Your desktop is the detailed control center. Your phone is paired with it: the same control, distilled into one deck of keys, with a count on each for what is waiting for you.',
      done: function () { return false; } },
    { id: 'phone-add', ch: 0, kind: 'press', kick: 'Make the deck yours',
      need: function () { return { at: 'deck', sheet: wfSheet('decklibrary') }; },
      aim: function () { return wfSheet('decklibrary') ? ['[data-a="deckadd"]'] : ['.w-dkey.empty']; },
      text: function () { return wfSheet('decklibrary') ? 'These are workflow buttons. Each one turns a task you repeat into a single tap. Choose Find Bugs; the others show what else a key can do.' : 'The ninth key is empty. Set the deck up for the work you do: tap it to add a button.'; },
      done: function () { return P.deckAdded; } },
    { id: 'phone-run', ch: 1, kind: 'press', kick: 'Tap to run',
      need: function () { return { at: 'deck', sheet: wfSheet('wfpick') || wfSheet('wfconfig') }; },
      aim: function () { return wfSheet('wfpick') ? ['[data-a="wfrun"]'] : wfSheet('wfconfig') ? ['[data-a="wfsave"]'] : ['[data-key="bugs"]']; },
      text: function () {
        if (wfSheet('wfpick')) return 'Choose a repository and run. Your paired computer does the work, and nothing on it changes.';
        if (wfSheet('wfconfig')) return 'Save a repository here, and a tap runs Find Bugs there straight away.';
        return P.repo ? 'Tap Find Bugs. It runs on ' + P.repo + ' straight away.' : 'The new key wears the accent: it runs work instead of opening a page. Tap it. No task to write, no form to fill in.';
      },
      done: function () { return !!G.f['phone-run']; } },
    { id: 'phone-progress', ch: 1, kind: 'area', next: true, sticky: true, kick: 'On your computer',
      need: function () { return { at: 'deck' }; }, aim: function () { return ['.w-wfb']; },
      text: 'Find Bugs is running on your computer, not your phone. Its stages report here as they finish, and it carries on if you leave this screen.',
      done: function () { return !wfRunning(); } },
    { id: 'phone-hold', ch: 1, kind: 'press', kick: 'Hold to configure', sticky: true,
      need: function () { return { at: 'deck', sheet: wfSheet('wfconfig') || wfSheet('wfpick') }; },
      aim: function () { return wfSheet('wfconfig') ? ['[data-a="wfsave"]'] : wfSheet('wfpick') ? ['.w-sheet [data-a="sheetx"].ic'] : ['[data-key="bugs"]']; },
      text: function () {
        if (wfSheet('wfconfig')) return 'Choose ' + (P.wf ? P.wf.repo : 'a repository') + ' and save. Tap to run, hold to configure: that is the whole deck.';
        if (wfSheet('wfpick')) return 'A tap asks for a repository every time. Close this, then press and hold Find Bugs to save one instead.';
        return 'Next time can take one tap. Press and hold Find Bugs to open its settings. With a keyboard, Shift+F10.';
      },
      done: function () { return !!G.f['phone-config']; } },
    { id: 'phone-team', ch: 1, kind: 'press', kick: 'Meanwhile', sticky: true, hops: true,
      need: function () { return { at: 'projects' }; }, aim: function () { return ['[data-a="pscope"][data-id="team"]']; },
      text: function (h) { return h && h.kind === 'key' ? 'The scan keeps going on your computer while you move around. Open Projects.' : h ? '' : 'Individual and Team sit side by side here, as on the desktop. Switch to Team: your team’s work is a tap away.'; },
      done: function () { return P.scope === 'team'; } },
    { id: 'phone-wait', ch: 2, kind: function () { return P.wf && P.wf.stopped ? 'press' : 'area'; }, wait: true, kick: 'On your computer', hops: true,
      need: function () { return { at: 'deck' }; }, aim: function () { return P.wf && P.wf.stopped ? ['[data-key="bugs"]'] : ['.w-wfb']; },
      text: function (h) {
        if (h) return h.kind === 'deck' ? 'Back to the Control Deck to see how the scan is going.' : '';
        return P.wf && P.wf.stopped ? 'You stopped Find Bugs. Tap it to run it again.' : 'Find Bugs is still at work on your computer, about 40 seconds in this demo. Your phone only had to start it.';
      },
      done: function () { return !!P.wf && wfLines().ended && !P.wf.stopped; } },
    { id: 'phone-report', ch: 2, kind: 'press', kick: 'The result', sticky: true, hops: true,
      need: function () { return { at: 'deck', sheet: wfSheet('workflow-report') }; }, aim: function () { return [['.w-wfb [data-a="wfreport"]', '.w-deckhistory [data-a="wfreport"]']]; },
      text: function (h) { return h ? (h.kind === 'deck' ? 'Find Bugs is done. Back to the Control Deck for its report.' : '') : 'Done. Open the report: what it found, with a fix for each.'; },
      done: function () { return !!G.f['phone-report']; } }
  ];

  function applies(s, w) { return !(s.desk && w !== 'desk') && !(s.phone && w !== 'phone'); }
  function isDone(s, w) {
    var key = s.id;
    if (s.ch < G.floor || G.s[key] || (s.next && G.f[s.id])) return true;
    var d = !!s.done(w);
    if (d && s.sticky) G.s[key] = true;
    return d;
  }
  function currentStep(w) {
    var steps = G.mode === 'phone' ? PHONE_STORY : STORY;
    for (var i = 0; i < steps.length; i++) if (applies(steps[i], w) && !isDone(steps[i], w)) return steps[i];
    return null;
  }

  /* The next control on the way to where a step needs the visitor, or null when they are there. */
  function route(need, w) {
    var phone = w === 'phone', V = phone ? P : D;
    // need.task: true allows any open task; an id allows that task only.
    function taskOk(open) { return !open || need.task === true || need.task === open; }
    if (AS.open && !need.asst) return { sel: phone ? '.w-tabbar [data-a="pdeck"]' : '[data-a="asst-x"]', kind: 'close-asst' };
    if (!AS.open && need.asst) return { sel: '[data-a="asst-open"]', kind: 'open-asst' };
    if (need.sheet && V.sheet) return null;
    if (V.sheet && !need.sheet) return { sel: '.w-sheet [data-a="sheetx"].ic', kind: 'close-sheet' };
    if (phone) {
      if (need.ws === 'individual') need = { at: 'project', tab: need.view === 'control' ? 'board' : need.view, task: need.task };
      if (need.ws === 'team') need = { at: 'team', teamTab: need.tv };
      if ((need.at === 'project' || need.at === 'team') && P.at === 'projects' && P.scope !== (need.at === 'team' ? 'team' : 'individual')) return { sel: '[data-a="pscope"][data-id="' + (need.at === 'team' ? 'team' : 'individual') + '"]', kind: 'scope', to: need.at === 'team' ? 'Team' : 'Individual' };
      if (need.at === 'team' && P.at === 'projects') return { sel: '[data-a="pteam"]', kind: 'teamproject' };
      if (need.at === 'team' && P.at === 'team' && need.teamTab && P.teamTab !== need.teamTab) return { sel: '[data-a="pteamtab"][data-id="' + need.teamTab + '"]', kind: 'nav', to: need.teamTab };
      if (P.task && !taskOk(P.task)) return { sel: '.w-mtask [data-a="close"]', kind: 'back' };
      if (need.at && !P.task) {
        if (P.at !== need.at) {
          if (need.at === 'project' && P.at === 'projects') return { sel: '[data-a="pproject"]', kind: 'project' };
          if (P.at === 'deck') return { sel: '.w-keys [data-a="pgo"][data-id="' + (need.at === 'project' || need.at === 'team' ? 'projects' : need.at) + '"]', kind: 'key', to: need.at === 'project' || need.at === 'team' ? 'projects' : need.at };
          return { sel: '.w-tabbar [data-a="pdeck"]', kind: 'deck' };
        }
        if (need.at === 'project' && need.tab && P.tab !== need.tab) return { sel: '.w-ptabs [data-a="ptabbar"][data-id="' + need.tab + '"]', kind: 'tab', to: need.tab };
        if (need.col && P.col !== need.col && need.at === 'project') return { sel: '.w-seg [data-a="col"][data-id="' + need.col + '"]', kind: 'col', to: need.col };
      }
      return null;
    }
    if (D.pal !== null) return null;
    if (need.ws && D.ws !== need.ws) return D.sw ? { sel: '.w-menu [data-a="ws"][data-id="' + need.ws + '"]', kind: 'ws', to: need.ws } : { sel: '.w-rail [data-a="sw"]', kind: 'sw', to: need.ws };
    if (D.sw) return null;
    if (need.ws === 'universal' && need.uv && D.uv !== need.uv) return { sel: '.w-rail [data-a="uv"][data-id="' + need.uv + '"]', kind: 'nav', to: need.uv };
    if (need.ws === 'team' && need.tv && D.tv !== need.tv) return { sel: '.w-rail [data-a="tv"][data-id="' + need.tv + '"]', kind: 'nav', to: need.tv };
    if (need.ws === 'individual' && need.view) {
      if (D.view !== need.view) return D.view === 'control' ? { sel: '.w-rail [data-a="view"][data-id="board"]', kind: 'project' } : { sel: '.w-tabs [data-a="view"][data-id="' + need.view + '"]', kind: 'tab', to: need.view };
      if (D.task && !taskOk(D.task)) return { sel: '.w-panel [data-a="close"]', kind: 'close-task' };
    }
    return null;
  }
  var WSNAME = { universal: 'Universal', individual: 'Individual' }, VIEWNAME = { board: 'Board', calendar: 'Calendar', mywork: 'My Work', inbox: 'Needs you', reviews: 'Reviews', home: 'Needs you', review: 'Review', git: 'Git', doing: 'Doing', backlog: 'Backlog' };
  var HOP = { scope: function (h) { return 'Choose ' + h.to + ' projects.'; }, teamproject: 'Open your team’s shared project.', deck: 'Open the Control Deck.', key: function (h) { return 'Open ' + (PLACES[h.to] || 'the page') + '.'; }, 'close-asst': 'Close Salie to continue.', 'open-asst': 'Open Salie.', 'close-sheet': 'Close this to continue.', back: 'Go back to the board.', 'close-task': 'Close the task to see the board.',
    sw: function (h) { return 'Open the switcher to get to ' + (WSNAME[h.to] || S.team.name) + '.'; },
    ws: function (h) { return 'Choose ' + (WSNAME[h.to] || S.team.name) + '.'; },
    project: 'Open my-app.',
    nav: function (h) { return 'Open ' + (VIEWNAME[h.to] || 'the page') + '.'; },
    tab: function (h) { return 'Open ' + (VIEWNAME[h.to] || 'the page') + '.'; },
    col: function (h) { return 'Open ' + (VIEWNAME[h.to] || 'the column') + '.'; } };
  var GENERIC = { 'close-asst': 1, 'open-asst': 1, 'close-sheet': 1, back: 1, 'close-task': 1 };
  function hopText(h) { var f = HOP[h.kind]; return typeof f === 'function' ? f(h) : f; }
  /* A step's own words show when the visitor is where the step needs them. On the way there the note names the next control,
     except for steps that word their own way in (hops: true). */
  function stepText(s, h, w) {
    if (!h) return typeof s.text === 'function' ? s.text(null, w) : s.text;
    if (s.hops && !GENERIC[h.kind]) { var t = s.text(h, w); if (t) return t; }
    return hopText(h);
  }

  function pick(root, spec) {
    if (typeof spec === 'string') return root.querySelector(spec);
    if (Array.isArray(spec)) { for (var i = 0; i < spec.length; i++) { var n = root.querySelector(spec[i]); if (n) return n; } return null; }
    var all = root.querySelectorAll(spec.last); return all.length ? all[all.length - 1] : null;
  }
  /* Scrolls the app's own containers so the whole target is in view. A new target is always brought in; after that only a target
     that has become half hidden is nudged back, such as when the note above a phone grows and shrinks the list. A visitor who
     has scrolled the target out of sight altogether is left where they are. */
  var revealed = '', placed = {};
  /* The bar that floats over a phone page's bottom edge, when the target is on that page and not in a layer above it. */
  function coverOf(target, surface) { return surface === phoneRoot && target.closest('.w-scroll') ? surface.querySelector('.w-tabbar') : null; }
  function reveal(target, surface, sig) {
    var first = revealed !== sig;
    revealed = sig;
    var scale = (surface === deskRoot ? D.s : (window.innerWidth >= 768 ? P.s : 1)) || 1;
    var bar = coverOf(target, surface), node = target.parentElement, pad = 14;
    // One axis at a time: a lead and a trail edge of the box, and of the target, along that axis. A box still scrolled to
    // where this last had the target in view was not scrolled by the visitor, so a target the layout has since pushed out
    // is brought back too (the box shrinks when the note docked above a phone grows). Boxes are known by their data-keep,
    // as redraws replace them.
    function nudge(prop, a0, a1, b0, b1) {
      var none = a1 <= b0 || a0 >= b1, whole = a0 >= b0 && a1 <= b1, key = (surface === deskRoot ? 'desk:' : 'phone:') + prop + (node.dataset.keep || '');
      var mine = !!node.dataset.keep && placed[key] === node[prop];
      if (whole) { placed[key] = node[prop]; return; }
      if (!(first || !none || mine)) return;
      if (a1 - a0 + 2 * pad > b1 - b0 || a0 < b0 + pad) node[prop] += (a0 - b0 - pad) / scale;
      else node[prop] += (a1 - b1 + pad) / scale;
      placed[key] = node[prop];
    }
    while (node && node !== surface) {
      var cs = getComputedStyle(node), r = target.getBoundingClientRect(), box = node.getBoundingClientRect();
      if (node.scrollHeight > node.clientHeight && /auto|scroll/.test(cs.overflowY)) {
        var bottom = box.bottom;
        if (bar) { var b = bar.getBoundingClientRect(); if (b.top < bottom && b.bottom > box.top) bottom = b.top; }
        nudge('scrollTop', r.top, r.bottom, box.top, bottom);
      }
      if (node.scrollWidth > node.clientWidth && /auto|scroll/.test(cs.overflowX)) {
        r = target.getBoundingClientRect();
        nudge('scrollLeft', r.left, r.right, box.left, box.right);
      }
      node = node.parentElement;
    }
  }
  function mobileNow() { return small.matches; }
  function guideHost(w) {
    if (w === 'desk') return deskMount.closest('.demo-desk');
    return small.matches ? guideSection.querySelector('[data-panel="phone"]') : guideSection.querySelector('.demo-stage');
  }
  function stepSpec(s, w, surface) {
    var h = route(s.need ? s.need(w) : {}, w), els = [], kind = typeof s.kind === 'function' ? s.kind(w) : s.kind;
    if (h) { var n = surface.querySelector(h.sel); els = n ? [n] : []; kind = 'press'; }
    else els = (s.aim ? s.aim(w) : []).map(function (a) { return pick(surface, a); }).filter(Boolean);
    if (!els.length && !s.wait) return null;
    var sig = s.id + (h ? ':' + h.kind : '');
    // Once per target, and again when the same control turns up in another place, such as a task's panel after its card,
    // or on the other surface after a switch between desktop and phone.
    var shown = null;
    if (els[0]) { var at = els[0].closest('.w-panel, .w-mtask, .w-asst, .w-sheet, .w-menu'); shown = [els[0], surface, w + ':' + sig + ':' + (els[0].getAttribute('data-id') || '') + ':' + (at ? at.className : '')]; reveal.apply(null, shown); }
    return { id: sig, kicker: s.kick || CHAPTERS[s.ch], text: stepText(s, h, w), els: els, kind: kind, wait: !!s.wait && !h, shown: shown,
      actions: s.next && !h && (!s.nextOk || s.nextOk()) ? [{ key: 'next', label: 'Next', primary: true }] : [] };
  }
  function startPhoneTour() {
    dropOverlay(); clearTimeout(toastTimer);
    [deskRoot, phoneRoot].forEach(function (root) { root.querySelector('.w-toast').classList.remove('show'); });
    G.mode = 'phone'; G.active = true; G.floor = 0; G.hide = null; G.left = null; G.deskSw = null;
    Object.keys(G.f).forEach(function (key) { if (key.indexOf('phone-') === 0) delete G.f[key]; });
    Object.keys(G.s).forEach(function (key) { if (key.indexOf('phone-') === 0) delete G.s[key]; });
    window.dispatchEvent(new CustomEvent('wb-demo-view', { detail: 'phone' }));
    P.at = 'deck'; P.task = null; P.deckAdded = false; P.repo = null; P.wf = null; P.scope = 'individual'; P.scroll = {};
    render();
  }
  function endSpec(w) {
    if (G.mode === 'phone') return { id: 'phone-end', kicker: 'Desktop and phone, paired', text: 'Use them together. The desktop is the detailed control center; the phone keeps the same control in reach, and its workflow keys get you the same results with a tap while you are away.', els: [], kind: 'area', actions: [{ key: 'restart', label: 'Restart' }, { key: 'phone-tour', label: 'Replay phone demo', primary: true }] };
    if (w === 'phone') return { id: 'end', kicker: 'Plan, run, review', text: 'That is the whole loop, on your phone, with the same board the desktop shows. Now see what is special about the phone: a deck you set up yourself, and workflow keys that run a task with a tap.', els: [], kind: 'area', actions: [{ key: 'restart', label: 'Restart' }, { key: 'phone-tour', label: 'See what’s special on the phone', primary: true }] };
    return { id: 'end', kicker: 'Plan, run, review', text: 'That is the whole loop, and your phone can drive all of it too. The phone demo shows only what is different there: a deck you set up yourself, and workflow keys that run a task with a tap.', els: [], kind: 'area', actions: [{ key: 'restart', label: 'Restart' }, { key: 'phone-tour', label: 'Phone demo', primary: true }] };
  }
  function paintChapters(w, step) {
    var list = guideEl.querySelector('.guide-chapters');
    if (w === 'phone' || G.mode === 'phone') { list.hidden = true; return; }
    list.hidden = false;
    var cur = step ? step.ch : -1;
    var html = CHAPTERS.map(function (name, i) {
      var done = i < G.floor || (planned() && STORY.every(function (s) { return s.ch !== i || !applies(s, w) || isDone(s, w); }));
      return '<li' + (done && i !== cur ? ' class="is-done"' : '') + '><button type="button" data-chapter="' + i + '"' + (i === cur ? ' aria-current="step"' : '') + ' title="' + (i === cur ? name : 'Go to ' + name) + '">' + name + '</button></li>';
    }).join('');
    if (list.dataset.sig !== html) { list.dataset.sig = html; list.innerHTML = html; }
  }
  function guideRefresh() {
    if (!guideEl || !deskRoot || !phoneRoot) return;
    var w = guideWhere(), surface = guideSurface();
    // Give a narrow desktop stage one usable note gutter instead of two cramped ones.
    var stageWidth = guideSection.querySelector('.demo-stage').clientWidth;
    var phoneWidth = phoneMount.getBoundingClientRect().width;
    var compactPhone = G.active && w === 'phone' && !small.matches && (stageWidth - phoneWidth) / 2 < 190;
    phoneMount.style.marginLeft = compactPhone ? 'auto' : '';
    phoneMount.style.marginRight = compactPhone ? '0' : '';
    var restart = guideEl.querySelector('[data-guide-restart]');
    restart.textContent = G.active ? 'Restart' : 'Start walkthrough';
    var phoneGuide = guideSection.querySelector('[data-phone-guide]');
    if (phoneGuide) phoneGuide.textContent = G.active ? 'Restart walkthrough' : 'Start walkthrough';
    guideEl.querySelector('.guide-chapters').hidden = !G.active || w === 'phone';
    if (!G.active) { WBGuide.hide(); return; }
    if (w === 'phone' ? P.at === 'team' : D.ws === 'team') G.f.team = true;
    if (w === 'phone' ? P.at === 'team' && P.teamTab === 'reviews' : D.ws === 'team' && D.tv === 'reviews') G.f.reviews = true;
    var step = currentStep(w);
    G.cur = step;
    paintChapters(w, step);
    var key = step ? step.id : 'end', tip = guideEl.querySelector('[data-guide-tip]');
    if (tip) tip.hidden = G.hide !== key;
    if (G.hide === key) { WBGuide.hide(); return; }
    var spec = G.mode === 'phone' && w === 'desk' && step ? { id: 'phone-resume', kicker: 'Desktop and phone, paired', text: P.wf ? 'The same Find Bugs run shows here, at the top of the window: one computer does the work, and either screen follows it. The phone demo carries on on the phone.' : 'The phone demo carries on on the phone. Anything you start there shows here too.', els: [], actions: [{ key: 'phone-resume', label: 'Back to the phone', primary: true }] } : step ? stepSpec(step, w, surface) : endSpec(w);
    [deskRoot, phoneRoot].forEach(function (r) { r.querySelectorAll('[aria-describedby="demo-guide-note"]').forEach(function (n) { n.removeAttribute('aria-describedby'); }); });
    var open = deskRoot.querySelector('.w-asst');
    if (open) open.classList.toggle('room', w === 'desk');
    if (!spec) { WBGuide.hide(); return; }
    var mobile = small.matches;
    spec.host = guideHost(w);
    spec.inset = w === 'desk' ? { top: 30 } : null;
    spec.keep = w === 'phone' && !mobileNow() ? phoneMount.querySelector('.device') : null;
    spec.dock = mobile ? { parent: guideHost(w), before: phoneMount } : null;
    spec.cover = spec.els[0] ? [coverOf(spec.els[0], surface)].filter(Boolean) : [];
    if (spec.els[0]) spec.els[0].setAttribute('aria-describedby', 'demo-guide-note');
    WBGuide.show(spec);
    // Docking the note above a phone takes room from the app, which can push the target back out of view.
    if (spec.shown) reveal.apply(null, spec.shown);
  }
  /* Where a surface is: enough to put the visitor back, and to tell whether they moved while they were there. */
  var NAV = { desk: ['ws', 'uv', 'tv', 'view', 'task', 'ptab'], phone: ['at', 'tab', 'scope', 'teamTab', 'task', 'ptab', 'col'] };
  function navOf(w) { var V = w === 'phone' ? P : D, o = { sheet: V.sheet }; NAV[w].forEach(function (k) { o[k] = V[k]; }); return o; }
  function navSig(w) { var o = navOf(w); o.sheet = o.sheet ? o.sheet.kind + ':' + (o.sheet.id || '') : ''; return JSON.stringify(o); }
  function guideLayout() {
    if (!guideEl || !guideSection) return;
    var w = guideWhere();
    if (G.where && G.where !== w) {
      // Back where they came from without moving on the other surface: the visitor returns to exactly where they were, even
      // to a place the other surface has no match for (the phone's Projects list, say). Otherwise the place is translated.
      var back = !!G.left && G.left.to === G.where && navSig(G.where) === G.left.landed, saved = navOf(G.where);
      // The phone has no switcher. One left open on the desktop is open again on the way back, if the workspace is the same.
      var swWs = G.deskSw;
      G.deskSw = w === 'phone' && D.sw ? D.ws : null;
      var fields = Array.from((G.where === 'phone' ? phoneRoot : deskRoot).querySelectorAll('.w-sheet input, .w-sheet select, .w-sheet textarea')).map(function (el) { return { name: el.name, value: el.value, checked: el.checked, repo: el.hasAttribute('data-workflow-repo') }; });
      if (back) { var V = w === 'phone' ? P : D; Object.keys(G.left.saved).forEach(function (k) { V[k] = G.left.saved[k]; }); }
      else if (w === 'phone') {
        P.task = D.task; P.ptab = D.ptab; P.sheet = D.sheet;
        if (D.ws === 'team') { P.at = 'team'; P.scope = 'team'; P.teamTab = D.tv === 'reviews' ? 'reviews' : 'board'; }
        else if (D.ws === 'individual') { P.at = D.view === 'control' ? 'control' : 'project'; P.tab = ['board', 'calendar', 'git', 'runs'].indexOf(D.view) >= 0 ? D.view : 'board'; P.scope = 'individual'; }
        // Universal is the desktop's home, and the deck is the phone's.
        else P.at = D.uv === 'inbox' ? 'control' : D.uv === 'calendar' ? 'calendar' : 'deck';
        if (P.task && get(P.task)) P.col = get(P.task).state;
      } else {
        D.task = P.task; D.ptab = P.ptab; D.sheet = P.sheet && ['merge', 'new', 'workflow-report'].indexOf(P.sheet.kind) >= 0 ? P.sheet : null;
        if (P.at === 'team') { D.ws = 'team'; D.tv = P.teamTab; }
        else if (P.at === 'project') { D.ws = 'individual'; D.view = P.tab; }
        else if (P.at === 'mywork') { D.ws = 'universal'; D.uv = 'mywork'; }
        else if (P.at !== 'deck' && P.at !== 'projects') { D.ws = 'individual'; D.view = P.at === 'agents' ? 'runs' : P.at === 'reviews' ? 'board' : ['control', 'calendar', 'git'].indexOf(P.at) >= 0 ? P.at : 'control'; }
      }
      G.left = { to: w, saved: saved, landed: navSig(w) };
      var reopen = w === 'desk' && !!swWs && swWs === D.ws;
      D.pal = null; D.sw = reopen;
      setOverlay(deskRoot, ''); setOverlay(phoneRoot, '');
      renderDesk(); renderPhone();
      if (AS.open) renderAsst(true);
      else if (reopen) setOverlay(deskRoot, switcherHTML(), '.w-menu [aria-current="true"]');
      else { var target = w === 'phone' ? P : D; if (target.sheet) { if (w === 'phone' && ['decklibrary', 'wfpick', 'wfconfig'].indexOf(target.sheet.kind) >= 0) workflowSheet(target.sheet.kind); else setOverlay(w === 'phone' ? phoneRoot : deskRoot, sheetHTML(target.sheet, w === 'phone')); } }
    }
    if (fields) (w === 'phone' ? phoneRoot : deskRoot).querySelectorAll('.w-sheet input, .w-sheet select, .w-sheet textarea').forEach(function (el, i) { var f = fields[i]; if (f && f.name === el.name) { el.value = f.value; if (el.type === 'radio' || el.type === 'checkbox') el.checked = f.checked; } });
    // The redraws above moved what the surface shows, so its target is brought into view again, from where it now is.
    if (G.where && G.where !== w) revealed = '';
    G.where = w;
    var before = guideSection.querySelector('.demo-stage');
    if (guideEl.nextElementSibling !== before) guideSection.insertBefore(guideEl, before);
    guideRefresh();
  }
  /* A chapter can be skipped from the bar. What the skipped part would have made is made now, so the next part has its work. */
  function jumpTo(ch) {
    if (guideWhere() === 'phone') return;
    dropOverlay();
    if (ch >= 1) seedPlan();
    G.floor = ch; D.task = null; D.pick = null;
    if (ch === 0) { D.ws = 'universal'; D.uv = 'mywork'; }
    if (ch === 1) { D.ws = 'individual'; D.view = 'board'; }
    if (ch === 2) { [story(1), story(2)].forEach(function (t) { if (!t.run) startTask(t.id, true); finish(t); }); D.ws = 'individual'; D.view = 'board'; }
    render();
  }
  function guideReset() {
    G.active = true; G.mode = 'core';
    halt(); asstFresh(); clearTimeout(toastTimer);
    var fresh = JSON.parse(initialState);
    Object.keys(S).forEach(function (k) { S[k] = fresh[k]; });
    G.f = {}; G.s = {}; G.floor = 0; G.hide = null; G.left = null; G.deskSw = null; revealed = ''; placed = {};
    AS.open = false;
    [D, P].forEach(function (v) { v.task = null; v.sheet = null; v.scroll = {}; });
    D.ws = 'universal'; D.uv = 'mywork'; D.tv = 'board'; D.view = 'control'; D.sw = false; D.pal = null; D.pick = null; D.week = 0;
    P.deckAdded = false; P.repo = null; P.scope = 'individual'; P.at = 'deck'; P.tab = 'board'; P.col = 'backlog'; P.day = TODAY; P.cc = 'all'; P.wf = null; P.af = 'all';
    [deskRoot, phoneRoot].forEach(function (root) { setOverlay(root, ''); root.querySelector('.w-toast').classList.remove('show'); });
    render(); go();
  }
  /* Escape closes the top layer of the surface on screen: a sheet, the menu or the palette, then Salie, then the task
     panel. Returns false when there was nothing to close. */
  function closeTop(where) {
    var root = where === 'desk' ? deskRoot : phoneRoot, V = where === 'desk' ? D : P;
    if (!root || !root.getClientRects().length) return false;
    // Focus leaves the closing layer first, so the redraw does not hand it to a look-alike control elsewhere on the board.
    if (root.contains(document.activeElement)) document.activeElement.blur();
    if (V.sheet || (where === 'desk' && (D.pal !== null || D.sw))) { dropOverlay(); render(); return true; }
    if (AS.open) { closeAsst(where); return true; }
    if (V.task) { V.task = null; render(); return true; }
    return false;
  }
  if (guideEl) {
    guideEl.querySelector('[data-guide-restart]').addEventListener('click', guideReset);
    guideEl.querySelector('[data-guide-tip]').addEventListener('click', function () { G.hide = null; guideRefresh(); });
    guideEl.querySelector('.guide-chapters').addEventListener('click', function (e) {
      var b = e.target.closest('[data-chapter]');
      if (b) jumpTo(+b.getAttribute('data-chapter'));
    });
  }
  WBGuide.onAction(function (key) {
    if (key === 'next' && G.cur) { G.f[G.cur.id] = true; guideRefresh(); }
    else if (key === 'hide') { G.hide = G.cur ? G.cur.id : 'end'; guideRefresh(); }
    else if (key === 'restart') guideReset();
    else if (key === 'phone-tour') startPhoneTour();
    else if (key === 'phone-resume') window.dispatchEvent(new CustomEvent('wb-demo-view', { detail: 'phone' }));
  });
  small.addEventListener('change', guideLayout);
  /* Escape works while focus is in the demo, or has fallen back to the page. It leaves the waitlist's keys alone. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var at = document.activeElement;
    if (at && at !== document.body && !guideSection.contains(at)) return;
    if (closeTop(guideWhere())) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  /* ---------- start ---------- */
  if (deskMount) mountDesk();
  if (phoneMount) mountPhone();
  fit();
  render();
  guideLayout();
  if ('ResizeObserver' in window) {
    new ResizeObserver(fit).observe(document.body);
    // A surface that changes size (the note docked above a phone grows, say) can push the guide's target out of view.
    var reflow = 0, sized = new ResizeObserver(function () { if (!reflow) reflow = requestAnimationFrame(function () { reflow = 0; guideRefresh(); }); });
    [deskRoot, phoneRoot].forEach(function (r) { if (r) sized.observe(r); });
  }
  window.addEventListener('resize', function () { fit(); guideLayout(); });
  window.addEventListener('themechange', function () { render(); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
      if (seen.size) go(); else halt();
    }, { threshold: 0.05 });
    [deskMount, phoneMount].forEach(function (m) { if (m) io.observe(m); });
  } else { seen.add(document.body); go(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); else go(); });

  /* The page's own controls drive the app the way a person would. where is 'phone' when the phone is the view on show. */
  window.WBApp = {
    state: S,
    refit: function () { fit(); guideLayout(); },
    guide: function () { guideLayout(); },
    startGuide: guideReset
  };
})();
