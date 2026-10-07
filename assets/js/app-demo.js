/* A working replica of individual Werkbord: the Mac app and the phone, sharing one controller.
   The markup, wording and states follow the product's Svelte components (web/src) so the
   simulator looks and behaves like the app. Start an agent on the desktop and it shows up on
   the phone; answer on the phone and the desktop moves on. Nothing leaves the page. */
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
    changes: '<path d="M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7"/><circle cx="10.5" cy="4.5" r="1.5"/><circle cx="5.5" cy="11.5" r="1.5"/>'
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
  var D = { view: 'board', task: null, ptab: 'activity', sheet: null, pal: null, week: 0, mode: 'week', pick: null, cc: 'all', drag: null, scroll: {} };
  var P = { tab: 'control', task: null, ptab: 'activity', sheet: null, col: 'doing', day: TODAY, mode: 'day', cc: 'all', scroll: {} };

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
    return '<li class="w-card w-item" data-kind="' + it.kind + '"><p class="w-kind">' + dot(tone) + '<b>' + label + '</b><span>' + (showProject ? 'my-app · ' : '') + '<span data-wait="' + t.id + '">' + dur(S.now - r.asked).toUpperCase() + '</span></span><span class="agent">' + t.agent + '</span></p>' +
      '<button class="ititle" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button>' +
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
    t.state = 'doing'; t.fresh = true;
    t.run = run('queued', 0, { left: sc.work, logs: sc.logs.slice(), ask: sc.ask, li: 0, feed: [] });
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
    var t = get(id); if (!t || !t.run) return;
    var was = t.run.st;
    if (was !== 'needs' && was !== 'blocked') return;
    t.run.st = 'running'; t.fresh = true;
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

  /* ================= desktop ================= */
  function railHTML() {
    var n = needsYou(), act = active();
    return '<aside class="w-rail" aria-label="Werkbord">' +
      '<button class="w-brand" type="button" data-a="view" data-id="control" aria-label="Werkbord, Control Center">' + mark(20) + '<span class="w-wm">werkbord</span></button>' +
      '<button class="w-nav" type="button" data-a="view" data-id="control"' + (D.view === 'control' ? ' aria-current="page"' : '') + '>' + ic('control') + 'Control Center' + (n ? '<span class="w-num">' + n + '</span>' : '') + '</button>' +
      '<div class="w-sec"><span>' + ic('folder') + 'Projects</span><button class="add" type="button" data-a="other" aria-label="Add a project">' + ic('plus', 14) + '</button></div>' +
      '<button class="w-nav" type="button" data-a="other"><span class="sq"></span><span class="name">api-server</span><span class="n">1</span></button>' +
      '<button class="w-nav" type="button" data-a="other"><span class="sq"></span><span class="name">marketing-site</span></button>' +
      '<button class="w-nav" type="button" data-a="view" data-id="board"' + (D.view !== 'control' ? ' aria-current="page"' : '') + '><span class="sq"></span><span class="name">my-app</span>' + (n ? '<span class="w-num pend">' + n + '</span>' : act ? '<span class="n">' + act + '</span>' : '') + '</button>' +
      '<div class="w-sec"><span>' + ic('runner') + 'Runners</span></div>' +
      '<div class="w-nav">' + dot('ok') + '<span class="name">this computer</span><span class="n" data-conc>' + (act + 1) + '/' + (LIMIT + 1) + '</span></div>' +
      '<div class="w-rfoot"><button class="w-nav" type="button" data-a="settings">' + ic('settings') + 'Settings</button>' +
      '<div class="w-rrow"><span class="w-status">' + dot('ok') + 'Live</span><button class="w-btn quiet sm ic" type="button" data-a="theme" aria-label="Switch theme">' + ic(WB.theme() === 'dark' ? 'sun' : 'moon') + '</button></div></div></aside>';
  }
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
      return ORDER[a.prio] - ORDER[b.prio] || a.id - b.id;
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
    var items = attention(), qs = items.filter(function (i) { return i.kind === 'question'; }), bl = items.filter(function (i) { return i.kind === 'blocked'; });
    var cur = phone ? P.cc : D.cc;
    var shown = items.filter(function (i) { return cur === 'all' || i.kind === cur; });
    var seg = '<div class="w-seg" role="group" aria-label="Show">' + [['all', 'All', items.length], ['question', 'Needs input', qs.length], ['blocked', 'Blocked', bl.length]].filter(function (s) { return s[0] === 'all' || s[2]; }).map(function (s) {
      return '<button type="button" data-a="cc" data-id="' + s[0] + '" aria-pressed="' + (cur === s[0]) + '">' + s[1] + ' <span class="w-mm">' + s[2] + '</span></button>';
    }).join('') + '</div>';
    var list = '<ul style="display:flex;flex-direction:column;gap:14px">' + (shown.length ? shown.map(function (i) { return itemHTML(i, true); }).join('') : '<li class="w-empty">Nothing needs you. Agents are working or waiting for review.</li>') + '</ul>';
    var running = S.tasks.filter(function (t) { return t.run && t.run.st === 'running'; });
    var queued = S.tasks.filter(function (t) { return (t.state === 'backlog' && t.sched) || (t.run && t.run.st === 'queued'); }).sort(function (a, b) { return schedAbs(a) - schedAbs(b); });
    var side = '<section class="w-pn" aria-label="Projects"><div class="w-ph">Projects <span class="w-chip">3</span></div><ul>' +
      '<li class="w-line"><div class="top"><span class="sq" style="width:7px;height:7px;background:var(--text)"></span><b style="font-weight:500">api-server</b><span class="w-mm">1 running</span></div></li>' +
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
      '<div class="w-pane" data-keep="ov-r"><section class="w-pn" aria-label="Git"><div class="w-ph">Git <span class="w-chip">main</span><a class="end" href="#" data-a="view" data-id="git">Open →</a></div><div class="w-big">' + dot('neutral') + branches.length + ' Werkbord branch' + (branches.length === 1 ? '' : 'es') + '</div><p class="w-mm">' + branches.filter(function (t) { return t.state === 'review'; }).length + ' ready to merge · ' + branches.length + ' unpushed · 0 to clean up</p></section>' +
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
    var state = r && r.st === 'running' ? 'running' : r && r.st === 'needs' ? 'needs you' : r && r.st === 'blocked' ? 'blocked' : r && r.st === 'completed' ? 'finished' : waitingFor(t).length ? 'after ' + waitingFor(t)[0].title : t.agent;
    return '<div class="w-ev' + cls + '" role="button" tabindex="0" draggable="true" data-ev="' + t.id + '" data-a="open" data-id="' + t.id + '" style="top:' + (top + 1) + 'px;height:' + h + 'px;left:calc(' + (o.lane * w) + '% + 3px);right:auto;width:calc(' + w + '% - 6px)"><b>' + esc(t.title) + '</b><span>' + clock(t.sched.s) + ' · ' + esc(state) + '</span></div>';
  }
  function dayColHTML(d, extra) {
    var evs = S.tasks.filter(function (t) { return t.sched && t.sched.d === d && t.state !== 'done'; });
    var now = d === TODAY && S.now >= H0 * 60 && S.now <= H1 * 60 ? '<div class="w-now" data-now style="top:' + ((S.now - H0 * 60) / 60 * HOUR) + 'px"></div>' : '';
    return '<div class="w-dcol' + ((d % 7 + 7) % 7 > 4 ? ' weekend' : '') + (D.pick ? ' pickable' : '') + (extra || '') + '" data-day="' + d + '" style="height:' + ((H1 - H0) * HOUR) + 'px">' + lanes(evs).map(evHTML).join('') + now + '</div>';
  }
  function hoursHTML() { var h = ''; for (var i = H0; i < H1; i++) h += '<span style="top:' + ((i - H0) * HOUR + (i === H0 ? 8 : 0)) + 'px">' + pad(i) + ':00</span>'; return '<div class="w-hours">' + h + '</div>'; }
  function weekTitle(w) { var a = dateOf(7 * w), b = dateOf(7 * w + 6); return MONTHS[a.getMonth()] + ' ' + a.getDate() + ' – ' + (a.getMonth() === b.getMonth() ? '' : MONTHS[b.getMonth()] + ' ') + b.getDate() + ', ' + b.getFullYear(); }
  function calendarHTML() {
    var base = 7 * D.week, days = [];
    for (var i = 0; i < 7; i++) days.push(base + i);
    var unsched = S.tasks.filter(function (t) { return !t.sched && t.state !== 'done'; });
    var queue = S.tasks.filter(function (t) { return t.sched && t.state === 'backlog'; }).sort(function (a, b) { return schedAbs(a) - schedAbs(b); });
    var waiting = S.tasks.filter(function (t) { return t.state === 'backlog' && waitingFor(t).length; });
    return '<div class="w-cal"><div class="w-calmain"><div class="w-calbar"><div class="l"><button class="w-btn" type="button" data-a="today">Today</button><button class="w-btn ic" type="button" data-a="wk" data-id="-1" aria-label="Previous week">' + ic('left') + '</button><button class="w-btn ic" type="button" data-a="wk" data-id="1" aria-label="Next week">' + ic('right') + '</button><span class="w-caltitle">' + weekTitle(D.week) + '</span></div>' +
      '<div class="r"><button class="w-btn" type="button" data-a="tz"><span class="w-mm" style="color:var(--text);font-size:12px">Europe/Amsterdam</span></button><div class="w-seg"><button type="button" data-a="mode" data-id="day" aria-pressed="false">Day</button><button type="button" aria-pressed="true">Week</button></div></div></div>' +
      '<div class="w-calhead"><div></div>' + days.map(function (d) { return '<div class="w-dh">' + DAYS[(d % 7 + 7) % 7].toUpperCase() + '<b' + (d === TODAY ? ' class="today"' : '') + '>' + dateOf(d).getDate() + '</b></div>'; }).join('') + '</div>' +
      '<div class="w-calscroll" data-keep="cal"><div class="w-calgrid">' + hoursHTML() + days.map(function (d) { return dayColHTML(d); }).join('') + '</div></div></div>' +
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
    var items = [['view', 'control', 'Control Center', 'everywhere'], ['view', 'overview', 'Overview', 'my-app'], ['view', 'board', 'Board', 'my-app'], ['view', 'calendar', 'Calendar', 'my-app'], ['view', 'git', 'Git', 'my-app'], ['view', 'runs', 'Runs', 'my-app'], ['new', '', 'New task', 'action']]
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
    return a.dataset && a.dataset.a ? '[data-a="' + a.dataset.a + '"][data-id="' + (a.dataset.id || '') + '"]' + (a.dataset.v ? '[data-v="' + CSS.escape(a.dataset.v) + '"]' : '') : null;
  }
  function renderDesk() {
    if (!deskRoot) return;
    if (D.drag) { D.dirty = true; return; }
    keepScroll(deskRoot, D.scroll);
    var fk = focusKey(deskRoot);
    var main;
    if (D.view === 'control') main = '<header class="w-ghead"><h1>Control Center</h1><button class="w-btn" type="button" data-a="pal">' + ic('search') + 'Jump to</button></header><main class="w-main" data-keep="main-cc">' + controlHTML(false) + '</main>';
    else main = headHTML() + bannerHTML() + '<main class="w-main" data-keep="main-' + D.view + '"' + (D.view === 'runs' ? '' : ' style="overflow:hidden"') + '>' + ({ board: boardHTML, overview: overviewHTML, calendar: calendarHTML, git: gitHTML, runs: runsHTML })[D.view]() + '</main>';
    var panel = D.task && get(D.task) && D.view !== 'control' ? '<section class="w-panel" role="dialog" aria-label="Task">' + panelInner(get(D.task), D.ptab, false) + '</section>' : '';
    // Sheets, the switcher and toasts live outside this part, so an open form keeps what was typed.
    deskRoot.querySelector('[data-app]').innerHTML = '<div class="w-shell">' + railHTML() + '<div class="w-mainarea">' + main + panel + '</div></div>';
    restoreScroll(deskRoot, D.scroll);
    S.tasks.forEach(function (t) { t.fresh = false; });
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
  }
  function openOverlay(html, focusSel) { setOverlay(deskRoot, html, focusSel); }
  function closeOverlay() { D.sheet = null; D.pal = null; setOverlay(deskRoot, ''); }

  /* ================= phone ================= */
  function phoneHeader(title, sub, global) {
    if (global) return '<header class="w-mhead g"><div style="display:flex;align-items:center;gap:10px">' + mark(18) + '<h1>' + title + '</h1></div><button class="w-btn ic" type="button" data-a="toast" data-v="Jump to searches projects, sections and tasks." aria-label="Jump to">' + ic('search') + '</button></header>';
    return '<header class="w-mhead"><div class="w-where"><button class="w-pname" type="button" data-a="toast" data-v="The project name switches projects. This demo has one.">' + mark(18) + '<h1>my-app</h1><span class="chev">' + ic('down', 14) + '</span></button><p class="w-path">~/code/my-app · main</p></div><button class="w-btn ic" type="button" data-a="toast" data-v="Jump to searches projects, sections and tasks." aria-label="Jump to">' + ic('search') + '</button></header>';
  }
  function phoneBoard() {
    var cols = COLS.map(function (c) { return [c[0], c[1], inCol(c[0])]; });
    return '<div class="w-mpage"><div class="w-pills" role="tablist" aria-label="Columns">' + cols.map(function (c) { return '<button type="button" role="tab" data-a="col" data-id="' + c[0] + '" aria-selected="' + (P.col === c[0]) + '">' + c[1] + '<span class="w-mm">' + c[2].length + '</span></button>'; }).join('') + '</div>' +
      filtersHTML() + legendHTML(true) +
      '<ul style="display:flex;flex-direction:column;gap:12px">' + (function () { var ts = inCol(P.col); return ts.length ? ts.map(function (t) { return cardHTML(t, false); }).join('') : '<li class="w-none">' + emptyCol(P.col) + '</li>'; })() + '</ul></div>';
  }
  function phoneControl() {
    var c = controlHTML(true);
    return '<p class="w-mm" style="padding:2px 16px 0">' + needsYou() + ' needs you · ' + c.running + ' running · all projects</p><div class="w-mpage">' + c.seg + '<div class="w-filters"><label class="w-pick"><span>Project</span><select><option>all</option></select></label><label class="w-pick"><span>Agent</span><select><option>all</option></select></label></div>' + c.list + c.side + '</div>';
  }
  function phoneCalendar() {
    var d = P.day, x = dateOf(d);
    var head = '<div class="w-mcal"><div class="bar"><button class="w-btn" type="button" data-a="pday" data-id="0">Today</button><button class="w-btn ic" type="button" data-a="pday" data-id="-1" aria-label="Previous day">' + ic('left') + '</button><button class="w-btn ic" type="button" data-a="pday" data-id="1" aria-label="Next day">' + ic('right') + '</button><span class="w-caltitle">' + DAYS[(d % 7 + 7) % 7] + ', ' + MONTHS[x.getMonth()] + ' ' + x.getDate() + ', 2026</span></div>' +
      '<div class="bar"><button class="w-btn" type="button" data-a="tz"><span class="w-mm" style="color:var(--text);font-size:13px">Europe/Amsterdam</span></button><div class="w-seg"><button type="button" aria-pressed="true">Day</button><button type="button" data-a="toast" data-v="Week view needs a wider screen; on a phone the day is easier to read.">Week</button></div></div>' +
      '<div class="w-dh" style="padding-left:52px">' + DAYS[(d % 7 + 7) % 7].toUpperCase() + '<b' + (d === TODAY ? ' class="today"' : '') + '>' + x.getDate() + '</b></div>' +
      '<div class="w-mday">' + hoursHTML() + dayColHTML(d) + '</div></div>';
    return '<div class="w-mpage">' + head + '</div>';
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
  function renderPhone() {
    if (!phoneRoot) return;
    keepScroll(phoneRoot, P.scroll);
    var fk = focusKey(phoneRoot);
    var page, g = P.tab === 'control';
    if (g) page = phoneHeader('Control Center', '', true) + phoneControl();
    else page = phoneHeader() + bannerHTML() + ({ board: phoneBoard, calendar: phoneCalendar, git: phoneGit, runs: phoneRuns })[P.tab]();
    var n = needsYou();
    var tabbar = '<nav class="w-tabbar" aria-label="Primary">' + [['control', 'control', 'Needs you'], ['board', 'board', 'Board'], ['calendar', 'calendar', 'Calendar'], ['git', 'git', 'Git'], ['runs', 'runs', 'Runs']].map(function (x) {
      return '<button type="button" data-a="ptabbar" data-id="' + x[0] + '"' + (P.tab === x[0] && !P.task ? ' aria-current="page"' : '') + '><span class="icon">' + ic(x[1], 20) + (x[0] === 'control' && n ? '<span class="w-num">' + n + '</span>' : '') + '</span><span>' + x[2] + '</span></button>';
    }).join('') + '</nav>';
    var task = P.task && get(P.task) ? '<section class="w-mtask" role="dialog" aria-label="Task">' + panelInner(get(P.task), P.ptab, true) + '</section>' : '';
    phoneRoot.querySelector('[data-app]').innerHTML = '<div class="w-scroll" data-keep="pscroll-' + P.tab + '">' + page + '</div>' + (P.tab === 'board' && !P.task ? '<button class="w-fab" type="button" data-a="new" aria-label="New task">' + ic('plus', 22) + '</button>' : '') + tabbar + task;
    restoreScroll(phoneRoot, P.scroll);
    if (fk) { var el = phoneRoot.querySelector(fk); if (el) el.focus({ preventScroll: true }); }
  }
  var PHONE_CHROME = '<div class="w-status-bar" aria-hidden="true"><span>9:41</span><svg width="68" height="13" viewBox="0 0 68 13" fill="currentColor"><rect x="0" y="8" width="3" height="5" rx="1"/><rect x="5" y="5.5" width="3" height="7.5" rx="1"/><rect x="10" y="3" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="13" rx="1"/><path d="M33 3.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10 10 0 0 0 33 1.6a10 10 0 0 0-7.1 2.8L27 5.6a8.4 8.4 0 0 1 6-2.4zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.1-1.2A7 7 0 0 0 33 5a7 7 0 0 0-4.7 1.8L29.4 8c1-.9 2.2-1.4 3.6-1.4zm0 3.3c.5 0 1 .2 1.3.5L33 12l-1.3-1.6c.3-.3.8-.5 1.3-.5z"/><rect x="45" y="1" width="20" height="11" rx="3" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="47" y="3" width="15" height="7" rx="1.5"/><path d="M66.5 5v3" stroke="currentColor" stroke-opacity=".4" stroke-linecap="round"/></svg></div><div class="w-island" aria-hidden="true"></div><div class="w-home" aria-hidden="true"></div>';

  function render() { renderDesk(); renderPhone(); S.tasks.forEach(function (t) { t.fresh = false; }); }

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

  /* ---------- the clock: one simulated minute a second ---------- */
  function tick() {
    var changed = false;
    S.now += 1;
    S.tasks.forEach(function (t) {
      var r = t.run; if (!r) return;
      if (r.st === 'running') {
        r.el += 1;
        if (r.el % 2 === 0 && r.li < r.logs.length) { feed(t, 'out', r.logs[r.li]); r.li++; }
        if (r.ask && !r.asked2 && r.el >= r.ask.at) {
          r.asked2 = true; r.st = 'needs'; r.q = r.ask.q; r.choices = r.ask.choices; r.asked = S.now; changed = true;
          r.left = Math.max(4, r.left);
          feed(t, 'q', r.q); say(t.agent + ' asked a question on “' + t.title + '”');
        } else if (--r.left <= 0) { finish(t); changed = true; }
      }
    });
    S.tasks.forEach(function (t) {
      if (t.state === 'backlog' && t.sched && !t.run && !waitingFor(t).length && t.sched.d * 1440 + t.sched.s <= TODAY * 1440 + S.now) { startTask(t.id, true); changed = true; }
    });
    if (changed) render(); else updateLive();
  }
  var timer = null, seen = new Set();
  function go() { if (!timer && !document.hidden && seen.size) timer = setInterval(tick, 1000); }
  function halt() { clearInterval(timer); timer = null; }

  /* ---------- mounting and scaling ---------- */
  function mountDesk() {
    deskMount.innerHTML = '<div class="mac"><div class="mac-bar"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span class="mac-title">Werkbord</span><span></span></div><div class="stage" style="--h:800px"><div class="wbx wbx-desk" data-root="desk"><div data-app style="height:100%"></div><div data-overlay></div><div class="w-toast" role="status" aria-live="polite"></div></div></div></div>';
    deskRoot = deskMount.querySelector('.wbx-desk');
    bind(deskRoot, 'desk');
  }
  function mountPhone() {
    phoneMount.innerHTML = '<div class="iphone"><div class="stage"><div class="wbx wbx-phone" data-root="phone"><div data-app></div><div data-overlay></div><div class="w-toast" role="status" aria-live="polite"></div>' + PHONE_CHROME + '</div></div></div>';
    phoneRoot = phoneMount.querySelector('.wbx-phone');
    bind(phoneRoot, 'phone');
  }
  function fit() {
    [[deskMount, 1280], [phoneMount, 390]].forEach(function (m) {
      if (!m[0]) return;
      var stage = m[0].querySelector('.stage'); if (!stage) return;
      var s = stage.clientWidth / m[1];
      stage.style.setProperty('--s', s);
      if (m[1] === 1280) D.s = s; else P.s = s;
    });
  }

  /* ---------- events ---------- */
  function nav(where, id) {
    if (where === 'desk') { D.view = id; D.task = null; D.pick = null; }
    else { P.tab = id === 'overview' ? 'control' : id; P.task = null; }
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
      var a = b.dataset.a, id = b.dataset.id, v = b.dataset.v;
      if (b.tagName === 'A') e.preventDefault();
      switch (a) {
        case 'view': nav(where, id); closeOverlayFor(where); render(); break;
        case 'open': openTask(where, id); closeOverlayFor(where); render(); break;
        case 'close': V.task = null; render(); break;
        case 'ptab': V.ptab = id; render(); break;
        case 'start': startTask(+id); render(); break;
        case 'answer': answer(+id, v); render(); break;
        case 'toreview': toReview(+id); render(); break;
        case 'merge': V.sheet = { kind: 'merge', id: +id }; setOverlay(root, sheetHTML(V.sheet, where === 'phone'), '[data-a="mergego"]'); break;
        case 'mergego': mergeTask(+id); closeOverlayFor(where); render(); break;
        case 'sheetx': closeOverlayFor(where); break;
        case 'palx': closeOverlay(); break;
        case 'pal': D.pal = ''; openOverlay(palHTML(), '[data-pal]'); break;
        case 'new': V.sheet = { kind: 'new' }; setOverlay(root, sheetHTML(V.sheet, where === 'phone'), 'input[name=title]'); break;
        case 'stop': stopTask(+id); render(); break;
        case 'cc': V.cc = id; render(); break;
        case 'col': P.col = id; render(); break;
        case 'ptabbar': P.tab = id; P.task = null; render(); break;
        case 'pday': P.day = id === '0' ? TODAY : P.day + (+id); render(); break;
        case 'wk': D.week += +id; render(); break;
        case 'today': D.week = 0; render(); break;
        case 'pick': D.pick = D.pick == id ? null : +id; render(); break;
        case 'finding': S.finding = false; var nt = newTask('Rebase refactor-settings-page onto main', 'Claude Code', 'normal'); nt.desc = 'Repository health found the branch 14 commits behind main.'; toast('“' + nt.title + '” is in Backlog. Findings never act on their own: you start it when you want.'); render(); break;
        case 'theme': var next = WB.theme() === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; try { localStorage.setItem('wb-theme', next); } catch (x) {} window.dispatchEvent(new Event('themechange')); render(); break;
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
        closeOverlayFor(where);
        if (where === 'desk') { if (D.view === 'control') D.view = 'board'; } else { P.tab = 'board'; P.task = null; P.col = startNow ? 'doing' : 'backlog'; }
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
      if (e.target.matches('[data-pal]')) { var l = root.querySelector('[data-pallist]'); if (l) l.innerHTML = palListHTML(e.target.value); }
    });
    root.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-a]')) { e.preventDefault(); e.target.click(); return; }
      if (e.key === 'Escape') {
        if (V.sheet || (where === 'desk' && D.pal !== null)) { closeOverlayFor(where); return; }
        if (V.task) { V.task = null; render(); return; }
      }
      if (where === 'desk' && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); D.pal = ''; openOverlay(palHTML(), '[data-pal]'); }
      if (e.target.matches('[data-pal]') && e.key === 'Enter') { var first = root.querySelector('[data-pallist] button'); if (first) first.click(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && e.target.closest('form[data-form="new"]')) { e.preventDefault(); var sb = e.target.closest('form').querySelector('[value="start"]'); if (sb) sb.click(); }
      if (where === 'desk' && e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !e.target.matches('input,textarea,select') && !D.sheet) { e.preventDefault(); D.sheet = { kind: 'new' }; openOverlay(sheetHTML(D.sheet), 'input[name=title]'); }
    });
    if (where === 'desk') bindDrag(root);
  }
  function closeOverlayFor(where) {
    if (where === 'desk') closeOverlay();
    else { P.sheet = null; setOverlay(phoneRoot, ''); }
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

  /* ---------- start ---------- */
  if (deskMount) mountDesk();
  if (phoneMount) mountPhone();
  fit();
  render();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(document.body); else window.addEventListener('resize', fit);
  window.addEventListener('themechange', function () { render(); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
      if (seen.size) go(); else halt();
    }, { threshold: 0.05 });
    [deskMount, phoneMount].forEach(function (m) { if (m) io.observe(m); });
  } else { seen.add(document.body); go(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); else go(); });

  /* The page's own controls drive the app the way a person would. */
  window.WBApp = {
    state: S,
    go: function (what) {
      D.task = null; closeOverlay();
      if (what === 'answer') { var q = questions()[0] || S.tasks.filter(function (t) { return t.run && t.run.st === 'blocked'; })[0]; D.view = 'control'; render(); if (q) { var b = deskRoot.querySelector('[data-a="answer"][data-id="' + q.id + '"]'); if (b) b.focus({ preventScroll: true }); } }
      else if (what === 'merge') { var m = S.tasks.filter(function (t) { return t.state === 'review' && t.run && t.run.st === 'completed'; })[0]; D.view = 'board'; render(); if (m) { D.sheet = { kind: 'merge', id: m.id }; openOverlay(sheetHTML(D.sheet), '[data-a="mergego"]'); } else toast('Nothing is in Review yet. Move a finished task there first.'); }
      else if (what === 'plan') { D.view = 'calendar'; render(); }
      else if (what === 'new') { D.view = 'board'; render(); D.sheet = { kind: 'new' }; openOverlay(sheetHTML(D.sheet), 'input[name=title]'); }
      else { D.view = what; render(); }
    },
    phone: function (tab) { P.task = null; P.tab = tab; render(); }
  };
})();
