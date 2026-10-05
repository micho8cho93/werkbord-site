/* A working replica of individual Werkbord. One store feeds the Board, the Calendar, the
   Overview and the phone: change anything in one and the others follow. */
(function () {
  'use strict';
  var esc = WB.esc;
  var mount = document.getElementById('app-demo');
  if (!mount) return;

  var host = null;
  try { if (window.parent !== window) host = window.parent.WBApp || null; } catch (e) {}
  var phone = document.getElementById('phone-demo');

  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var LIMIT = 3, DAY0 = 8 * 60, DAY1 = 18 * 60;

  /* ---------- store ---------- */
  var S = {
    tab: 'board', week: 0, simNow: 620, nextId: 46, pick: null, dragging: false, dirty: false,
    gitOpen: true, gitTask: null, palette: null, newTask: false,
    tasks: [
      T(35, 'Fix flaky auth test', 'doing', 'running', 'Claude Code', 1, { elapsed: 12, work: 22, sched: sc(0, 540, 90),
        logs: ['editing internal/auth/session_test.go', 'running go test ./internal/auth -run Session', 'reading internal/auth/clock.go', 'editing internal/auth/session.go'] }),
      T(36, 'Migrate runs table to WAL', 'doing', 'needs', 'Claude Code', 1, { waitMin: 4, sched: sc(1, 780, 120), q: 'Run `go test ./...` in the worktree?', kind: 'approve' }),
      T(37, 'Calendar: missed-time handling', 'doing', 'blocked', 'Codex', 2, { waitMin: 31, q: 'Stopped rather than guess: which timezone should schedules use?', kind: 'reply', choices: ['Use UTC', 'Use my local time'], work: 14 }),
      T(33, 'Refactor settings page', 'review', 'ready', 'Claude Code', 2, { branch: 'werkbord/refactor-settings', diff: '+142 −61 · 6 files' }),
      T(34, 'Fix date picker off-by-one', 'review', 'ready', 'Codex', 2, { branch: 'werkbord/fix-date-picker', diff: '+12 −3 · 2 files' }),
      T(38, 'Add CSV export to reports', 'backlog', 'idle', 'Claude Code', 2, { sched: sc(1, 510, 90), ask: { at: .45, q: 'Comma or semicolon as the CSV delimiter?', kind: 'reply', choices: ['Comma', 'Semicolon'] }, work: 18 }),
      T(39, 'Upgrade vite to the latest minor', 'backlog', 'idle', 'Codex', 3, { dep: 35, sched: sc(0, 660, 60), work: 10 }),
      T(40, 'Write onboarding copy for setup', 'backlog', 'idle', 'Claude Code', 3, { work: 12 }),
      T(41, 'Investigate slow search on large repos', 'backlog', 'idle', 'Codex', 2, { ask: { at: .5, q: 'Run `go test -bench ./...` in the worktree?', kind: 'approve' }, work: 20 }),
      T(42, 'Add dark mode toggle', 'backlog', 'idle', 'Claude Code', 3, { work: 14 }),
      T(43, 'Rename config keys', 'backlog', 'idle', 'Codex', 3, { work: 9 }),
      T(44, 'Nightly dependency audit', 'backlog', 'idle', 'Codex', 3, { sched: sc(3, 600, 120), weekly: true, work: 10 }),
      T(45, 'Update API docs', 'backlog', 'idle', 'Codex', 3, { sched: sc(4, 480, 90), work: 11 }),
      T(30, 'Add project switcher', 'done', 'merged', 'Claude Code', 2, { when: '2d ago' }),
      T(29, 'Verify installer checksums', 'done', 'merged', 'Codex', 1, { when: '3d ago' }),
      T(27, 'Docs: pairing a second runner', 'done', 'merged', 'Claude Code', 3, { when: '5d ago' })
    ],
    log: [
      { t: '10:21', x: 'Claude Code asked a question on #36' },
      { t: '10:09', x: '#35 started on this computer' },
      { t: '09:48', x: '#34 is ready for review' },
      { t: '09:12', x: 'You merged #30 into main' }
    ]
  };
  if (host) ['tasks', 'log', 'simNow', 'nextId', 'gitOpen', 'gitTask'].forEach(function (key) {
    Object.defineProperty(S, key, { get: function () { return host.state[key]; }, set: function (value) { host.state[key] = value; } });
  });
  function sc(d, s, dur) { return { w: 0, d: d, s: s, dur: dur }; }
  function T(id, title, col, state, agent, pri, o) {
    var t = { id: id, title: title, col: col, state: state, agent: agent, pri: pri, runner: 'this computer', elapsed: 0, work: 15, sched: null, px: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1] };
    for (var k in o) t[k] = o[k];
    return t;
  }
  function get(id) { for (var i = 0; i < S.tasks.length; i++) if (S.tasks[i].id == id) return S.tasks[i]; }
  function active() { return S.tasks.filter(function (t) { return t.state === 'running' || t.state === 'needs'; }).length; }
  function depOpen(t) { var d = t.dep && get(t.dep); return d && d.col !== 'review' && d.col !== 'done'; }
  function clock(m) { m = Math.floor(m); return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function say(x) { S.log.unshift({ t: clock(S.simNow), x: x }); if (S.log.length > 14) S.log.pop(); }
  function slug(t) { return t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28); }
  var LOGSDEF = ['reading the failing test', 'editing the implementation', 'running the tests', 'updating the docs'];

  /* ---------- actions ---------- */
  function startTask(id) {
    var t = get(id);
    if (!t || t.col !== 'backlog') return false;
    if (depOpen(t)) { toast('#' + t.id + ' waits for #' + t.dep + '. It starts when that one is ready.'); return false; }
    t.col = 'doing'; t.elapsed = 0; t.fresh = true; t.asked = false;
    if (active() < LIMIT) { t.state = 'running'; say('#' + t.id + ' started on this computer'); }
    else { t.state = 'queued'; say('#' + t.id + ' queued: project concurrency limit is ' + LIMIT); toast('Three agents are already running, so #' + t.id + ' queued.'); }
    return true;
  }
  function pump() {
    S.tasks.filter(function (t) { return t.state === 'queued'; }).forEach(function (t) {
      if (active() < LIMIT) { t.state = 'running'; t.fresh = true; say('#' + t.id + ' started on this computer'); }
    });
  }
  function answer(id, v) {
    var t = get(id); if (!t) return;
    t.state = 'running'; t.asked = true; t.waitMin = 0;
    say(v === 'deny' ? 'You denied #' + id + '. The agent continues without it' : 'You answered #' + id + (v && v !== 'approve' ? ': ' + v : ''));
  }
  function merge(id) {
    var t = get(id); if (!t || t.col !== 'review') return;
    t.col = 'done'; t.state = 'merged'; t.when = 'just now'; t.fresh = true;
    say('You merged #' + id + ' into main (an agent never merges)');
  }
  function finish(t) {
    t.col = 'review'; t.state = 'ready'; t.fresh = true; t.branch = 'werkbord/' + slug(t);
    var n = (t.id * 37) % 90 + 12; t.diff = '+' + n + ' −' + Math.floor(n / 3) + ' · ' + (n % 5 + 2) + ' files';
    say('#' + t.id + ' is ready for review');
    S.tasks.forEach(function (o) { if (o.dep === t.id && o.col === 'backlog') say('#' + o.id + ' is no longer waiting on #' + t.id); });
    pump();
  }
  function newTask(title, agent) {
    var t = T(S.nextId++, title, 'backlog', 'idle', agent || 'Claude Code', 3, { fresh: true });
    S.tasks.push(t); say('You added #' + t.id + ' to Backlog'); return t;
  }
  function schedule(id, w, d, s) {
    var t = get(id), dur = t.sched ? t.sched.dur : 60;
    s = Math.max(DAY0, Math.min(DAY1 - dur, Math.round(s / 30) * 30));
    t.sched = { w: w, d: d, s: s, dur: dur }; S.pick = null;
    say('#' + id + ' scheduled ' + DAYS[d] + ' ' + clock(s));
    toast('#' + id + ' scheduled for ' + DAYS[d] + ' ' + clock(s) + '. It shows on the Board as scheduled.');
  }

  /* ---------- tiny dom helpers ---------- */
  var ICONS = {
    cc: '<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>',
    folder: '<path d="M2 4.5A1 1 0 0 1 3 3.5h3L7.5 5H13a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>',
    run: '<rect x="2" y="2.5" width="12" height="8.5" rx="1"/><path d="M5.5 13.5h5M8 11v2.5"/>',
    set: '<path d="M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7"/><circle cx="10.5" cy="4.5" r="1.5"/><circle cx="5.5" cy="11.5" r="1.5"/>',
    search: '<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>',
    plus: '<path d="M8 3v10M3 8h10"/>',
    l: '<path d="M10 3L5 8l5 5"/>', r: '<path d="M6 3l5 5-5 5"/>', x: '<path d="M4 4l8 8M12 4l-8 8"/>'
  };
  function ic(n, w) { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.4) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>'; }
  function dot(c, o) { return '<span class="dot" style="background:var(--' + c + ')' + (o ? ';opacity:' + o : '') + '"></span>'; }
  var toastTimer;
  function toast(m) {
    var el = mount.querySelector('.toast'); if (!el) return;
    el.textContent = m; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3200);
  }
  function fmtSched(s) { return DAYS[s.d] + ' ' + clock(s.s); }
  function weekLabel() {
    var a = new Date(2026, 9, 5 + 7 * S.week), b = new Date(2026, 9, 11 + 7 * S.week);
    var am = MONTHS[a.getMonth()], bm = MONTHS[b.getMonth()];
    return am + ' ' + a.getDate() + ' – ' + (am === bm ? '' : bm + ' ') + b.getDate() + ', ' + b.getFullYear();
  }

  /* ---------- shell ---------- */
  mount.innerHTML =
    '<div class="win"><div class="win-bar"><div class="px3" aria-hidden="true"><i></i><i></i><i></i></div>' +
    '<span class="url" id="ad-url">127.0.0.1:7420/#/p/my-app/board</span>' +
    '</div>' +
    '<div class="app" id="ad-app">' +
    '<aside class="rail" aria-label="Projects and runners"></aside>' +
    '<main><div class="ahead"><button class="btn ic mobile-menu" data-act="menu" type="button" aria-label="Open project navigation" aria-expanded="false">' + ic('cc') + '</button><div><div class="mm">~/code/my-app · main</div><h3>my-app</h3></div><div class="acts">' +
    '<button class="btn" type="button" data-act="palette">' + ic('search') + 'Jump to<span class="key">⌘K</span></button>' +
    '<button class="btn pri" type="button" data-act="new">' + ic('plus', 1.6) + 'New task</button></div></div>' +
    '<nav class="tabs" role="tablist" aria-label="Project"></nav><div class="view" id="ad-view" role="tabpanel"></div></main>' +
    '<div class="toast" role="status" aria-live="polite"></div><div id="ad-ovl"></div></div></div>';
  var app = mount.querySelector('#ad-app'), view = mount.querySelector('#ad-view');

  function renderRail() {
    var needs = S.tasks.filter(function (t) { return t.state === 'needs' || t.state === 'blocked'; }).length;
    var runners = active();
    mount.querySelector('.rail').innerHTML =
      '<button class="btn rail-dismiss" data-act="menu" type="button">Close navigation</button><div class="rail-logo"><img class="mark-l" src="assets/img/mark-light.svg" alt=""><img class="mark-d" src="assets/img/mark-dark.svg" alt=""><span class="wm">werkbord</span></div>' +
      '<button class="nv" type="button" data-act="cc">' + ic('cc') + 'Control Center' + (needs ? '<span class="badge" style="margin-left:auto">' + needs + '</span>' : '') + '</button>' +
      '<div class="rsec">' + ic('folder') + 'Projects</div>' +
      '<button class="nv on" type="button" data-act="project" aria-current="true"><span class="sq"></span>my-app<span class="n">' + S.tasks.filter(function (t) { return t.col === 'doing'; }).length + '</span></button>' +
      '<button class="nv" type="button" data-act="other"><span class="sq" style="background:var(--t2)"></span>api-server<span class="n">1</span></button>' +
      '<button class="nv" type="button" data-act="other"><span class="sq" style="background:var(--t2)"></span>docs-site</button>' +
      '<div class="rsec">' + ic('run') + 'Runners</div>' +
      '<div class="nv">' + dot('ok') + 'this computer<span class="n" id="ad-conc">' + runners + '/' + LIMIT + '</span></div>' +
      '<div class="nv">' + dot('t2', .5) + 'mbp-work<span class="n">offline</span></div>' +
      '<div style="margin-top:auto"><div class="nv">' + ic('set') + 'Settings</div></div>';
  }
  function renderTabs() {
    var gitBadge = S.gitOpen ? '<span class="badge pend">1</span>' : '';
    var defs = [['overview', 'Overview'], ['board', 'Board'], ['calendar', 'Calendar']];
    mount.querySelector('.tabs').innerHTML = defs.map(function (d) {
      return '<button class="tab' + (S.tab === d[0] ? ' on' : '') + '" type="button" role="tab" aria-selected="' + (S.tab === d[0]) + '" data-act="tab" data-id="' + d[0] + '">' + d[1] + (d[0] === 'overview' ? gitBadge : '') + '</button>';
    }).join('');
    mount.querySelector('#ad-url').textContent = '127.0.0.1:7420/#/p/my-app/' + (S.tab === 'overview' ? 'overview' : S.tab);
  }

  /* ---------- board ---------- */
  var COLS = [['backlog', 'Backlog'], ['doing', 'Doing'], ['review', 'Review'], ['done', 'Done']];
  function sorted(col) {
    return S.tasks.filter(function (t) { return t.col === col; }).sort(function (a, b) { return a.pri - b.pri || a.id - b.id; });
  }
  function cardHTML(t) {
    var st = '', body = '', key = '#' + t.id;
    switch (t.state) {
      case 'idle':
        var wait = depOpen(t);
        st = dot('t2', .45) + (wait ? 'Waits for #' + t.dep : t.sched ? 'Scheduled ' + fmtSched(t.sched) + (t.weekly ? ' · weekly' : '') : 'Not started');
        body = '<div class="row-b"><button class="btn sm" type="button" data-act="start" data-id="' + t.id + '"' + (wait ? ' aria-disabled="true"' : '') + '>Start agent</button></div>';
        break;
      case 'queued': st = dot('wn') + 'Queued · waiting for a free slot'; break;
      case 'running':
        st = dot('ac') + '<span data-el="' + t.id + '">Running · ' + Math.floor(t.elapsed) + 'm</span> · ' + t.runner;
        body = '<div class="q" data-lg="' + t.id + '">› ' + esc((t.logs || LOGSDEF)[Math.floor(t.elapsed) % (t.logs || LOGSDEF).length]) + '</div><div style="display:flex;align-items:center;gap:10px"><div class="px" data-px="' + t.id + '" role="img" aria-label="Agent activity over the last 10 minutes">' + t.px.map(function (v) { return '<i' + (v ? ' class="on"' : '') + '></i>'; }).join('') + '</div><span class="mm">activity · 10 min</span></div>';
        break;
      case 'needs': case 'blocked':
        st = dot(t.state === 'needs' ? 'wn' : 'bl') + (t.state === 'needs' ? 'Needs you · ' + Math.floor(t.waitMin) + 'm' : 'Blocked · stopped rather than guess');
        body = '<div class="q">' + esc(t.q) + '</div>' + answerBtns(t);
        break;
      case 'ready':
        st = dot('ok') + 'Ready for review';
        body = '<div class="q">' + esc(t.branch) + '<br>' + esc(t.diff) + '</div><div class="row-b"><button class="btn pri sm" type="button" data-act="merge" data-id="' + t.id + '">Merge into main</button></div>';
        break;
      case 'merged': st = dot('ok') + 'Merged by you · ' + t.when; break;
    }
    var drag = (t.col === 'backlog' && t.state === 'idle') || t.col === 'review';
    return '<article class="card' + (t.state === 'running' ? ' live' : '') + (t.state === 'merged' ? ' settled' : '') + (t.fresh ? ' fresh' : '') + '" ' + (drag ? 'draggable="true" ' : '') + 'data-card="' + t.id + '" id="card-' + t.id + '">' +
      '<div class="ct">' + esc(t.title) + '</div><div class="st">' + st + '</div>' + body +
      '<div class="mt"><span class="chip">' + t.agent + '</span><span class="mm">P' + t.pri + ' · ' + key + '</span></div></article>';
  }
  function answerBtns(t) {
    if (t.kind === 'approve') return '<div class="row-b"><button class="btn pri sm" type="button" data-act="answer" data-id="' + t.id + '" data-v="approve">Approve</button><button class="btn sm" type="button" data-act="answer" data-id="' + t.id + '" data-v="deny">Deny</button></div>';
    return '<div class="row-b">' + (t.choices || []).map(function (c, i) { return '<button class="btn sm' + (i === 0 ? ' pri' : '') + '" type="button" data-act="answer" data-id="' + t.id + '" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
  }
  function legend() {
    var c = function (f) { return S.tasks.filter(f).length; };
    var items = [['ac', c(function (t) { return t.state === 'running'; }) + ' running'], ['wn', c(function (t) { return t.state === 'needs'; }) + ' needs you'],
      ['bl', c(function (t) { return t.state === 'blocked'; }) + ' blocked'], ['ok', c(function (t) { return t.state === 'ready'; }) + ' ready for review']];
    return items.map(function (i) { return '<span>' + dot(i[0]) + i[1] + '</span>'; }).join('');
  }
  function renderBoard() {
    view.innerHTML = '<div class="sbar"><div class="row-b"><span class="chip">Agent: any</span><span class="chip">Runner: any</span><span class="chip">Priority: any</span></div><div class="legend" id="ad-legend">' + legend() + '</div></div>' +
      '<div class="board">' + COLS.map(function (c) {
        var ts = sorted(c[0]);
        return '<section class="col" data-col="' + c[0] + '" aria-label="' + c[1] + '"><div class="ch">' + c[1] + '<span class="chip">' + ts.length + '</span></div>' +
          (ts.length ? ts.map(cardHTML).join('') : '<div class="empty">' + (c[0] === 'backlog' ? 'Nothing waiting' : 'Nothing here') + '</div>') + '</section>';
      }).join('') + '</div>';
    S.tasks.forEach(function (t) { t.fresh = false; });
    if (S.focusCard) { var f = view.querySelector('#card-' + S.focusCard); if (f) { f.scrollIntoView({ block: 'nearest', behavior: WB.reduced ? 'auto' : 'smooth' }); f.classList.add('fresh'); } S.focusCard = null; }
  }

  /* ---------- calendar ---------- */
  function layout(evs) {
    // lane assignment for overlapping events in one day
    evs.sort(function (a, b) { return a.sched.s - b.sched.s; });
    var lanes = [], out = [], cluster = [], cEnd = 0;
    function flush() { var n = lanes.length || 1; cluster.forEach(function (o) { o.n = n; }); out = out.concat(cluster); cluster = []; lanes = []; }
    evs.forEach(function (t) {
      if (cluster.length && t.sched.s >= cEnd) { flush(); cEnd = 0; }
      var l = 0; while (lanes[l] && lanes[l] > t.sched.s) l++;
      lanes[l] = t.sched.s + t.sched.dur; cEnd = Math.max(cEnd, t.sched.s + t.sched.dur);
      cluster.push({ t: t, lane: l });
    });
    flush(); return out;
  }
  function renderCalendar() {
    var hours = '', i;
    for (i = 0; i < 10; i++) hours += '<span class="hl" style="top:' + (i * 60 - 7) + 'px">' + pad(8 + i) + ':00</span>';
    var heads = DAYS.map(function (d, k) {
      var dt = new Date(2026, 9, 5 + 7 * S.week + k);
      return '<div class="dh">' + d + '<i' + (S.week === 0 && k === 0 ? ' class="today"' : '') + '>' + dt.getDate() + '</i></div>';
    }).join('');
    var cols = DAYS.map(function (d, k) {
      var evs = S.tasks.filter(function (t) { return t.sched && t.sched.w === S.week && t.sched.d === k && t.col !== 'done'; });
      var html = layout(evs).map(function (o) {
        var t = o.t, w = 100 / o.n;
        var cls = t.state === 'running' ? ' run' : t.state === 'needs' ? ' needs' : '';
        return '<div class="ev' + cls + '" draggable="true" data-ev="' + t.id + '" style="top:' + (t.sched.s - DAY0 + 1) + 'px;height:' + (t.sched.dur - 2) + 'px;left:calc(' + (o.lane * w) + '% + 4px);right:auto;width:calc(' + w + '% - 8px)">' +
          '<b>' + esc(t.title) + '</b><span>' + clock(t.sched.s) + '–' + clock(t.sched.s + t.sched.dur) + (t.dep && depOpen(t) ? ' · after #' + t.dep : '') + '</span><span>' + t.agent + (t.state === 'running' ? ' · running' : t.state === 'needs' ? ' · needs you' : t.weekly ? ' · weekly' : '') + '</span>' +
          '<button class="x" type="button" data-act="unsched" data-id="' + t.id + '" aria-label="Unschedule ' + esc(t.title) + '">' + ic('x') + '</button></div>';
      }).join('');
      return '<div class="dcol' + (k > 4 ? ' weekend' : '') + (S.pick ? ' pickable' : '') + '" data-day="' + k + '">' + html +
        (S.week === 0 && k === 0 ? '<div class="nowline" id="ad-now" style="top:' + (S.simNow - DAY0) + 'px"></div>' : '') + '</div>';
    }).join('');
    var unsched = S.tasks.filter(function (t) { return !t.sched && t.col === 'backlog'; });
    var pickT = S.pick && get(S.pick);
    var pickUI = pickT ? '<div class="pick"><b>' + esc(pickT.title) + '</b><div class="r"><select class="sel" id="pk-d" aria-label="Day">' + DAYS.map(function (d, k) { return '<option value="' + k + '">' + d + '</option>'; }).join('') + '</select><select class="sel" id="pk-t" aria-label="Start time">' + (function () { var o = ''; for (var m = DAY0; m < DAY1; m += 30) o += '<option value="' + m + '"' + (m === 14 * 60 ? ' selected' : '') + '>' + clock(m) + '</option>'; return o; })() + '</select></div><div class="r"><button class="btn pri sm" type="button" data-act="pickgo">Schedule</button><button class="btn sm" type="button" data-act="pickx">Cancel</button></div><span class="mm">or click a day in the grid</span></div>' : '';
    var waiting = S.tasks.filter(function (t) { return t.col === 'backlog' && depOpen(t); });
    var over = overload();
    view.innerHTML = '<div class="cal-bar"><div class="l"><button class="btn" type="button" data-act="today">Today</button><button class="btn ic" type="button" data-act="wk" data-id="-1" aria-label="Previous week">' + ic('l') + '</button><button class="btn ic" type="button" data-act="wk" data-id="1" aria-label="Next week">' + ic('r') + '</button><span class="cal-title">' + weekLabel() + '</span></div><span class="mm">drag a task onto the week, or pick one and choose a slot</span></div>' +
      '<div class="cal-wrap"><div class="cal-main"><div class="cal-in"><div class="cal-head"><div></div>' + heads + '</div><div class="cal-grid"><div class="hours">' + hours + '</div>' + cols + '</div></div></div>' +
      '<aside class="cal-side" aria-label="Unscheduled"><h4>Unscheduled<span class="chip">' + unsched.length + '</span></h4>' +
      (unsched.length ? unsched.map(function (t) { return '<div class="item' + (S.pick == t.id ? ' on' : '') + '" draggable="true" data-un="' + t.id + '"><span class="grip" aria-hidden="true">⋮⋮</span><button class="pbtn" type="button" aria-pressed="' + (S.pick == t.id) + '" data-act="pick" data-id="' + t.id + '"><span class="t" style="display:block">' + esc(t.title) + '</span><span class="mm">P' + t.pri + ' · #' + t.id + '</span></button></div>'; }).join('') : '<div class="empty">Everything has a slot</div>') + pickUI +
      (waiting.length ? '<h4>Waiting on</h4>' + waiting.map(function (t) { return '<div class="item"><div><div class="t">' + esc(t.title) + ' waits for ' + esc(get(t.dep).title) + '</div><div class="mm" style="margin-top:2px">#' + t.id + ' after #' + t.dep + '</div></div></div>'; }).join('') : '') +
      '<div class="conc"><div style="display:flex;justify-content:space-between;font-size:13px"><span style="font-weight:500">Concurrency</span><span class="mm" id="ad-conc2">' + active() + ' of ' + LIMIT + ' running</span></div><div class="slots">' + [0, 1, 2].map(function (k) { return '<span class="' + (k < active() ? 'on' : '') + '"></span>'; }).join('') + '</div>' + (over ? '<div class="warn">' + over + '</div>' : '<div class="mm">No planned overlap above the limit.</div>') + '</div></aside></div>';
  }
  function overload() {
    var worst = null;
    for (var d = 0; d < 7; d++) for (var m = DAY0; m < DAY1; m += 30) {
      var n = S.tasks.filter(function (t) { return t.sched && t.sched.w === 0 && t.sched.d === d && t.col !== 'done' && t.col !== 'review' && t.sched.s <= m && m < t.sched.s + t.sched.dur; }).length;
      if (n > LIMIT && (!worst || n > worst.n)) worst = { n: n, d: d, m: m };
    }
    return worst ? DAYS[worst.d] + ' ' + clock(worst.m) + ' plans ' + worst.n + ' runs. The extra ones queue at the limit of ' + LIMIT + '.' : '';
  }

  /* ---------- overview ---------- */
  var HIST = 'wwwwwwwwwwwwwwwwwwggggggwwggggggwwwggggbpbwggbbbbbbbbbbbb'; // decorative 24h strip
  function renderOverview() {
    var needs = S.tasks.filter(function (t) { return t.state === 'needs' || t.state === 'blocked'; });
    var runs = S.tasks.filter(function (t) { return ['running', 'needs', 'blocked', 'ready', 'queued'].indexOf(t.state) > -1 || (t.state === 'merged' && t.when === 'just now'); }).sort(function (a, b) { return a.id - b.id; });
    var cells = '', i, m = { g: 'g', b: 'b', p: 'p', w: '' };
    for (i = 0; i < 48; i++) { var ch = HIST.charAt(i % HIST.length); cells += '<i class="' + (m[ch] || '') + '"></i>'; }
    var stl = { running: ['ac', 'Running'], needs: ['wn', 'Needs you'], blocked: ['bl', 'Blocked'], ready: ['ok', 'Ready'], queued: ['wn', 'Queued'], merged: ['ok', 'Merged'] };
    view.innerHTML = '<div class="ov"><div class="col-s">' +
      '<section class="pn" aria-label="Needs you"><div class="ph">Needs you<span class="chip">' + needs.length + '</span></div>' +
      (needs.length ? needs.map(function (t) { return '<div class="need"><div class="h">' + dot(t.state === 'needs' ? 'wn' : 'bl') + '<span style="font-weight:500">' + esc(t.title) + '</span><span class="mm" style="margin-left:auto">#' + t.id + ' · ' + t.agent + ' · ' + Math.floor(t.waitMin) + 'm</span></div><div class="q">' + esc(t.q) + '</div>' + answerBtns(t) + '</div>'; }).join('') : '<div class="empty">All clear. Agents are working or waiting for review.</div>') + '</section>' +
      '<section class="pn" aria-label="Runs"><div class="ph">Runs<span class="chip">' + runs.length + '</span><span class="mm" style="margin-left:auto">last 24 hours</span></div><div class="hist" role="img" aria-label="Run history over 24 hours">' + cells + '</div>' +
      '<div class="tbl"><div class="tr th"><span>Run</span><span>Task</span><span>Agent</span><span>Runner</span><span>State</span><span>Time</span></div>' +
      runs.map(function (t) { var s = stl[t.state]; return '<div class="tr"><span class="mm">run-' + (4000 + t.id * 7).toString(16) + '</span><span style="font-weight:500">' + esc(t.title) + '</span><span>' + t.agent + '</span><span class="mm">' + t.runner + '</span><span class="st">' + dot(s[0]) + s[1] + '</span><span class="mm">' + (t.state === 'running' ? '<span data-el2="' + t.id + '">' + Math.floor(t.elapsed) + 'm</span>' : (t.waitMin ? Math.floor(t.waitMin) + 'm' : 'n/a')) + '</span></div>'; }).join('') + '</div></section></div>' +
      '<div class="col-s"><section class="pn" aria-label="Git"><div class="ph">Git<span class="chip">main</span></div>' +
      '<div class="bignote">' + dot(S.gitOpen ? 'wn' : 'ok') + (S.gitOpen ? '1 risk · 3 items need attention' : 'Healthy · 1 task opened') + '</div>' +
      (S.gitOpen ? '<div class="need"><div style="font-weight:500;font-size:13px">Branch is behind main</div><div style="font-size:12.5px;color:var(--t2)">werkbord/fix-flaky-auth is 14 commits behind main.</div><div class="q">git rev-list --count HEAD..main → 14</div><div class="row-b"><button class="btn sm" type="button" data-act="gittask">Open as task</button></div></div>' :
        '<div class="need"><div style="font-weight:500;font-size:13px">Investigation task #' + S.gitTask + ' is in Backlog</div><div style="font-size:12.5px;color:var(--t2)">Findings never act on their own. You choose the agent and when to start.</div><div class="row-b"><button class="btn sm" type="button" data-act="tab" data-id="board" data-focus="' + S.gitTask + '">View on Board</button></div></div>') + '</section>' +
      '<section class="pn" aria-label="Agents"><div class="ph">Agents</div><div style="display:flex;align-items:center;gap:10px;font-size:13px">' + dot('ok') + '<span style="font-weight:500">Claude Code</span><span class="mm">signed in</span><span class="mm" style="margin-left:auto">' + S.tasks.filter(function (t) { return t.agent === 'Claude Code' && t.state === 'running'; }).length + ' running</span></div><div style="display:flex;align-items:center;gap:10px;font-size:13px">' + dot('ok') + '<span style="font-weight:500">Codex</span><span class="mm">signed in</span><span class="mm" style="margin-left:auto">' + S.tasks.filter(function (t) { return t.agent === 'Codex' && t.state === 'running'; }).length + ' running</span></div></section>' +
      '<section class="pn" aria-label="Activity"><div class="ph">Activity</div><div style="display:flex;flex-direction:column;gap:12px">' + S.log.slice(0, 7).map(function (l) { return '<div class="ar"><span class="mm">' + l.t + '</span><span>' + esc(l.x) + '</span></div>'; }).join('') + '</div></section></div></div>';
  }

  /* ---------- overlays: palette and new task ---------- */
  function renderOverlay() {
    var o = mount.querySelector('#ad-ovl');
    if (S.palette !== null) {
      var q = S.palette.toLowerCase();
      var items = [{ l: 'Go to Overview', a: 'tab', id: 'overview' }, { l: 'Go to Board', a: 'tab', id: 'board' }, { l: 'Go to Calendar', a: 'tab', id: 'calendar' }]
        .concat(S.tasks.filter(function (t) { return t.col !== 'done'; }).map(function (t) { return { l: '#' + t.id + ' ' + t.title, a: 'jump', id: t.id }; }))
        .filter(function (i) { return i.l.toLowerCase().indexOf(q) > -1; }).slice(0, 8);
      o.innerHTML = '<div class="ovl" data-act="ovlx"><div class="ovb" role="dialog" aria-label="Jump to"><input id="pal-in" class="tin" placeholder="Jump to a view or a task" value="' + esc(S.palette) + '" autocomplete="off">' +
        '<div class="ovl-list">' + (items.length ? items.map(function (i) { return '<button type="button" class="ovl-i" data-act="' + i.a + '" data-id="' + i.id + '">' + esc(i.l) + '</button>'; }).join('') : '<div class="empty">No match</div>') + '</div></div></div>';
      var inp = o.querySelector('#pal-in'); if (inp && document.activeElement !== inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    } else if (S.newTask) {
      o.innerHTML = '<div class="ovl" data-act="ovlx"><form class="ovb" id="nt-form" role="dialog" aria-label="New task"><label for="nt-in" style="font-weight:600;font-size:14px">New task</label><input id="nt-in" class="tin" placeholder="What should an agent do?" maxlength="80" autocomplete="off"><div class="r2"><select class="sel" id="nt-ag" aria-label="Agent"><option>Claude Code</option><option>Codex</option></select><button class="btn pri" type="submit">Add to Backlog</button><button class="btn" type="button" data-act="ovlx">Cancel</button></div></form></div>';
      o.querySelector('#nt-in').focus();
    } else o.innerHTML = '';
  }

  /* ---------- render all ---------- */
  var renderedTab = null;
  function render(localOnly) {
    if (S.dragging) { S.dirty = true; return; }
    var fa = document.activeElement, fk = null;
    if (fa && view.contains(fa) && fa.dataset && fa.dataset.act) fk = '[data-act="' + fa.dataset.act + '"][data-id="' + (fa.dataset.id || '') + '"]' + (fa.dataset.v ? '[data-v="' + fa.dataset.v + '"]' : '');
    renderRail(); renderTabs();
    if (S.tab === 'board') renderBoard(); else if (S.tab === 'calendar') renderCalendar(); else renderOverview();
    if (renderedTab !== S.tab) { view.scrollTop = 0; view.scrollLeft = 0; renderedTab = S.tab; }
    if (fk) { var n = view.querySelector(fk); if (n) n.focus({ preventScroll: true }); }
    if (!localOnly) {
      if (host) host.refresh(true);
      else if (phone && phone.contentWindow.WBApp) phone.contentWindow.WBApp.refresh(true);
    }
  }

  /* ---------- events ---------- */
  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || !app.contains(b)) {
      // pick mode: clicking a day column schedules
      var col = e.target.closest('.dcol');
      if (col && S.pick && !e.target.closest('.ev')) { var r = col.getBoundingClientRect(); schedule(S.pick, S.week, +col.dataset.day, DAY0 + (e.clientY - r.top)); render(); }
      return;
    }
    var act = b.dataset.act, id = b.dataset.id;
    if (act === 'ovlx') { if (e.target !== b && !e.target.classList.contains('ovl') && b.tagName !== 'BUTTON') return; S.palette = null; S.newTask = false; renderOverlay(); return; }
    if (b.hasAttribute('aria-disabled') && act === 'start') { startTask(id); render(); return; }
    if (act !== 'menu') { app.classList.remove('menu-open'); app.querySelector('.mobile-menu').setAttribute('aria-expanded', 'false'); }
    switch (act) {
      case 'menu': var opened = app.classList.toggle('menu-open'); app.querySelector('.mobile-menu').setAttribute('aria-expanded', String(opened)); if (opened) app.querySelector('.rail-dismiss').focus(); else app.querySelector('.mobile-menu').focus(); break;
      case 'project': S.tab = 'board'; render(); break;
      case 'tab': S.tab = id; if (b.dataset.focus) S.focusCard = b.dataset.focus; S.palette = null; render(); renderOverlay(); break;
      case 'cc': S.tab = 'overview'; render(); break;
      case 'other': toast('This demo only has my-app. Add yours with: werkbord project add ~/code/your-repo'); break;
      case 'start': startTask(id); render(); break;
      case 'answer': answer(id, b.dataset.v); render(); break;
      case 'merge': merge(id); render(); break;
      case 'palette': S.palette = ''; renderOverlay(); break;
      case 'new': S.newTask = true; renderOverlay(); break;
      case 'jump': S.tab = 'board'; S.palette = null; S.focusCard = id; render(); renderOverlay(); break;
      case 'gittask': var t = newTask('Rebase fix-flaky-auth onto main', 'Claude Code'); t.pri = 2; S.gitOpen = false; S.gitTask = t.id; say('Repository finding opened as #' + t.id); render(); toast('Task #' + t.id + ' is in Backlog on the Board. You choose when an agent starts.'); break;
      case 'wk': S.week += +id; S.pick = S.pick; render(); break;
      case 'today': S.week = 0; render(); break;
      case 'pick': S.pick = (S.pick == id ? null : +id); render(); break;
      case 'pickx': S.pick = null; render(); break;
      case 'pickgo': schedule(S.pick, S.week, +view.querySelector('#pk-d').value, +view.querySelector('#pk-t').value); render(); break;
      case 'unsched': var u = get(id); u.sched = null; say('#' + id + ' unscheduled'); render(); e.stopPropagation(); break;
    }
  });
  app.addEventListener('input', function (e) { if (e.target.id === 'pal-in') { S.palette = e.target.value; renderOverlay(); } });
  app.addEventListener('submit', function (e) {
    if (e.target.id !== 'nt-form') return; e.preventDefault();
    var v = app.querySelector('#nt-in').value.trim(); if (!v) return;
    var t = newTask(v, app.querySelector('#nt-ag').value); S.newTask = false; S.tab = 'board'; S.focusCard = t.id; render(); renderOverlay();
    toast('#' + t.id + ' is in Backlog. Start it, or drag it onto the Calendar.');
  });
  app.addEventListener('keydown', function (e) {
    if (e.target.getAttribute('role') === 'tab' && ['ArrowLeft','ArrowRight','Home','End'].indexOf(e.key) > -1) {
      e.preventDefault(); var tabs = Array.from(app.querySelectorAll('[role=tab]')), index = tabs.indexOf(e.target);
      var next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click(); app.querySelectorAll('[role=tab]')[next].focus();
    }
    if (e.key === 'Escape' && app.classList.contains('menu-open')) { app.classList.remove('menu-open'); app.querySelector('.mobile-menu').setAttribute('aria-expanded', 'false'); app.querySelector('.mobile-menu').focus(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); S.palette = ''; S.newTask = false; renderOverlay(); }
    if (e.key === 'Escape' && (S.palette !== null || S.newTask)) { S.palette = null; S.newTask = false; renderOverlay(); }
  });

  /* drag and drop: board and calendar */
  var drag = null;
  function allowed(t, to) {
    if (!t) return false;
    if (to === 'doing') return t.col === 'backlog' && t.state === 'idle';
    if (to === 'done') return t.col === 'review';
    return false;
  }
  app.addEventListener('dragstart', function (e) {
    var c = e.target.closest('[data-card],[data-ev],[data-un]'); if (!c) return;
    drag = c.dataset.card ? { k: 'card', id: +c.dataset.card } : c.dataset.ev ? { k: 'ev', id: +c.dataset.ev, off: e.clientY - c.getBoundingClientRect().top } : { k: 'un', id: +c.dataset.un };
    S.dragging = true; c.classList.add('dragging');
    try { e.dataTransfer.setData('text/plain', String(drag.id)); e.dataTransfer.effectAllowed = 'move'; } catch (x) {}
  });
  app.addEventListener('dragend', function () {
    drag = null; S.dragging = false; clearOver();
    app.querySelectorAll('.dragging').forEach(function (n) { n.classList.remove('dragging'); });
    if (S.dirty) { S.dirty = false; render(); }
  });
  function clearOver() { app.querySelectorAll('.over,.nope').forEach(function (n) { n.classList.remove('over', 'nope'); }); var g = app.querySelector('.ghost'); if (g) g.remove(); }
  app.addEventListener('dragover', function (e) {
    if (!drag) return;
    var col = e.target.closest('.col'), day = e.target.closest('.dcol');
    if (col && drag.k === 'card') {
      var ok = allowed(get(drag.id), col.dataset.col); e.preventDefault();
      clearOver(); col.classList.add(ok ? 'over' : 'nope');
    } else if (day && drag.k !== 'card') {
      e.preventDefault(); clearOver(); day.classList.add('over');
      var r = day.getBoundingClientRect(), t = get(drag.id), dur = t.sched ? t.sched.dur : 60;
      var s = Math.max(DAY0, Math.min(DAY1 - dur, Math.round((DAY0 + e.clientY - r.top - (drag.off || 0)) / 30) * 30));
      var g = document.createElement('div'); g.className = 'ghost'; g.style.top = (s - DAY0) + 'px'; g.style.height = dur + 'px'; day.appendChild(g);
    }
  });
  app.addEventListener('dragleave', function (e) { if (!app.contains(e.relatedTarget)) clearOver(); });
  app.addEventListener('drop', function (e) {
    if (!drag) return;
    var col = e.target.closest('.col'), day = e.target.closest('.dcol'), d = drag;
    e.preventDefault(); clearOver(); S.dragging = false;
    if (col && d.k === 'card') {
      var t = get(d.id), to = col.dataset.col;
      if (allowed(t, to)) { if (to === 'doing') startTask(d.id); else merge(d.id); }
      else if (to !== t.col) toast(t.col === 'backlog' ? 'Only an agent finishing moves a card out of Doing. Start it first.' : to === 'backlog' || to === 'doing' ? 'Cards move forward. Use Continue with… to start fresh work.' : 'Agents move cards to Review; you move them to Done by merging.');
    } else if (day && d.k !== 'card') {
      var r = day.getBoundingClientRect(); schedule(d.id, S.week, +day.dataset.day, DAY0 + e.clientY - r.top - (d.off || 0));
    }
    drag = null; S.dirty = false; render();
  });

  /* ---------- the clock ---------- */
  function tick() {
    var changed = false;
    S.simNow += 0.5;
    S.tasks.forEach(function (t) {
      if (t.state === 'running') {
        t.elapsed += 0.5;
        t.px.shift(); t.px.push(Math.random() < .72 ? 1 : 0);
        if (t.ask && !t.asked && t.elapsed >= t.work * t.ask.at) {
          t.state = 'needs'; t.q = t.ask.q; t.kind = t.ask.kind; t.choices = t.ask.choices; t.waitMin = 0; t.asked = true;
          say(t.agent + ' asked a question on #' + t.id); changed = true;
        } else if (t.elapsed >= t.work) { finish(t); changed = true; }
      } else if (t.state === 'needs' || t.state === 'blocked') { t.waitMin += 0.25; if (Math.floor(t.waitMin) !== Math.floor(t.waitMin - 0.25)) t.dirtyWait = true; }
    });
    if (changed) { render(); return; }
    updateLive();
    if (phone && phone.contentWindow.WBApp) phone.contentWindow.WBApp.updateLive();
  }
  function updateLive() {
    // In-place updates preserve focus and drags in both views.
    S.tasks.forEach(function (t) {
      if (t.state !== 'running') return;
      var a = mount.querySelector('[data-el="' + t.id + '"]'); if (a) a.textContent = 'Running · ' + Math.floor(t.elapsed) + 'm';
      var a2 = mount.querySelector('[data-el2="' + t.id + '"]'); if (a2) a2.textContent = Math.floor(t.elapsed) + 'm';
      var l = mount.querySelector('[data-lg="' + t.id + '"]'); if (l) { var L = t.logs || LOGSDEF; l.textContent = '› ' + L[Math.floor(t.elapsed / 2) % L.length]; }
      var p = mount.querySelector('[data-px="' + t.id + '"]'); if (p) [].forEach.call(p.children, function (c, i) { c.className = t.px[i] ? 'on' : ''; });
    });
    var nl = mount.querySelector('#ad-now'); if (nl) nl.style.top = (S.simNow - DAY0) + 'px';
  }
  var timer = null, visible = new Set();
  function run() { if (!host && !timer && !document.hidden) timer = setInterval(tick, 1000); }
  function stop() { clearInterval(timer); timer = null; }
  if (!host) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); });
        if (visible.size) run(); else stop();
      }, { threshold: 0.05 });
      observer.observe(mount); if (phone) observer.observe(phone);
    } else { visible.add(mount); run(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible.size) run(); });
  }

  window.WBApp = { state: S, refresh: render, updateLive: updateLive, goto: function (tab) { S.tab = tab; render(); } };
  render(true);
  if (phone) {
    phone.src = phone.dataset.src;
    window.addEventListener('themechange', function () {
      if (phone.contentDocument) phone.contentDocument.documentElement.dataset.theme = WB.theme();
    });
  }
})();
