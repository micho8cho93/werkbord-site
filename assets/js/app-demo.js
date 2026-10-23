/* A working replica of werkbord: the Mac app (Universal, Individual and a Team) and the phone, sharing one controller.
   The markup, wording and states follow the product's Svelte components (web/src) so the simulator looks and behaves
   like the app. Start an agent on the desktop and it shows up on the phone; answer on the phone and the desktop moves on.
   The guided story walks through it with quiet notes (demo-guide.js), and nothing is locked. Nothing leaves the page. */
(function () {
  'use strict';
  var esc = WB.esc;
  var M = WB.motion;
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
    database: '<ellipse cx="8" cy="4" rx="5.5" ry="2"/><path d="M2.5 4v8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V4M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2"/>',
    more: '<circle cx="3.5" cy="8" r="0.9"/><circle cx="8" cy="8" r="0.9"/><circle cx="12.5" cy="8" r="0.9"/>',
    help: '<circle cx="8" cy="8" r="5.8"/><path d="M6.3 6.4a1.8 1.8 0 1 1 2.5 1.6c-.5.3-.8.6-.8 1.1v.3"/><path d="M8 11.7v.1"/>'
  };
  function ic(n, size) { size = size || 16; return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>'; }
  function mark(h) { var w = Math.round(h * 130 / 94); return '<span class="w-mark"><img class="mark-l" src="assets/img/mark-light.svg" alt="" width="' + w + '" height="' + h + '"><img class="mark-d" src="assets/img/mark-dark.svg" alt="" width="' + w + '" height="' + h + '"></span>'; }
  function dot(tone, cls) { return '<span class="w-dot' + (cls ? ' ' + cls : '') + '" data-tone="' + tone + '"></span>'; }

  /* ---------- time: today, a little before eleven ----------
     Day 0 is the visitor's own today, read from their clock when the page loads. The calendar shows seven days from today, so
     "tomorrow" is always on screen, whatever day of the week the visitor arrives. */
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var TODAY = 0, HOUR = 48, H0 = 7, H1 = 19, LIMIT = 3;
  // Pace of the scripted work: agents and the Find Bugs run take 75% of their former time. Salie's replies take 15% less again.
  var PACE = 0.75, TICK = 1000 * PACE, ASK_PACE = PACE * 0.85;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(m) { m = Math.floor(m); m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function dur(min) { min = Math.max(0, Math.floor(min)); return min < 1 ? 'just now' : min < 60 ? min + 'm' : Math.floor(min / 60) + 'h ' + pad(min % 60) + 'm'; }
  function ago(min) { min = Math.max(0, Math.floor(min)); return min < 1 ? 'just now' : min < 60 ? min + 'm ago' : min < 1440 ? Math.floor(min / 60) + 'h ago' : Math.floor(min / 1440) + 'd ago'; }
  var DAY0 = new Date(); DAY0 = new Date(DAY0.getFullYear(), DAY0.getMonth(), DAY0.getDate());
  function dateOf(d) { return new Date(DAY0.getFullYear(), DAY0.getMonth(), DAY0.getDate() + d); }
  function dayName(d) { return DAYS[(dateOf(d).getDay() + 6) % 7]; }
  function dayLabel(d) { var x = dateOf(d); return dayName(d) + ' ' + MONTHS[x.getMonth()] + ' ' + x.getDate(); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 34).replace(/-$/, ''); }

  /* ---------- the controller's state ----------
     my-app is the project the story is about: it starts with only its finished history, and the walkthrough builds the rest.
     api-server and marketing-site are full of work of their own (FXT, below), shown as they stand: read only. */
  function at(d, h, m) { return d * 1440 + (h || 0) * 60 + (m || 0); }
  var S = {
    now: 10 * 60 + 42, nextId: 30, seq: 0x4f2a,
    finding: false,
    // The rest of Individual and a Team: a backdrop that Universal reads beside my-app. See "the other workspaces" below.
    ext: {
      ask: { id: 102, title: 'Fix flaky auth test', project: 'api-server', agent: 'Claude Code', prio: 'high', st: 'needs', asked: 9 * 60 + 52,
        q: 'The session test passes alone and fails in the full suite. Fix the shared clock, or skip the test for now?', choices: ['Fix the shared clock', 'Skip it for now'] },
      // The Team's dated tickets, drawn on Universal's calendar. Individual's come from the projects' own scheduled tasks.
      cal: [
        { title: 'WB-40 Add audit log filters', project: 'storefront', tag: 'Northwind', d: 0, s: 13 * 60, dur: 90 },
        { title: 'WB-44 Rate-limit login attempts', project: 'storefront', tag: 'Northwind', d: 1, s: 10 * 60, dur: 120 },
        { title: 'WB-43 Fix the cart badge count', project: 'storefront', tag: 'Northwind', d: 2, s: 9 * 60, dur: 60 }
      ]
    },
    team: {
      name: 'Northwind', project: 'storefront', role: 'Admin', nextN: 48,
      members: [['Sam Okafor', 'Owner', '1 runner connected', 'Phone connected'], ['You', 'Admin', '1 runner connected', 'No phone paired'], ['Maya Chen', 'Member', '1 runner connected', 'Phone disconnected · access paired'], ['Jonas Weber', 'Member', '1 runner connected', 'Phone connection unknown'], ['Priya Nair', 'Member', 'No runners connected', 'No phone paired']],
      tickets: [
        { n: 30, title: 'Move the checkout to the new payments API', st: 'done', who: 'Sam Okafor', branch: 'wb-30-move-the-checkout-to-the-new-payments-api', ahead: 5, pr: { n: 188, state: 'merged' }, arch: at(-9, 14), desc: 'Switch the checkout from the legacy payments client to the new API.' },
        { n: 31, title: 'Remove the unused coupon table', st: 'done', who: 'Jonas Weber', branch: 'wb-31-remove-the-unused-coupon-table', ahead: 1, pr: { n: 191, state: 'merged' }, arch: at(-9, 14) },
        { n: 33, title: 'Fix the broken price filter on mobile', st: 'done', who: 'Maya Chen', branch: 'wb-33-fix-the-broken-price-filter-on-mobile', ahead: 2, pr: { n: 196, state: 'merged' }, arch: at(-5, 9) },
        { n: 36, title: 'Upgrade the payments client', st: 'done', who: 'Jonas Weber', branch: 'wb-36-upgrade-the-payments-client', ahead: 2, pr: { n: 205, state: 'merged' } },
        { n: 37, title: 'Show order history on the account page', st: 'done', who: 'Maya Chen', branch: 'wb-37-show-order-history-on-the-account-page', ahead: 3, pr: { n: 207, state: 'merged' } },
        { n: 38, title: 'Fix the checkout total rounding', st: 'done', who: 'Sam Okafor', branch: 'wb-38-fix-the-checkout-total-rounding', ahead: 1, pr: { n: 209, state: 'merged' } },
        { n: 39, title: 'Retry failed webhooks with backoff', st: 'done', who: 'Jonas Weber', branch: 'wb-39-retry-failed-webhooks-with-backoff', ahead: 2, pr: { n: 210, state: 'merged' } },
        { n: 40, title: 'Add audit log filters', st: 'progress', who: 'You', branch: 'wb-40-add-audit-log-filters', ahead: 2, pr: { n: 212, state: 'open' }, exec: 'running', active: true, start: -2, due: 3,
          desc: 'The audit log lists every change. Add filters for the person, the action and the date range.' },
        { n: 41, title: 'Redirect old product URLs', st: 'review', who: 'Sam Okafor', reviewer: 'Priya Nair', branch: 'wb-41-redirect-old-product-urls', ahead: 3, pr: { n: 214, state: 'open' }, start: -4, due: 0,
          desc: 'Old product links from the previous shop should land on the new product pages.' },
        { n: 42, title: 'Show cart total with tax', st: 'review', who: 'Maya Chen', reviewer: 'You', branch: 'wb-42-show-cart-total-with-tax', ahead: 4, pr: { n: 216, state: 'merged' },
          comments: [{ by: 'Jonas Weber', at: 9 * 60 + 31, text: 'I checked the rounding on the tax line. It matches the invoice.' }, { by: 'Maya Chen', at: 9 * 60 + 48, text: '@You this one is ready. The pull request is merged, so it only needs your sign-off.', mentions: ['You'], unread: true }] },
        { n: 43, title: 'Fix the cart badge count', st: 'progress', who: 'Maya Chen', branch: 'wb-43-fix-the-cart-badge-count', ahead: 1, active: true, start: -1, due: 2 },
        { n: 44, title: 'Rate-limit login attempts', st: 'progress', who: 'Jonas Weber', branch: 'wb-44-rate-limit-login-attempts', ahead: 3, pr: { n: 219, state: 'draft' }, start: -1, due: 5,
          comments: [{ by: 'Jonas Weber', at: 10 * 60 + 20, text: '@Maya Chen can you look at the rate window once the draft pull request is up?', mentions: ['Maya Chen'] }] },
        { n: 45, title: 'Landing page copy for reports', st: 'available', by: 'Priya Nair', due: 7 },
        { n: 46, title: 'Pick a date range on reports', st: 'available', by: 'Priya Nair' },
        { n: 47, title: 'Export invoices as PDF', st: 'available', by: 'Sam Okafor', start: 1, due: 9 }
      ]
    },
    // Git transfers: which request is out, and what came back (see "Git Fetch and Push" below).
    xfer: { fetching: '', fetched: '', pushing: 0, last: null },
    tasks: [], log: []
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
  /* What a run shows in its task: the agent's start, its lines so far, the question it is waiting on, and its end. */
  function seedRun(t, i) {
    if (!t.run) return;
    var r = t.run;
    r.id = 'run-' + (0x6c1f + i * 977).toString(36).slice(-4);
    var start = r.ended != null ? r.ended - r.el : S.now - r.el;
    r.started = start;
    var f = [{ k: 'sys', x: 'Agent started', t: start }];
    (r.logs || []).forEach(function (l, j) { if (r.st !== 'running' || j <= 2) f.push({ k: 'out', x: l, t: start + 1 + j }); });
    if (r.st === 'running') r.li = Math.min(3, r.logs.length);
    if (r.st === 'needs') f.push({ k: 'q', x: r.q, t: r.asked });
    if (r.st === 'blocked') f.push({ k: 'block', x: r.q, t: r.asked });
    if (r.st === 'completed' || r.st === 'merged') { f.push({ k: 'out', x: 'Committed: ' + (r.commit || 'the change'), t: (r.ended || start) - 1 }); f.push({ k: 'sys', x: 'Session finished', t: r.ended || start }); }
    r.feed = f;
  }
  var GENERIC_LOGS = ['Reading the files this touches', 'Making the change', 'Running the tests', 'All tests pass'];
  /* A finished task, merged d days ago at h:m. Claude Code reports its tokens and cost; Codex does not. */
  function done(id, title, agent, d, h, m, o) {
    o = o || {};
    var end = at(d, h, m);
    var t = T(id, title, 'done', agent, o.prio || 'normal', { doneAt: end, desc: o.desc || '', run: run('merged', o.el || 6 + id % 13, {
      branch: slug(title), ahead: o.ahead || 1 + id % 3, files: 2 + id % 6, add: 24 + (id * 37) % 140, del: 4 + (id * 11) % 50, commit: o.commit || title, ended: end - 4,
      tokens: agent === 'Claude Code' ? (20 + (id * 13) % 50) + '.' + (id % 9) + 'k' : null, cost: agent === 'Claude Code' ? '$0.' + pad(18 + (id * 7) % 60) : null, logs: GENERIC_LOGS.slice() }) });
    if (o.archived != null) t.archived = o.archived;
    if (o.project) { t.project = o.project; t.ro = true; }
    return t;
  }
  S.tasks = [
    done(11, 'Add project switcher', 'Claude Code', 0, 8, 30, { commit: 'Add the project switcher to the header', el: 18 }),
    done(12, 'Verify installer checksums', 'Codex', -1, 15, 20),
    done(13, 'Show run time on the Runs tab', 'Claude Code', -2, 11, 5),
    done(14, 'Cache the project list', 'Codex', -3, 16, 40),
    done(15, 'Fix date picker off-by-one', 'Codex', -4, 10, 15),
    done(16, 'Add keyboard shortcuts to the board', 'Claude Code', -6, 14, 50),
    done(17, 'Refactor settings page', 'Claude Code', -8, 9, 25, { el: 23 }),
    done(18, 'Move logging to structured output', 'Codex', -11, 13, 10),
    done(19, 'Remove the old onboarding flow', 'Claude Code', -21, 17, 0, { archived: at(-14, 9) }),
    done(20, 'Update the README screenshots', 'Codex', -26, 12, 30, { archived: at(-14, 9) })
  ];
  S.tasks.forEach(seedRun);
  S.log = [
    { t: 8 * 60 + 30, x: 'You merged werkbord/add-project-switcher into main' },
    { t: at(-1, 15, 20), x: 'You merged werkbord/verify-installer-checksums into main' },
    { t: at(-2, 11, 5), x: 'You merged werkbord/show-run-time-on-the-runs-tab into main' }
  ];

  /* api-server and marketing-site, as they stand today. Every task here is read only: the demo drives my-app. The question
     api-server is waiting on (S.ext.ask) is live, and is answered from Workspace, from Universal or by Salie. */
  function sx(project, t) { t.project = project; t.ro = true; return t; }
  var FXT = {
    'api-server': [
      sx('api-server', T(101, 'Rate-limit the webhook endpoint', 'doing', 'Codex', 'high', { desc: 'Webhook senders can flood the endpoint. Allow a burst, then limit each sender per minute.',
        run: run('running', 31, { logs: ['Reading internal/webhooks/handler.go', 'Choosing a token bucket per sender', 'Adding internal/webhooks/limit.go', 'Running go test ./internal/webhooks', '14 passed in 1.8s'], left: 12 }) })),
      sx('api-server', T(103, 'Cache the pricing lookups', 'doing', 'Claude Code', 'normal', { desc: 'The pricing page asks the database for the same rows on every request.',
        run: run('running', 8, { logs: ['Reading internal/pricing/lookup.go', 'Measuring the lookups on a busy page', 'Adding a five-minute cache in front of them', 'Running go test ./internal/pricing'], left: 20 }) })),
      sx('api-server', T(104, 'Paginate the orders endpoint', 'review', 'Claude Code', 'normal', { desc: 'The orders endpoint returns every order. Return pages with a cursor.',
        run: run('completed', 19, { branch: 'paginate-the-orders-endpoint', ahead: 3, files: 7, add: 164, del: 38, commit: 'Add cursor pagination to /orders', ended: at(0, 7, 40), tokens: '52.3k', cost: '$0.44', logs: GENERIC_LOGS.slice() }) })),
      sx('api-server', T(105, 'Trim secrets from error logs', 'review', 'Codex', 'high', { desc: 'An error log line can include a request header. Remove tokens before it is written.',
        run: run('completed', 11, { branch: 'trim-secrets-from-error-logs', ahead: 2, files: 4, add: 58, del: 9, commit: 'Redact authorization headers in error logs', ended: at(-1, 17, 5), logs: GENERIC_LOGS.slice() }) })),
      sx('api-server', T(106, 'Return 400 for an empty request body', 'backlog', 'Claude Code', 'high', { sched: { d: 1, s: 9 * 60 + 30, dur: 60 }, desc: 'An empty body returns a 500. Answer with a 400 and a message.' })),
      sx('api-server', T(107, 'Add a request ID to every log line', 'backlog', 'Codex', 'normal', { desc: 'Follow one request through the logs.' })),
      sx('api-server', T(108, 'Document the webhook retry policy', 'backlog', 'Codex', 'low', { deps: [101], desc: 'Describe the retries and the limits for the people who send us webhooks.' })),
      sx('api-server', T(109, 'Audit dependencies for advisories', 'backlog', 'Codex', 'low', { sched: { d: 0, s: 15 * 60, dur: 90 }, desc: 'Run the audit tools and list what needs an update.' })),
      done(110, 'Add a health check endpoint', 'Claude Code', -2, 12, 0, { project: 'api-server' }),
      done(111, 'Move config to environment variables', 'Codex', -3, 10, 20, { project: 'api-server' }),
      done(112, 'Rotate the signing key', 'Claude Code', -5, 16, 45, { project: 'api-server' }),
      done(113, 'Add an OpenAPI spec', 'Claude Code', -8, 11, 30, { project: 'api-server', el: 21 }),
      done(114, 'Tighten the CORS rules', 'Codex', -11, 15, 15, { project: 'api-server' }),
      done(115, 'Remove unused middleware', 'Codex', -30, 10, 0, { project: 'api-server', archived: at(-20, 9) }),
      done(116, 'Fix a race in the scheduler', 'Claude Code', -35, 14, 0, { project: 'api-server', archived: at(-20, 9) })
    ],
    'marketing-site': [
      sx('marketing-site', T(201, 'Fix signup errors for screen readers', 'doing', 'Claude Code', 'high', { desc: 'A failed signup is not announced. Put the message in a polite live region.',
        run: run('running', 12, { logs: ['Reading components/SignupForm.tsx', 'The error appears but is not announced', 'Adding a polite live region to the form', 'Running npm test'], left: 14 }) })),
      sx('marketing-site', T(202, 'Add social cards to blog posts', 'review', 'Codex', 'normal', { desc: 'Each post should share with a card made from its title and image.',
        run: run('completed', 14, { branch: 'add-social-cards-to-blog-posts', ahead: 2, files: 5, add: 88, del: 6, commit: 'Generate a social card for each post', ended: at(0, 9, 10), logs: GENERIC_LOGS.slice() }) })),
      sx('marketing-site', T(203, 'Write the pricing page FAQ', 'backlog', 'Claude Code', 'normal', { desc: 'Answer the questions people ask before they sign up.' })),
      sx('marketing-site', T(204, 'Add a changelog page', 'backlog', 'Claude Code', 'low', { sched: { d: 2, s: 10 * 60, dur: 60 }, desc: 'List what shipped, newest first.' })),
      sx('marketing-site', T(205, 'Compress the hero images', 'backlog', 'Codex', 'low', { desc: 'The home page hero is 2.4 MB. Aim for under 300 KB.' })),
      sx('marketing-site', T(206, 'Translate the homepage to German', 'backlog', 'Claude Code', 'normal', { deps: [201], desc: 'Keep the tone, and let a person read it before it ships.' })),
      done(207, 'Add a sitemap', 'Codex', -1, 13, 30, { project: 'marketing-site' }),
      done(208, 'Fix the theme resetting after navigation', 'Claude Code', -2, 15, 55, { project: 'marketing-site' }),
      done(209, 'Speed up font loading', 'Claude Code', -4, 9, 40, { project: 'marketing-site' }),
      done(210, 'Add a dark mode', 'Claude Code', -7, 12, 10, { project: 'marketing-site', el: 26 }),
      done(211, 'Write the launch post', 'Claude Code', -9, 16, 20, { project: 'marketing-site' }),
      done(212, 'Remove the old pricing table', 'Codex', -20, 11, 0, { project: 'marketing-site', archived: at(-12, 9) }),
      done(213, 'Replace the contact form', 'Claude Code', -26, 14, 30, { project: 'marketing-site', archived: at(-12, 9) })
    ]
  };
  var FXLOG = {
    'api-server': [{ t: 9 * 60 + 52, x: 'Claude Code asked a question on “Fix flaky auth test”' }, { t: 9 * 60 + 12, x: 'Codex started on “Rate-limit the webhook endpoint”' }, { t: 7 * 60 + 40, x: '“Paginate the orders endpoint” is ready for review' }, { t: at(-1, 17, 5), x: '“Trim secrets from error logs” is ready for review' }, { t: at(-2, 12, 0), x: 'You merged werkbord/add-a-health-check-endpoint into main' }],
    'marketing-site': [{ t: 10 * 60 + 30, x: 'Claude Code started on “Fix signup errors for screen readers”' }, { t: 9 * 60 + 10, x: '“Add social cards to blog posts” is ready for review' }, { t: at(-1, 13, 30), x: 'You merged werkbord/add-a-sitemap into main' }, { t: at(-2, 15, 55), x: 'You merged werkbord/fix-the-theme-resetting-after-navigation into main' }]
  };
  Object.keys(FXT).forEach(function (p, pi) { FXT[p].forEach(function (t, i) { seedRun(t, 40 + pi * 20 + i); }); });
  var PROJECTS = ['my-app', 'api-server', 'marketing-site'];

  /* ---------- views: each surface has its own navigation ---------- */
  var D = { ws: 'universal', uv: 'mywork', tv: 'board', view: 'control', proj: 'my-app', page: null, pwk: 'todo', set: null, alerts: false, share: 0, mine: false, sw: false, task: null, ptab: 'activity', sheet: null, pal: null, week: 0, dayN: 0, mode: 'week', cal: 'calendar', pick: null, cc: 'all', fa: 'any', fp: 'any', arch: false, tarch: false, aq: '', gsub: 'overview', an: analyticsState(), tan: 'Activity', hq: '', drag: null, scroll: {} };
  var P = { scope: 'individual', teamTab: 'board', deckAdded: false, deckWs: false, pwk: 'todo', repo: null, at: 'deck', tab: 'board', proj: 'my-app', task: null, ptab: 'activity', sheet: null, col: 'backlog', day: TODAY, mode: 'day', cc: 'all', fa: 'any', fp: 'any', arch: false, aq: '', gsub: 'overview', an: analyticsState(), set: null, hq: '', wf: null, af: 'all', scroll: {} };
  // The visible surface being drawn: the per-project pages read its project, filters and archive from it.
  var VIEW = D;

  // my-app starts with only its finished history, so the visitor sees an idea become a working board.
  var initialState = JSON.stringify(S);
  var PW, PWS;
  var G = { mode: 'core', active: false, f: {}, s: {}, floor: 0, cur: null, where: null, hide: null, exitAsk: false };

  function get(id) {
    for (var i = 0; i < S.tasks.length; i++) if (S.tasks[i].id == id) return S.tasks[i];
    if (id == S.ext.ask.id) return extTask();
    for (var p in FXT) for (var j = 0; j < FXT[p].length; j++) if (FXT[p][j].id == id) return FXT[p][j];
  }
  /* A project's tasks. my-app's are live; the others are as they stand. api-server's waiting question is live too. */
  function projTasks(p) {
    if (p === 'my-app' || !FXT[p]) return S.tasks;
    return p === 'api-server' ? FXT[p].concat([extTask()]) : FXT[p];
  }
  function curProj() { return VIEW.proj || 'my-app'; }
  function curTasks() { return projTasks(curProj()); }
  /* What the lists show, as a short signature. A repaint that changes it is a real change (a task moved, a ticket was claimed) and
     the motion layer animates it; any other repaint (a filter, a page, the theme) only sets a new baseline, as in the app. */
  function revSig() {
    return S.tasks.map(function (t) { return t.id + ':' + t.state + ':' + (t.archived != null ? 1 : 0) + ':' + (t.run ? t.run.st : ''); }).join('|') + '#' +
      S.team.tickets.map(function (k) { return k.n + ':' + k.st + ':' + (k.who || '') + ':' + (k.arch != null ? 1 : 0); }).join('|') + '#' + S.ext.ask.st + ':' + (P.deckAdded ? 1 : 0) + (P.deckWs ? 1 : 0);
  }
  /* A card that lands in Done is acknowledged where it lands. */
  function landed(node, it) { if (/-done$/.test(it.part)) M.acknowledge(node); }
  function isMine(t) { return !t.ro; }
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
    var drag = !t.ro && (t.state === 'backlog' || t.state === 'review' || (t.state === 'doing' && r && r.st === 'completed'));
    return '<li class="w-card w-task' + (s.live ? ' live' : '') + (t.state === 'done' ? ' settled' : '') + (sel ? ' selected' : '') + (t.fresh ? ' fresh' : '') + '" data-tone="' + s.tone + '" data-card="' + t.id + '" data-mk="c' + t.id + '"' + (drag ? ' draggable="true"' : '') + '>' +
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
  function projAttention(p) {
    if (p === 'my-app') return attention();
    var out = [];
    if (p === 'api-server' && S.ext.ask.st === 'needs') out.push({ kind: 'question', t: extTask() });
    projTasks(p).forEach(function (t) { if (t.run && t.run.st === 'completed' && !t.archived) out.push({ kind: 'review', t: t }); });
    return out;
  }
  function itemHTML(it, showProject) {
    var t = it.t, r = t.run;
    if (it.kind === 'review') {
      return '<li class="w-card w-row" data-mk="r' + t.id + '">' + dot('ok') + '<div class="what"><button class="rtitle" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button><p class="w-mm">Ready for review' + (showProject ? ' · ' + (t.project || 'my-app') : '') + ' · ' + t.agent + '</p></div>' +
        '<button class="w-btn sm" type="button" data-a="' + (t.state === 'review' ? 'merge' : 'toreview') + '" data-id="' + t.id + '">' + (t.state === 'review' ? 'Merge…' : 'Move to Review') + '</button></li>';
    }
    var label = it.kind === 'question' ? 'Needs input' : 'Blocked', tone = it.kind === 'question' ? 'ask' : 'block';
    return '<li class="w-card w-item" data-kind="' + it.kind + '" data-mk="q' + t.id + '"><p class="w-kind">' + dot(tone) + '<b>' + label + '</b><span>' + (showProject ? (it.project || t.project || 'my-app') + ' · ' : '') + '<span data-wait="' + t.id + '">' + dur(S.now - r.asked).toUpperCase() + '</span></span><span class="agent">' + t.agent + '</span></p>' +
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
    say('You merged ' + branchOf(t) + ' into main');
    toast('Merged into main on this computer. Nothing was pushed.', viewIn('done', 'Done'));
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

  /* ---------- personal generative workspaces (the app's 4.72 and 4.73) ----------
     Salie can propose a private interface that is saved on this computer: a layout of panels over a collection of records. The
     proposal is a card with a read only preview and its own Confirm, as in the app. Once saved it is listed under Create with Salie in
     the sidebar, and its records are the person's to add, tick off, edit and delete. Salie draws the page; it never reads or changes
     the records. The demo has two examples, each over one collection of its own. Individual's is a weekly to-do list. A Team's is a
     tracker of what the person is waiting on from teammates: a workspace can be shown in a Team, and Team display keeps it private to
     the person. What a page draws follows the product's own renderer (web/src/lib/personal, web/src/shell): bordered panels, a shaded
     filter band over each list or table, and more room between sections. A phone lists every workspace on its deck and works with its
     records (4.73); making or reshaping one there goes through Salie, and renaming, history and deleting stay on the computer. */
  var PW_ICONS = ['check', 'folder', 'analytics', 'calendar', 'activity', 'overview', 'people'];
  var PW_KINDS = ['todo', 'team'];
  var PWK = {
    todo: {
      id: 'pws_h3k7q2m9x4c6b8da', home: 'individual', loc: { uni: true, ind: true, team: false },
      name: 'Weekly to-dos', icon: 'check', col: 'Weekly tasks',
      create: 'Create a weekly to-do list', focus: 'Add a High priority section and move progress up', back: 'Put progress back below the tasks',
      intro: 'Your weekly tasks, saved on this computer. Add them directly, tick them off, and come back whenever you need the list.',
      fields: [['title', 'Task', 'text'], ['done', 'Completed', 'boolean'], ['due', 'Due date', 'date'], ['priority', 'Priority', 'select'], ['notes', 'Notes', 'text']],
      sel: 'priority', opts: ['Low', 'Normal', 'High'], dflt: 'Normal', hot: 'High', hotName: 'High priority', main: 'This week', card: 'Priority overview', chart: 'Tasks by priority', ph: 'Ship the weekly report',
      sample: { title: 'Send the weekly report', sel: 'High', due: 1 },
      seed: [{ title: 'Send the weekly report', done: false, due: 1, priority: 'High', notes: '' }, { title: 'Renew the domain', done: false, due: 3, priority: 'Normal', notes: 'It expires next week' }, { title: 'Book flights for the offsite', done: true, due: -1, priority: 'Low', notes: '' }],
      say: 'Here is a weekly to-do list with deadlines and priorities. It keeps one collection of tasks on this computer: the task, whether it is done, a due date, a priority and notes. The page shows this week’s tasks as a checklist, with progress, a status line, a chart by priority and a table of every record.',
      focusSay: 'I will move the progress panels to the top and add a section for High priority tasks. Only the layout changes: the collection, its fields and every record stay as they are. The preview below uses your current records.',
      backSay: 'I will put the High priority section away and move progress back below the tasks. Your records stay as they are.'
    },
    team: {
      id: 'pws_t5n8w2r6y3d9f7ka', home: 'team', loc: { uni: false, ind: false, team: true },
      name: 'Team follow-ups', icon: 'people', col: 'Follow-ups',
      create: 'Create a team follow-up tracker', focus: 'Add a section for Maya and move progress up', back: 'Put progress back below the follow-ups',
      intro: 'What you are waiting on from your teammates, saved on this computer. ' + S.team.name + ' shows it in your sidebar, and your teammates cannot see it. Add a follow-up, and tick it off when it arrives.',
      fields: [['title', 'Follow-up', 'text'], ['done', 'Done', 'boolean'], ['due', 'Needed by', 'date'], ['who', 'Teammate', 'select'], ['notes', 'Notes', 'text']],
      sel: 'who', opts: ['Maya', 'Jonas', 'Priya', 'Sam'], dflt: 'Maya', hot: 'Maya', hotName: 'Waiting on Maya', main: 'Open follow-ups', card: 'Who it is with', chart: 'Follow-ups by teammate', ph: 'Review of the pull request',
      sample: { title: 'Review of pull request 212 (WB-40)', sel: 'Priya', due: 1 },
      seed: [{ title: 'Review of pull request 212 (WB-40)', done: false, due: 1, who: 'Priya', notes: 'The audit log filters' }, { title: 'API notes for the reports page (WB-45)', done: false, due: 3, who: 'Maya', notes: '' },
        { title: 'Scope for the invoice export (WB-47)', done: false, due: 6, who: 'Sam', notes: '' }, { title: 'Rounding check on the tax line (WB-42)', done: true, due: -1, who: 'Jonas', notes: 'It matches the invoice' }],
      say: 'Here is a tracker for what you are waiting on from your team. It keeps one collection of follow-ups on this computer: the follow-up, whether it is done, a due date, the teammate and notes. The page shows open follow-ups as a checklist, with progress, a status line, a chart by teammate and a table of every record. It appears in ' + S.team.name + ' and stays private to you.',
      focusSay: 'I will move the progress panels to the top and add a section for follow-ups with Maya. Only the layout changes: the collection, its fields and every record stay as they are. The preview below uses your current records.',
      backSay: 'I will put the Maya section away and move progress back below the follow-ups. Your records stay as they are.'
    }
  };
  /* The same three layouts for every example: the page as made, the page with a section for one value and progress on top, and the
     fixed table the data library makes when it reuses a collection. */
  PW_KINDS.forEach(function (k) {
    var K = PWK[k], head = ['text', K.intro];
    K.layouts = {
      basic: [head, ['view', 'todos'], ['grid', 'progress', 'status'], ['card', K.card, 'chart'], ['view', 'table']],
      focus: [head, ['grid', 'progress', 'status'], ['view', 'urgent'], ['view', 'todos'], ['card', K.card, 'chart'], ['view', 'table']],
      table: [['view', 'records']]
    };
  });
  /* One state per example: the saved workspace, its collection, and what its page has open. PW is the one being drawn or acted on. */
  var pwLibNote = '';
  function pwNew(k) {
    return { k: k, K: PWK[k], ws: null, col: null, menu: false, panel: '', ed: null, draft: {}, q: {}, f: {}, sk: {}, sd: {}, delId: null, delView: '', mode: '', cfm: false, hsel: 0, hrev: 0, inspect: false, note: '', teamOpen: false, setf: null };
  }
  function pwReset() { PWS = {}; PW_KINDS.forEach(function (k) { PWS[k] = pwNew(k); }); PW = PWS.todo; pwLibNote = ''; }
  /* The workspace a control belongs to: the one whose page it is on. */
  function pwOf(el) { var n = el.closest && el.closest('[data-pw-key]'); return n ? pwUse(n.getAttribute('data-pw-key')) : PW; }
  function pwUse(k) { if (PWS[k]) PW = PWS[k]; return PW; }
  function pwIdle(s) { s.menu = false; s.panel = ''; s.ed = null; s.delId = null; s.setf = null; s.mode = ''; }
  function pwAny() { return PW_KINDS.some(function (k) { return !!PWS[k].ws; }); }
  function pwRecs(k) { return PWS[k].col ? PWS[k].col.recs.length : 0; }
  function pwViews() {
    var K = PW.K, hot = {}; hot[K.sel] = K.hot;
    return {
      todos: { id: 'todos', name: K.main, kind: 'checklist', ops: ['create', 'update', 'delete'] },
      urgent: { id: 'urgent', name: K.hotName, kind: 'checklist', ops: ['update'], filt: hot },
      table: { id: 'table', name: 'All records', kind: 'table', ops: ['create', 'update', 'delete'] },
      progress: { id: 'progress', name: 'Progress', kind: 'progress' },
      status: { id: 'status', name: 'Current status', kind: 'status' },
      chart: { id: 'chart', name: K.chart, kind: 'chart' },
      records: { id: 'records', name: PW.col ? PW.col.name : 'Records', kind: 'table', ops: ['create', 'update', 'delete'] }
    };
  }
  function pwLabel(k) { return PW.K.fields.filter(function (f) { return f[0] === k; })[0][1]; }
  function pwShow(v) { return v === undefined || v === '' || v === null ? '–' : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v); }
  /* What Salie offers about a workspace: to make it, or to reshape the one that is saved. */
  function pwKindOpts(k) { var K = PWK[k], s = PWS[k]; return !s.ws ? [K.create] : s.ws.layout === 'basic' ? [K.focus] : s.ws.layout === 'focus' ? [K.back] : []; }
  function pwOpts(ks, making) {
    var pool = making && ks.some(function (k) { return !PWS[k].ws; }) ? ks.filter(function (k) { return !PWS[k].ws; }) : ks;
    return pool.reduce(function (o, k) { return o.concat(pwKindOpts(k)); }, []);
  }
  function pwWhere() { return D.ws === 'universal' ? 'uni' : D.ws === 'individual' ? 'ind' : 'team'; }
  function pwVisible(k) { var s = PWS[k || PW.k]; return !!s.ws && !!s.ws.loc[pwWhere()]; }
  function pwLocs(loc) { return [loc.uni ? 'Universal' : '', loc.ind ? 'Individual' : '', loc.team ? S.team.name : ''].filter(Boolean).join(', ') || 'no location'; }
  function pwSave(note) {
    var w = PW.ws; w.rev++;
    w.hist.push({ rev: w.rev, name: w.name, icon: w.icon, layout: w.layout, loc: { uni: w.loc.uni, ind: w.loc.ind, team: w.loc.team }, at: clock(S.now) });
    PW.note = note || '';
  }
  function pwMake(layout) {
    var K = PW.K, reuse = !!PW.col;
    if (!PW.col) PW.col = { name: K.col, recs: [], next: 1, owned: true }; else PW.col.owned = false;
    PW.ws = { id: K.id, rev: 0, name: layout === 'table' ? PW.col.name : K.name, icon: layout === 'table' ? 'folder' : K.icon, layout: layout, loc: { uni: K.loc.uni, ind: K.loc.ind, team: K.loc.team }, hist: [] };
    pwSave(reuse ? 'Saved. Your earlier records are back in the workspace.' : '');
  }
  /* What the phone lesson finds when nothing was made on the computer first: what a person would have made there. */
  function pwSeed() {
    PW_KINDS.forEach(function (k) {
      pwUse(k);
      if (!PW.ws) pwMake('basic');
      if (!PW.col.recs.length) PW.K.seed.forEach(function (r) { var x = { id: PW.col.next++ }; Object.keys(r).forEach(function (key) { x[key] = r[key]; }); x.due = iso(dateOf(r.due)); PW.col.recs.push(x); });
      PW.note = '';
    });
  }
  /* The card Salie proposes: creating the workspace, or changing its layout (a new revision, with the records untouched). */
  function pwCard(k, layout) {
    pwUse(k);
    var K = PW.K, edit = !!PW.ws, rev = edit ? PW.ws.rev : 0;
    return { op: 'workspace', k: k, edit: edit, layout: layout, rev: rev, title: edit ? PW.ws.name : K.name,
      detail: edit ? 'Update “' + PW.ws.name + '” with a new layout. Records are preserved. Review the interface, schemas and display locations below.'
        : 'Create “' + K.name + '” with 1 personal collection. Records are ' + (PW.col ? 'preserved' : 'saved only when you add them') + '. Review the interface, schemas and display locations below.',
      ok: function () { var s = PWS[k]; return edit ? !!s.ws && s.ws.rev === rev : !s.ws; },
      run: function () {
        pwUse(k);
        if (edit) { PW.ws.layout = layout; pwSave('Layout updated. Your records did not change.'); } else pwMake(layout);
        this.saved = PW.ws.rev;
      } };
  }
  /* The page's outline, by section, as the confirmation card lists a saved definition. */
  function pwOutline(layout) {
    var V = pwViews();
    return PW.K.layouts[layout].map(function (n) { return n[0] === 'text' ? 'text' : n[0] === 'view' ? V[n[1]].name : n[0] === 'grid' ? 'Progress and status' : n[1]; });
  }
  /* What the confirmation card shows before anything is saved: where it appears, its fields and record controls, and the
     interface itself with every control switched off. */
  function pwPreview(c) {
    var w = PW.ws, K = PW.K, recs = PW.col ? PW.col.recs : [], V = pwViews(), req = ['title', 'done', K.sel], loc = c.edit ? w.loc : K.loc;
    var fields = '<h4>' + esc(PW.col ? PW.col.name : K.col) + '</h4><ul>' + K.fields.map(function (f) { return '<li>' + f[1] + ' (' + f[0] + ') · ' + f[2] + (req.indexOf(f[0]) > -1 ? ' · required' : ' · optional') + (f[0] === K.sel ? ' · ' + K.opts.join(', ') : '') + '</li>'; }).join('') + '</ul>';
    var ops = Object.keys(V).filter(function (k) { return K.layouts[c.layout].some(function (n) { return n.indexOf(k) > 0; }); }).map(function (k) {
      return '<p>' + V[k].name + ': ' + (V[k].ops ? V[k].ops.join(', ') : 'read only') + (V[k].filt ? ' · ' + K.sel + ' = ' + K.hot : '') + '</p>'; }).join('');
    var prev = c.edit ? '<details><summary>Previous definition and locations</summary><pre>' + esc(JSON.stringify({ id: w.id, name: w.name, icon: w.icon, revision: w.rev, layout: pwOutline(w.layout), visibility: { universal: w.loc.uni, individual: w.loc.ind, team: w.loc.team } }, null, 2)) + '</pre></details>' : '';
    return '<section class="w-pwprev" aria-label="Proposed workspace"><h3>' + ic(c.edit ? w.icon : K.icon, 18) + esc(c.edit ? w.name : K.name) + '</h3>' +
      '<p>' + (c.edit ? 'Editing ' + esc(w.name) + ' · revision ' + w.rev + ' · ' + w.id : 'New workspace · ' + (PW.col ? 'reuses saved personal data' : 'collections start empty')) + '</p>' +
      '<p>Show in: ' + esc(pwLocs(loc)) + '</p>' + (loc.team ? '<p>Private to you. ' + esc(S.team.name) + ' shows it in your sidebar, and teammates cannot see it or its records.</p>' : '') + prev +
      '<details><summary>Review fields and record controls</summary>' + fields + ops + '</details>' +
      '<p>Preview only. Confirm below to save this definition. Existing records keep their IDs and values.</p>' + pwRender(c.layout, { ro: true, recs: recs }) + '</section>';
  }
  function pwCardHTML(c, mi, ci, phone) {
    pwUse(c.k);
    var st = !c.state ? 'Needs you' : c.state === 'yes' ? 'Done' : c.state === 'no' ? 'Declined' : 'Not sent';
    var label = c.edit ? 'Update personal workspace' : 'Save personal workspace', body;
    if (AS.busy && !c.state) body = '<p class="w-mm">Preparing proposal…</p>';
    else if (!c.state) body = pwPreview(c) + '<div class="acts"><button class="w-btn pri sm" type="button" data-a="asst-ok" data-id="' + mi + '" data-v="' + ci + '">Confirm</button><button class="w-btn sm" type="button" data-a="asst-no" data-id="' + mi + '" data-v="' + ci + '">Not now</button></div><p class="w-muted fine">Nothing changes until you confirm. Open until ' + clock(S.now + 15) + '.</p>';
    else if (c.state === 'yes') body = '<p class="res ok">' + ic('check', 14) + 'Done. Saved personal workspace ' + PW.K.id + ', revision ' + c.saved + '.' + ' <button class="link" type="button" data-a="pw-openfrom" data-k="' + c.k + '">Open saved workspace</button>' + '</p>';
    else body = '<p class="res">' + (c.state === 'no' ? 'Not done. You said no.' : 'This changed before you confirmed, so nothing was sent.') + '</p>';
    return '<section class="w-acard" data-state="' + (c.state || 'wait') + '" aria-label="' + label + ': ' + st + '"><p class="w-lab">' + label + '<span class="st"><i></i>' + st + '</span></p><p class="detail">' + esc(c.detail) + '</p>' + body + '</section>';
  }
  /* Both examples have a scripted exchange for making them and for reshaping them. */
  function pwReplies() {
    var out = {};
    PW_KINDS.forEach(function (k) {
      var K = PWK[k], ws = function () { return PWS[k].ws; };
      out[K.create] = { reads: 'Read your saved personal workspaces', ok: function () { return !ws(); }, gone: K.name + ' is already saved on this computer. Open it from the sidebar, or choose Customize with Salie there. I will not create a duplicate.',
        text: function () { return K.say + ' ' + (PWS[k].col ? 'Your earlier records are reused as they are.' : 'It starts empty: only you add or change records.'); },
        textEnd: 7000, cardAt: 8000, endAt: 11000, cards: function () { return [pwCard(k, 'basic')]; } };
      out[K.focus] = { reads: 'Read ' + K.name + ' (revision 1) and its collection schema', ok: function () { return !!ws() && ws().layout === 'basic'; }, gone: NOT_OPEN,
        text: K.focusSay, textEnd: 6000, cardAt: 7500, endAt: 10500, cards: function () { return [pwCard(k, 'focus')]; } };
      out[K.back] = { reads: 'Read ' + K.name + ' and its collection schema', ok: function () { return !!ws() && ws().layout === 'focus'; }, gone: NOT_OPEN,
        text: K.backSay, textEnd: 5000, cardAt: 6500, endAt: 9500, cards: function () { return [pwCard(k, 'basic')]; } };
    });
    return out;
  }

  /* ---- the interface: one renderer for the proposal's preview and the saved page ---- */
  function pwMatch(r, v) { if (!v.filt) return true; return Object.keys(v.filt).every(function (k) { return r[k] === v.filt[k]; }); }
  function pwRender(layout, o) {
    var V = pwViews();
    return '<div class="w-pwstack">' + PW.K.layouts[layout].map(function (n) {
      if (n[0] === 'text') return '<p class="w-pwtext">' + esc(n[1]) + '</p>';
      if (n[0] === 'view') return pwView(V[n[1]], o);
      if (n[0] === 'grid') return '<div class="w-pwgrid">' + n.slice(1).map(function (k) { return pwView(V[k], o); }).join('') + '</div>';
      return '<section class="w-pwcard"><h3>' + esc(n[1]) + '</h3>' + pwView(V[n[2]], o) + '</section>';
    }).join('') + '</div>';
  }
  function pwShown(v, o) {
    var K = PW.K, q = (o.ro ? '' : PW.q[v.id] || '').toLowerCase(), sk = o.ro ? '' : PW.sk[v.id] || '', dir = PW.sd[v.id] === false ? -1 : 1;
    var rows = o.recs.filter(function (r) {
      if (!pwMatch(r, v)) return false;
      if (q && !K.fields.some(function (f) { return pwShow(r[f[0]]).toLowerCase().indexOf(q) > -1; })) return false;
      return ['done', K.sel].every(function (k) { var fv = o.ro ? '' : PW.f[v.id + ':' + k]; return !fv || String(r[k]) === fv; });
    });
    if (sk) rows = rows.slice().sort(function (a, b) { return pwShow(a[sk]).localeCompare(pwShow(b[sk]), undefined, { numeric: true }) * dir; });
    return rows;
  }
  function pwRows(v, o) {
    var K = PW.K, all = o.recs.filter(function (r) { return pwMatch(r, v); }), rows = pwShown(v, o), ops = v.ops || [], upd = ops.indexOf('update') > -1, del = ops.indexOf('delete') > -1;
    var out = '<p class="ct">' + rows.length + ' of ' + all.length + ' records</p>';
    var actions = function (r) {
      return '<div class="ra">' + (upd ? '<button class="w-btn sm" type="button"' + (o.ro ? ' disabled' : ' data-a="pw-edit" data-id="' + r.id + '" data-v="' + v.id + '" aria-label="Edit ' + esc(r.title) + '"') + '>Edit</button>' : '') +
        (del ? '<button class="w-btn sm" type="button"' + (o.ro ? ' disabled' : ' data-a="pw-del" data-id="' + r.id + '" data-v="' + v.id + '" aria-label="Delete ' + esc(r.title) + '"') + '>Delete</button>' : '') + '</div>';
    };
    if (!rows.length) return out + '<p class="none">' + (all.length ? 'No records match these filters.' : 'No records yet. Add your first record to get started.') + '</p>';
    if (v.kind === 'table' && !o.phone) {
      var th = K.fields.map(function (f) {
        var on = !o.ro && PW.sk[v.id] === f[0];
        return '<th scope="col" aria-sort="' + (on ? (PW.sd[v.id] === false ? 'descending' : 'ascending') : 'none') + '"><button type="button"' + (o.ro ? ' disabled' : ' data-a="pw-sort" data-id="' + v.id + '" data-v="' + f[0] + '"') + '>' + f[1] + ic('down', 12) + '</button></th>';
      }).join('') + (upd || del ? '<th scope="col">Actions</th>' : '');
      return out + '<div class="scroll"><table><thead><tr>' + th + '</tr></thead><tbody>' + rows.map(function (r) {
        return '<tr>' + K.fields.map(function (f) { return '<td>' + esc(pwShow(r[f[0]])) + '</td>'; }).join('') + (upd || del ? '<td>' + actions(r) + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>';
    }
    return out + '<ul class="recs">' + rows.map(function (r) {
      var chk = v.kind === 'checklist' ? '<label class="dn"><input class="done" type="checkbox"' + (r.done ? ' checked' : '') + (!upd || o.ro ? ' disabled' : ' data-a="pw-chk" data-id="' + r.id + '"') + ' aria-label="Complete ' + esc(r.title) + '"></label>' : '';
      return '<li>' + chk + '<div class="rc"><strong' + (v.kind === 'checklist' && r.done ? ' class="fin"' : '') + '>' + esc(r.title) + '</strong><dl>' + K.fields.slice(v.kind === 'checklist' ? 2 : 1).map(function (f) { return '<div><dt>' + f[1] + '</dt><dd>' + esc(pwShow(r[f[0]])) + '</dd></div>'; }).join('') + '</dl></div>' + (upd || del ? actions(r) : '') + '</li>';
    }).join('') + '</ul>';
  }
  function pwEditor(v, o) {
    var K = PW.K, r = PW.ed.id == null ? null : o.recs.filter(function (x) { return x.id === PW.ed.id; })[0], d = PW.draft;
    var f = function (k, def) { return d[k] === undefined ? def : d[k]; };
    var x = o.sfx || '';
    return '<form class="editor" data-form="pw-rec" aria-label="' + (r ? 'Edit record' : 'Add record') + '"><h4>' + (r ? 'Edit record' : 'Add record') + '</h4><div class="fields">' +
      '<div class="fld"><label for="pw-title' + x + '">' + pwLabel('title') + ' (required)</label><input id="pw-title' + x + '" name="title" type="text" required maxlength="120" data-pw-d="title" value="' + esc(f('title', '')) + '" placeholder="' + esc(K.ph) + '" autocomplete="off"></div>' +
      '<div class="fld"><label for="pw-due' + x + '">' + pwLabel('due') + '</label><input id="pw-due' + x + '" name="due" type="date" data-pw-d="due" value="' + esc(f('due', '')) + '"></div>' +
      '<div class="fld"><label for="pw-sel' + x + '">' + pwLabel(K.sel) + ' (required)</label><select id="pw-sel' + x + '" name="' + K.sel + '" required data-pw-d="' + K.sel + '">' + K.opts.map(function (p) { return '<option' + (f(K.sel, K.dflt) === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label for="pw-notes' + x + '">' + pwLabel('notes') + '</label><input id="pw-notes' + x + '" name="notes" type="text" data-pw-d="notes" value="' + esc(f('notes', '')) + '" autocomplete="off"></div>' +
      '<div class="fld chk"><label for="pw-done' + x + '">' + pwLabel('done') + ' (required)</label><input id="pw-done' + x + '" name="done" type="checkbox" data-pw-d="done"' + (f('done', false) ? ' checked' : '') + '></div></div>' +
      '<div class="acts"><button class="w-btn pri" type="submit">Save record</button><button class="w-btn" type="button" data-a="pw-cancel">Cancel</button></div></form>';
  }
  function pwView(v, o) {
    var K = PW.K, recs = o.recs, rows = recs.filter(function (r) { return pwMatch(r, v); }), done = rows.filter(function (r) { return r.done; }).length;
    if (v.kind === 'progress') return '<section class="w-pwc" aria-label="' + v.name + '"><div class="pr"><h3>' + v.name + '</h3>' + (rows.length ? '<span class="ct">' + done + ' of ' + rows.length + '</span>' : '') + '</div>' +
      (rows.length ? '<div class="pgs" role="progressbar" aria-valuemin="0" aria-valuemax="' + rows.length + '" aria-valuenow="' + done + '"><span style="width:' + Math.round(done / rows.length * 100) + '%"></span></div>' : '<p class="mut">No total is recorded for this view.</p>') + '</section>';
    if (v.kind === 'status') return '<section class="w-pwc" aria-label="' + v.name + '"><h3 class="big">' + v.name + '</h3><p class="mut"><span class="ok">' + done + ' completed</span> · ' + (rows.length - done) + ' remaining</p></section>';
    if (v.kind === 'chart') {
      var counts = K.opts.map(function (p) { return rows.filter(function (r) { return r[K.sel] === p; }).length; }), peak = Math.max.apply(null, counts.concat(0));
      return '<section class="w-pwc" aria-label="' + v.name + '"><h3>' + v.name + '</h3><div class="bars">' + K.opts.map(function (p, i) {
        return '<div class="bar"><span class="c">' + p + '</span><span class="track"><span style="width:' + (peak ? Math.round(counts[i] / peak * 100) : 0) + '%"></span></span><span class="n">' + counts[i] + '</span></div>'; }).join('') + '</div><p class="mut">' + rows.length + ' records. Unassigned: 0.</p></section>';
    }
    var ops = v.ops || [], uid = o.ro ? '' : v.id;
    var sel = function (k, label, opts) {
      return '<label>' + label + '<select' + (o.ro ? ' disabled' : ' data-pw-f="' + v.id + ':' + k + '"') + '><option value="">All</option>' + opts.map(function (p) { return '<option value="' + p[0] + '"' + (!o.ro && PW.f[v.id + ':' + k] === p[0] ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select></label>';
    };
    var sortSel = v.kind !== 'table' || o.phone ? '<label>Sort by<select' + (o.ro ? ' disabled' : ' data-pw-s="' + v.id + '"') + '><option value="">Record order</option>' + K.fields.map(function (f) { return '<option value="' + f[0] + '"' + (!o.ro && PW.sk[v.id] === f[0] ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select></label>' : '';
    var mine = !o.ro && PW.ed && PW.ed.view === v.id, gone = !o.ro && PW.delId != null && PW.delView === v.id ? o.recs.filter(function (r) { return r.id === PW.delId; })[0] : null;
    return '<section class="w-pwc" aria-label="' + esc(v.name) + '"><div class="vh"><h3>' + esc(v.name) + '</h3>' + (ops.indexOf('create') > -1 ? '<button class="w-btn sm"' + (o.ro ? ' disabled' : ' type="button" data-a="pw-add" data-id="' + v.id + '"' + (PW.ed ? ' disabled' : '')) + '>' + ic('plus', 14) + 'Add record</button>' : '') + '</div>' +
      '<div class="fil"><label class="sch">Filter records<input type="search"' + (o.ro ? ' disabled' : ' data-pw-q="' + v.id + '" value="' + esc(PW.q[v.id] || '') + '"') + ' placeholder="Search this view" autocomplete="off"></label>' +
      (v.kind === 'checklist' || v.kind === 'table' ? sel('done', pwLabel('done'), [['true', 'Yes'], ['false', 'No']]) : '') + sel(K.sel, pwLabel(K.sel), K.opts.map(function (p) { return [p, p]; })) + sortSel + '</div>' +
      (mine ? pwEditor(v, o) : '') +
      (gone ? '<div class="dc" role="group" aria-label="Delete record"><p>Delete “' + esc(gone.title) + '”?</p><button class="w-btn danger" type="button" data-a="pw-delgo">Delete record</button><button class="w-btn" type="button" data-a="pw-cancel">Keep record</button></div>' : '') +
      '<div data-pwr="' + uid + '">' + pwRows(v, o) + '</div></section>';
  }

  /* ---- the saved workspace's page, with its management menu ---- */
  function pwPage() {
    var w = PW.ws, o = { ro: false, recs: PW.col.recs, sfx: 'd' };
    var menu = [['pw-settings', 'Name, icon & locations'], pwVisible() ? ['pw-away', 'Remove from this location'] : null, ['pw-history', 'Definition history'], ['pw-lib', 'Personal data library'], ['pw-delete', 'Delete workspace…']].filter(Boolean).map(function (m) {
      return '<button class="w-btn" type="button" role="menuitem" data-a="' + m[0] + '">' + m[1] + '</button>'; }).join('');
    var head = '<header class="w-pwhead"><div class="ti">' + ic(w.icon, 20) + '<h1>' + esc(w.name) + '</h1></div><button class="w-btn" type="button" data-a="pw-custom">Customize with Salie</button><button class="w-btn" type="button" data-a="pw-reload">Reload workspace</button>' +
      '<div class="more"><button class="w-btn ic" type="button" data-a="pw-menu" aria-haspopup="menu" aria-expanded="' + !!PW.menu + '" aria-label="Manage workspace" title="Manage workspace">' + ic('more') + '</button>' + (PW.menu ? '<div class="menu" role="menu">' + menu + '</div>' : '') + '</div>' + pwManage() + '</header>';
    var team = w.loc.team ? '<details class="team" data-pwteam' + (PW.teamOpen ? ' open' : '') + '><summary>Team projects · ' + esc(S.team.name) + ' · read-only</summary>' + (PW.teamOpen ? '<p class="mut">Read-only · Checked ' + clock(S.now) + '</p><ul><li>' + esc(S.team.project) + '</li></ul>' : '') + '</details>' : '';
    return '<main class="w-main" data-keep="main-pw"><div class="w-pw" data-pw-workspace="' + w.id + '" data-pw-key="' + PW.k + '">' + head + '<div class="w-pwstatus" aria-live="polite">' + esc(PW.note) + '</div>' + pwRender(w.layout, o) + team + '</div></main>';
  }
  function pwManage() {
    var w = PW.ws, p = PW.panel; if (!p) return '';
    var body = '';
    if (p === 'settings') {
      var s = PW.setf || (PW.setf = { name: w.name, icon: w.icon, uni: w.loc.uni, ind: w.loc.ind, team: w.loc.team });
      body = '<form data-form="pw-set"><label class="f">Name<input class="w-input" name="name" data-pw-sf="name" required maxlength="120" value="' + esc(s.name) + '"></label>' +
        '<label class="f">Icon<select class="w-select" name="icon" data-pw-sf="icon" aria-label="Icon">' + PW_ICONS.map(function (i) { return '<option' + (s.icon === i ? ' selected' : '') + '>' + i + '</option>'; }).join('') + '</select></label>' +
        '<fieldset><legend>Show in</legend>' + [['uni', 'Universal'], ['ind', 'Individual'], ['team', S.team.name]].map(function (l) { return '<label><input type="checkbox" name="' + l[0] + '" data-pw-sf="' + l[0] + '"' + (s[l[0]] ? ' checked' : '') + '> ' + esc(l[1]) + '</label>'; }).join('') + '</fieldset>' +
        '<p>Locations control navigation only. Your workspace and personal records stay saved, even with no locations selected. Team display keeps them private to you.</p><div class="acts"><button class="w-btn pri" type="submit">Save changes</button></div></form>';
    } else if (p === 'history') {
      var earlier = w.hist.filter(function (h) { return h.rev < w.rev; }), pick = PW.hsel || (earlier.length ? earlier[earlier.length - 1].rev : 0), shown = PW.hrev && earlier.filter(function (h) { return h.rev === PW.hrev; })[0];
      body = '<h2>Definition history</h2><p>Restore a saved interface as a new revision. Personal records and collection schemas stay current.</p>' +
        (earlier.length ? '<label class="f">Saved revision<select class="w-select" data-pw-h>' + earlier.slice().reverse().map(function (h) { return '<option value="' + h.rev + '"' + (h.rev === pick ? ' selected' : '') + '>Revision ' + h.rev + ' · ' + h.at + '</option>'; }).join('') + '</select></label><div class="acts"><button class="w-btn" type="button" data-a="pw-review">Review revision</button></div>' : '<p>No earlier revisions.</p>') +
        (shown ? '<p>Restore revision ' + shown.rev + ': “' + esc(shown.name) + '”, icon ' + shown.icon + ', ' + ({ basic: 5, focus: 6, table: 1 })[shown.layout] + ' views. Its saved display locations will also be restored.</p><div class="acts"><button class="w-btn" type="button" data-a="pw-restore">Restore this definition</button></div>' : '') + '<p>The latest 100 revisions are listed.</p>';
    } else if (p === 'delete') {
      var c = PW.col, keep = PW.mode === 'keep', kill = PW.mode === 'data' && c.owned;
      body = '<h2>Delete “' + esc(w.name) + '”</h2><div class="acts"><button class="w-btn" type="button" data-a="pw-mode" data-id="keep">Delete workspace only</button><button class="w-btn" type="button" data-a="pw-mode" data-id="data">Delete workspace and its data</button></div><p>Deleting only the workspace keeps all personal collections in the data library for recovery and reuse.</p>' +
        (PW.mode ? '<h3>' + (keep ? 'Keep personal records' : 'Review personal data deletion') + '</h3><p>The workspace definition, its revision history and all navigation entries will be deleted.</p><div class="col"><strong>' + (kill ? 'Delete ' : 'Keep ') + esc(c.name) + '</strong><p>' + c.recs.length + ' personal records. 1 workspace references.</p>' +
          (!kill && !keep ? '<p>Protected: this collection is shared or is not owned by this workspace.</p>' : '') + '</div><p>Existing board tasks, projects, Git information, Team records and shared memory are unaffected. Retained collections remain in the personal data library.</p>' +
          '<label class="cf"><input type="checkbox" data-a="pw-cfm"' + (PW.cfm ? ' checked' : '') + '> I confirm this deletion and the personal data choices above.</label><div class="acts"><button class="w-btn" type="button" data-a="pw-delconfirm"' + (PW.cfm ? '' : ' disabled') + '>Confirm deletion</button></div>' : '');
    }
    return '<section class="manage" aria-label="Workspace management">' + body + '<div class="acts"><button class="w-btn" type="button" data-a="pw-cancel">Cancel</button></div></section>';
  }


  /* On a phone (4.73): the workspace's page has Back, its records, Edit with Salie and a Control Deck button, and no management
     menu and no data library. A table is read as labelled cards. The deck lists every workspace, wherever it is shown on the
     computer, and offers Create with Salie. It is the same workspace and the same records as on the computer. */
  function pwPhone() {
    var w = PW.ws, o = { ro: false, recs: PW.col.recs, phone: true, sfx: 'p' };
    return pageHead(esc(w.name), 'Saved on your computer', 'the Control Deck') + '<div class="w-mpage"><div class="w-pw w-pwphone" data-pw-workspace="' + w.id + '" data-pw-key="' + PW.k + '"><div class="w-pwacts"><button class="w-btn pri" type="button" data-a="pw-custom">Edit with Salie</button>' +
      '<button class="w-btn" type="button" data-a="pw-reload">Reload workspace</button>' +
      // The phone lesson keeps the ninth position for its own Find Bugs key until that is on the deck.
      (G.active && G.mode === 'phone' && !P.deckAdded && P.deckWs !== PW.k ? '' : '<button class="w-btn" type="button" data-a="pw-deck">' + (P.deckWs === PW.k ? 'Remove from Control Deck' : 'Add to Control Deck') + '</button>') + '</div>' +
      '<div class="w-pwstatus" aria-live="polite">' + esc(PW.note) + '</div>' + pwRender(w.layout, o) + '</div></div>';
  }
  function pwDeckSection() {
    if (G.active && G.mode === 'core' && !pwAny()) return '';
    var rows = PW_KINDS.filter(function (k) { return PWS[k].ws; }).map(function (k) { var w = PWS[k].ws; return '<a class="w-pwrow" href="#" data-a="pw-open" data-k="' + k + '">' + ic(w.icon, 18) + '<span>' + esc(w.name) + '</span></a>'; }).join('');
    return '<section class="w-pwdeck" aria-label="Workspaces" data-testid="deck-workspaces"><h2>Workspaces</h2>' + rows +
      '<button class="w-btn" type="button" data-a="pw-create">' + ic('plus', 16) + 'Create with Salie</button>' + (rows ? '<p class="w-muted">To put one on a button, use Edit Deck.</p>' : '') + '</section>';
  }
  /* The ninth key, when a workspace holds it. A workspace that was deleted at the computer says so, and the button can be removed. */
  function pwDeckKey() {
    var w = PWS[P.deckWs] && PWS[P.deckWs].ws;
    return '<a class="w-dkey" href="#" data-a="' + (w ? 'pw-open' : 'pw-deckrm') + '" data-k="' + P.deckWs + '" data-key="workspace" data-mk="k-pw" aria-label="' + (w ? esc(w.name) : 'Removed workspace. Remove this button') + '"><span class="cap"><span class="face"><span class="glyph">' + ic(w ? w.icon : 'folder', 26) + '</span><span class="name">' + (w ? esc(w.name) : 'Removed workspace') + '</span></span></span></a>';
  }
  function pwDeckLibrary() {
    var held = P.deckWs && PWS[P.deckWs] && !PWS[P.deckWs].ws;
    if (G.active || (!pwAny() && !held)) return '';
    var opts = PW_KINDS.filter(function (k) { return PWS[k].ws; }).map(function (k) { var w = PWS[k].ws; return '<button class="w-card w-workflow-option" type="button" data-a="pw-deck" data-k="' + k + '">' + ic(w.icon, 20) + '<span><strong>' + esc(w.name) + '</strong><small>' + (P.deckWs === k ? 'On your deck · remove' : 'Add to your deck') + '</small></span></button>'; }).join('');
    return '<h3 class="w-lab" style="margin-top:6px">Your workspaces</h3><p>Open a workspace you made with Salie. These buttons do not start agents.</p>' + (opts || held ? '<div class="w-workflows">' + opts + (held ? '<button class="w-card w-workflow-option" type="button" data-a="pw-deckrm">' + ic('folder', 20) + '<span><strong>Removed workspace</strong><small>No longer saved. Remove this button</small></span></button>' : '') + '</div>' : '');
  }

  /* ---- the Personal data library ---- */
  function pwLibPage() {
    var cols = PW_KINDS.filter(function (k) { return PWS[k].col; }), saved = PW_KINDS.filter(function (k) { return PWS[k].ws; });
    var rows = cols.map(function (k) {
      var s = PWS[k], c = s.col;
      return '<section class="row" aria-label="' + esc(c.name) + '"><div><h3>' + esc(c.name) + '</h3><p>' + c.recs.length + ' records · ' + (s.ws ? '1 workspace references' : 'Retained data, no workspace') + '</p></div><div class="rs"><button class="w-btn" type="button" data-a="pw-inspect" data-k="' + k + '">Inspect records</button><button class="w-btn" type="button" data-a="pw-reuse" data-k="' + k + '">Use in new workspace</button></div></section>';
    }).join('') || '<p>No personal collections are saved.</p>';
    var seen = cols.filter(function (k) { return PWS[k].inspect; }).map(function (k) {
      pwUse(k);
      return '<h2>Collection records</h2><div class="w-pw w-pwins">' + pwView({ id: 'inspect', name: PW.col.name, kind: 'table', ops: [] }, { ro: true, recs: PW.col.recs }) + '</div>';
    }).join('');
    return '<main class="w-main" data-keep="main-pwlib"><div class="w-pwlib"><header><h1>Personal data library</h1><button class="w-btn" type="button" data-a="pw-reload">Reload library</button></header>' +
      '<p>Collections kept after deleting a workspace remain here. Inspect their records or use them in a new workspace. All data stays on this computer.</p>' +
      (pwLibNote ? '<p role="status" class="sts">' + esc(pwLibNote) + '</p>' : '') +
      (saved.length ? '<h2>Saved workspaces</h2><p>Includes workspaces with no display locations.</p><div class="rs">' + saved.map(function (k) { return '<button class="w-btn" type="button" data-a="pw-open" data-k="' + k + '">' + esc(PWS[k].ws.name) + '</button>'; }).join('') + '</div>' : '') +
      '<h2>Personal collections</h2>' + rows + seen + '</div></main>';
  }
  /* The sidebar's group: Create with Salie (Individual and a Team, not Universal), then each workspace shown here, then the library. */
  function pwRail() {
    var gen = function (attrs, icon, label, cur) { return '<button class="w-nav" type="button" ' + attrs + (cur ? ' aria-current="page"' : '') + ' title="' + esc(label) + '">' + ic(icon) + '<span class="name">' + esc(label) + '</span></button>'; };
    var home = D.ws === 'team' ? 'team' : 'todo';
    return '<div class="w-gen">' + (D.ws === 'universal' ? '' : gen('data-a="pw-create" data-k="' + home + '"', 'plus', 'Create with Salie', false)) +
      PW_KINDS.filter(function (k) { return pwVisible(k); }).map(function (k) { return gen('data-a="pw-open" data-k="' + k + '"', PWS[k].ws.icon, PWS[k].ws.name, D.page === 'pw' && D.pwk === k); }).join('') +
      gen('data-a="page" data-id="pwlib"', 'database', 'Personal data library', D.page === 'pwlib') + '</div>';
  }
  function pwUnder() {
    pwUse(D.pwk);
    if (D.page === 'pw' && !PW.ws) D.page = null;
  }
  function pwRegion(root, id) {
    var v = pwViews()[id], box = root.querySelector('[data-pwr="' + id + '"]');
    if (v && box && PW.col) box.innerHTML = pwRows(v, { ro: false, recs: PW.col.recs, phone: root === phoneRoot });
  }
  function pwOpenPhone(k) {
    dropOverlay(); pwUse(k); if (P.at !== 'pw' || P.pwk !== k) PW.note = '';
    P.at = 'pw'; P.pwk = k; P.task = null; PW.ed = null; PW.delId = null;
    render();
  }
  /* A workspace is shown where it is set to be shown: the page opens in a workspace that lists it. */
  function pwOpen(k) {
    var was = D.page === 'pw' && D.pwk === k; pwUse(k); leave(); dropOverlay();
    if (!pwVisible()) D.ws = PW.ws.loc.ind ? 'individual' : PW.ws.loc.uni ? 'universal' : 'team';
    D.page = 'pw'; D.pwk = k; D.task = null; if (!was) PW.note = '';
    render();
  }
  function pwAway() { leave(); dropOverlay(); if (D.ws !== 'universal' && !D.view) D.view = 'control'; render(); }
  function pwActs(a, id, v, where, root, b) {
    VIEW = where === 'phone' ? P : D;
    // The workspace an action is about: the button's own (the sidebar, the deck, a card), else the page it is on.
    var scope = b && b.closest('[data-pw-key]'), ak = b && b.getAttribute('data-k');
    pwUse(ak || (scope && scope.getAttribute('data-pw-key')) || (where === 'phone' ? P.pwk : D.pwk));
    var c = PW.col, K = PW.K;
    if (a === 'pw-create' || a === 'pw-custom') {
      var ks = ak ? [ak] : scope ? [PW.k] : PW_KINDS;
      if (a === 'pw-create' && ak) G.f['gen-' + ak] = true;
      dropOverlay(); openAsst(where);
      if (!AS.busy && !waitingChanges()) { var offer = pwOpts(ks, a === 'pw-create' && !ak); AS.opts = offer.length ? offer : null; renderAsst(false); }
      return;
    }
    if (a === 'pw-openfrom') { AS.open = false; renderAsst(false); if (where === 'phone') pwOpenPhone(PW.k); else pwOpen(PW.k); return; }
    if (a === 'pw-open') { PW.inspect = false; if (where === 'phone') pwOpenPhone(PW.k); else pwOpen(PW.k); return; }
    if (a === 'pw-deck') {
      if (!PW.ws) return;
      if (P.deckWs === PW.k) { P.deckWs = false; PW.note = 'Removed from the Control Deck.'; toast('Removed from the Control Deck.'); }
      else if (P.deckAdded || P.deckWs) { PW.note = 'Your Control Deck is full. Remove a button first.'; toast('Your Control Deck is full. Remove a button first.'); }
      else { P.deckWs = PW.k; PW.note = 'Added to the Control Deck.'; toast('Added to the Control Deck.'); }
      dropOverlay(); render(); return;
    }
    if (a === 'pw-deckrm') { P.deckWs = false; dropOverlay(); toast('Removed the button.'); render(); return; }
    if (a === 'pw-reload') { PW.note = ''; pwLibNote = ''; render(); toast(D.page === 'pwlib' ? 'Loaded again from this computer.' : 'Loaded again from this computer. Your records are safe.'); return; }
    if (!PW.ws && !c) return;
    switch (a) {
      case 'pw-menu': PW.menu = !PW.menu; render(); var first = PW.menu && root.querySelector('.w-pwhead .menu .w-btn'); if (first) first.focus({ preventScroll: true }); break;
      case 'pw-settings': PW.menu = false; PW.panel = 'settings'; PW.setf = null; render(); break;
      case 'pw-history': PW.menu = false; PW.panel = 'history'; PW.hsel = 0; PW.hrev = 0; render(); break;
      case 'pw-delete': PW.menu = false; PW.panel = 'delete'; PW.mode = ''; PW.cfm = false; render(); break;
      case 'pw-lib': PW.menu = false; PW.panel = ''; leave(); D.page = 'pwlib'; render(); break;
      case 'pw-away':
        PW.menu = false; PW.ws.loc[pwWhere()] = false; pwSave('Removed from ' + (pwWhere() === 'uni' ? 'Universal' : pwWhere() === 'ind' ? 'Individual' : S.team.name) + '. The workspace and its records are still saved.');
        toast('Removed from this location. It is still in the Personal data library.'); pwAway(); break;
      case 'pw-cancel': PW.menu = false; PW.panel = ''; PW.ed = null; PW.delId = null; PW.setf = null; PW.mode = ''; render(); break;
      case 'pw-add':
        PW.ed = { view: id, id: null }; PW.draft = { due: iso(dateOf(3)), done: false }; PW.draft[K.sel] = K.dflt;
        // In the walkthrough the first record is filled in, so the visitor only has to save it.
        if (G.active && G.mode === 'core' && !c.recs.length) { PW.draft.title = K.sample.title; PW.draft[K.sel] = K.sample.sel; PW.draft.due = iso(dateOf(K.sample.due)); }
        render(); var t = root.querySelector('form[data-form="pw-rec"] [name="title"]'); if (t) t.focus({ preventScroll: true }); break;
      case 'pw-edit': var r = c.recs.filter(function (x) { return x.id === +id; })[0]; if (r) { PW.ed = { view: v, id: r.id }; PW.draft = { title: r.title, done: r.done, due: r.due || '', notes: r.notes || '' }; PW.draft[K.sel] = r[K.sel]; PW.delId = null; render(); var t2 = root.querySelector('form[data-form="pw-rec"] [name="title"]'); if (t2) t2.focus({ preventScroll: true }); } break;
      case 'pw-chk': var cr = c.recs.filter(function (x) { return x.id === +id; })[0]; if (cr) { cr.done = !cr.done; PW.note = '“' + cr.title + '” ' + (cr.done ? 'is complete.' : 'is open again.'); if (where === 'phone') G.f['phone-ws-tick'] = true; render(); } break;
      case 'pw-del': PW.delId = +id; PW.delView = v; PW.ed = null; render(); break;
      case 'pw-delgo': var gone = c.recs.filter(function (x) { return x.id === PW.delId; })[0]; c.recs = c.recs.filter(function (x) { return x.id !== PW.delId; }); PW.delId = null; PW.note = gone ? '“' + gone.title + '” was deleted.' : ''; render(); break;
      case 'pw-sort': if (PW.sk[id] === v) PW.sd[id] = PW.sd[id] === false; else { PW.sk[id] = v; PW.sd[id] = true; } render(); break;
      case 'pw-review': var sel = root.querySelector('[data-pw-h]'); PW.hrev = sel ? +sel.value : 0; render(); break;
      case 'pw-restore':
        var h = PW.ws.hist.filter(function (x) { return x.rev === PW.hrev; })[0];
        if (h) { PW.ws.name = h.name; PW.ws.icon = h.icon; PW.ws.layout = h.layout; PW.ws.loc = { uni: h.loc.uni, ind: h.loc.ind, team: h.loc.team }; pwSave('Restored revision ' + h.rev + ' as revision ' + (PW.ws.rev + 1) + '. Your records did not change.'); PW.panel = ''; toast('Restored as a new revision.'); if (!pwVisible()) pwAway(); else render(); }
        break;
      case 'pw-mode': PW.mode = id; PW.cfm = false; render(); break;
      case 'pw-cfm': PW.cfm = !PW.cfm; render(); break;
      case 'pw-delconfirm':
        if (!PW.cfm) break;
        var removed = PW.mode === 'data' && c.owned;
        PW.ws = null; PW.panel = ''; PW.menu = false; PW.mode = ''; PW.cfm = false; PW.ed = null; PW.inspect = false;
        if (removed) PW.col = null;
        leave(); D.page = 'pwlib';
        pwLibNote = removed ? 'Workspace and its exclusively owned personal data deleted.' : 'Workspace deleted. Preserved personal collections are available in the Personal data library.';
        render(); break;
      case 'pw-inspect': PW.inspect = !PW.inspect; render(); break;
      case 'pw-reuse':
        if (PW.ws) { toast(PW.ws.name + ' already uses this collection. Delete it first to reuse the data.'); break; }
        pwMake('table'); PW.inspect = false; pwOpen(PW.k); PW.note = 'Recovered records in a new personal workspace.'; render(); break;
    }
  }
  pwReset();

  /* ---------- Salie: predefined messages, scripted replies ----------
     The person picks one of the messages on offer; there is no text box. Each message has a reply written in advance, which
     streams in word by word, and the next messages on offer follow from it. A reply can carry generated interface (the
     OpenUI blocks the product draws inline: figures, a chart, a table that sorts and filters here, all read only) and
     changes to confirm. Nothing changes until the person confirms it, one card at a time or all at once. Each surface keeps
     its own conversation, as in the product: the desktop assistant reaches the Team workspaces connected to the window, and
     a phone sees Individual only. The replies read the demo's current state. */
  var CARD_LEAD = 'Here is what I will do. Nothing changes until you confirm.';
  var NOT_OPEN = 'That is already settled, so nothing needs to change.';
  var AS = { msgs: [], opts: null, busy: false, timer: null, open: false, cur: null, away: { desk: false, phone: false }, behind: { desk: false, phone: false } };
  function asstFresh() { clearTimeout(AS.timer); AS.msgs = []; AS.opts = null; AS.busy = false; AS.timer = null; AS.cur = null; AS.away = { desk: false, phone: false }; AS.behind = { desk: false, phone: false }; }
  function waitingChanges() {
    var n = 0;
    AS.msgs.forEach(function (m) { (m.cards || []).forEach(function (c) { if (!c.state) n++; }); });
    return n;
  }
  var NEXT_Q = 'What should I do next on my-app?';
  function rootOpts() {
    return ['What is on my plate this week?', 'Plan CSV export for reports', NEXT_Q, 'What needs me today?'];
  }
  function backOpts(extra) {
    var o = (extra || []).concat(['What is on my plate this week?', NEXT_Q, 'What needs me today?']);
    if (!planned()) o.unshift('Plan CSV export for reports');
    return o.filter(function (l, i) { return o.indexOf(l) === i; }).slice(0, 4);
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
    extSched().forEach(function (e) { if (e.tag === 'Individual') rows.push({ at: e.d * 1440 + e.s, d: e.d, s: e.s, title: e.title }); });
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
    extSched().forEach(function (e) { if (e.tag === 'Individual') rows.push([e.title, 'Individual', e.project, 'Planned ' + dayLabel(e.d).split(' ')[0] + ' ' + clock(e.s)]); });
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
    var k = { n: S.team.nextN++, title: DOC.title, st: 'available', by: ME, story: true, desc: DOC.desc };
    S.team.tickets.push(k); return k;
  }
  function taskCard(i) {
    return { op: 'task', i: i, title: PLAN[i].title, dest: 'my-app · Backlog', detail: PLAN[i].agent + '. ' + PLAN[i].desc, done: 'Added to Backlog.',
      ok: function () { return !story(i + 1); }, run: function () { makeTask(i); } };
  }
  function ticketCard() {
    return { op: 'ticket', title: DOC.title, dest: S.team.name + ' · ' + S.team.project + ' · Available', detail: DOC.desc, done: 'Added to Available.',
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

  /* "What should I do next?" At most two suggestions, from fixed rules rather than from the model (the app's recommend_next_actions):
     what the app and your policy require first, then your own decisions, then Git and task state, then habit. A suggestion only
     names a place to go; every action opens an existing screen, where the usual confirmation applies. Memory enters as sources
     Salie cites. The records are scripted for the demo (see MEM). */
  function nextRecs() {
    var ask = S.tasks.filter(function (t) { return t.run && (t.run.st === 'needs' || t.run.st === 'blocked'); })[0];
    var fin = S.tasks.filter(function (t) { return t.run && t.run.st === 'completed'; })[0];
    var wait = S.tasks.filter(function (t) { return t.state === 'backlog' && !waitingFor(t).length && !t.run; })[0];
    var out = [];
    if (ask) out.push({ intent: 'Continue', basis: 'evidence', title: 'Answer the question on “' + ask.title + '”', detail: ask.agent + ' is waiting, and its worktree is kept while you decide.', label: 'Open task', open: { task: ask.id },
      applied: [], rests: [['Current state', 'The agent has waited ' + dur(S.now - ask.run.asked) + ' for an answer.', 'Task']] });
    if (fin) out.push({ intent: 'Branch', basis: 'required', title: 'Review “' + fin.title + '” before it merges', detail: branchOf(fin) + ' is ' + fin.run.ahead + ' commit' + (fin.run.ahead === 1 ? '' : 's') + ' ahead of main, and nothing has been pushed.', label: 'Open task', open: { task: fin.id },
      applied: [['Your decision', 'You merge after reading the diff, on this computer, and share through a pull request.']],
      rests: [['Current state', branchOf(fin) + ' is not on any remote.', 'Git'], ['Your decision', MEM[0].text, MEM[0].id]] });
    if (!out.length && wait) out.push({ intent: 'Next up', basis: 'evidence', title: 'Start “' + wait.title + '”', detail: 'It has no unfinished dependency, so an agent can start it now.', label: 'Open task', open: { task: wait.id },
      applied: [], rests: [['Current state', 'No task it depends on is still open.', 'Task']] });
    if (!out.length) out.push({ intent: 'Find Bugs', basis: 'preference', title: 'Run Find Bugs on my-app', detail: 'The repository has not been scanned in nine days. The report leaves every file unchanged.', label: 'Show on Deck', open: { deck: true },
      applied: [], rests: [['Habit', 'You ran Find Bugs before each of your last three releases.', 'Run']] });
    return out.slice(0, 2);
  }
  function nextText() {
    var r = nextRecs()[0];
    if (r.intent === 'Continue') return 'An agent in my-app is waiting on you, so that comes first. I also read your saved merge policy, which applies once its work is ready to merge.';
    if (r.intent === 'Branch') return 'Finished work is waiting in my-app. Your saved policy is to read the diff before merging, so reviewing it is the next step. I only point you to it: nothing merges from here.';
    if (r.intent === 'Next up') return 'Nothing is waiting on you in my-app, and one task is ready to start. I read your saved policy and decisions too, and none of them stands in its way.';
    return 'Nothing in my-app is waiting on you yet, so I would start with a scan. I also read your saved merge policy, which will matter once there is work to merge. I only suggest: you decide what happens.';
  }

  /* Each key is a message the person can pick. text: the scripted reply (a string, or a function that reads the state).
     next: the messages offered after it. ok and gone: the message is only open while ok() holds. ui: generated interface.
     cards: changes to confirm. */
  var REPLY = {
    'What is on my plate this week?': { reads: 'Read My Work, the schedules and what is waiting in Individual and Northwind', text: plateText, ui: plateUI,
      next: function () { return backOpts(); } },
    'Plan CSV export for reports': { reads: 'Read the reports tasks and project context',
      ok: function () { return !story(1); }, gone: 'The CSV export is already planned. You will find it in Backlog.',
      text: function () { return 'Let’s split this into three scoped tasks for my-app: the endpoint, an export button and tests. ' + ('The API reference needs a page too, so I will add a ticket for ' + S.team.name + '. ') + 'Each task has an agent and clear acceptance criteria, and the tests wait for the other two.'; },
      cards: planCards },
    'What should I do next on my-app?': { reads: 'Read your saved policy and decisions, the repository and the tasks in my-app', text: nextText, recs: nextRecs, memory: true, next: function () { return backOpts(); } },
    'What needs me today?': { reads: 'Read the attention lists', text: needsText,
      next: function () { return backOpts(S.ext.ask.st === 'needs' ? ['Answer the auth test question'] : []); } },
    'What is planned for this week?': { reads: 'Read the schedules in Individual', text: agendaText, next: function () { return backOpts(); } },
    'Answer the auth test question': { reads: 'Read “Fix flaky auth test” and its question',
      text: 'There are two options. Fix the shared clock so the test passes in the full suite, or skip the test for now. Which one should the agent use?',
      ok: function () { return S.ext.ask.st === 'needs'; }, gone: NOT_OPEN, next: function () { return ['Fix the shared clock', 'Skip it for now', 'What needs me today?']; } },
    'Fix the shared clock': { reads: 'Read the task and its question', text: CARD_LEAD, ok: function () { return S.ext.ask.st === 'needs'; }, gone: NOT_OPEN, cards: function () { return [answerCard('Fix the shared clock')]; } },
    'Skip it for now': { reads: 'Read the task and its question', text: CARD_LEAD, ok: function () { return S.ext.ask.st === 'needs'; }, gone: NOT_OPEN, cards: function () { return [answerCard('Skip it for now')]; } }
  };
  // Making each workspace, and reshaping it, are scripted exchanges too: one set for each example (see the workspaces above).
  (function () { var more = pwReplies(); Object.keys(more).forEach(function (k) { REPLY[k] = more[k]; }); })();

  function askAsst(label) {
    var e = REPLY[label];
    if (!e || AS.busy) return;
    if (label === 'What is on my plate this week?') G.f.plate = true;
    if (label === 'Plan CSV export for reports') G.f.planAsk = true;
    if (label === NEXT_Q) G.f.nextAsk = true;
    PW_KINDS.forEach(function (k) { if (label === PWK[k].create) G.f['ask-' + k] = true; });
    AS.msgs.push({ r: 'me', x: label });
    AS.opts = [];
    if (e.ok && !e.ok()) { replyAsst({ text: e.gone, next: backOpts }); return; }
    replyAsst(e);
  }
  /* One cancellable timeline streams text, then builds generated blocks and proposals in order.
     Reduced motion changes presentation, never the amount of simulated work. */
  function replyAsst(e) {
    var as = AS, text = typeof e.text === 'function' ? e.text() : e.text;
    var replies = AS.msgs.filter(function (x) { return x.r === 'ai'; }).length;
    // One of the six approved studies, in order, fixed for the reply. The record is read by whichever node draws the mark.
    var m = { r: 'ai', x: '', reads: e.reads || '', done: false, cards: null, ui: null, open: false, stage: 'Reading workspace context…', steps: [{ x: 'Reading workspace context', done: false }],
      mark: { study: M.studies[replies % M.studies.length], t0: performance.now(), stopAt: null } };
    var words = text.split(' '), events = [], complex = !!(e.ui || e.cards || e.recs), recs = e.recs ? e.recs() : null;
    as.msgs.push(m); as.busy = true; as.cur = m;
    function at(time, fn) { events.push({ time: time * ASK_PACE, fn: fn }); }
    function redraw() {
      renderAsst('auto'); renderPhone();
    }
    var textEnd = complex ? (e.textEnd || 11500) : Math.max(5000, Math.min(12000, words.length * 155));
    var chunk = WB.reduced ? 7 : 1;
    for (var i = chunk; i < words.length + chunk; i += chunk) (function (n) {
      at(1800 + (textEnd - 1800) * n / words.length, function () {
        m.x = words.slice(0, n).join(' '); setStage(m, 'Writing the reply…'); paintReply(m);
      });
    })(Math.min(i, words.length));
    if (e.ui) {
      var u = e.ui(), count = 4 + u.bars.length + 1 + u.rows.length;
      u.progress = 0;
      for (var j = 1; j <= count; j++) (function (n) {
        at(13500 + (32000 - 13500) * (n - 1) / Math.max(1, count - 1), function () {
          m.ui = u; u.progress = n;
          setStage(m, n <= 4 ? 'Building your overview…' : n <= 4 + u.bars.length ? 'Grouping work by project…' : 'Adding your work items…'); redraw();
        });
      })(j);
    }
    if (e.cards) {
      var cards = e.cards(); m.cards = [];
      cards.forEach(function (c, j) { at((e.cardAt || 15000) + j * 5000, function () {
        m.cards.push(c); setStage(m, 'Preparing proposed changes · ' + (j + 1) + ' of ' + cards.length); redraw();
      }); });
    }
    if (recs) {
      m.recs = [];
      recs.forEach(function (r, j) { at(12500 + j * 3000, function () { m.recs.push(r); setStage(m, 'Weighing your policy and the repository…'); redraw(); }); });
      at(12500 + recs.length * 3000, function () { m.mem = true; setStage(m, 'Citing what I read…'); redraw(); });
    }
    at(e.ui || e.cards ? (e.endAt || 35000) : recs ? 12500 + recs.length * 3000 + 3500 : textEnd + 800, function () {
      as.busy = false; as.timer = null; as.cur = null; m.done = true; m.x = text; finishSteps(m);
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
    // What the person sent arrives (160 ms); a conversation that was restored does not replay.
    [deskRoot, phoneRoot].forEach(function (root) {
      var me = root && root.querySelectorAll('.w-ame'), last = me && me[me.length - 1];
      if (last) M.animate(last, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], 160);
    });
  }
  /* What a reply reports as it goes: the line under it names the stage, and opens to the stages so far. */
  function setStage(m, s) {
    var name = s.replace(/…$/, '').replace(/ · \d+ of \d+$/, '');
    m.stage = s;
    if (m.steps[m.steps.length - 1].x === name) return;
    m.steps[m.steps.length - 1].done = true;
    m.steps.push({ x: name, done: false });
  }
  function finishSteps(m) { m.steps.forEach(function (x) { x.done = true; }); }
  /* Stop stays pending until the work reports that it has stopped (here, a moment later); the mark settles back meanwhile, and
     what had already been written stays. Nothing proposed is offered: a half-made change is not one to confirm. */
  function stopAsst() {
    var m = AS.cur;
    if (!AS.busy || !m || m.stopping) return;
    m.stopping = true; m.mark.stopAt = performance.now();
    clearTimeout(AS.timer); AS.timer = null;
    paintReply(m); renderAsst('auto');
    setTimeout(function () {
      if (AS.msgs.indexOf(m) < 0) return;
      m.stopped = true; m.done = true; m.ui = null; m.cards = null; m.recs = null; m.mem = false; finishSteps(m);
      AS.busy = false; AS.cur = null; AS.opts = backOpts();
      renderAsst('auto'); renderPhone(); render();
    }, 900);
  }
  /* Writes the new words of a reply that is still streaming, in each surface that shows the conversation. What was already there
     stays still; the words that just arrived fade in (120 ms). A reader who scrolled up, or selected text, is left where they are. */
  function nearEnd(chat, within) { return chat.scrollHeight - chat.scrollTop - chat.clientHeight < within; }
  function selecting(node) { var sel = document.getSelection(); return !!sel && !sel.isCollapsed && node.contains(sel.anchorNode); }
  function setBehind(kind, on) {
    AS.behind[kind] = on;
    var root = kind === 'desk' ? deskRoot : phoneRoot, b = root && root.querySelector('.w-latest');
    if (b) b.hidden = !on;
  }
  function paintReply(m) {
    var at = AS.msgs.indexOf(m);
    [['desk', deskRoot], ['phone', phoneRoot]].forEach(function (pair) {
      var kind = pair[0], root = pair[1];
      var o = root && root.querySelector('[data-overlay]'), chat = o && o.querySelector('.w-achat');
      var box = chat && chat.querySelector('[data-m="' + at + '"]'), node = box && box.querySelector('.w-atext');
      if (!node) return;
      var follow = !AS.away[kind] && nearEnd(chat, 80) && !selecting(chat);
      var stage = box.querySelector('[data-stage]');
      if (stage) stage.textContent = m.stopping ? 'Stopping…' : m.stage;
      node.hidden = !m.x;
      M.stream(node.querySelector('[data-stream]'), m.x, true);
      if (follow) chat.scrollTop = chat.scrollHeight; else if (m.x) setBehind(kind, true);
    });
  }
  /* New response below: back to the tail over 180 ms. Scrolling again interrupts it. */
  function jumpLatest(kind) {
    var root = kind === 'desk' ? deskRoot : phoneRoot, chat = root && root.querySelector('.w-achat');
    AS.away[kind] = false; setBehind(kind, false);
    if (!chat) return;
    if (M.reduced()) { chat.scrollTop = chat.scrollHeight; return; }
    var from = chat.scrollTop, start = performance.now();
    (function step(now) {
      if (AS.away[kind]) return;
      var p = Math.min(1, (now - start) / 180);
      chat.scrollTop = from + (chat.scrollHeight - chat.clientHeight - from) * (1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(step); else chat.scrollTop = chat.scrollHeight;
    })(start);
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
      leave();
      if (c && c.op === 'ticket') { D.ws = 'team'; D.tv = 'board'; } else { D.ws = 'individual'; D.proj = 'my-app'; D.view = 'board'; D.task = null; }
    } else { P.at = c && c.op === 'ticket' ? 'team' : 'project'; P.proj = 'my-app'; P.teamTab = 'board'; P.tab = 'board'; P.task = null; P.col = 'backlog'; }
    render();
  }
  /* Both surfaces draw the conversation while it is open. Each keeps its own scroll, and follows the tail only while its reader does. */
  function renderAsst(stick) {
    [['desk', deskRoot, D], ['phone', phoneRoot, P]].forEach(function (trio) {
      var kind = trio[0], root = trio[1], V = trio[2], o = root && root.querySelector('[data-overlay]');
      if (!o) return;
      if (!AS.open) { if (o.querySelector('.w-asst')) setOverlay(root, ''); return; }
      var store = V === P ? P.scroll : D.scroll, fk = focusKey(o), old = o.querySelector('.w-achat');
      var follow = stick === 'auto' ? !old || (!AS.away[kind] && nearEnd(old, 90) && !selecting(old)) : stick;
      if (follow) { AS.away[kind] = false; AS.behind[kind] = false; } else if (stick === 'auto') AS.behind[kind] = true;
      keepScroll(o, store);
      o.innerHTML = assistantHTML(V === P);
      restoreScroll(o, store);
      var chat = o.querySelector('.w-achat');
      if (chat && follow) chat.scrollTop = chat.scrollHeight;
      o.querySelectorAll('.w-livemark').forEach(function (node) { var m = AS.msgs[+node.dataset.mi]; if (m && m.mark) M.mark(node, m.mark); });
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
      '<div class="w-achatwrap"><div class="w-achat" data-keep="achat"><div class="w-acol">' + chatHTML(phone) + '</div></div>' +
      '<button class="w-latest" type="button" data-a="asst-latest"' + (AS.behind[phone ? 'phone' : 'desk'] ? '' : ' hidden') + '>' + ic('down', 12) + 'New response below</button></div>' + dockHTML(phone) + '</div>';
  }
  function chatHTML(phone) {
    if (!AS.msgs.length) return '<div class="w-aempty">' + mark(40) + '<h2>What can I help with?</h2><p>Pick a message below. I will ask you before I change anything.</p></div>';
    return AS.msgs.map(function (m, i) {
      if (m.r === 'me') return '<div class="w-ame"><p>' + esc(m.x) + '</p></div>';
      // While a reply is being written: the pixel mark and what it is doing, opening to the stages reported so far.
      var line = m.done ? '' : '<div class="w-activity"><button class="w-progress" type="button" data-a="asst-act" data-id="' + i + '" aria-expanded="' + !!m.actOpen + '">' + M.markHTML(24, m.mark.study, i) + '<span data-stage>' + esc(m.stopping ? 'Stopping…' : m.stage || 'Working on it…') + '</span></button>' +
        (m.actOpen ? '<ul class="w-actsteps">' + m.steps.map(function (x) { return '<li>' + esc(x.x) + ' · ' + (x.done ? 'Completed' : m.stopping ? 'Stopping' : 'Running') + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      var cards = m.cards ? m.cards.map(function (c, ci) { return assistCardHTML(c, i, ci, phone); }).join('') : '';
      var left = m.done && m.cards ? m.cards.filter(function (c) { return !c.state; }).length : 0;
      var bar = left >= 2 ? '<div class="w-aall" role="group" aria-label="All the changes waiting"><span>' + left + ' changes are waiting for you.</span><button class="w-btn pri sm" type="button" data-a="asst-all" data-id="' + i + '" data-v="yes">Confirm all ' + left + '</button><button class="w-btn sm" type="button" data-a="asst-all" data-id="' + i + '" data-v="no">Not now</button></div>' : '';
      var sugs = m.recs && m.recs.length ? '<section class="w-sugs" aria-label="Suggested next steps">' + m.recs.map(function (r, ri) { return recHTML(r, i, ri, phone); }).join('') + '</section>' : '';
      var mem = m.mem ? '<details class="w-reads w-mem" data-j="' + i + '"' + (m.memOpen ? ' open' : '') + '><summary>Memory sources (' + MEM.slice(0, 2).length + ')</summary><ul>' + MEM.slice(0, 2).map(function (r) {
        return '<li><strong>' + r.id + '</strong> · Your private memory · ' + r.kind + ' · ' + r.ver + ' · current<p>' + esc(r.text) + '</p><p class="w-mm">' + esc(r.ref) + ' · Updated ' + r.upd + '</p></li>'; }).join('') + '</ul></details>' : '';
      return '<div class="w-aai" data-m="' + i + '"><p class="w-atext"' + (m.x ? '' : ' hidden') + '><span data-stream>' + esc(m.x) + '</span></p>' + (m.ui ? uiHTML(m.ui, i) : '') + line + sugs + mem +
        (m.reads ? '<details class="w-reads" data-i="' + i + '"' + (m.open ? ' open' : '') + '><summary>What I looked at</summary><p>' + esc(m.reads) + '</p></details>' : '') +
        (m.done ? '<p class="w-astat" role="status">' + (m.stopped ? 'Stopped.' : 'Reply finished.') + '</p>' : '') + cards + bar + (m.result ? '<p class="w-aresult" role="status">' + esc(m.result) + '</p>' : '') + '</div>';
    }).join('');
  }
  /* One suggestion: what to do, why, where it leads, and a way to say whether it helped. */
  var BASIS = { required: ['ask', 'Needed first'], evidence: ['work', 'From current state'], preference: ['idle', 'From how you work'] };
  function recHTML(r, mi, ri, phone) {
    if (r.fb === 'dismissed' || r.fb === 'not_useful') return '<p class="w-sugnote" role="status">' + (r.fb === 'dismissed' ? 'Dismissed. It stays hidden for now.' : 'Noted as not useful.') + '</p>';
    var b = BASIS[r.basis];
    var act = r.open.deck ? (phone ? '<button class="w-btn pri sm" type="button" data-a="sug-open" data-id="' + mi + '" data-v="' + ri + '">' + r.label + '</button>' : '<span class="w-muted fine">Start it from the Control Deck on your phone.</span>')
      : '<button class="w-btn pri sm" type="button" data-a="sug-open" data-id="' + mi + '" data-v="' + ri + '">' + r.label + '</button><span class="w-muted fine">Nothing starts until you decide there.</span>';
    var why = '<details class="w-why"><summary>Why this</summary>' + (r.applied.length ? '<p class="w-lab">What shaped it</p><ul>' + r.applied.map(function (a) { return '<li><span class="w-chip">' + a[0] + '</span> ' + esc(a[1]) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="w-lab">What it rests on</p><ul>' + r.rests.map(function (e) { return '<li><span class="w-chip">' + e[0] + '</span> ' + esc(e[1]) + ' <span class="w-mm">' + esc(e[2]) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="w-muted fine">' + (r.basis === 'preference' ? 'Part of this is inferred from how you work' : 'Everything here is verified and current') + '. Habits and feedback only choose between ways that policy, permissions and the repository already allow.</p></details>';
    var fb = r.fb === 'useful' ? '<p class="w-muted fine" role="status">Noted as useful.</p>' : '<div class="w-sugfb" role="group" aria-label="Was this useful?">' + [['useful', 'Useful'], ['not_useful', 'Not useful'], ['dismissed', 'Dismiss']].map(function (o) { return '<button class="w-btn quiet sm" type="button" data-a="sug-fb" data-id="' + mi + '" data-v="' + ri + ':' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
    return '<article class="w-sug" data-basis="' + r.basis + '"><p class="kick">' + dot(b[0]) + '<b>' + b[1] + '</b><span class="w-mm">' + r.intent + '</span></p><h3>' + esc(r.title) + '</h3><p class="detail">' + esc(r.detail) + '</p><div class="acts">' + act + '</div>' + why + fb + '</article>';
  }
  function openSuggestion(where, mi, ri) {
    var r = AS.msgs[mi] && AS.msgs[mi].recs && AS.msgs[mi].recs[ri]; if (!r) return;
    AS.open = false; renderAsst(false); leave();
    if (r.open.deck) { P.at = 'deck'; P.task = null; toast('Find Bugs is a workflow button. Add it to an empty position on the deck, then tap it.'); }
    else if (where === 'desk') { var ot = get(r.open.task); D.ws = 'individual'; D.proj = ot && ot.project || 'my-app'; D.view = 'board'; D.task = r.open.task; D.ptab = 'activity'; }
    else { P.at = 'project'; P.proj = 'my-app'; P.tab = 'board'; P.task = r.open.task; P.ptab = 'activity'; }
    render();
  }
  function assistCardHTML(c, mi, ci, phone) {
    if (c.op === 'workspace') return pwCardHTML(c, mi, ci, phone);
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
  function dockHTML(phone) {
    var pills = (waitingChanges() ? [] : optsNow()).map(function (o) { return '<button class="w-apill" type="button" data-a="asst-ask" data-id="" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('');
    var note = AS.busy ? '' : waitingChanges() ? 'Confirm or decline the changes above to continue.' : 'Pick a message. Replies are scripted in this demo, and nothing is sent to a model.';
    var stop = AS.busy ? '<div class="w-stoprow"><button class="w-btn" type="button" data-a="asst-stop"' + (AS.cur && AS.cur.stopping ? ' disabled' : '') + '>' + ic('stop', 14) + (AS.cur && AS.cur.stopping ? 'Stopping…' : 'Stop') + '</button><p class="w-anote">' + (AS.cur && AS.cur.stopping ? 'Waiting for the work to confirm it has stopped.' : 'Working on it.') + '</p></div>' : '';
    return '<div class="w-acol w-adock">' + (pills ? '<div class="w-apills" role="group" aria-label="Predefined messages">' + pills + '</div>' : '') + stop + (note ? '<p class="w-anote">' + note + '</p>' : '') + '</div>';
  }

  /* ---------- toasts ---------- */
  var toastTimer, toastAct = null;
  // A message stays up for as long as it takes to read: a base time plus a little per character, so a longer note lingers
  // proportionally longer (about 3.9s at 40 characters, 5.8s at 100, 8s at 170) and never more than 9s.
  function toastTime(m) { return Math.min(9000, 2600 + 32 * String(m).length); }
  /* A notice can offer the place a change landed (act: where, label, run); it then stays up for six seconds, as in the app. */
  function toast(m, act) {
    toastAct = act || null;
    [deskMount, phoneMount].forEach(function (root) {
      var el = root && root.querySelector('.w-toast');
      if (!el) return;
      var mine = act && act.where === (root === phoneMount ? 'phone' : 'desk');
      el.innerHTML = esc(m) + (mine ? '<button class="act" type="button" data-a="toastact">' + esc(act.label) + '</button>' : '');
      el.classList.toggle('has-act', !!mine); el.classList.add('show');
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { document.querySelectorAll('.w-toast').forEach(function (el) { el.classList.remove('show', 'has-act'); }); toastAct = null; }, act ? 6000 : toastTime(m));
  }
  /* On the phone's board, a card that moved to a column other than the one on show can be followed there. */
  function viewIn(col, label) {
    if (VIEW !== P || P.at !== 'project' || P.tab !== 'board' || P.col === col) return null;
    return { where: 'phone', label: 'View in ' + label, run: function () { P.col = col; P.task = null; render(); } };
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

  /* api-server has two agents beside my-app. The question is answered from Workspace, from Universal or by Salie. */
  function extTask() {
    var a = S.ext.ask, answered = a.st !== 'needs', start = a.asked - 14;
    var logs = ['Reading internal/auth/session_test.go', 'The test passes alone and fails in the full suite', 'It shares a clock with the token tests'];
    if (answered) logs = logs.concat([a.answer === 'Skip it for now' ? 'Skipping the test with a note, as asked' : 'Giving the session and token tests their own clock', 'Running go test ./internal/auth -count=20', '20 passed in 6.3s']);
    var feed = [{ k: 'sys', x: 'Agent started', t: start }].concat(logs.slice(0, 3).map(function (l, i) { return { k: 'out', x: l, t: start + 1 + i }; }), [{ k: 'q', x: a.q, t: a.asked }]);
    if (answered) feed = feed.concat([{ k: 'me', x: a.answer, t: a.asked + 1 }], logs.slice(3).map(function (l, i) { return { k: 'out', x: l, t: a.asked + 2 + i }; }));
    var t = T(a.id, a.title, 'doing', a.agent, a.prio, { project: a.project, ro: true, desc: 'The session test fails about one run in ten. Find the race, fix it, and keep the test.' });
    t.run = { st: a.st, el: S.now - start, id: 'run-6b3e', logs: logs, li: logs.length, feed: feed, q: a.q, choices: a.choices, asked: a.asked, started: start };
    return t;
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
    var rows = [];
    ['api-server', 'marketing-site'].forEach(function (p) {
      projTasks(p).forEach(function (t) {
        if ((t.state === 'doing' || t.state === 'review') && t.run && !t.archived) rows.push({ ws: 'individual', wsName: 'Individual', project: p, title: t.title, status: t.state, exec: execOf(t.run), go: 'ind:' + t.id });
      });
    });
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
    var k = tix(n); if (!k || k.who || k.st !== 'available') return;
    k.st = 'progress'; k.who = ME; k.claimedAt = S.now; k.waiting = true; k.fresh = true; k.branch = 'wb-' + k.n + '-' + slug(k.title);
    toast('Claimed. It is yours, and now In Progress, waiting for you to start. Your branch will be ' + k.branch + '.');
  }
  function startWork(n) {
    var k = tix(n); if (!k || k.st !== 'progress' || k.who !== ME || !k.waiting) return;
    k.waiting = false; k.exec = 'running'; k.active = true; k.fresh = true;
    toast('Your agent is working on ' + k.branch + ', on your computer. Teammates see only that it is active.');
  }
  /* A ticket's conversation. Only an explicit @mention of a member notifies anyone, and the mention is bound to the member. */
  function unreadMentions() {
    var out = [];
    S.team.tickets.forEach(function (k) { (k.comments || []).forEach(function (c, i) { if (c.unread && (c.mentions || []).indexOf(ME) > -1) out.push({ k: k, c: c, i: i }); }); });
    return out;
  }
  function commentHTML(text) {
    var out = esc(text);
    S.team.members.forEach(function (m) { out = out.split('@' + esc(m[0])).join('<span class="w-mention">@' + esc(m[0]) + '</span>'); });
    return out;
  }
  function postComment(n, text) {
    var k = tix(n); text = (text || '').trim(); if (!k || !text) return false;
    var named = S.team.members.map(function (m) { return m[0]; }).filter(function (name) { return name !== ME && text.indexOf('@' + name) > -1; });
    (k.comments = k.comments || []).push({ by: ME, at: S.now, text: text, mentions: named });
    toast(named.length ? named.join(' and ') + (named.length === 1 ? ' is' : ' are') + ' notified. Only an explicit mention notifies anyone.' : 'Posted. Nobody is notified unless you mention them.');
    return true;
  }
  function signoff(n) {
    var k = tix(n); if (!k || k.st !== 'review' || !k.pr || k.pr.state !== 'merged') return;
    k.st = 'done'; k.fresh = true;
    toast('WB-' + k.n + ' is done. Its pull request was already merged on the Git host.');
  }

  /* Settings, Devices & Hosting and Help are pages of the window: any other place in the sidebar leaves them. */
  function leave() { D.set = null; D.page = null; PW_KINDS.forEach(function (k) { pwIdle(PWS[k]); }); pwLibNote = ''; }
  var PROJVIEWS = ['overview', 'board', 'calendar', 'git', 'runs', 'psettings'];
  function inProject() { return D.ws === 'individual' && PROJVIEWS.indexOf(D.view) > -1 && D.set === null && !D.page; }
  /* What a project has going: its agents' work and what waits for a person. */
  function projStats(p) {
    var ts = projTasks(p).filter(function (t) { return !t.archived; });
    return { running: ts.filter(function (t) { return t.run && t.run.st === 'running'; }).length, asks: ts.filter(function (t) { return t.run && (t.run.st === 'needs' || t.run.st === 'blocked'); }).length,
      review: ts.filter(function (t) { return t.state === 'review'; }).length, open: ts.filter(function (t) { return t.state !== 'done'; }).length };
  }
  function statsText(p) {
    var st = projStats(p);
    return [st.asks ? st.asks + ' needs input' : '', st.running ? st.running + ' running' : '', st.review ? st.review + ' in review' : ''].filter(Boolean).join(' · ') || 'quiet';
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
      body = [['mywork', 'My Work', 'check', 0], ['inbox', 'Workspaces', 'control', needsAll()], ['calendar', 'Calendar', 'calendar', 0]].map(function (p) {
        return navBtn('data-a="uv" data-id="' + p[0] + '"', p[2], p[1], D.uv === p[0], p[3]);
      }).join('');
    } else if (D.ws === 'individual') {
      var ask = S.ext.ask.st === 'needs';
      var pj = function (name, badge) {
        return '<button class="w-nav proj" type="button" data-a="proj" data-id="' + name + '"' + (D.proj === name && PROJVIEWS.indexOf(D.view) > -1 ? ' aria-current="page"' : '') + '><span class="sq"></span><span class="name">' + name + '</span>' + badge + '</button>';
      };
      body = '<div class="w-sec"><span>Individual</span></div>' +
        navBtn('data-a="view" data-id="control"', 'overview', 'Workspace', D.view === 'control', ni) +
        navBtn('data-a="view" data-id="projects"', 'folder', 'Projects', D.view === 'projects', 0) +
        pj('api-server', ask ? '<span class="w-num pend">1</span>' : '<span class="n">' + projStats('api-server').running + '</span>') +
        pj('marketing-site', '<span class="n">' + projStats('marketing-site').running + '</span>') +
        pj('my-app', n ? '<span class="w-num pend">' + n + '</span>' : act ? '<span class="n">' + act + '</span>' : '') +
        '<button class="w-nav proj add" type="button" data-a="addproject">' + ic('plus', 14) + 'Add project</button>' +
        navBtn('data-a="view" data-id="analytics"', 'analytics', 'Analytics', D.view === 'analytics', 0);
    } else {
      var reviews = rowsTeam().length + unreadMentions().length;
      body = '<div class="w-sec"><span>' + esc(S.team.name) + '</span></div>' +
        navBtn('data-a="tv" data-id="home"', 'overview', 'Workspace', D.tv === 'home', reviews) +
        navBtn('data-a="tv" data-id="projects"', 'folder', 'Projects', D.tv === 'projects', 0) +
        '<button class="w-nav proj" type="button" data-a="tv" data-id="board"' + (['board', 'git', 'activity'].indexOf(D.tv) > -1 ? ' aria-current="page"' : '') + '><span class="sq"></span><span class="name">' + esc(S.team.project) + '</span></button>' +
        navBtn('data-a="tv" data-id="reviews"', 'merge', 'Reviews', D.tv === 'reviews', reviews) +
        navBtn('data-a="tv" data-id="members"', 'people', 'Members', D.tv === 'members', 0) +
        navBtn('data-a="tv" data-id="analytics"', 'analytics', 'Analytics', D.tv === 'analytics', 0);
    }
    // Settings is a page of its own: while it is open, no other place in the sidebar is current.
    if (D.set !== null || D.page) body = body.replace(/ aria-current="page"/g, '');
    body += pwRail();
    var foot = '<div class="w-rfoot"><button class="w-nav" type="button" data-a="settings"' + (D.set !== null ? ' aria-current="page"' : '') + '>' + ic('settings') + 'Settings</button>' +
      '<div class="w-rrow"><button class="w-nav w-devices" type="button" data-a="page" data-id="devices"' + (D.page === 'devices' ? ' aria-current="page"' : '') + '><span class="w-ic">' + ic('runner') + '</span><span>Devices &amp; Hosting</span></button>' +
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
    D.ws = id; D.task = null; D.pick = null; leave();
    render();
  }
  /* Where a row of Universal opens: the place it lives in. */
  function jump(dest) {
    dropOverlay();
    leave();
    if (dest.indexOf('proj:') === 0) { D.ws = 'individual'; D.proj = dest.slice(5); D.view = 'calendar'; D.task = null; }
    else if (dest.indexOf('ind:') === 0) { var jt = get(+dest.slice(4)); D.ws = 'individual'; D.proj = jt && jt.project || 'my-app'; D.view = 'board'; D.task = +dest.slice(4); D.ptab = 'activity'; }
    else if (dest === 'team:reviews') { D.ws = 'team'; D.tv = 'reviews'; }
    else if (dest === 'team') { D.ws = 'team'; D.tv = 'board'; }
    render();
  }

  /* ================= Universal: My Work, Workspaces and Calendar across workspaces ================= */
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
      return '<section class="w-ugroup" aria-label="' + esc(g[1]) + '"><h2>' + wsTag(g[0], g[1]) + '<span class="count">' + rs.length + '</span></h2><ul class="w-ulist" data-mp="mw-' + g[0] + '">' + rs.map(function (w) {
        var badge = w.exec ? '<span class="w-xb" data-tone="' + EXECTONE[w.exec] + '"><i class="w-dot" data-tone="' + EXECTONE[w.exec] + '"></i>Reported: ' + EXECWORD[w.exec] + '</span>' : '<span></span>';
        return '<li data-mk="w' + w.go + '"><button class="w-wrow" type="button" data-a="go" data-v="' + w.go + '"><span class="ti">' + esc(w.title) + '</span><span class="pj">' + esc(w.project) + '</span><span class="stt">' + status[w.status] + '</span>' + badge + '</button></li>';
      }).join('') + '</ul></section>';
    }).join('');
    return upage('My Work', lede, groups);
  }
  function inboxRowHTML(r) {
    if (r.ws === 'team') {
      var k = r.k;
      return '<li data-mk="ik' + k.n + '"><div class="w-irow"><i class="w-dot" data-tone="ok"></i><span class="tx"><span class="ti">WB-' + k.n + ' ' + esc(k.title) + '</span><span class="cx">' + wsTag('team', S.team.name) + '<span>' + esc(S.team.project) + '</span></span><span class="dt">' + esc(k.who) + ' asked for your review. Pull request #' + k.pr.n + ' is merged.</span></span><span class="ac"><button class="w-btn sm pri" type="button" data-a="go" data-v="team:reviews">Review changes</button></span></div></li>';
    }
    var t = r.t, q = r.kind === 'question';
    return '<li data-mk="it' + t.id + '"><div class="w-irow"><i class="w-dot" data-tone="' + (q ? 'ask' : 'ok') + '"></i><span class="tx"><span class="ti">' + esc(t.title) + '</span><span class="cx">' + wsTag('individual', 'Individual') + '<span>' + esc(r.project) + '</span></span><span class="dt">' +
      (q ? (t.prio === 'high' ? 'High priority. ' : '') + esc(t.agent) + ' asks: ' + esc(t.run.q) : r.kind === 'blocked' ? 'Stopped rather than guess. ' + esc(t.run.q) : 'Finished and ready for review.') + '</span></span><span class="ac">' +
      (q || r.kind === 'blocked' ? t.run.choices.map(function (c) { return '<button class="w-btn sm" type="button" data-a="answer" data-id="' + t.id + '" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('')
        : '<button class="w-btn sm pri" type="button" data-a="go" data-v="ind:' + t.id + '">Review changes</button>') + '</span></div></li>';
  }
  function inboxHTML() {
    var rows = rowsAll();
    return upage('Workspaces', 'Questions, blockers, reviews and warnings from all your workspaces',
      rows.length ? '<section class="w-ugroup" aria-label="Action needed"><h2>Action needed<span class="count">' + rows.length + '</span></h2><ul class="w-ulist" data-mp="inbox">' + rows.map(inboxRowHTML).join('') + '</ul></section>' : '<p class="w-uempty">Nothing needs you.</p>');
  }
  function ucalHTML() {
    var tl = D.cal === 'timeline';
    var seg = '<div class="w-seg" role="group" aria-label="Calendar presentation"><button type="button" data-a="calmode" data-id="calendar" aria-pressed="' + !tl + '">Calendar</button><button type="button" data-a="calmode" data-id="timeline" aria-pressed="' + tl + '">Timeline</button></div>';
    return '<header class="w-ghead"><div class="w-uh"><h1>' + (tl ? 'Timeline' : 'Calendar') + '</h1><p class="w-lede">' + (tl ? 'Planned dates across all projects' : 'Scheduled and planned work across all projects') + '</p></div>' + seg + '</header>' +
      (tl ? '<main class="w-main" data-keep="main-u-timeline">' + timelineHTML() + '</main>' : '<main class="w-main" style="overflow:hidden">' + calMainHTML(true) + '</main>');
  }

  /* ================= more places: Projects, project settings, Devices & Hosting, Help, Timeline, the Team's Git and Activity ================= */
  function projRow(name) {
    var st = projStats(name), n = st.asks;
    return '<li><button class="w-projrow" type="button" data-a="proj" data-id="' + name + '"><span class="tile" aria-hidden="true">' + ic('folder', 18) + '</span><span class="who"><b>' + name + '</b><span class="w-mm">~/code/' + name + ' · main · github.com/you/' + name + '</span></span>' +
      '<span class="stat">' + esc(statsText(name)) + '</span>' + (n ? '<span class="w-num pend">' + n + '</span>' : '') + '<span class="go" aria-hidden="true">' + ic('right', 14) + '</span></button></li>';
  }
  function projectsPage() {
    return '<header class="w-ghead"><div class="w-uh"><h1>Projects</h1><p class="w-lede">Repositories on this computer, each with its own board, calendar and Git view</p></div><button class="w-btn" type="button" data-a="addproject">' + ic('plus') + 'Add project</button></header>' +
      '<main class="w-main" data-keep="main-projects"><div class="w-upage"><ul class="w-ulist">' + PROJECTS.map(projRow).join('') + '</ul></div></main>';
  }
  function teamProjectsPage() {
    var open = S.team.tickets.filter(function (k) { return k.st !== 'done' && !k.arch; }).length, rv = S.team.tickets.filter(function (k) { return k.st === 'review'; }).length;
    return '<header class="w-ghead"><div class="w-uh"><h1>Projects</h1><p class="w-lede">' + esc(S.team.name) + ' · Team workspace · each project’s people, tickets and branches</p></div><button class="w-btn" type="button" data-a="toast" data-v="Creating a project is turned off in the demo.">' + ic('plus') + 'New project</button></header>' +
      '<main class="w-main" data-keep="main-t-projects"><div class="w-upage"><ul class="w-ulist"><li><button class="w-projrow" type="button" data-a="tv" data-id="board"><span class="tile" aria-hidden="true">' + ic('folder', 18) + '</span><span class="who"><b>' + esc(S.team.project) + '</b><span class="w-mm">5 people · github.com/northwind/storefront</span></span><span class="stat">' + open + ' open · ' + rv + ' in review</span><span class="go" aria-hidden="true">' + ic('right', 14) + '</span></button></li></ul></div></main>';
  }
  var PMEM = { 'api-server': [{ label: 'Saved policy', text: 'Every change to the public API ships with an entry in the OpenAPI spec.', ref: 'Policy saved in api-server settings', upd: '6 days ago' }],
    'marketing-site': [{ label: 'Decision', text: 'Copy is read by a person before it ships, whichever agent wrote it.', ref: 'Run run-2c9a on “Write the launch post”', upd: '9 days ago' }] };
  function psettingsHTML() { return headHTML() + '<main class="w-main" data-keep="main-psettings"><div class="w-upage">' + psettingsBody() + '</div></main>'; }
  function psettingsBody() {
    var p = curProj(), mem = p === 'my-app' ? MEM.map(function (m) { return { label: m.label, text: m.text, ref: m.ref, upd: m.upd }; }) : PMEM[p];
    var agent = 'Claude Code';
    return '<section class="w-pn"><div class="head"><h3>Agents and defaults</h3><p class="w-muted">What a new task in ' + p + ' starts with. A task can override it.</p></div>' +
      kvl([['Default agent', agent], ['Agents at once', String(LIMIT)], ['Priority', 'Normal'], ['Interaction', 'Ask me when needed'], ['Timezone', p === 'marketing-site' ? 'America/New_York' : 'Europe/Amsterdam'], ['Merge into', '<b>main</b> on this computer'], ['Repository', '<span class="w-mm">~/code/' + p + ' · github.com/you/' + p + '</span>']]) +
      '</section><section class="w-pn"><div class="head"><h3>Labels</h3><p class="w-muted">Group tasks on the board.</p></div><div class="w-setrow">' + ['bug', 'feature', 'docs', 'chore'].map(function (l) { return '<span class="w-chip">' + l + '</span>'; }).join('') + '</div></section>' +
      '<section class="w-pn"><div class="head"><h3>Project memory</h3><p class="w-muted">What Werkbord remembers about ' + p + ', on this computer. Salie reads and cites it, and never changes it.</p></div><ul class="w-setlist">' +
      mem.map(function (m) { return '<li class="w-memrow"><span class="tx"><span class="w-mm"><b>' + m.label + '</b> · ' + p + ' · Current</span><span>' + esc(m.text) + '</span><span class="w-mm">' + esc(m.ref) + ' · Updated ' + m.upd + '</span></span></li>'; }).join('') + '</ul></section>';
  }
  function devicesPage() {
    function card(name, kind, standing, roles, rows, acts) {
      return '<li class="w-pn w-devcard"><header><h2>' + name + '</h2><span class="w-mm">' + kind + '</span></header><p class="w-mm">' + standing + '</p><ul class="roles">' + roles.map(function (r) { return '<li class="w-chip">' + r + '</li>'; }).join('') + '</ul>' + (rows ? kvl(rows) : '') + '<div class="w-setrow">' + acts + '</div></li>';
    }
    function go(label, id, ws) { return '<button class="w-btn sm" type="button" data-a="setgo" data-id="' + id + '">' + label + '</button>'; }
    return '<header class="w-ghead"><div class="w-uh"><h1>Devices &amp; Hosting</h1><p class="w-lede">Closing this window stops nothing: your agents, schedules and Team services keep running.</p></div></header>' +
      '<main class="w-main" data-keep="main-devices"><div class="w-upage"><section class="w-pn w-devcard"><header><h2>Team on this computer</h2></header><p class="w-muted">Team is running.</p><div class="w-setrow"><button class="w-btn sm" type="button" data-a="toast" data-v="Stopping the Team service is turned off in the demo.">Stop Team service</button></div></section>' +
      '<ul class="w-devcards">' +
      card('Individual', 'Individual · this computer', 'Ready · 3 projects, ' + (active() + 2 + FXT['marketing-site'].filter(function (t) { return t.run && t.run.st === 'running'; }).length) + ' agents working', ['Runner'], [['Saving changes', 'On this computer']], go('Runners', 'personal/runners') + '<button class="w-btn sm" type="button" data-a="ws" data-id="individual">Open</button>') +
      card(esc(S.team.name), 'Team · ' + S.team.role, 'Ready · 5 members, 4 online', ['Runner', 'Workspace Host'], [['Hosts', '2 of 3 online'], ['Saving changes', 'Available'], ['Connectivity', 'Sam’s MacBook Air'], ['Backups', 'Last one today 03:00']],
        '<button class="w-btn sm" type="button" data-a="ws" data-id="team">Open</button>' + go('Hosts and devices', 'team/hosts') + go('Connectivity', 'team/connectivity') + go('Backups', 'team/backups') + go('Settings', 'team/license')) +
      '</ul><p><button class="w-btn" type="button" data-a="addteam">Add a Team…</button></p></div></main>';
  }
  /* Help: the app's bundled guides (web/src/lib/help.ts), searchable. */
  var HELP = [
    { id: 'mcp', title: 'Setting up an MCP server', dest: 'mcp', link: 'Open MCP setup', summary: 'MCP lets a client use tools from a server. Connect Werkbord to an external server, or connect any compatible client to Werkbord’s built-in board server.',
      example: 'A notes service supplies an MCP URL for Werkbord to use. A separate planning client instead connects to Werkbord to read selected projects and propose changes.',
      steps: ['Open Settings → Connections → MCP services. To use another service, paste its single-server MCP JSON configuration or choose Add connection and enter its URL or local executable. Use the authentication method documented by that service.', 'Review the imported fields and save. Test and discover checks the server and lists its tools; OAuth opens sign-in if required. Then enable the connection and choose Assistant or Coding agents. Review each tool’s permission before use.', 'To let another client use Werkbord, go to Connect a client to Werkbord on the same page. Give it a name and select only the projects and operations it needs. Create its credential and copy the generated connection settings while they are visible.', 'For a client on another computer, use a reachable private controller address ending in /mcp. For stdio-only clients, select the local process option and install the werkbord command on that client’s computer. Paste the generated settings into your client and reconnect it.', 'Ask the client to list projects to verify the connection. Individual board changes wait in Pending changes for your approval. Team task plans wait in Plans; direct Team ticket writes follow the issued permissions. Credentials are specific to their Individual controller or Team workspace.'],
      recovery: 'If connection fails, check which side is the client, the server address, network access, and authentication. localhost means the computer running the client. Environment references name variables available to the controller process; they are not secret values. Never paste credentials into a chat. If you lose a new credential, revoke it and create another.' },
    { id: 'answer', title: 'Answer an agent', dest: 'control', link: 'Open Workspace', summary: 'Workspace collects questions and other interruptions. Open the task to see its project and the exact request before choosing.',
      example: 'An agent asks, “Commit the fixture work?” Open the question, review its context and options, then choose the answer that matches your intent.',
      steps: ['Open Workspace or the question on its task card. The task title and project stay with the question.', 'Read the prompt and available choices. Werkbord saves the answer, then the runner delivers it to the agent.', '“Answer saved. Waiting for the agent to receive it” means delivery is not confirmed yet. “Answer delivered” means the runner confirmed receipt.'],
      recovery: 'If the answer status is uncertain, reconnect and check the question first. Each question accepts one answer. The app disables answers when its report is stale or offline.' },
    { id: 'review', title: 'Inspect and merge work', dest: 'board', link: 'Open project work', summary: 'Review means the work is ready for your inspection. Accept work and Reject work record your verdict; Merge… changes the repository after confirmation.',
      example: 'A task reaches Review with a branch and reported test notes. Inspect the changes, treat those notes as reported rather than verified, then use Merge… only if you want to merge locally.',
      steps: ['Open the task in Review and choose Review changes to inspect its branch or pull request evidence.', 'Accept work or Reject work records your assessment. It does not merge the branch or move the task.', 'Merge… shows Werkbord’s repository check. Confirm only when the displayed evidence is current and the proposed merge is what you want.'],
      recovery: 'If evidence changes or Werkbord refuses the merge, return to the task and inspect the latest Git state. A successful local merge moves the task to Done and offers Undo for the task move.' },
    { id: 'continue', title: 'Continue a run', dest: 'runs', link: 'Open project work', summary: 'A task keeps its run history and its current state. Open an In progress task to see the latest run and use the available reply, answer or run-again action.',
      example: 'If a run finished without changes and the task remains In progress, open the task and start another run when the task is ready.',
      steps: ['Open the task from the Board or Runs and read the latest reported state.', 'If it is waiting for a decision, answer the question in place. If it is still running, use the task message field to send a follow-up.', 'When a finished task offers Run again, review its current execution choices before starting another run.'],
      recovery: 'A lost start response can leave the outcome uncertain. Check the task and Runs before trying again.' },
    { id: 'plan-schedule', title: 'Plan dates or schedule a run', dest: 'calendar', link: 'Open planning or schedule', summary: 'Timeline dates plan when work should happen. Calendar schedules when Werkbord starts agent work. They answer different questions.',
      example: 'Put “Book the venue” on next week’s Timeline to plan the work. Add an execution schedule in Calendar only if an agent should start it at a chosen time.',
      steps: ['Use Timeline for planned task dates, milestones and dependencies. Setting a date there does not start an agent.', 'Use Calendar for agent execution schedules. A scheduled task starts only under the configured runner and execution rules.', 'Work projects have Timeline planning, but no Calendar or agent execution controls.'],
      recovery: 'If you meant to plan work rather than launch an agent, edit the task on Timeline. If you meant to schedule execution, check the task’s Calendar entry and runner availability.' },
    { id: 'runner', title: 'Choose a runner', dest: 'runners', link: 'Open Settings → Runners', summary: 'A runner is the computer where an agent works. Project defaults and routing rules can choose it for new runs; task run settings can override the defaults.',
      example: 'If the only eligible runner is Busy, wait for a slot or stop a run. An installed agent on a full runner is busy, not missing.',
      steps: ['Open Settings → Runners to check whether a runner is Idle, Working, Busy, Offline or Disabled.', 'Use project Task defaults or Routing rules for the usual choice. Change run settings on a task when that run needs a different agent or runner.', 'Before starting, confirm the selected runner is online and has capacity.'],
      recovery: 'If no runner can take the task, wait for capacity or stop a run you no longer need. If it is Offline or Disabled, use the runner’s existing Settings controls to investigate.' },
    { id: 'disconnect', title: 'Recover after disconnection', dest: 'control', link: 'Open Workspace', summary: 'Werkbord may keep working while a browser is disconnected. A last reported state is not proof of what is happening now.',
      example: 'If a task save reports an uncertain outcome, reconnect and check the Board or use View saved task before creating it again.',
      steps: ['Reconnect to the Werkbord that owns the project and wait for a fresh report.', 'Check the task or Runs to see what was saved or started before taking the action again.', 'If answer delivery is still unconfirmed and Werkbord offers a retry, retry the same answer. Do not submit a different answer.'],
      recovery: 'When the app says delivery or save is uncertain, check first instead of repeating the action. A stale or offline report keeps actions disabled until current evidence returns.' },
    { id: 'counts', title: 'Understand Workspace counts', dest: 'control', link: 'Open Workspace', summary: 'Interruption badges count questions, blocked work and failures. They exclude tasks ready for Review; the Workspace page’s All list includes Review work.',
      example: 'A project can show one interruption while also having two tasks in Review. Open Workspace → All to see both kinds of work.',
      steps: ['Use the badge to spot work that needs a response or intervention.', 'Use Workspace → All when you want the full list, including work ready for review.', 'Open a task to see its project and source run before acting.'],
      recovery: 'If a badge does not match the rows you expected, refresh the report and compare its scope: badges exclude Review, while All includes it.' },
    { id: 'keyboard', title: 'Navigate with the keyboard', dest: 'board', link: 'Open the current Board', summary: 'Jump to is available from the page and from ⌘K on Mac or Ctrl+K elsewhere. It searches bundled destinations and tasks in the current project.',
      example: 'Press Ctrl+K, type “Runs”, then press Enter. Press N from a project page to open New task.',
      steps: ['Press ⌘K or Ctrl+K to open Jump to, type a project, section or task, then use the arrow keys and Enter.', 'Press N on a project page to open New task. Press Escape to close a task panel or sheet.', 'Tab through links and controls; shortcuts pause while you type in a field. Use the visible Skip to main content link to move past navigation.'],
      recovery: 'If a shortcut does not open, first finish or leave the focused field or menu. Jump to is also a visible button in the page heading.' }
  ];
  function helpList(q) {
    q = (q || '').trim().toLowerCase();
    var list = HELP.filter(function (a) { return !q || [a.title, a.summary, a.example, a.recovery].concat(a.steps).some(function (t) { return t.toLowerCase().indexOf(q) > -1; }); });
    return '<p class="w-mm" role="status">' + (q ? list.length + (list.length === 1 ? ' guide found' : ' guides found') : list.length + ' guides') + '</p>' + (list.length ? '<ol class="w-guides">' + list.map(function (a) {
      return '<li><article class="w-pn"><div class="gh"><h3>' + a.title + '</h3><p class="w-muted">' + a.summary + '</p></div><p class="ex"><b>Example</b> ' + a.example + '</p><ol class="steps">' + a.steps.map(function (st, i) { return '<li><span class="n" aria-hidden="true">' + (i + 1) + '</span><span>' + st + '</span></li>'; }).join('') +
        '</ol><p class="ex"><b>If it goes wrong</b> ' + a.recovery + '</p><div><button class="w-btn sm" type="button" data-a="helpgo" data-id="' + a.dest + '">' + a.link + ic('right', 14) + '</button></div></article></li>';
    }).join('') + '</ol>' : '<div class="w-empty" role="status"><p>No bundled guide matches “' + esc(q) + '”.</p><p>Try a task, section or shortcut such as “runner”, “Review” or “Ctrl+K”.</p></div>');
  }
  function helpPage(phone) {
    var body = '<div class="w-help-page"><header class="intro"><div><h2>Find the next step</h2><p class="w-muted">Short guides for the work you do in Werkbord. Each example uses the words and safeguards shown in the app.</p></div>' +
      '<label class="w-field"><span class="w-lab">Search Help and shortcuts</span><input class="w-input" type="search" data-help-q value="' + esc(VIEW.hq || '') + '" placeholder="Try “merge” or “Ctrl+K”" autocomplete="off"></label></header><div data-help-list>' + helpList(VIEW.hq) + '</div></div>';
    if (phone) return pageHead('Help', 'Guides and shortcuts', 'the Control Deck') + '<div class="w-mpage">' + body + '</div>';
    return '<header class="w-ghead"><div class="w-uh"><h1>Help</h1><p class="w-lede">Guides and shortcuts</p></div></header><main class="w-main" data-keep="main-help"><div class="w-upage">' + body + '</div></main>';
  }
  /* A guide's link goes to the place it names. */
  function helpGo(where, dest) {
    dropOverlay();
    if (where === 'phone') {
      P.task = null;
      if (dest === 'control') P.at = 'control'; else if (dest === 'runners') P.at = 'runners'; else if (dest === 'mcp') { P.at = 'settings'; P.set = 'personal/mcp'; } else { P.at = 'project'; P.proj = 'my-app'; P.tab = dest === 'runs' ? 'runs' : dest === 'calendar' ? 'calendar' : 'board'; }
    } else {
      leave(); D.ws = 'individual'; D.task = null;
      if (dest === 'control') D.view = 'control'; else if (dest === 'runners') { D.ws = 'universal'; D.set = 'personal/runners'; G.f.settings = true; } else if (dest === 'mcp') { D.ws = 'universal'; D.set = 'personal/mcp'; G.f.settings = true; } else { D.proj = 'my-app'; D.view = dest; }
    }
    render();
  }

  /* Timeline: the planned dates of everything, fourteen days from today. It shows and never moves anything. */
  function timelineHTML() {
    var N = 14, rows = [];
    function bar(label, project, tag, a, b) { rows.push({ label: label, project: project, tag: tag, a: Math.max(0, a), b: Math.min(N - 1, b) }); }
    S.tasks.forEach(function (t) { if (t.sched && t.state !== 'done') bar(t.title, 'my-app', 'Individual', t.sched.d, t.sched.d); });
    ['api-server', 'marketing-site'].forEach(function (p) { FXT[p].forEach(function (t) { if (t.sched && t.state !== 'done') bar(t.title, p, 'Individual', t.sched.d, t.sched.d); }); });
    S.team.tickets.forEach(function (k) { if (!k.arch && k.st !== 'done' && (k.start != null || k.due != null)) bar('WB-' + k.n + ' ' + k.title, S.team.project, S.team.name, k.start != null ? k.start : k.due, k.due != null ? k.due : k.start); });
    var head = '';
    for (var i = 0; i < N; i++) head += '<span class="d' + (i === 0 ? ' today' : '') + '">' + dayName(i).slice(0, 2) + '<b>' + dateOf(i).getDate() + '</b></span>';
    var groups = ['Individual', S.team.name].map(function (tag) {
      var rs = rows.filter(function (r) { return r.tag === tag; });
      if (!rs.length) return '';
      return '<section class="w-tlgroup"><h2>' + wsTag(tag === 'Individual' ? 'individual' : 'team', tag) + '<span class="count">' + rs.length + '</span></h2>' + rs.map(function (r) {
        return '<div class="w-tlrow"><span class="who"><b>' + esc(r.label) + '</b><span class="w-mm">' + esc(r.project) + '</span></span><span class="track" style="--n:' + N + '"><span class="w-tlbar' + (r.tag !== 'Individual' ? ' team' : '') + '" style="grid-column:' + (r.a + 1) + ' / ' + (r.b + 2) + '"></span></span></div>';
      }).join('') + '</section>';
    }).join('');
    return '<div class="w-tl"><div class="w-tlhead"><span></span><span class="days" style="--n:' + N + '">' + head + '</span></div>' + groups +
      '<p class="w-muted w-tlnote">Planned dates, milestones and dependencies. The Timeline warns about conflicts and never reschedules anything.</p></div>';
  }
  /* The Team's Git: each member’s branch and pull request as their own werkbord reports it. */
  function teamGitHTML() {
    var ks = S.team.tickets.filter(function (k) { return k.branch && !k.arch && k.st !== 'done'; });
    return teamHeadHTML('git') + '<main class="w-main" data-keep="main-t-git"><div class="w-upage"><section class="w-ugroup"><h2>Branches and pull requests<span class="count">' + ks.length + '</span></h2><ul class="w-ulist">' + ks.map(function (k) {
      return '<li><div class="w-irow"><i class="w-dot" data-tone="' + (k.pr && k.pr.state === 'merged' ? 'ok' : k.pr ? 'work' : 'neutral') + '"></i><span class="tx"><span class="ti w-mm" style="color:var(--text)">' + esc(k.branch) + '</span><span class="cx"><span>WB-' + k.n + ' ' + esc(k.title) + '</span></span><span class="dt">' + esc(k.who) + ' · ' + (k.ahead || 0) + ' commits ahead of main' + (k.pr ? ' · pull request #' + k.pr.n + ' ' + k.pr.state : ' · no pull request yet') + '</span></span><span class="ac"><span class="w-chip">' + (k.st === 'review' ? 'In review' : 'In progress') + '</span></span></div></li>';
    }).join('') + '</ul></section><p class="w-muted">Team does not reproduce a code-review interface. The diff is on your Git host.</p></div></main>';
  }
  function teamActivityHTML() {
    var ev = [[10 * 60 + 20, 'Jonas Weber commented on WB-44'], [9 * 60 + 48, 'Maya Chen mentioned You on WB-42'], [9 * 60 + 40, 'Maya Chen moved WB-42 to Review'], [9 * 60 + 5, 'You started your agent on WB-40'], [at(-1, 17, 30), 'Sam Okafor moved WB-41 to Review'], [at(-1, 15, 10), 'Maya Chen claimed WB-43'], [at(-1, 11, 0), 'Jonas Weber claimed WB-44'], [at(-2, 16, 20), 'Jonas Weber marked WB-39 done'], [at(-3, 9, 45), 'Sam Okafor wrote WB-47']];
    var st = storyTicket(); if (st) ev.unshift([S.now, 'You wrote WB-' + st.n + ' with Salie']);
    return teamHeadHTML('activity') + '<main class="w-main" data-keep="main-t-activity"><div class="w-upage"><section class="w-ugroup"><h2>Activity<span class="count">' + ev.length + '</span></h2><div class="w-pn" style="gap:12px">' +
      ev.map(function (e) { return '<div class="w-act"><span class="w-mm">' + whenShort(e[0]) + '</span><span>' + esc(e[1]) + '</span></div>'; }).join('') + '</div></section></div></main>';
  }
  function whenShort(m) { var d = Math.floor(m / 1440); return d === 0 ? clock(m) : d === -1 ? 'Yest.' : dayName(d); }

  /* ================= a Team: board, reviews, members ================= */
  var TCOLS = [['available', 'Available'], ['progress', 'In Progress'], ['review', 'Review'], ['done', 'Done']];
  function tcardHTML(k) {
    var mine = k.who === ME, acts = '';
    if (!k.who && k.st === 'available') acts = '<button class="w-btn sm' + (k.story ? ' pri' : '') + '" type="button" data-a="claim" data-id="' + k.n + '" aria-label="Claim WB-' + k.n + ' ' + esc(k.title) + '">Claim</button>';
    else if (mine && k.st === 'progress' && k.waiting) acts = '<button class="w-btn sm pri" type="button" data-a="tstart" data-id="' + k.n + '">Start agent</button>';
    else if (mine && k.st === 'progress') acts = '<button class="w-btn sm" type="button" data-a="runner" data-id="' + k.n + '">' + ic('runner', 14) + 'Open in my runner</button>';
    var who = k.who ? '<span class="w-av' + (mine ? ' me' : '') + '" aria-hidden="true">' + initials(k.who) + '</span>' + esc(k.who) + (k.waiting ? '<span class="w-mm">· claimed ' + ago(S.now - k.claimedAt) + '</span>' : '') : '<span class="w-muted">Unclaimed · ' + esc(k.by) + ' wrote it</span>';
    // Only the owner sees what an agent does. Everyone else sees one yes or no: active now, or not.
    var presence = k.st === 'progress' && k.who ? '<p class="w-tpres">' + (k.waiting ? dot('neutral', 'hollow') + 'Claimed · waiting to start' : dot(k.active ? 'work' : 'neutral', k.active ? 'pulse' : 'hollow') + (k.active ? (mine ? 'Your agent is working' : 'Active now') : 'Not active')) + '</p>' : '';
    var due = k.due != null && k.st !== 'done' ? '<span class="w-chip">' + ic('calendar', 12) + 'Due ' + dayLabel(k.due).slice(4) + '</span>' : '';
    var cs = k.comments || [], unread = cs.some(function (c) { return c.unread; });
    var talk = cs.length ? '<button class="w-comment-chip' + (unread ? ' unread' : '') + '" type="button" data-a="tticket" data-id="' + k.n + '" aria-label="' + plural(cs.length, 'comment') + (unread ? ', one mentions you' : '') + ' on WB-' + k.n + '">' + ic('reply', 12) + (unread ? 'Mentions you' : plural(cs.length, 'comment')) + '</button>' : '';
    var git = k.branch ? '<p class="w-tbranch">' + esc(k.branch) + '</p><p class="w-tchips">' + (k.ahead ? '<span class="w-chip">' + k.ahead + ' commits</span>' : '<span class="w-chip">no commits yet</span>') + (k.pr ? '<span class="w-chip">' + ic('pr', 12) + '#' + k.pr.n + ' ' + k.pr.state + '</span>' : '') + '</p>' : '';
    var tone = k.st === 'review' ? 'ask' : k.st === 'progress' ? 'work' : k.st === 'done' ? 'ok' : 'neutral';
    return '<li class="w-card w-task w-tix' + (k.st === 'done' ? ' settled' : '') + (k.fresh ? ' fresh' : '') + '" data-tone="' + tone + '" data-ticket="' + k.n + '" data-mk="k' + k.n + '"><p class="w-tid">WB-' + k.n + '</p><button class="w-ttitle" type="button" data-a="tticket" data-id="' + k.n + '">' + esc(k.title) + '</button><p class="w-st">' + who + '</p>' + presence + git + (due ? '<p class="w-tchips">' + due + '</p>' : '') + talk + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</li>';
  }
  function teamHeadHTML(tab) {
    tab = tab || 'board';
    return '<header class="w-head"><div class="w-where"><span class="w-pname"><h1>' + esc(S.team.project) + '</h1></span><p class="w-path">' + esc(S.team.name) + ' · Team workspace · early access</p></div>' +
      '<div class="w-acts"><button class="w-btn" type="button" data-a="pal">' + ic('search') + 'Jump to</button><button class="w-btn pri" type="button" data-a="new">' + ic('plus') + 'New ticket</button></div></header>' +
      '<nav class="w-tabs" aria-label="' + esc(S.team.project) + ' sections">' + navTab('data-a="tv" data-id="board"', 'Board', tab === 'board') + navTab('data-a="tv" data-id="git"', 'Git', tab === 'git') + navTab('data-a="tv" data-id="activity"', 'Activity', tab === 'activity') + '</nav>';
  }
  function navTab(attrs, label, cur) { return '<button class="w-tab" type="button" ' + attrs + (cur ? ' aria-current="page"' : '') + '>' + label + '</button>'; }
  function teamArchiveRows() {
    var q = (D.aq || '').toLowerCase();
    var ks = S.team.tickets.filter(function (k) { return k.arch != null && ('WB-' + k.n + ' ' + k.title + ' ' + (k.desc || '')).toLowerCase().indexOf(q) > -1; }).sort(function (a, b) { return b.arch - a.arch; });
    return ks.length ? ks.map(function (k) {
      return '<li><div><button class="rtitle" type="button" data-a="tticket" data-id="' + k.n + '">WB-' + k.n + ' · ' + esc(k.title) + '</button><p class="w-mm">Done · Archived ' + ago(S.now - k.arch) + '</p></div><button class="w-btn sm" type="button" data-a="trestore" data-id="' + k.n + '">Restore</button></li>';
    }).join('') : '<li class="w-muted">' + (q ? 'No archived tickets match.' : 'No archived work yet. Archive Done tickets, or archive a ticket, to keep it here.') + '</li>';
  }
  function teamBoardHTML() {
    var tk = S.team.tickets.filter(function (k) { return k.arch == null; }), n = function (s) { return tk.filter(function (k) { return k.st === s; }).length; };
    var mineN = tk.filter(function (k) { return k.who === ME; }).length, archived = S.team.tickets.length - tk.length;
    var legend = '<ul class="w-legend" aria-label="The team at a glance"><li>' + dot('work') + n('progress') + ' in progress</li><li>' + dot('ask') + n('review') + ' in review</li><li>' + dot('ok') + n('done') + ' done</li></ul>';
    var filters = '<div class="w-filters"><div class="w-seg" role="group" aria-label="Whose tickets">' + [['0', 'All tickets', ''], ['1', 'My tickets', mineN]].map(function (o) { return '<button type="button" data-a="tmine" data-id="' + o[0] + '" aria-pressed="' + (D.mine === (o[0] === '1')) + '">' + o[1] + (o[2] !== '' ? ' <span class="w-mm">' + o[2] + '</span>' : '') + '</button>'; }).join('') + '</div>' +
      '<button class="w-btn sm" type="button" data-a="tarchview" aria-pressed="' + !!D.tarch + '">' + (D.tarch ? 'Back to board' : 'Archive (' + archived + ')') + '</button>' +
      '<button class="w-btn sm" type="button" data-a="tarchdone"' + (n('done') ? '' : ' disabled') + ' title="Move all Done tickets into the archive and keep their details">Archive Done tickets</button></div>';
    if (D.tarch) return teamHeadHTML() + '<main class="w-main" style="overflow:hidden"><div class="w-bview"><div class="w-bar">' + filters + '</div><div class="w-bscroll"><section class="w-archive" aria-label="Ticket archive"><div class="head"><div><h2>Archived work</h2><p class="w-muted">Archived tickets and cleared Done cards. Their comments, branches and pull requests are kept.</p></div><label class="w-field"><span class="w-lab">Search archive</span><input class="w-input" type="search" data-arch-q value="' + esc(D.aq || '') + '" placeholder="Title or ticket details" autocomplete="off"></label></div><ul class="w-archlist" data-arch-list>' + teamArchiveRows() + '</ul></section></div></div></main>';
    return teamHeadHTML() + '<main class="w-main" style="overflow:hidden"><div class="w-bview"><div class="w-bar">' + filters + legend + '</div><div class="w-cols">' + TCOLS.map(function (c) {
      var ts = tk.filter(function (k) { return k.st === c[0] && (!D.mine || k.who === ME); }).sort(function (a, b) { return Number(!!b.story) - Number(!!a.story) || b.n - a.n; });
      return '<section class="w-col w-tray" data-col="' + c[0] + '" data-mp="tb-' + c[0] + '" aria-label="' + c[1] + '"><header class="w-ch"><h2>' + c[1] + '</h2><span class="w-chip">' + ts.length + '</span></header><ul class="w-list" data-keep="tcol-' + c[0] + '">' + (ts.length ? ts.map(tcardHTML).join('') : '<li class="w-none">Nothing here.</li>') + '</ul></section>';
    }).join('') + '</div></div></main>';
  }
  function teamReviewsHTML() {
    var rs = S.team.tickets.filter(function (k) { return k.st === 'review'; }).sort(function (a, b) { return Number(b.reviewer === ME) - Number(a.reviewer === ME); });
    var list = rs.length ? '<ul class="w-ulist" data-mp="treviews">' + rs.map(function (k) {
      var asked = k.reviewer === ME && k.who !== ME;
      return '<li class="w-rv" data-mk="v' + k.n + '"><div class="tx"><p class="w-tid">WB-' + k.n + '</p><p class="w-ttitle">' + esc(k.title) + '</p><p class="w-mm">' + esc(k.who) + ' · ' + esc(k.branch) + ' · ' + k.ahead + ' commits</p><p class="w-mm">' + ic('pr', 12) + 'Pull request #' + k.pr.n + ' · ' + k.pr.state + ' on the Git host · no conflicts</p>' + (k.comments && k.comments.length ? '<button class="w-comment-chip" type="button" data-a="tticket" data-id="' + k.n + '">' + ic('reply', 12) + plural(k.comments.length, 'comment') + '</button>' : '') + '</div><div class="acts">' +
        (asked ? '<button class="w-btn sm" type="button" data-a="toast" data-v="Request changes sends the ticket back to its author with your note.">Request changes</button><button class="w-btn sm pri" type="button" data-a="signoff" data-id="' + k.n + '">Mark done</button>' : '<span class="w-mm">Waiting for ' + esc(k.reviewer || 'a reviewer') + '</span>') + '</div></li>';
    }).join('') + '</ul>' : '<p class="w-uempty">Nothing is waiting for review.</p>';
    return '<header class="w-ghead"><div class="w-uh"><h1>Reviews</h1><p class="w-lede">Tickets in review, those asked of you first. The diff itself is on your Git host.</p></div></header><main class="w-main" data-keep="main-t-reviews"><div class="w-upage">' + list + '</div></main>';
  }
  function teamHomeHTML() {
    var rs = rowsTeam(), ms = unreadMentions();
    var heard = ms.length ? '<section class="w-ugroup" aria-label="Mentions"><h2>Mentions<span class="count">' + ms.length + '</span></h2><ul class="w-ulist">' + ms.map(function (m) {
      return '<li><div class="w-irow"><i class="w-dot" data-tone="ask"></i><span class="tx"><span class="ti">' + esc(m.c.by) + ' mentioned you on WB-' + m.k.n + '</span><span class="cx"><span>' + esc(S.team.project) + '</span><span>' + esc(m.k.title) + '</span></span><span class="dt">' + commentHTML(m.c.text) + '</span></span><span class="ac"><button class="w-btn sm pri" type="button" data-a="tticket" data-id="' + m.k.n + '">Open comment</button><button class="w-btn sm" type="button" data-a="mread" data-id="' + m.k.n + '" data-v="' + m.i + '">Mark read</button></span></div></li>';
    }).join('') + '</ul></section>' : '';
    return '<header class="w-ghead"><div class="w-uh"><h1>Workspace</h1><p class="w-lede">' + esc(S.team.name) + ' · what is waiting for you in this Team</p></div></header><main class="w-main" data-keep="main-t-home"><div class="w-upage">' +
      (rs.length ? '<section class="w-ugroup"><h2>Action needed<span class="count">' + rs.length + '</span></h2><ul class="w-ulist" data-mp="inbox">' + rs.map(inboxRowHTML).join('') + '</ul></section>' : (heard ? '' : '<p class="w-uempty">Nothing needs you in ' + esc(S.team.name) + '.</p>')) + heard + '</div></main>';
  }
  function teamMembersHTML() {
    return '<header class="w-ghead"><div class="w-uh"><h1>Members</h1><p class="w-lede">One Owner, any number of Admins, and Members. Each person keeps their own computer, runner and credentials; connections are what each computer reports.</p></div></header><main class="w-main" data-keep="main-t-members"><div class="w-upage"><ul class="w-ulist">' +
      S.team.members.map(function (m) { return '<li><div class="w-irow"><span class="w-av' + (m[0] === ME ? ' me' : '') + '" aria-hidden="true">' + initials(m[0]) + '</span><span class="tx"><span class="ti">' + esc(m[0]) + (m[0] === ME ? ' <span class="w-mm">(you)</span>' : '') + '</span><span class="dt">' + esc(m[2]) + '</span><span class="dt">' + esc(m[3]) + '</span></span><span class="ac"><span class="w-chip">' + m[1] + '</span></span></div></li>'; }).join('') + '</ul></div></main>';
  }
  function teamMain() {
    return ({ board: teamBoardHTML, reviews: teamReviewsHTML, home: teamHomeHTML, members: teamMembersHTML, projects: teamProjectsPage, git: teamGitHTML, activity: teamActivityHTML, analytics: function () { return '<header class="w-ghead"><div class="w-uh"><h1>Analytics</h1><p class="w-lede">How work moves through ' + esc(S.team.name) + '</p></div></header><main class="w-main" data-keep="main-t-an">' + teamAnalyticsHTML() + '</main>'; } })[D.tv]();
  }


  /* ================= Analytics =================
     The page follows the app's four views (Activity, Execution, Usage, Completion) with its filters. The history behind it is
     written for the demo: ninety days a project, generated the same way every time, with today's real work from the board
     added on top. Nothing here is measured. */
  function analyticsState() { return { tab: 'Activity', project: '', days: 30, provider: '', runner: '', series: 'both', measure: 'tokens' }; }
  function noise(n) { return Math.abs(Math.sin(n * 12.9898 + 78.233) * 43758.5453) % 1; }
  var AN_CFG = { 'my-app': { tasks: 2.1, runs: 2.6, tok: 38000, claude: 0.62, median: 11100 }, 'api-server': { tasks: 3.0, runs: 4.1, tok: 52000, claude: 0.55, median: 8400 }, 'marketing-site': { tasks: 1.5, runs: 1.9, tok: 24000, claude: 0.7, median: 16800 } };
  var AN = (function () {
    var out = {};
    PROJECTS.forEach(function (p, pi) {
      var c = AN_CFG[p], days = [];
      for (var i = 0; i < 90; i++) {
        var dow = dateOf(-i).getDay(), wk = dow === 0 || dow === 6 ? 0.22 : 1, r = function (k) { return noise(pi * 7919 + i * 31 + k); };
        var created = Math.round(c.tasks * wk * (0.4 + r(1) * 1.3)), completed = Math.round(c.tasks * wk * (0.3 + r(2) * 1.3));
        var attempts = Math.round(c.runs * wk * (0.4 + r(3) * 1.4)), failed = r(4) < 0.28 ? Math.ceil(attempts * 0.2) : 0, stopped = r(5) < 0.22 ? 1 : 0, blocked = r(6) < 0.12 ? 1 : 0;
        var waiting = i < 2 ? 1 : 0;
        if (i === 0 && p === 'my-app') { created = completed = attempts = failed = stopped = blocked = waiting = 0; }
        var tok = attempts * c.tok * (0.6 + r(7) * 0.9);
        days.push({ created: created, completed: completed, attempts: attempts, failed: Math.min(failed, attempts), stopped: Math.min(stopped, attempts), blocked: blocked, waiting: waiting, retries: Math.round(attempts * 0.14 * r(8) * 2),
          inTok: Math.round(tok * 0.72), outTok: Math.round(tok * 0.28), cacheTok: Math.round(tok * 0.46), cost: Math.round(tok * c.claude * 0.000011 * 100) / 100, est: Math.round(tok * (1 - c.claude) * 0.000009 * 100) / 100, limit: r(9) < 0.04 ? 1 : 0,
          accepted: Math.round(completed * 0.82), rejected: r(10) < 0.2 ? 1 : 0, verified: completed, normal: Math.max(0, attempts - failed - stopped) });
      }
      out[p] = days;
    });
    return out;
  })();
  function parseK(v) { return v ? parseFloat(v) * 1000 : 0; }
  function parseUSD(v) { return v ? parseFloat(String(v).replace('$', '')) : 0; }
  /* Day 0 of my-app: what the board shows today, added to the generated history. */
  function liveToday() {
    var z = { created: 0, completed: 0, attempts: 0, failed: 0, stopped: 0, blocked: 0, waiting: 0, retries: 0, inTok: 0, outTok: 0, cacheTok: 0, cost: 0, est: 0, limit: 0, accepted: 0, rejected: 0, verified: 0, normal: 0 };
    S.tasks.forEach(function (t) {
      if (t.id >= 30) z.created++;
      if (t.state === 'done' && t.doneAt >= 0) { z.completed++; z.verified++; z.accepted++; }
      var r = t.run; if (!r || (r.started != null && r.started < 0)) return;
      z.attempts++;
      if (r.st === 'stopped') z.stopped++; else if (r.st === 'blocked') z.blocked++; else if (r.st === 'needs') z.waiting++; else if (r.st === 'completed' || r.st === 'merged') z.normal++;
      var tk = parseK(r.tokens); z.inTok += Math.round(tk * 0.72); z.outTok += Math.round(tk * 0.28); z.cacheTok += Math.round(tk * 0.46); z.cost += parseUSD(r.cost);
    });
    return z;
  }
  function anReport(A) {
    var projs = A.project ? [A.project] : PROJECTS, days = [], t = { attempts: 0, retries: 0, failed: 0, stopped: 0, blocked: 0, waiting: 0, inTok: 0, outTok: 0, cacheTok: 0, cost: 0, est: 0, limit: 0, accepted: 0, rejected: 0, verified: 0, normal: 0, created: 0, completed: 0 };
    var runnerShare = A.runner === 'MacBook-Pro' ? 0.93 : A.runner === 'Not recorded' ? 0.07 : 1;
    var medians = 0, samples = 0;
    for (var i = A.days - 1; i >= 0; i--) {
      var day = { date: dateOf(-i), created: 0, completed: 0 };
      projs.forEach(function (p) {
        var d = AN[p][i], l = p === 'my-app' && i === 0 ? liveToday() : null, share = A.provider === 'Claude Code' ? AN_CFG[p].claude : A.provider === 'Codex' ? 1 - AN_CFG[p].claude : 1;
        function v(k) { return (d[k] + (l ? l[k] : 0)); }
        day.created += v('created'); day.completed += v('completed');
        ['attempts', 'retries', 'failed', 'stopped', 'blocked', 'waiting', 'inTok', 'outTok', 'cacheTok', 'cost', 'est', 'limit', 'accepted', 'rejected', 'verified', 'normal'].forEach(function (k) { t[k] += v(k) * share * runnerShare; });
      });
      t.created += day.created; t.completed += day.completed;
      days.push(day);
    }
    projs.forEach(function (p) { var n = AN[p].slice(0, A.days).reduce(function (a, d) { return a + d.completed; }, 0); medians += AN_CFG[p].median * n; samples += n; });
    ['attempts', 'retries', 'failed', 'stopped', 'blocked', 'waiting', 'inTok', 'outTok', 'cacheTok', 'limit', 'accepted', 'rejected', 'verified', 'normal'].forEach(function (k) { t[k] = Math.round(t[k]); });
    t.cost = Math.round(t.cost * 100) / 100; t.est = Math.round(t.est * 100) / 100;
    t.days = days; t.median = samples ? Math.round(medians / samples) : 0; t.samples = samples;
    t.done = Math.max(0, t.attempts - t.failed - t.stopped - t.blocked - t.waiting);
    return t;
  }
  function num(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n); }
  function usd(n) { return '$' + n.toFixed(2); }
  function hm(sec) { var m = Math.round(sec / 60); return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + pad(m % 60) + 'm'; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  /* What the charts on show are drawn for: a new scope (another project, range or measure) is animated, a quiet update is not. */
  var chartScope = '';
  function barsHTML(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; }).concat(1));
    return '<div class="w-anbars">' + rows.map(function (r) {
      return '<div class="row"><div class="cap"><span>' + esc(r.l) + '</span><b>' + (r.f || num(r.v)) + '</b></div><div class="track"><span data-chart-key="bar:' + esc(r.l) + '" data-chart-value="' + (r.v / max) + '" data-chart-scope="' + esc(chartScope) + '" style="width:' + Math.round(r.v / max * 100) + '%;background:' + (r.c || 'var(--accent)') + '"></span></div>' + (r.d ? '<small>' + esc(r.d) + '</small>' : '') + '</div>';
    }).join('') + '</div>';
  }
  /* The daily chart. Its exact values are in the readout and in the table below it, so the picture can grow in without delaying a number.
     Pointer, tap and keyboard (Left and Right, Home and End, Escape) inspect a date; the readout floats, so nothing around it moves. */
  var INSP = {}, DAYS_OPEN = {};
  function readout(d) { return d[0] + ' · ' + d[1] + ' created · ' + d[2] + ' moved to Done'; }
  function dailySVG(days, series, key) {
    var max = Math.max.apply(null, days.map(function (d) { return series === 'created' ? d.created : series === 'completed' ? d.completed : Math.max(d.created, d.completed); }).concat(1));
    var step = 640 / Math.max(1, days.length), g = '', every = Math.max(1, Math.ceil(days.length / 6)), scope = chartScope + '/' + series;
    (max > 1 && max % 2 === 0 ? [0, 0.5, 1] : [0, 1]).forEach(function (ratio) { g += '<line x1="40" x2="680" y1="' + (170 - ratio * 144) + '" y2="' + (170 - ratio * 144) + '" stroke="var(--border)"/><text x="30" y="' + (174 - ratio * 144) + '" text-anchor="end">' + Math.round(max * ratio) + '</text>'; });
    days.forEach(function (d, i) {
      var both = series === 'both', x = 40 + i * step, id = iso(d.date);
      g += '<g><title>' + id + ': ' + d.created + ' created, ' + d.completed + ' moved to Done</title>';
      if (series !== 'completed') g += '<rect data-chart-key="' + id + ':created" data-chart-value="' + (d.created / max) + '" data-chart-axis="y" data-chart-scope="' + esc(scope) + '" x="' + (x + step * 0.12).toFixed(1) + '" y="' + (170 - d.created / max * 144).toFixed(1) + '" width="' + (step * (both ? 0.34 : 0.76)).toFixed(1) + '" height="' + (d.created / max * 144).toFixed(1) + '" fill="var(--accent)"/>';
      if (series !== 'created') g += '<rect data-chart-key="' + id + ':done" data-chart-value="' + (d.completed / max) + '" data-chart-axis="y" data-chart-scope="' + esc(scope) + '" x="' + (x + step * (both ? 0.52 : 0.12)).toFixed(1) + '" y="' + (170 - d.completed / max * 144).toFixed(1) + '" width="' + (step * (both ? 0.34 : 0.76)).toFixed(1) + '" height="' + (d.completed / max * 144).toFixed(1) + '" fill="var(--ok)"/>';
      if (i % every === 0 || i === days.length - 1) g += '<text x="' + (40 + (i + 0.5) * step).toFixed(1) + '" y="196" text-anchor="middle">' + pad(d.date.getMonth() + 1) + '-' + pad(d.date.getDate()) + '</text>';
      g += '</g>';
    });
    var data = days.map(function (d) { return [iso(d.date), d.created, d.completed]; }), at = INSP[key] != null && INSP[key] < days.length ? INSP[key] : null;
    var rows = data.map(function (d) { return '<tr><td>' + d[0] + '</td><td>' + d[1] + '</td><td>' + d[2] + '</td></tr>'; }).join('');
    return '<div class="w-andaily" role="slider" tabindex="0" data-insp="' + key + '" data-days="' + esc(JSON.stringify(data)) + '" aria-valuemin="0" aria-valuemax="' + Math.max(0, days.length - 1) + '" aria-valuenow="' + (at == null ? 0 : at) + '" aria-valuetext="' + esc(at == null ? data[0][0] : readout(data[at])) + '" aria-label="Daily activity chart. Use Left and Right arrows to inspect dates, or Escape to clear."' + (at == null ? '' : ' data-pin="1" data-sel="' + at + '"') + '>' +
      '<div class="legend"><span class="key" style="background:var(--accent)"></span>Created <span class="key" style="background:var(--ok)"></span>Moved to Done <span class="unit">Days · peak ' + max + ' tasks</span></div><svg viewBox="0 0 700 210" role="img" aria-label="Daily task counts. Exact values are in Daily values below.">' + g + '</svg>' +
      (at == null ? '' : '<output class="readout">' + esc(readout(data[at])) + '</output>') +
      '<details class="w-days" data-dv="' + key + '"' + (DAYS_OPEN[key] ? ' open' : '') + '><summary>Daily values</summary><div class="scroll"><table><thead><tr><th>Date</th><th>Created</th><th>Moved to Done</th></tr></thead><tbody>' + rows + '</tbody></table></div></details></div>';
  }
  function inspectDay(box, i, pin) {
    var days = JSON.parse(box.dataset.days);
    i = Math.max(0, Math.min(days.length - 1, i));
    var out = box.querySelector('output.readout');
    if (!out) { out = document.createElement('output'); out.className = 'readout'; box.insertBefore(out, box.querySelector('.w-days')); }
    out.textContent = readout(days[i]);
    box.dataset.sel = i; box.setAttribute('aria-valuenow', i); box.setAttribute('aria-valuetext', readout(days[i]));
    if (pin) { box.dataset.pin = '1'; INSP[box.dataset.insp] = i; }
  }
  function clearDay(box) {
    var out = box.querySelector('output.readout'); if (out) out.remove();
    delete box.dataset.sel; delete box.dataset.pin; INSP[box.dataset.insp] = null;
    box.setAttribute('aria-valuenow', 0); box.setAttribute('aria-valuetext', JSON.parse(box.dataset.days)[0][0]);
  }
  function dayAt(box, e) {
    var days = JSON.parse(box.dataset.days), r = box.querySelector('svg').getBoundingClientRect();
    return Math.floor(((e.clientX - r.left) / r.width * 700 - 40) / (640 / Math.max(1, days.length)));
  }
  function statsHTML(items) { return '<dl class="w-anstats">' + items.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl>'; }
  function selHTML(label, key, list, cur) {
    return '<label class="w-pick"><span>' + label + '</span><select data-asel="' + key + '" aria-label="' + label + '">' + list.map(function (o) { return '<option value="' + esc(String(o[0])) + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>';
  }
  function analyticsHTML(A) {
    var r = anReport(A), tab = A.tab;
    var tabs = '<div class="w-antabs" role="tablist" aria-label="Analytics views">' + ['Activity', 'Execution', 'Usage', 'Completion'].map(function (n) { return '<button type="button" role="tab" data-a="atab" data-id="' + n + '" aria-selected="' + (tab === n) + '">' + n + '</button>'; }).join('') + '</div>';
    var filters = selHTML('Project', 'project', [['', 'All projects']].concat(PROJECTS.map(function (p) { return [p, p]; })), A.project) + selHTML('Time range', 'days', [[7, 'Last 7 days'], [30, 'Last 30 days'], [90, 'Last 90 days']], A.days) +
      (tab !== 'Activity' ? selHTML('Provider', 'provider', [['', 'All agent providers'], ['Claude Code', 'Claude Code'], ['Codex', 'Codex']], A.provider) : '') +
      (tab === 'Execution' || tab === 'Usage' ? selHTML('Runner', 'runner', [['', 'All runners'], ['MacBook-Pro', 'MacBook-Pro'], ['Not recorded', 'Not recorded']], A.runner) : '') +
      (tab === 'Activity' ? selHTML('Show', 'series', [['both', 'Created and Done'], ['created', 'Created'], ['completed', 'Moved to Done']], A.series) : '') +
      (tab === 'Usage' ? selHTML('Measure', 'measure', [['tokens', 'Tokens'], ['cost', 'API cost']], A.measure) : '');
    var stamp = '<p class="w-muted w-anstamp">As of today, ' + clock(S.now) + ' · ' + (A.project || 'All projects') + ' · ' + A.days + ' days</p>', body = '';
    chartScope = [A.project, A.days, A.provider, A.runner, tab, A.measure].join('/');
    if (tab === 'Activity') {
      body = statsHTML([['Tasks created', r.created], ['Moved to Done', r.completed], ['Median task duration', hm(r.median)], ['Duration samples', r.samples]]) +
        '<p class="w-muted w-anfine">Duration includes waiting, from creation to the first recorded move to Done.</p><section><h3>Created and completed over time</h3>' + dailySVG(r.days, A.series, A === P.an ? 'phone' : 'desk') + '</section>';
    } else if (tab === 'Execution') {
      body = statsHTML([['Run attempts', r.attempts], ['Retries', r.retries], ['Failed runs', r.failed], ['Waiting for you', r.waiting]]) +
        '<p class="w-muted w-anfine">Latest outcomes of runs started in the selected period. A normal exit does not verify task completion.</p><section><h3>Run outcomes</h3>' +
        (r.attempts ? barsHTML([{ l: 'Normal exit', v: r.done, c: 'var(--ok)' }, { l: 'Failed', v: r.failed, c: 'var(--danger)' }, { l: 'Stopped', v: r.stopped }, { l: 'Blocked', v: r.blocked }, { l: 'Waiting', v: r.waiting, c: 'var(--warn)' }]) : '<p class="w-muted">No runs match these filters.</p>') + '</section>';
    } else if (tab === 'Usage') {
      body = statsHTML([['Input tokens', num(r.inTok)], ['Output tokens', num(r.outTok)], ['Reported API cost', usd(r.cost)], ['Usage-limit notices', r.limit]]) +
        '<p class="w-muted w-anfine">Measured usage from runs started in this period. Missing reports stay unknown; subscription charges and remaining quota are unknown.</p><section><h3>' + (A.measure === 'tokens' ? 'Token usage and reporting coverage' : 'Reported and estimated API cost') + '</h3>' +
        (A.measure === 'tokens' ? barsHTML([{ l: 'Input tokens', v: r.inTok, d: Math.max(0, r.attempts - 2) + '/' + r.attempts + ' runs reported input' }, { l: 'Output tokens', v: r.outTok, d: Math.max(0, r.attempts - 3) + '/' + r.attempts + ' runs reported output' }, { l: 'Cached tokens', v: r.cacheTok, c: 'var(--text-2)', d: 'May overlap input tokens' }])
          : barsHTML([{ l: 'Reported API cost', v: r.cost, f: usd(r.cost), d: 'Claude Code runs report their cost' }, { l: 'Estimated API equivalent', v: r.est, f: usd(r.est), c: 'var(--text-2)', d: 'Runs whose agent reports tokens but not a cost' }])) + '</section>';
    } else {
      body = statsHTML([['Accepted', r.accepted], ['Rejected', r.rejected], ['Controller-verified merges', r.verified], ['Normal session ends', r.normal]]) +
        '<p class="w-muted w-anfine">Assessments, board decisions, session ends and verified merges are separate signals, each with its own count.</p><div class="w-ansplit"><section><h3>Recorded assessments</h3>' +
        barsHTML([{ l: 'Accepted', v: r.accepted, c: 'var(--ok)' }, { l: 'Rejected', v: r.rejected, c: 'var(--danger)' }]) + '</section><section><h3>Completion signals</h3>' +
        barsHTML([{ l: 'Moved to Done', v: r.completed, c: 'var(--ok)' }, { l: 'Controller-verified merges', v: r.verified, c: 'var(--text-2)' }, { l: 'Normal session ends', v: r.normal }]) + '</section></div>';
    }
    return '<div class="w-an">' + tabs + '<div class="w-anfilters">' + filters + '</div>' + stamp + body + '</div>';
  }
  /* A Team's analytics: how tickets move, who finishes them, and how long a review waits. */
  var TEAM_DAYS = (function () {
    var out = [];
    for (var i = 0; i < 90; i++) { var dow = dateOf(-i).getDay(), wk = dow === 0 || dow === 6 ? 0.2 : 1; out.push({ created: Math.round(2.4 * wk * (0.4 + noise(500 + i) * 1.3)), completed: Math.round(2.1 * wk * (0.3 + noise(900 + i) * 1.3)) }); }
    return out;
  })();
  function teamAnalyticsHTML() {
    var n = D.tdays || 30, days = [], created = 0, completed = 0, reviews = 0;
    chartScope = 'team/' + n;
    for (var i = n - 1; i >= 0; i--) { var d = TEAM_DAYS[i]; days.push({ date: dateOf(-i), created: d.created, completed: d.completed }); created += d.created; completed += d.completed; }
    S.team.tickets.forEach(function (k) { if (k.st === 'review') reviews++; });
    var people = S.team.members.map(function (m, i) { return [m[0], Math.round(completed * [0.3, 0.17, 0.26, 0.22, 0.05][i])]; });
    var col = function (st) { return S.team.tickets.filter(function (k) { return k.st === st && !k.arch; }).length; };
    return '<div class="w-an"><div class="w-anfilters">' + selHTML('Time range', 'tdays', [[7, 'Last 7 days'], [30, 'Last 30 days'], [90, 'Last 90 days']], n) + '</div><p class="w-muted w-anstamp">As of today, ' + clock(S.now) + ' · ' + esc(S.team.project) + ' · ' + n + ' days</p>' +
      statsHTML([['Tickets created', created], ['Moved to Done', completed], ['Median time in review', n > 7 ? '5h 20m' : '4h 05m'], ['In review now', col('review')]]) +
      '<section><h3>Created and completed over time</h3>' + dailySVG(days, 'both', 'team') + '</section>' +
      '<div class="w-ansplit"><section><h3>Finished by person</h3>' + barsHTML(people.map(function (p) { return { l: p[0], v: p[1], c: p[0] === ME ? 'var(--accent)' : 'var(--ok)' }; })) + '</section>' +
      '<section><h3>Where tickets are now</h3>' + barsHTML([{ l: 'Available', v: col('available'), c: 'var(--text-2)' }, { l: 'In Progress', v: col('progress') }, { l: 'Review', v: col('review'), c: 'var(--warn)' }, { l: 'Done', v: col('done'), c: 'var(--ok)' }]) + '</section></div></div>';
  }

  /* ================= Settings: one screen, scoped to Universal, Individual or a Team =================
     Appearance and Alerts belong to the window; the rest belong to the workspace they change. Universal lists every
     workspace's sections, a workspace at a time. The records under Individual memory are scripted for the demo. */
  var MEM = [
    { id: 'mem_3f9a', label: 'Saved policy', kind: 'approved policy', ver: 'verified', upd: '2 days ago', by: 'Confirmed by you', text: 'Merge a finished branch into main on this computer after reading its diff. Share it through a pull request.', ref: 'Policy saved in my-app settings' },
    { id: 'mem_71c2', label: 'Decision', kind: 'explicit decision', ver: 'verified', upd: '5 days ago', by: 'Verified by controller', text: 'Tests take an injected clock instead of reading time.Now.', ref: 'Run run-5e1f on “Fix flaky auth test”' },
    { id: 'mem_a8d4', label: 'Verified fact', kind: 'fact', ver: 'verified', upd: '9 days ago', by: 'Verified by controller', text: 'Report exports go through internal/reports, and the PDF writer already quotes its fields.', ref: 'Commit 4be91d2 on main' }
  ];
  function setGroups(ws) {
    ws = ws || D.ws;
    var u = ws === 'universal', out = [{ label: 'General', sections: [['general/appearance', 'Appearance'], ['general/alerts', 'Alerts']] }];
    if (u || ws === 'individual') out = out.concat([
      { owner: 'Individual', label: 'Work', sections: [['personal/defaults', 'Task defaults'], ['personal/routing', 'Routing rules'], ['personal/time', 'Time format']] },
      { owner: 'Individual', label: 'Machines', sections: [['personal/runners', 'Runners'], ['personal/agents', 'Agents'], ['personal/computer', 'This computer']] },
      { owner: 'Individual', label: 'Connections', sections: [['personal/phones', 'Phones'], ['personal/github', 'GitHub'], ['personal/mcp', 'MCP services'], ['personal/memory', 'Individual memory']] }]);
    if (u || ws === 'team') out = out.concat([
      { owner: S.team.name, label: 'Work', sections: [['team/labels', 'Labels']] },
      { owner: S.team.name, label: 'Machines', sections: [['team/computer', 'This computer'], ['team/devices', 'Devices'], ['team/hosts', 'Workspace Hosts'], ['team/connectivity', 'Connectivity']] },
      { owner: S.team.name, label: 'Connections', sections: [['team/phones', 'Phones'], ['team/mcp', 'MCP clients'], ['team/memory', 'Team memory']] },
      { owner: S.team.name, label: 'Workspace', sections: [['team/backups', 'Backups'], ['team/license', 'License']] }]);
    return out;
  }
  function setCurrent() {
    var all = [];
    setGroups().forEach(function (g) { g.sections.forEach(function (s) { all.push(s); }); });
    for (var i = 0; i < all.length; i++) if (all[i][0] === D.set) return all[i];
    return all[0];
  }
  var SET_NOTE = {
    'personal/defaults': 'The agent, priority and interaction a new task starts with.', 'personal/routing': 'Send a task to an agent and a runner by its label or its project.',
    'personal/time': 'Twelve or twenty-four hours, and each project’s own timezone.', 'personal/runners': 'The computers that run your agents. This one is registered, and you can pair more.',
    'personal/agents': 'The coding agents Werkbord found on this computer, signed in the way you already signed them in.', 'personal/computer': 'This computer’s service, its data and its sign-ins.',
    'personal/github': 'Connect GitHub to create repositories and read pull requests. It is optional.', 'personal/mcp': 'Services Salie can call, each off until you turn it on.',
    'team/labels': 'The labels everyone in the Team can put on a ticket.', 'team/computer': 'The Team service this computer hosts for the workspace.', 'team/devices': 'The computers your members have paired.',
    'team/hosts': 'Where the workspace’s data lives.', 'team/connectivity': 'How members reach the workspace host.', 'team/mcp': 'Clients that may read the workspace.',
    'team/backups': 'Backups of the workspace, and how to restore one.', 'team/license': 'The workspace’s offline license.', 'team/phones': 'Phones paired with this Team. A Team phone shows a summary of the workspace.'
  };
  /* The rest of Settings, filled in as a working setup would look: what a person has chosen, what is connected, what is running.
     It is shown as it stands. Anything that would add or change something says so instead (see roToast). */
  var DEMO_ONLY = ' This is a fixed example in the demo.';
  /* A pasted single-server configuration, read the way the product reads it (web/src/lib/mcp-setup.ts): it fills in the fields and
     never runs anything, and anything it cannot carry over safely is refused rather than guessed. */
  function mcpImport(text) {
    var parsed;
    try { parsed = JSON.parse(text); } catch (x) { throw new Error('This is not valid JSON. Copy the configuration again from the service’s documentation.'); }
    var servers = parsed && parsed.mcpServers;
    if (!servers || typeof servers !== 'object' || Array.isArray(servers) || Object.keys(servers).length !== 1) throw new Error('Paste a configuration with exactly one entry inside mcpServers.');
    var name = Object.keys(servers)[0], v = servers[name];
    if (!v || typeof v !== 'object') throw new Error('The server entry must be an object.');
    if (Object.keys(v).some(function (k) { return ['command', 'args', 'url', 'headers', 'type', 'transport', 'env'].indexOf(k) < 0; })) throw new Error('This configuration has unsupported options. Enter it manually so no settings are lost.');
    if (v.env && (typeof v.env !== 'object' || Object.keys(v.env).length)) throw new Error('This configuration includes environment values. Enter it manually and use environment references instead of pasting secrets.');
    if (v.url !== undefined && v.command !== undefined) throw new Error('Choose one transport: a service URL or a local executable.');
    if (typeof v.url === 'string') {
      var u; try { u = new URL(v.url); } catch (y) { throw new Error('Use an HTTP or HTTPS service URL without embedded credentials.'); }
      if (['http:', 'https:'].indexOf(u.protocol) < 0 || u.username || u.password) throw new Error('Use an HTTP or HTTPS service URL without embedded credentials.');
      var bearer = false;
      if (v.headers) {
        if (typeof v.headers !== 'object' || Array.isArray(v.headers)) throw new Error('Headers must be an object.');
        Object.keys(v.headers).forEach(function (k) { if (k.toLowerCase() !== 'authorization' || typeof v.headers[k] !== 'string' || !/^Bearer \S+$/i.test(v.headers[k])) throw new Error('Only a Bearer Authorization header can be imported. Configure other authentication manually.'); bearer = true; });
      }
      return [['Name', esc(name)], ['Connection', 'Remote service'], ['Address', '<span class="w-mm">' + esc(u.href) + '</span>'], ['Authentication', bearer ? 'Bearer token (not shown)' : 'None'], ['Starts', 'Disabled until you test or enable it']];
    }
    if (typeof v.command !== 'string' || !v.command.trim() || (v.args !== undefined && (!Array.isArray(v.args) || v.args.some(function (x) { return typeof x !== 'string' || /[\r\n]/.test(x); })))) throw new Error('Provide an executable and a list of string arguments, or a service URL.');
    return [['Name', esc(name)], ['Connection', 'Local process'], ['Command', '<span class="w-mm">' + esc(v.command) + '</span>'], ['Arguments', '<span class="w-mm">' + esc((v.args || []).join(' ') || 'none') + '</span>'], ['Starts', 'Disabled until you test or enable it']];
  }
  function pnl(title, note, inner) { return '<section class="w-pn" aria-labelledby="set-h"><div class="head"><h3 id="set-h">' + esc(title) + '</h3><p class="w-muted">' + note + '</p></div>' + inner + '</section>'; }
  function srow(main, sub, right) { return '<li><span class="tx"><b>' + main + '</b><span class="w-mm">' + sub + '</span></span>' + (right ? '<span class="ac">' + right + '</span>' : '') + '</li>'; }
  function sbtn(label, msg, pri) { return '<button class="w-btn sm' + (pri ? ' pri' : '') + '" type="button" data-a="toast" data-v="' + esc(msg) + '">' + label + '</button>'; }
  function kvl(pairs) { return '<dl class="w-kv">' + pairs.map(function (p) { return '<dt>' + p[0] + '</dt><dd>' + p[1] + '</dd>'; }).join('') + '</dl>'; }
  function pickRow(name, options, cur) {
    return '<div class="w-setrow"><span class="w-setlabel">' + name + '</span><div class="w-seg" role="group" aria-label="' + name + '">' + options.map(function (o) { return '<button type="button" data-a="toast" data-v="Your choices are saved in the app. In the demo they are shown as an example." aria-pressed="' + (o === cur) + '">' + o + '</button>'; }).join('') + '</div></div>';
  }
  var LABELS = ['bug', 'feature', 'design', 'docs', 'infra', 'payments'];
  var SETPANELS = {
    'personal/defaults': function () {
      return pnl('Task defaults', SET_NOTE['personal/defaults'], pickRow('Agent', ['Claude Code', 'Codex'], 'Claude Code') + pickRow('Priority', ['Low', 'Normal', 'High'], 'Normal') + pickRow('Interaction', ['Ask me when needed', 'Autonomous', 'Stop if blocked'], 'Ask me when needed') +
        kvl([['Model', 'Agent default'], ['Reasoning', 'Agent default'], ['Agents at once, per project', String(LIMIT)], ['Merge into', '<b>main</b>, on this computer']]) + '<p class="w-muted fine">A task can override any of these, and a single run can override the task.</p>');
    },
    'personal/routing': function () {
      return pnl('Routing rules', SET_NOTE['personal/routing'], '<ul class="w-setlist">' +
        srow('Label <span class="w-chip">docs</span> → Codex', 'Any runner · first match wins', sbtn('Edit', 'Rules are edited in the app.' + DEMO_ONLY)) +
        srow('Project <span class="w-chip">marketing-site</span> → Claude Code', 'MacBook-Pro', sbtn('Edit', 'Rules are edited in the app.' + DEMO_ONLY)) +
        srow('Priority <span class="w-chip">high</span> → Claude Code', 'MacBook-Pro · starts first when a slot frees up', sbtn('Edit', 'Rules are edited in the app.' + DEMO_ONLY)) + '</ul>' +
        '<p class="w-muted fine">Rules choose an agent and a runner for new tasks. Nothing is routed to a computer you have not paired.</p>');
    },
    'personal/time': function () {
      return pnl('Time format', SET_NOTE['personal/time'], pickRow('Clock', ['12-hour', '24-hour'], '24-hour') + '<ul class="w-setlist">' +
        srow('my-app', 'Europe/Amsterdam') + srow('api-server', 'Europe/Amsterdam') + srow('marketing-site', 'America/New_York · the team that edits it works there') + '</ul>' +
        '<p class="w-muted fine">Each project keeps its own timezone, so a schedule means the same thing after travel or a clock change.</p>');
    },
    'personal/runners': function () {
      return pnl('Runners', SET_NOTE['personal/runners'], '<ul class="w-setlist">' + srow('MacBook-Pro · this computer', dot('ok') + 'Online · darwin/arm64 · Claude Code, Codex', '<span class="w-chip">' + (active() + 1) + '/' + (LIMIT + 1) + ' slots</span>') + '</ul>' +
        '<div><button class="w-btn" type="button" data-a="toast" data-v="Pairing another computer shows a code to enter there. It is turned off in the demo.">Pair a computer</button></div>');
    },
    'personal/agents': function () {
      return pnl('Agents', SET_NOTE['personal/agents'], '<ul class="w-setlist">' + srow('Claude Code', dot('ok') + 'Ready · 2.1.14 · signed in with your own account', sbtn('Check again', 'Werkbord looks for the agent and its sign-in again.' + DEMO_ONLY)) +
        srow('Codex', dot('ok') + 'Ready · 0.46.0 · signed in with your own account', sbtn('Check again', 'Werkbord looks for the agent and its sign-in again.' + DEMO_ONLY)) + '</ul>' +
        '<p class="w-muted fine">Werkbord never asks for your sign-ins. Each agent keeps the account you already signed it in with.</p>');
    },
    'personal/computer': function () {
      return pnl('This computer', SET_NOTE['personal/computer'], kvl([['Service', dot('ok') + ' Running · started 3 days ago'], ['Starts at login', 'On'], ['Data', '<span class="w-mm">~/Library/Application Support/Werkbord · 48 MB</span>'], ['Sign-ins', 'Claude Code, Codex (kept by the agents)'], ['Closing the window', 'Stops nothing. Agents and schedules keep running']]) +
        '<div class="w-setrow">' + sbtn('Restart the service', 'Restarting the service stops running agents. It is turned off in the demo.') + sbtn('Open the data folder', 'This opens the folder in Finder in the app.' + DEMO_ONLY) + '</div>');
    },
    'personal/github': function () {
      return pnl('GitHub', SET_NOTE['personal/github'], '<ul class="w-setlist">' + srow('michel-demo', dot('ok') + 'Connected · read pull requests, create repositories', sbtn('Disconnect', 'Disconnecting is turned off in the demo.')) + '</ul>' +
        '<p class="w-lab">Repositories Werkbord can see</p><ul class="w-setlist">' + srow('you/my-app', 'Linked to my-app · 1 open pull request') + srow('you/api-server', 'Linked to api-server · 2 open pull requests') + srow('you/marketing-site', 'Linked to marketing-site · 1 open pull request') + '</ul>' +
        '<p class="w-muted fine">A sample account for the demo. Werkbord reads pull requests and creates repositories when you ask. It never pushes without asking first.</p>');
    },
    'personal/mcp': function () {
      var dir = VIEW.mcp || 'service';
      var toggle = '<div class="w-seg mcp-direction" role="group" aria-label="MCP connection direction" style="margin-bottom:16px">' + [['service', 'Use a service in Werkbord'], ['client', 'Let a client use Werkbord']].map(function (o) {
        return '<button type="button" data-a="mcpdir" data-id="' + o[0] + '" aria-pressed="' + (dir === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>';
      if (dir === 'client') {
        return toggle + pnl('Connect a client to Werkbord', 'Give an external agent its own credential, limited to selected projects and board operations. It cannot start runs, change execution settings, or approve its own changes.',
          '<p class="w-muted fine">Werkbord’s MCP server is already built in. Name your client, choose its projects and operations, then create and copy its connection settings. Any compatible MCP client can connect. <a href="#" data-a="helpgo" data-id="mcp">How MCP setup works</a></p><p class="w-muted">No clients yet.</p><div><button class="w-btn" type="button" data-a="toast" data-v="Creating a client credential is turned off in the demo.">Add a client</button></div>');
      }
      var draft = VIEW.mcpDraft ? '<div class="w-notice" role="status"><p class="w-lab">Review before saving</p>' + kvl(VIEW.mcpDraft) + '<p class="w-muted fine">Saving a connection is turned off in the demo.</p></div>' : '';
      var err = VIEW.mcpErr ? '<p role="alert" style="color:var(--danger);font-size:13px">' + esc(VIEW.mcpErr) + '</p>' : '';
      return toggle + pnl('Connect Werkbord to a service', 'Connect services the assistant or coding agents can use through Werkbord. Credentials stay with the controller and are never passed to an agent. New connections start disabled.',
        '<details class="w-setuphelp" data-mcpopen' + (VIEW.mcpOpen ? ' open' : '') + '><summary>Have an MCP configuration? Paste it here</summary><p class="w-muted fine">Copy one server’s JSON configuration from its documentation. Werkbord fills in the fields for you; review them before saving. Nothing runs until you test or enable the connection.</p>' +
        '<label class="w-field"><span class="w-lab">MCP configuration</span><textarea class="w-input" data-mcp-paste rows="5" spellcheck="false" style="font-family:var(--mono);font-size:12px" placeholder="' + esc('{"mcpServers":{"my-service":{"url":"https://service.example/mcp"}}}') + '">' + esc(VIEW.mcpText || '') + '</textarea></label>' +
        '<div><button class="w-btn" type="button" data-a="mcpfill">Fill in connection</button></div></details>' + err + draft +
        '<p class="w-muted fine">For a hosted server, choose Remote service and enter its MCP URL. For a server installed on this computer, choose Local process and enter its executable and arguments. <a href="#" data-a="helpgo" data-id="mcp">MCP setup help</a></p>' +
        '<p class="w-muted" data-testid="mcp-empty">No MCP services yet. Salie only calls a service you have turned on.</p><div><button class="w-btn" type="button" data-a="toast" data-v="Adding a service is turned off in the demo.">Add a service</button></div>');
    },
    'team/labels': function () {
      return pnl('Labels', SET_NOTE['team/labels'], '<div class="w-setrow">' + LABELS.map(function (l) { return '<span class="w-chip">' + l + '</span>'; }).join('') + '</div><p class="w-muted fine">Labels group tickets on the board and in the Timeline. Anyone with the right to manage labels can add one.</p>');
    },
    'team/computer': function () {
      return pnl('This computer', SET_NOTE['team/computer'], kvl([['Team service', dot('ok') + ' Running'], ['Roles here', 'Runner, Workspace Host'], ['Workspace', esc(S.team.name) + ' · ' + S.team.role], ['Data', '<span class="w-mm">~/Library/Application Support/Werkbord Team · 112 MB</span>']]));
    },
    'team/devices': function () {
      return pnl('Devices', SET_NOTE['team/devices'], '<ul class="w-setlist">' + srow('Sam’s MacBook Air', dot('ok') + 'Owner · Runner, Workspace Host, Connectivity Host') + srow('MacBook-Pro · this computer', dot('ok') + 'You · Runner, Workspace Host') + srow('Maya’s ThinkPad', dot('ok') + 'Member · Runner') + srow('Jonas’s Mac mini', dot('neutral', 'hollow') + 'Member · Runner · last seen 2h ago') + srow('Priya', dot('neutral', 'hollow') + 'Member · no runner connected') + '</ul>');
    },
    'team/hosts': function () {
      return pnl('Workspace Hosts', SET_NOTE['team/hosts'], kvl([['Hosts', '2 of 3 online'], ['Saving changes', 'Available'], ['Needed to save', '2 of 3 Hosts']]) + '<ul class="w-setlist">' + srow('Sam’s MacBook Air', dot('ok') + 'Online · up to date') + srow('MacBook-Pro · this computer', dot('ok') + 'Online · up to date') + srow('Jonas’s Mac mini', dot('neutral', 'hollow') + 'Offline · returns on its own') + '</ul>');
    },
    'team/connectivity': function () {
      return pnl('Connectivity', SET_NOTE['team/connectivity'], kvl([['Connectivity Host', 'Sam’s MacBook Air'], ['Reachable now', '4 of 5 members'], ['Phones', 'Reach the Team through the Host']]) + '<p class="w-muted fine">Members reach the workspace through a Host. No server of Werkbord’s sits between them.</p>');
    },
    'team/mcp': function () {
      return pnl('MCP clients', SET_NOTE['team/mcp'], '<ul class="w-setlist">' + srow('Claude Desktop', dot('ok') + 'Read only · last used 2h ago', sbtn('Revoke', 'Revoking is turned off in the demo.')) + srow('Cursor', dot('neutral', 'hollow') + 'Read only · last used 3 days ago', sbtn('Revoke', 'Revoking is turned off in the demo.')) + '</ul>');
    },
    'team/backups': function () {
      return pnl('Backups', SET_NOTE['team/backups'], kvl([['Last backup', 'Today 03:00 · 14 MB'], ['Schedule', 'Every night'], ['Kept', 'The last 14']]) + '<ul class="w-setlist">' + srow('Today 03:00', '14 MB · verified', sbtn('Restore', 'Restoring is turned off in the demo.')) + srow('Yesterday 03:00', '14 MB · verified', sbtn('Restore', 'Restoring is turned off in the demo.')) + srow('2 days ago 03:00', '13 MB · verified', sbtn('Restore', 'Restoring is turned off in the demo.')) + '</ul><div><button class="w-btn" type="button" data-a="toast" data-v="Backing up is turned off in the demo.">Back up now</button></div>');
    },
    'team/license': function () {
      return pnl('License', SET_NOTE['team/license'], kvl([['Plan', 'Early access'], ['Your seat', S.team.role], ['Checked', 'On this computer, offline']]) + '<p class="w-muted fine">The license is a file that lives with the workspace. Nothing is checked over the network.</p>');
    }
  };

  function setPanel(cur) {
    var id = cur[0], label = cur[1];
    if (id === 'general/appearance') {
      var dark = WB.theme() === 'dark', stored = ''; try { stored = localStorage.getItem('wb-theme') || ''; } catch (x) {}
      return '<section class="w-pn" aria-labelledby="set-h"><div class="head"><h3 id="set-h">Theme</h3><p class="w-muted">Light or dark for the whole window and every workspace in it. It follows your Mac unless you choose.</p></div><div class="w-seg" role="group" aria-label="Theme">' +
        [['', 'Device'], ['light', 'Light'], ['dark', 'Dark']].map(function (o) { return '<button type="button" data-a="settheme" data-v="' + o[0] + '" aria-pressed="' + (stored === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div><p class="w-mm">Showing ' + (dark ? 'dark' : 'light') + '</p></section>';
    }
    if (id === 'general/alerts') {
      return '<section class="w-pn" aria-labelledby="set-h"><div class="head"><h3 id="set-h">Alerts</h3><p class="w-muted">When an agent asks you a question, gets blocked or fails, or finishes work for you to review while you are in another app, Werkbord shows a notification and bounces its icon in the Dock. Nothing is sent anywhere: they come from this computer.</p></div>' +
        '<div class="w-setrow"><button class="w-btn' + (D.alerts ? '' : ' pri') + '" type="button" data-a="setalerts" aria-pressed="' + D.alerts + '">' + (D.alerts ? 'Turn alerts off' : 'Turn alerts on') + '</button><span class="w-mm">' + dot(D.alerts ? 'ok' : 'neutral') + (D.alerts ? 'On' : 'Off') + '</span>' +
        (D.alerts ? '<button class="w-btn" type="button" data-a="settest">Send a test alert</button>' : '') + '</div></section>';
    }
    if (id === 'personal/phones' || id === 'team/phones') {
      var team = id === 'team/phones';
      return '<section class="w-pn" aria-labelledby="set-h"><div class="head"><h3 id="set-h">Phones</h3><p class="w-muted">' + (team ? 'A phone paired with ' + esc(S.team.name) + ' shows a summary of the workspace.' : 'Scan a code with your phone and it pairs with this computer. Each phone has its own credential, which you can rename or revoke here.') + '</p></div>' +
        (team ? '<ul class="w-setlist"><li><span class="tx"><b>Michel’s iPhone</b><span class="w-mm">' + dot('ok') + 'Connected · a summary of ' + esc(S.team.name) + '</span></span><span class="ac"><button class="w-btn sm" type="button" data-a="toast" data-v="Revoke signs that phone out for good. It is turned off in the demo.">Revoke</button></span></li></ul>' : '<ul class="w-setlist"><li><span class="tx"><b>Michel’s iPhone</b><span class="w-mm">' + dot('ok') + 'Connected · paired 3 days ago</span></span><span class="ac"><button class="w-btn sm" type="button" data-a="toast" data-v="Rename changes the name shown here. It is turned off in the demo.">Rename</button><button class="w-btn sm" type="button" data-a="toast" data-v="Revoke signs that phone out for good. It is turned off in the demo.">Revoke</button></span></li></ul>') +
        '<div><button class="w-btn pri" type="button" data-a="toast" data-v="Add a phone shows a code to scan. It is turned off in the demo.">Add a phone</button></div></section>';
    }
    if (id === 'personal/memory') {
      var shared = D.share === 2;
      var rec = D.share === 0 ? '<div class="w-setrow"><span class="w-mm">my-app → ' + esc(S.team.name) + ' · ' + esc(S.team.project) + ' · awaiting your approval</span><button class="w-btn sm" type="button" data-a="setshare" data-v="1">Review proposed text</button></div>'
        : D.share === 1 ? '<label class="w-field"><span class="w-lab">Text to share</span><textarea class="w-input" rows="3" readonly>' + esc(MEM[1].text) + '</textarea></label><p class="w-muted">Write only the implementation conclusion you intend to share. ' + esc(S.team.name) + ' still requires another authorised person to approve publication.</p><div class="w-setrow"><button class="w-btn pri sm" type="button" data-a="setshare" data-v="2">Approve this exact text for sharing</button><button class="w-btn sm" type="button" data-a="setshare" data-v="0">Cancel</button></div>'
        : '<div class="w-setrow"><span class="w-mm">' + dot('work') + 'Sent to ' + esc(S.team.name) + ' · waiting for a Team approver</span><button class="w-btn sm" type="button" data-a="setshare" data-v="0">Revoke publication</button></div>';
      return '<section class="w-pn" aria-labelledby="set-h"><div class="head"><h3 id="set-h">Individual memory</h3><p class="w-muted">What Werkbord remembers about your projects, on this computer. Salie reads it and cites it, and never changes it. Personal preferences, private sessions, transcripts, source code, credentials and local paths are never exported automatically.</p></div>' +
        '<ul class="w-setlist">' + MEM.map(function (m) { return '<li class="w-memrow"><span class="tx"><span class="w-mm"><b>' + m.label + '</b> · my-app · ' + m.by + ' · Current</span><span>' + esc(m.text) + '</span><span class="w-mm">' + m.id + ' · ' + esc(m.ref) + '</span></span></li>'; }).join('') + '</ul></section>' +
        '<section class="w-pn" aria-label="Proposed and shared memories"><div class="head"><h3>Proposed and shared memories</h3><p class="w-muted">' + esc(MEM[1].text) + '</p></div>' + rec +
        '<p class="w-muted fine">Revocation removes active Team access when acknowledged. It cannot erase copies already read.</p></section>';
    }
    if (id === 'team/memory') {
      return '<section class="w-pn" aria-labelledby="set-h"><div class="head"><h3 id="set-h">Team memory</h3><p class="w-muted">Records members publish from their own Individual memory, after a second person approves them. Everyone on the project can read them, and Salie cites them as Team memory.</p></div><ul class="w-setlist">' +
        '<li class="w-memrow"><span class="tx"><span class="w-mm"><b>Saved policy</b> · ' + esc(S.team.project) + ' · Approved by Sam Okafor</span><span>Every change goes through a pull request and one review before it merges.</span><span class="w-mm">tmem_20b7 · Policy in ' + esc(S.team.project) + ' settings</span></span></li>' +
        (D.share === 2 ? '<li class="w-memrow"><span class="tx"><span class="w-mm"><b>Decision</b> · ' + esc(S.team.project) + ' · ' + dot('work') + 'Waiting for a Team approver</span><span>' + esc(MEM[1].text) + '</span><span class="w-mm">Published by You from Individual memory</span></span></li>' : '') + '</ul></section>';
    }
    if (SETPANELS[id]) return SETPANELS[id]();
    return pnl(label, esc(SET_NOTE[id] || ''), '');
  }
  function settingsHTML() {
    var cur = setCurrent(), prev = null, u = D.ws === 'universal';
    var nav = setGroups().map(function (g) {
      var own = u && g.owner && g.owner !== prev ? '<p class="w-setown">' + esc(g.owner) + '</p>' : '';
      prev = g.owner || null;
      return own + '<div class="w-setgrp" role="group" aria-label="' + esc((g.owner ? g.owner + ' ' : '') + g.label) + '"><h2>' + g.label + '</h2>' + g.sections.map(function (s) {
        return '<button class="w-setitem" type="button" data-a="setsec" data-id="' + s[0] + '"' + (s[0] === cur[0] ? ' aria-current="page"' : '') + '>' + s[1] + '</button>';
      }).join('') + '</div>';
    }).join('');
    var scope = u ? 'Universal · every workspace' : D.ws === 'individual' ? 'Individual · this computer' : S.team.name + ' · Team workspace';
    return '<header class="w-ghead"><div class="w-uh"><h1>Settings</h1><p class="w-lede">' + esc(scope) + '</p></div></header><main class="w-main" style="overflow:hidden"><div class="w-set"><nav class="w-setnav" aria-label="Settings sections" data-keep="setnav">' + nav + '</nav><div class="w-setbody" data-keep="setbody">' + setPanel(cur) + '</div></div></main>';
  }
  function helpButtonHTML() { return '<button class="w-help" type="button" data-a="help" aria-label="Help and keyboard shortcuts"><span aria-hidden="true">' + ic('help', 15) + '</span>Help</button>'; }

  /* ================= desktop ================= */
  function projQuestions(p) { return p === 'my-app' ? questions() : p === 'api-server' && S.ext.ask.st === 'needs' ? [extTask()] : []; }
  function bannerHTML() {
    var q = projQuestions(curProj()); if (!q.length) return '';
    var t = q[0];
    return '<button class="w-banner" type="button" data-a="open" data-id="' + t.id + '"><span class="w-num pend">' + q.length + '</span><span class="text"><strong>' + (q.length === 1 ? '1 question needs your input' : q.length + ' questions need your input') + '</strong><span class="what">' + curProj() + ' · ' + esc(t.title) + ': ' + esc(t.run.q) + '</span></span><span class="go">' + (q.length === 1 ? 'Answer' : 'Review') + ' →</span></button>';
  }
  function headHTML() {
    var pr = curProj();
    return '<header class="w-head"><div class="w-where"><button class="w-pname" type="button" data-a="pal"><h1>' + pr + '</h1><span class="chev">' + ic('down', 14) + '</span></button><p class="w-path">~/code/' + pr + ' · main</p></div>' +
      '<div class="w-acts"><button class="w-btn" type="button" data-a="pal">' + ic('search') + 'Jump to<kbd class="w-key">⌘ K</kbd></button>' +
      '<button class="w-btn ic" type="button" data-a="view" data-id="psettings" aria-label="Project settings">' + ic('settings') + '</button>' +
      '<button class="w-btn pri" type="button" data-a="new">' + ic('plus') + 'New task</button></div></header>' +
      '<nav class="w-tabs" aria-label="' + pr + ' sections">' + [['overview', 'Overview'], ['board', 'Board'], ['calendar', 'Calendar'], ['git', 'Git'], ['runs', 'Runs']].map(function (s) {
        var badge = s[0] === 'git' && gitItems().length ? '<span class="w-num pend">' + gitItems().length + '</span>' : '';
        return '<button class="w-tab" type="button" data-a="view" data-id="' + s[0] + '"' + (D.view === s[0] ? ' aria-current="page"' : '') + '>' + s[1] + badge + '</button>';
      }).join('') + '</nav>';
  }

  function legendHTML(phone) {
    var c = function (f) { return curTasks().filter(f).length; };
    var items = [['work', c(function (t) { return t.run && t.run.st === 'running'; }), 'running'], ['ask', c(function (t) { return t.run && t.run.st === 'needs'; }), 'needs you'],
      ['block', c(function (t) { return t.run && t.run.st === 'blocked'; }), 'blocked'], ['ok', c(function (t) { return t.state === 'review'; }), 'ready for review']];
    return '<ul class="w-legend" aria-label="Agents at a glance">' + items.filter(function (i) { return !phone || i[1]; }).map(function (i) { return '<li' + (i[1] ? '' : ' class="zero"') + '>' + dot(i[0]) + i[1] + ' ' + i[2] + '</li>'; }).join('') + '</ul>';
  }
  function opts(list, cur) { return list.map(function (o) { return '<option' + (o === cur ? ' selected' : '') + '>' + o + '</option>'; }).join(''); }
  function filtersHTML() {
    var tasks = curTasks(), archived = tasks.filter(function (t) { return t.archived; }).length, any = tasks.some(function (t) { return t.state === 'done' && !t.archived; });
    return '<div class="w-filters"><label class="w-pick"><span>Agent</span><select aria-label="Filter by agent" data-sel="fa">' + opts(['any', 'Claude Code', 'Codex'], VIEW.fa) + '</select></label>' +
      '<label class="w-pick"><span>Priority</span><select aria-label="Filter by priority" data-sel="fp">' + opts(['any', 'high', 'normal', 'low'], VIEW.fp) + '</select></label>' +
      '<button class="w-btn sm" type="button" data-a="archview" aria-pressed="' + !!VIEW.arch + '">' + (VIEW.arch ? 'Back to board' : 'Archive (' + archived + ')') + '</button>' +
      '<button class="w-btn sm" type="button" data-a="archdone"' + (any ? '' : ' disabled') + ' title="Move all Done tasks into the archive and keep their details">Archive Done tasks</button></div>';
  }
  var COLS = [['backlog', 'Backlog'], ['doing', 'In progress'], ['review', 'Review'], ['done', 'Done']];
  var ORDER = { high: 0, normal: 1, low: 2 };
  function inCol(c) {
    return curTasks().filter(function (t) { return t.state === c && !t.archived && (VIEW.fa === 'any' || t.agent === VIEW.fa) && (VIEW.fp === 'any' || t.prio === VIEW.fp); }).sort(function (a, b) {
      if (c === 'done') return b.doneAt - a.doneAt;
      return Number(!!b.guided) - Number(!!a.guided) || ORDER[a.prio] - ORDER[b.prio] || a.id - b.id;
    });
  }
  function emptyCol(c) {
    return c === 'backlog' ? 'Nothing waiting. Add a task with <kbd class="w-key">N</kbd>.' : c === 'doing' ? 'No agent is working. Start one from Backlog.' : c === 'review' ? 'Finished work lands here for you to review.' : 'Merged work lands here.';
  }
  function archiveHTML() {
    return '<section class="w-archive" aria-label="Task archive"><div class="head"><div><h2>Archived work</h2><p class="w-muted">Archived tasks and cleared Done cards. Their conversations, runs and Git evidence are kept.</p></div>' +
      '<label class="w-field"><span class="w-lab">Search archive</span><input class="w-input" type="search" data-arch-q value="' + esc(VIEW.aq || '') + '" placeholder="Title or task details" autocomplete="off"></label></div><ul class="w-archlist" data-arch-list>' + archiveRows() + '</ul></section>';
  }
  function archiveRows() {
    var q = (VIEW.aq || '').toLowerCase();
    var ts = curTasks().filter(function (t) { return t.archived != null && (t.title + ' ' + (t.desc || '')).toLowerCase().indexOf(q) > -1; }).sort(function (a, b) { return b.archived - a.archived; });
    return ts.length ? ts.map(function (t) {
      return '<li><div><button class="rtitle" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button><p class="w-mm">Done · Archived ' + ago(S.now - t.archived) + '</p></div><button class="w-btn sm" type="button" data-a="restore" data-id="' + t.id + '">Restore</button></li>';
    }).join('') : '<li class="w-muted">' + (q ? 'No archived tasks match.' : 'No archived work yet. Archive Done tasks, or archive a task, to keep it here.') + '</li>';
  }
  function boardHTML() {
    if (VIEW.arch) return '<div class="w-bview"><div class="w-bar">' + filtersHTML() + '</div><div class="w-bscroll">' + archiveHTML() + '</div></div>';
    return '<div class="w-bview"><div class="w-bar">' + filtersHTML() + legendHTML() + '</div><div class="w-cols">' + COLS.map(function (c) {
      var ts = inCol(c[0]);
      return '<section class="w-col w-tray" data-col="' + c[0] + '" data-mp="db-' + c[0] + '" aria-label="' + c[1] + '"><header class="w-ch"><h2>' + c[1] + '</h2><span class="w-chip">' + ts.length + '</span>' +
        (c[0] === 'backlog' ? '<button class="w-btn quiet sm ic add" type="button" data-a="new" aria-label="Add a task to Backlog">' + ic('plus') + '</button>' : '') + '</header>' +
        '<div data-hint="' + c[0] + '"></div><ul class="w-list" data-keep="col-' + c[0] + '">' + (ts.length ? ts.map(function (t) { return cardHTML(t, D.task == t.id); }).join('') : '<li class="w-none">' + emptyCol(c[0]) + '</li>') + '</ul></section>';
    }).join('') + '</div></div>';
  }

  function controlHTML(phone) {
    var items = rowsInd(), qs = items.filter(function (i) { return i.kind === 'question'; }), bl = items.filter(function (i) { return i.kind === 'blocked'; });
    var cur = phone ? P.cc : D.cc, cp = (phone ? P.ccp : D.ccp) || 'all', ca = (phone ? P.cca : D.cca) || 'all';
    var shown = items.filter(function (i) { return (cur === 'all' || i.kind === cur) && (cp === 'all' || i.project === cp) && (ca === 'all' || i.t.agent === ca); });
    var cfilters = '<div class="w-filters"><label class="w-pick"><span>Project</span><select aria-label="Filter by project" data-sel="ccp">' + opts(['all'].concat(PROJECTS), cp) + '</select></label><label class="w-pick"><span>Agent</span><select aria-label="Filter by agent" data-sel="cca">' + opts(['all', 'Claude Code', 'Codex'], ca) + '</select></label></div>';
    var seg = '<div class="w-seg" role="group" aria-label="Show">' + [['all', 'All', items.length], ['question', 'Needs input', qs.length], ['blocked', 'Blocked', bl.length]].filter(function (s) { return s[0] === 'all' || s[2]; }).map(function (s) {
      return '<button type="button" data-a="cc" data-id="' + s[0] + '" aria-pressed="' + (cur === s[0]) + '">' + s[1] + ' <span class="w-mm">' + s[2] + '</span></button>';
    }).join('') + '</div>';
    var list = '<ul style="display:flex;flex-direction:column;gap:14px" data-mp="attn">' + (shown.length ? shown.map(function (i) { return itemHTML(i, true); }).join('') : '<li class="w-empty">Nothing needs you. Agents are working or waiting for review.</li>') + '</ul>';
    var mine = S.tasks.filter(function (t) { return t.run && t.run.st === 'running'; });
    var others = [];
    ['api-server', 'marketing-site'].forEach(function (p) { projTasks(p).forEach(function (t) { if (t.run && t.run.st === 'running') others.push(t); }); });
    var running = mine.concat(others);
    var queued = S.tasks.filter(function (t) { return (t.state === 'backlog' && t.sched) || (t.run && t.run.st === 'queued'); }).concat(extSched().filter(function (e) { return e.tag === 'Individual'; }).map(function (e) { return { ext: true, title: e.title, project: e.project, sched: { d: e.d, s: e.s } }; })).sort(function (a, b) { return schedAbs(a) - schedAbs(b); });
    var go = phone ? 'pproject' : 'proj';
    var side = '<section class="w-pn" aria-label="Projects"><div class="w-ph">Projects <span class="w-chip">3</span></div><ul>' +
      PROJECTS.slice().reverse().map(function (p) {
        var st = projStats(p);
        return '<li class="w-line"><button class="w-linebtn" type="button" data-a="' + go + '" data-id="' + p + '"><div class="top"><span class="sq" style="width:7px;height:7px;background:var(--text)"></span><b style="font-weight:500">' + p + '</b>' + (st.asks ? '<span class="w-num pend" style="margin-left:auto">' + st.asks + '</span>' : '') + '</div><p class="w-mm sub">' + esc(statsText(p)) + '</p></button></li>';
      }).join('') + '</ul></section>' +
      '<section class="w-pn" aria-label="Running now"><div class="w-ph">Running now <span class="w-chip">' + running.length + '</span></div><ul>' +
      running.map(function (t) { return '<li class="w-line"><div class="top">' + dot('work', 'pulse') + '<button class="rtitle" style="border:0;background:none;padding:0;font-weight:500;color:var(--text);text-align:left" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button></div><p class="w-mm sub">' + (t.project || 'my-app') + ' · ' + t.agent + ' · <span data-el="' + t.id + '">' + dur(t.run.el) + '</span></p><p class="w-mm sub" data-lg2="' + t.id + '" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">› ' + esc(t.run.logs[Math.max(0, t.run.li - 1)] || '') + '</p></li>'; }).join('') + '</ul></section>' +
      '<section class="w-pn" aria-label="Scheduled and queued"><div class="w-ph">Scheduled and queued <span class="w-chip">' + queued.length + '</span></div><ul>' + (queued.length ? queued.map(function (t) {
        if (t.ext) return '<li class="w-line"><div class="top">' + ic('calendar') + '<b style="font-weight:500">' + esc(t.title) + '</b></div><p class="w-mm sub">' + t.project + ' · Scheduled ' + dayLabel(t.sched.d) + ' ' + clock(t.sched.s) + '</p></li>';
        var w = waitingFor(t);
        return '<li class="w-line"><div class="top">' + ic('calendar') + '<button style="border:0;background:none;padding:0;font-weight:500;color:var(--text);text-align:left" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button></div><p class="w-mm sub">my-app · ' + (t.run && t.run.st === 'queued' ? 'Waiting for Capacity' : w.length ? 'Waiting on Dependency' : 'Scheduled ' + dayLabel(t.sched.d) + ' ' + clock(t.sched.s)) + '</p></li>';
      }).join('') : '<li class="w-mm">Nothing planned.</li>') + '</ul></section>';
    if (!phone) side += '<section class="w-pn" aria-label="Runners"><div class="w-ph">Runners <span class="w-chip">1</span><a class="end" href="#" data-a="settings" data-id="personal/runners">Manage</a></div><div class="w-line" style="border:0;padding:0"><div class="top">' + dot('ok') + '<b style="font-weight:500">MacBook-Pro · this computer</b><span class="w-mm" style="margin-left:auto" data-conc>' + (active() + 1) + '/' + (LIMIT + 1) + '</span></div><p class="w-mm">darwin/arm64 · Claude Code, Codex</p></div></section>';
    if (phone) return { seg: seg, filters: cfilters, list: list, side: side, n: items.length, running: running.length };
    return '<div class="w-split w-cc"><div class="w-pane" data-keep="cc-l"><div class="w-ccbar">' + seg + cfilters + '</div>' + list + '</div><div class="w-pane" data-keep="cc-r">' + side + '</div></div>';
  }
  function schedAbs(t) { return t.sched ? t.sched.d * 1440 + t.sched.s : 1e9; }

  var HIST = '..........................ggg.gg.....gggbg.ggbbab';
  function stripHTML() {
    var cells = '';
    for (var i = 0; i < 48; i++) { var ch = HIST.charAt(i); cells += '<i class="' + (ch === '.' ? '' : ch) + '"></i>'; }
    return '<div class="w-stripwrap"><div class="w-strip" role="img" aria-label="Runs over the last 24 hours, 30 minutes per cell">' + cells + '</div><span class="w-mm">30 min per cell</span></div>';
  }
  var RUNSTATE = { running: ['work', 'Running'], needs: ['ask', 'Needs input'], blocked: ['block', 'Blocked'], queued: ['neutral', 'Waiting'], completed: ['ok', 'Completed'], merged: ['ok', 'Completed'], stopped: ['neutral', 'Stopped'] };
  function runList() { return curTasks().filter(function (t) { return t.run; }).sort(function (a, b) { return (b.run.started || 0) - (a.run.started || 0); }); }
  /* When a run started, in words: the day it is on, and the time. */
  function whenLabel(m) { var d = Math.floor(m / 1440); return (d === 0 ? 'Today' : d === -1 ? 'Yesterday' : dayName(d)) + ' ' + clock(m); }

  function projLog(p) { return p === 'my-app' ? S.log : FXLOG[p] || []; }
  function overviewHTML() {
    var items = projAttention(curProj());
    var live = runList().filter(function (t) { return t.run.st !== 'merged'; });
    var branches = gitItems();
    return '<div class="w-split"><div class="w-pane" data-keep="ov-l">' +
      '<section class="w-pn" aria-label="Needs you"><div class="w-ph">Needs you <span class="w-chip">' + items.length + '</span></div><ul style="display:flex;flex-direction:column;gap:12px">' + (items.length ? items.map(function (i) { return itemHTML(i, false); }).join('') : '<li class="w-empty">All clear. Agents are working or waiting for review.</li>') + '</ul></section>' +
      '<section class="w-pn" aria-label="Runs"><div class="w-ph">Runs <span class="w-chip">' + live.length + '</span><span class="end w-mm">last 24 hours</span></div>' + stripHTML() +
      '<div class="w-tbl" style="--cols:110px minmax(0,1fr) 130px 70px"><div class="w-tr th"><span>Run</span><span>Task</span><span>State</span><span class="r">Time</span></div>' + live.map(function (t) {
        var st = RUNSTATE[t.run.st];
        return '<div class="w-tr"><span class="w-mm">' + t.run.id + '</span><span style="font-weight:500">' + esc(t.title) + '</span><span class="w-badge">' + dot(st[0]) + st[1] + '</span><span class="w-mm r" data-el="' + t.id + '">' + dur(t.run.el) + '</span></div>';
      }).join('') + '</div></section></div>' +
      '<div class="w-pane" data-keep="ov-r"><section class="w-pn" aria-label="Git"><div class="w-ph">Git <span class="w-chip">main</span><a class="end" href="#" data-a="view" data-id="git">Open →</a></div><div class="w-big">' + dot('neutral') + branches.length + ' werkbord branch' + (branches.length === 1 ? '' : 'es') + '</div><p class="w-mm">' + branches.filter(function (t) { return t.state === 'review'; }).length + ' ready to merge · ' + branches.length + ' unpushed · ' + (curProj() === 'my-app' ? 0 : 2) + ' to clean up</p></section>' +
      '<section class="w-pn" aria-label="Agents"><div class="w-ph">Agents</div>' + ['Claude Code', 'Codex'].map(function (a) {
        var n = curTasks().filter(function (t) { return t.agent === a && isActive(t); }).length;
        return '<div style="display:flex;align-items:center;gap:10px;font-size:13px">' + dot('ok') + '<b style="font-weight:500">' + a + '</b><span class="w-mm">ready</span><span class="w-mm" style="margin-left:auto">' + n + ' active</span></div>';
      }).join('') + '</section>' +
      '<section class="w-pn" aria-label="Activity"><div class="w-ph">Activity</div><div style="display:flex;flex-direction:column;gap:12px">' + projLog(curProj()).slice(0, 7).map(function (l) { return '<div class="w-act"><span class="w-mm">' + clock(l.t) + '</span><span>' + esc(l.x) + '</span></div>'; }).join('') + '</div></section></div></div>';
  }

  function runsHTML() {
    var rs = runList();
    return '<div style="padding:16px 24px 24px;display:flex;flex-direction:column;gap:16px"><div style="display:flex;align-items:center;gap:16px">' + stripHTML().replace('w-stripwrap', 'w-stripwrap" style="flex:1') +
      '<label class="w-pick"><span>State</span><select><option>any</option><option>running</option><option>needs input</option><option>completed</option></select></label><span class="w-mm">' + rs.length + ' of ' + rs.length + '</span></div>' +
      '<section class="w-pn" style="padding:4px 16px"><div class="w-tbl" style="--cols:84px minmax(0,1.5fr) 100px 96px 120px 92px 60px 64px 56px"><div class="w-tr th" style="padding-top:12px"><span>Run</span><span>Task</span><span>Agent</span><span>Runner</span><span>State</span><span>Started</span><span class="r">Time</span><span class="r">Tokens</span><span class="r">Cost</span></div>' + rs.map(function (t) {
        var st = RUNSTATE[t.run.st], d = t.run.started;
        return '<div class="w-tr"><span class="w-mm">' + t.run.id + '</span><button style="border:0;background:none;padding:0;text-align:left;font-weight:500;color:var(--text)" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button><span>' + t.agent + '</span><span class="w-mm">this computer</span><span class="w-badge">' + dot(st[0]) + st[1] + '</span><span class="w-mm">' + whenLabel(d) + '</span><span class="w-mm r" data-el="' + t.id + '">' + dur(t.run.el) + '</span><span class="w-mm r">' + (t.run.tokens || '–') + '</span><span class="w-mm r">' + (t.run.cost || '–') + '</span></div>';
      }).join('') + '</div></section></div>';
  }

  function gitItems(p) { return projTasks(p || curProj()).filter(function (t) { return t.run && t.run.st === 'completed' && !t.archived; }); }
  var HEAD = { 'my-app': 'c93e343', 'api-server': '7be12d0', 'marketing-site': 'a41f9c6' };
  function branchCardHTML(t) {
    var r = t.run;
    return '<li class="w-card w-branch"><p class="w-bname">werkbord/<b>' + esc(r.branch) + '</b></p><p style="display:flex;gap:6px;flex-wrap:wrap"><span class="w-chip">' + dot('work') + r.ahead + ' ahead</span><span class="w-chip">' + (r.pushed ? dot('ok') + 'on origin' : dot('ask') + 'not on any remote') + '</span></p>' +
      '<p class="w-bwarn">' + r.ahead + ' commit' + (r.ahead === 1 ? '' : 's') + ' ready to review</p><p class="w-muted" style="font-size:13px">' + r.ahead + ' ahead of main · ' + (r.pushed ? 'tracks origin/' + branchOf(t) : 'no upstream') + '</p><p class="w-muted" style="font-size:13px"><span class="w-mm" style="color:var(--text)">' + (t.id * 2654435761 >>> 0).toString(16).slice(0, 8) + '</span> ' + esc(r.commit) + ' · ' + ago(S.now - (r.ended || S.now)) + '</p>' +
      '<div class="w-bfoot"><button class="link" type="button" data-a="open" data-id="' + t.id + '">' + esc(t.title) + '</button><button class="w-btn" type="button" data-a="open" data-id="' + t.id + '">Review</button><button class="w-btn" type="button" data-a="merge" data-id="' + t.id + '">Merge…</button>' + (r.pushed ? '' : '<button class="w-btn" type="button" data-a="push" data-id="' + t.id + '">Push…</button>') + '</div></li>';
  }
  var GITSUBS = [['overview', 'overview', 'Overview'], ['health', 'check', 'Health'], ['branches', 'git', 'Branches'], ['pr', 'pr', 'Pull requests'], ['changes', 'changes', 'Changes'], ['worktrees', 'folder', 'Worktrees'], ['history', 'runs', 'History']];
  var PRS = { 'my-app': [], 'api-server': [['#41', 'Bump the Postgres driver to 5.6', 'dependabot', 'open · checks passing'], ['#42', 'Allow the new dashboard origin in CORS', 'you', 'open · review requested']], 'marketing-site': [['#17', 'Update the footer links', 'you', 'draft']] };
  function gitNavHTML() {
    var n = gitItems().length, counts = { branches: n + 1, pr: PRS[curProj()].length, changes: 0, worktrees: n + 3 }, cur = VIEW.gsub || 'overview';
    return '<div class="w-gnav">' + GITSUBS.map(function (b) {
      return '<button class="w-btn" type="button" data-a="gnav" data-id="' + b[0] + '"' + (b[0] === cur ? ' aria-current="page"' : '') + '>' + ic(b[1]) + b[2] + (counts[b[0]] != null ? '<span class="w-chip">' + counts[b[0]] + '</span>' : '') + '</button>';
    }).join('') + '</div>';
  }
  /* Git's other views, for the project on show: its health, branches, pull requests, working tree, worktrees and history. */
  function gitSubHTML(sub) {
    var pr = curProj(), items = gitItems(), mm = function (x) { return '<span class="w-mm">' + x + '</span>'; };
    function list(rows) { return '<ul class="w-setlist">' + rows.join('') + '</ul>'; }
    if (sub === 'health') {
      return healthHTML() + '<section class="w-pn"><div class="w-ph">Checks</div>' + list(['The working tree is clean', 'main is up to date with origin', 'No branch is far behind main', 'No branch has a merge conflict with main', 'No worktree is missing its branch', 'Every Werkbord branch belongs to a task', 'The remote answers', 'Git is the version the app expects'].map(function (c) { return srow(c, dot('ok') + 'Passed'); })) +
        '<p class="w-muted fine">Health is read from Git metadata only: no network, no AI, nothing changed.</p></section>';
    }
    if (sub === 'branches') {
      return '<section class="w-pn"><div class="w-ph">Branches <span class="w-chip">' + (items.length + 1) + '</span></div>' + list([srow('main', dot('ok') + 'HEAD · up to date with origin · ' + HEAD[pr])].concat(items.map(function (t) { return srow('werkbord/' + esc(t.run.branch), (t.run.pushed ? dot('ok') + t.run.ahead + ' ahead · on origin' : dot('ask') + t.run.ahead + ' ahead · not on any remote'), '<button class="w-btn sm" type="button" data-a="open" data-id="' + t.id + '">Review</button>'); }))) +
        '<p class="w-muted fine">Werkbord branches are made for an agent’s task and merged locally when you say so.</p></section>';
    }
    if (sub === 'pr') {
      var prs = PRS[pr];
      return '<section class="w-pn"><div class="w-ph">Pull requests <span class="w-chip">' + prs.length + '</span></div>' + (prs.length ? list(prs.map(function (x) { return srow(x[0] + ' ' + esc(x[1]), esc(x[2]) + ' · ' + x[3]); })) + '<p class="w-muted fine">Read from GitHub. Werkbord never changes a pull request.</p>' : '<p class="w-muted">No open pull requests. Werkbord branches are merged on this computer, and shared through a pull request when you choose.</p>') + '</section>';
    }
    if (sub === 'changes') {
      return '<section class="w-pn"><div class="w-ph">Working tree</div><p class="w-big">' + dot('ok') + 'Clean</p><p class="w-muted" style="font-size:13px">Nothing to commit on <b>main</b>. Agents work in their own worktrees, so your checkout stays as you left it.</p></section>';
    }
    if (sub === 'worktrees') {
      var mine = projTasks(pr).filter(function (t) { return t.run && t.run.branch && !t.archived && t.state !== 'done'; });
      return '<section class="w-pn"><div class="w-ph">Worktrees <span class="w-chip">' + (mine.length + 1) + '</span></div>' + list([srow('~/code/' + pr, dot('ok') + 'main · your checkout')].concat(mine.map(function (t) { return srow('~/.werkbord/worktrees/' + pr + '/' + esc(t.run.branch), dot(t.run.st === 'running' ? 'work' : 'ask') + (t.run.st === 'running' ? 'An agent is working here' : 'Kept until you merge or discard')); }))) + '</section>';
    }
    // history: what reached main
    var commits = projTasks(pr).filter(function (t) { return t.state === 'done' && t.run; }).sort(function (a, b) { return b.doneAt - a.doneAt; }).slice(0, 8).map(function (t) {
      return srow(esc(t.run.commit || t.title), mm((t.id * 2654435761 >>> 0).toString(16).slice(0, 7)) + ' · merged ' + ago(S.now - t.doneAt));
    });
    return '<section class="w-pn"><div class="w-ph">History <span class="w-chip">main</span></div>' + list(commits.concat([srow('Initial commit', mm('4be91d2') + ' · 6 weeks ago')])) + '</section>';
  }
  function healthHTML() {
    var finding = S.finding && curProj() === 'my-app';
    return '<section class="w-pn" aria-label="Repository health"' + (finding ? ' style="border-color:color-mix(in srgb,var(--amber) 55%,var(--border))"' : '') + '><div class="w-ph"><span class="w-lab">Repository health</span><button class="w-btn sm end" type="button" data-a="toast" data-v="Health is recalculated when something changes, from Git metadata only: no network, no AI, nothing changed." style="margin-left:auto">Check now</button></div><p class="w-big" style="font-size:22px;' + (finding ? 'color:var(--warn-text)' : '') + '">' + (finding ? '1 item needs attention' : 'Healthy') + '</p><p class="w-muted" style="font-size:13px">Checked 2m ago · score ' + (finding ? 94 : 100) + '</p>' +
      (finding ? '<div class="w-slot"><b style="font-weight:600;font-size:13px">A branch is falling behind main</b><p class="w-muted" style="font-size:13px">werkbord/refactor-settings-page is 14 commits behind main. Merging it later may need a rebase first.</p><p class="w-well">git rev-list --count werkbord/refactor-settings-page..main → 14</p><div><button class="w-btn sm" type="button" data-a="finding">Create Backlog task</button></div></div>' :
        '<p class="w-muted" style="font-size:13px">11 checks passed. Findings never act on their own: you choose what becomes a task.</p>') + '</section>';
  }
  /* ---------- Git Fetch and Push ----------
     As in the app: while a request is out, a bounded arrow and a thin current say so (no percentage, no stage that was not reported);
     what comes back keeps this computer's side and the remote's side apart, and only a result the remote confirmed gets a drawn check.
     The demo's remote answers from a script, after a moment. */
  var xferTimers = [];
  function xferIcon(state, dir) {
    return '<span class="w-xfer" data-state="' + state + '" data-direction="' + dir + '" aria-hidden="true"><svg viewBox="0 0 16 16">' +
      (state === 'done' ? '<path class="check" d="m2 8 4 4 8-9" pathLength="1"/>' : '<path class="arrow" d="' + (dir === 'down' ? 'M8 2v12m-5-5 5 5 5-5' : 'M8 14V2m-5 5 5-5 5 5') + '"/>') + '</svg></span>';
  }
  function fetchButton() {
    var pend = S.xfer.fetching === curProj(), done = S.xfer.fetched === curProj();
    return '<button class="w-btn sm w-transfer fetch" type="button" data-a="gfetch"' + (pend ? ' data-transfer="pending" disabled' : '') + ' title="Fetch from the remote to update what is known about it. Changes no branch of yours.">' +
      (pend ? xferIcon('pending', 'down') : done ? xferIcon('done', 'down') : '') + '<span>' + (pend ? 'Fetching…' : done ? 'Fetched' : 'Fetch') + '</span></button>';
  }
  function resultHTML(r) {
    return '<div class="w-notice w-result" data-tone="ok" role="status"><div class="heading">' + xferIcon('done', 'down') + '<strong>Done</strong></div><p>' + esc(r.message) + '</p>' +
      '<div class="sides"><div><h4>On this computer</h4><p>' + esc(r.local) + (r.sha ? ' <span class="sha">none → ' + r.sha + '</span>' : '') + '</p></div>' +
      '<div><h4>On origin</h4><p><strong class="ok">Confirmed by the remote.</strong>' + (r.sha ? ' <span class="sha">at ' + r.sha + '</span>' : '') + '</p></div></div></div>';
  }
  function acknowledgeResults() { [deskRoot, phoneRoot].forEach(function (root) { if (root) root.querySelectorAll('.w-result').forEach(M.acknowledge); }); }
  function gitFetch() {
    var p = curProj();
    if (S.xfer.fetching) return;
    S.xfer.fetching = p; S.xfer.fetched = ''; S.xfer.last = null; render();
    xferTimers.push(setTimeout(function () {
      S.xfer.fetching = ''; S.xfer.fetched = p;
      S.xfer.last = { kind: 'fetch', project: p, message: 'Fetched origin.', local: 'Remote-tracking branches were updated. Your own branches, your checkout and every worktree were left alone.' };
      render(); acknowledgeResults();
      // "Fetched" reads for a moment (720 ms), then the button is Fetch again; the result stays.
      xferTimers.push(setTimeout(function () { S.xfer.fetched = ''; render(); }, 720));
    }, 1300));
  }
  function shaOf(t) { return (t.id * 2654435761 >>> 0).toString(16).slice(0, 7); }
  function repaintPush() {
    [[deskRoot, D], [phoneRoot, P]].forEach(function (pair) { if (pair[0] && pair[1].sheet && pair[1].sheet.kind === 'push') setOverlay(pair[0], sheetHTML(pair[1].sheet, pair[0] === phoneRoot)); });
  }
  function gitPush(id) {
    var t = get(id); if (!t || !t.run || S.xfer.pushing || t.run.pushed) return;
    S.xfer.pushing = t.id; S.xfer.last = null; repaintPush();
    xferTimers.push(setTimeout(function () {
      S.xfer.pushing = 0; t.run.pushed = true;
      S.xfer.last = { kind: 'push', task: t.id, message: 'Pushed ' + branchOf(t) + ' to origin, and origin confirms it is at ' + shaOf(t) + '.', local: 'your remote-tracking branch origin/' + branchOf(t) + ' was updated; it now tracks origin/' + branchOf(t), sha: shaOf(t) };
      repaintPush(); acknowledgeResults(); render();
    }, 1600));
  }
  function pushSheet(t) {
    var r = t.run, res = S.xfer.last && S.xfer.last.kind === 'push' && S.xfer.last.task === t.id ? S.xfer.last : null, pend = S.xfer.pushing === t.id;
    var body = res ? resultHTML(res) : '<p>Push <strong>' + branchOf(t) + '</strong> to <strong>origin</strong> at <span class="w-mm" style="color:var(--text)">' + shaOf(t) + '</span>.</p>' +
      '<dl class="w-kv"><dt>Now</dt><dd>No upstream <span class="w-muted">(as of the last fetch)</span></dd><dt>To push</dt><dd>' + plural(r.ahead, 'commit') + ' that exist on no remote</dd></dl>' +
      '<p class="w-muted" style="font-size:12px">A plain push: never forced. If the remote has commits this branch lacks, it is refused and nothing is overwritten. Afterwards the remote itself is asked to confirm the branch is where it should be.</p>';
    var foot = res ? '<footer><button class="w-btn pri" type="button" data-a="sheetx">Done</button></footer>' :
      '<footer><button class="w-btn" type="button" data-a="sheetx">Cancel</button><button class="w-btn pri w-transfer push" type="button" data-a="pushgo" data-id="' + t.id + '"' + (pend ? ' data-transfer="pending" disabled' : '') + '>' + (pend ? xferIcon('pending', 'up') : '') + '<span>' + (pend ? 'Pushing…' : 'Push to origin') + '</span></button></footer>';
    return '<div class="w-scrim" data-a="sheetx"></div><div class="w-sheet" role="dialog" aria-label="Push ' + branchOf(t) + '" style="--w:560px"><header><h2>Push ' + branchOf(t) + '</h2><button class="w-btn quiet sm ic" type="button" data-a="sheetx" aria-label="Close">' + ic('close') + '</button></header><div class="body">' + body + '</div>' + foot + '</div>';
  }
  function gitHTML() {
    var items = gitItems(), sub = VIEW.gsub || 'overview';
    if (sub !== 'overview') return '<div style="padding:16px 24px 0;height:100%;display:flex;flex-direction:column;gap:18px">' + gitNavHTML() + '<div class="w-pane" data-keep="git-sub" style="max-width:760px">' + gitSubHTML(sub) + '</div></div>';
    return '<div style="padding:16px 24px 0;height:100%;display:flex;flex-direction:column;gap:18px">' + gitNavHTML() + '<div class="w-split" style="padding:0;--side:420px;flex:1;min-height:0"><div class="w-pane" data-keep="git-l"><p class="w-lab" style="display:flex;justify-content:space-between">Needs you<span>' + items.length + '</span></p><ul style="display:flex;flex-direction:column;gap:12px">' + (items.length ? items.map(branchCardHTML).join('') : '<li class="w-empty">Nothing waiting. Finished work shows up here with its branch.</li>') + '</ul></div>' +
      '<div class="w-pane" data-keep="git-r">' + healthHTML() + '<section class="w-pn" aria-label="Repository"><div class="w-ph"><span class="w-lab">Repository</span><span class="end" style="display:flex;gap:6px"><button class="w-btn sm" type="button" data-a="toast" data-v="Refresh reads the repository again.">Refresh</button>' + fetchButton() + '</span></div>' + (S.xfer.last && S.xfer.last.kind === 'fetch' && S.xfer.last.project === curProj() ? resultHTML(S.xfer.last) : '') + '<p style="font-weight:600;font-size:16px">' + curProj() + '</p><div class="w-boxes"><div class="w-slot"><p class="w-lab">On this computer</p><dl class="w-kv"><dt>HEAD</dt><dd><b>main</b> · ' + HEAD[curProj()] + '</dd><dt>Target</dt><dd><b>main</b></dd><dt>Working tree</dt><dd style="color:var(--ok-text)">clean</dd></dl></div><div class="w-slot"><p class="w-lab">On the remote</p><dl class="w-kv"><dt>origin</dt><dd>github.com/you/' + curProj() + '</dd><dt>main</dt><dd>up to date</dd></dl></div></div></section></div></div></div>';
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
    if (t.ext) return '<div class="w-ev" role="button" tabindex="0" data-a="go" data-v="' + (t.agent === 'Individual' ? 'proj:' + t.project : 'team') + '" style="' + pos + '"><b>' + esc(t.title) + '</b><span>' + clock(t.sched.s) + ' · ' + esc(t.agent) + '</span></div>';
    var state = r && r.st === 'running' ? 'running' : r && r.st === 'needs' ? 'needs you' : r && r.st === 'blocked' ? 'blocked' : r && r.st === 'completed' ? 'finished' : waitingFor(t).length ? 'after ' + waitingFor(t)[0].title : t.agent;
    return '<div class="w-ev' + cls + '" role="button" tabindex="0"' + (t.ro ? '' : ' draggable="true" data-ev="' + t.id + '"') + ' data-a="open" data-id="' + t.id + '" style="' + pos + '"><b>' + esc(t.title) + '</b><span>' + clock(t.sched.s) + ' · ' + esc(state) + '</span></div>';
  }
  /* A day's events: my-app's, and in Universal the other projects' and the Team's too. */
  /* Everything dated that is not my-app's: the other projects' scheduled tasks and the Team's tickets. */
  function extSched() {
    var out = [];
    ['api-server', 'marketing-site'].forEach(function (p) {
      FXT[p].forEach(function (t) { if (t.sched && t.state !== 'done') out.push({ title: t.title, project: p, tag: 'Individual', d: t.sched.d, s: t.sched.s, dur: t.sched.dur }); });
    });
    return out.concat(S.ext.cal);
  }
  function calEvents(d, uni) {
    var evs = (uni ? S.tasks : curTasks()).filter(function (t) { return t.sched && t.sched.d === d && t.state !== 'done'; });
    if (uni) extSched().forEach(function (e, i) {
      if (e.d === d) evs.push({ id: 'e' + i, ext: true, title: e.title, project: e.project, sched: { d: e.d, s: e.s, dur: e.dur }, agent: e.tag, deps: [], state: 'backlog', run: null });
    });
    return evs;
  }
  function dayColHTML(d, extra, uni) {
    var now = d === TODAY && S.now >= H0 * 60 && S.now <= H1 * 60 ? '<div class="w-now" data-now style="top:' + ((S.now - H0 * 60) / 60 * HOUR) + 'px"></div>' : '';
    // With the test task picked, tomorrow at 09:00 is offered as a slot, so a click is enough to plan it.
    var t3 = story(3), slot = !uni && D.pick && t3 && D.pick === t3.id && !t3.sched && d === TODAY + 1 ?
      '<button class="w-slot" type="button" data-a="slot" data-day="' + d + '" data-m="540" style="top:' + ((540 - H0 * 60) / 60 * HOUR + 1) + 'px;height:' + (HOUR - 3) + 'px">' + ic('calendar', 14) + 'Tomorrow, 09:00</button>' : '';
    return '<div class="w-dcol' + ([0, 6].indexOf(dateOf(d).getDay()) > -1 ? ' weekend' : '') + (D.pick ? ' pickable' : '') + (extra || '') + '" data-day="' + d + '" style="height:' + ((H1 - H0) * HOUR) + 'px">' + lanes(calEvents(d, uni)).map(evHTML).join('') + slot + now + '</div>';
  }
  function hoursHTML() { var h = ''; for (var i = H0; i < H1; i++) h += '<span style="top:' + ((i - H0) * HOUR + (i === H0 ? 8 : 0)) + 'px">' + pad(i) + ':00</span>'; return '<div class="w-hours">' + h + '</div>'; }
  function weekTitle(w) { var a = dateOf(7 * w), b = dateOf(7 * w + 6); return MONTHS[a.getMonth()] + ' ' + a.getDate() + ' – ' + (a.getMonth() === b.getMonth() ? '' : MONTHS[b.getMonth()] + ' ') + b.getDate() + ', ' + b.getFullYear(); }
  function calGridHTML(uni) {
    var day = D.mode === 'day', base = 7 * D.week, days = [], cols = day ? 'grid-template-columns:52px minmax(0,1fr)' : '';
    if (day) days.push(D.dayN); else for (var i = 0; i < 7; i++) days.push(base + i);
    return '<div class="w-calmain"><div class="w-calbar"><div class="l"><button class="w-btn" type="button" data-a="today">Today</button><button class="w-btn ic" type="button" data-a="wk" data-id="-1" aria-label="Previous week">' + ic('left') + '</button><button class="w-btn ic" type="button" data-a="wk" data-id="1" aria-label="Next week">' + ic('right') + '</button><span class="w-caltitle">' + (day ? dayName(D.dayN) + ', ' + MONTHS[dateOf(D.dayN).getMonth()] + ' ' + dateOf(D.dayN).getDate() + ', ' + dateOf(D.dayN).getFullYear() : weekTitle(D.week)) + '</span></div>' +
      '<div class="r"><button class="w-btn" type="button" data-a="tz"><span class="w-mm" style="color:var(--text);font-size:12px">Europe/Amsterdam</span></button><div class="w-seg"><button type="button" data-a="mode" data-id="day" aria-pressed="' + day + '">Day</button><button type="button" data-a="mode" data-id="week" aria-pressed="' + !day + '">Week</button></div></div></div>' +
      '<div class="w-calhead" style="' + cols + '"><div></div>' + days.map(function (d) { return '<div class="w-dh">' + dayName(d).toUpperCase() + '<b' + (d === TODAY ? ' class="today"' : '') + '>' + dateOf(d).getDate() + '</b></div>'; }).join('') + '</div>' +
      '<div class="w-calscroll" data-keep="cal' + (uni ? '-u' : '') + '"><div class="w-calgrid" style="' + cols + '">' + hoursHTML() + days.map(function (d) { return dayColHTML(d, '', uni); }).join('') + '</div></div></div>';
  }
  /* Universal's calendar: every project of every workspace on one week, read only. */
  function calMainHTML() { return '<div class="w-cal single">' + calGridHTML(true) + '</div>'; }
  function calendarHTML() {
    var all = curTasks();
    var unsched = all.filter(function (t) { return !t.sched && t.state !== 'done'; });
    var queue = all.filter(function (t) { return t.sched && t.state === 'backlog'; }).sort(function (a, b) { return schedAbs(a) - schedAbs(b); });
    var waiting = all.filter(function (t) { return t.state === 'backlog' && waitingFor(t).length; });
    return '<div class="w-cal">' + calGridHTML(false) +
      '<aside class="w-calside" data-keep="calside" aria-label="Unscheduled and queue"><h3>Unscheduled <span class="w-chip">' + unsched.length + '</span></h3>' +
      unsched.map(function (t) { return '<div class="w-card w-unit" role="button" tabindex="0"' + (t.ro ? ' data-a="readonly" data-id="' + t.id + '"' : ' draggable="true" data-un="' + t.id + '" data-a="pick" data-id="' + t.id + '"') + ' aria-pressed="' + (D.pick == t.id) + '"><span class="grip">' + ic('grip') + '</span><span><span class="t">' + esc(t.title) + '</span><span class="w-mm">' + ({ backlog: 'Backlog', doing: 'In progress', review: 'Review' })[t.state] + (t.prio !== 'normal' ? ' · ' + t.prio : '') + '</span></span></div>'; }).join('') +
      '<p class="w-mm" style="line-height:1.6">' + (D.pick ? 'Now click a time in the week.' : 'Drag onto the week, or pick one and click a time.') + '</p>' +
      '<h3>Queue <span class="w-chip">' + queue.length + '</span></h3>' + queue.map(function (t) {
        var w = waitingFor(t), dt = dateOf(t.sched.d);
        return '<div class="w-qrow"><b>' + esc(t.title) + '</b><span class="w-mm">' + dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()) + ' ' + clock(t.sched.s) + ' · ' + (w.length ? 'Waiting on Dependency' : 'Scheduled') + '</span>' + (w.length ? '<span class="w-muted" style="font-size:12.5px">Waiting for ' + esc(w[0].title) + ' to finish</span>' : '') + '</div>';
      }).join('') +
      (waiting.length ? '<h3>Waiting on</h3>' + waiting.map(function (t) { return '<div class="w-qrow"><b>' + esc(t.title) + '</b><span class="w-mm">after ' + esc(waitingFor(t)[0].title) + '</span></div>'; }).join('') : '') +
      '<h3>Concurrency</h3><p class="w-mm" data-conc2>' + all.filter(isActive).length + ' of ' + LIMIT + ' running in ' + curProj() + '</p></aside></div>';
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
    var r = t.run, st = status(t), stateLabel = { backlog: 'Backlog', doing: 'In progress', review: 'Review', done: 'Done' }[t.state];
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
      var findings = wfFindings();
      return '<div class="w-scrim" data-a="sheetx"></div><section class="w-sheet" role="dialog" aria-label="Find Bugs report"><header><h2>Find Bugs · ' + esc(P.wf.repo) + '</h2><button class="w-btn ic" type="button" data-a="sheetx" aria-label="Close report">' + ic('close') + '</button></header><div class="body"><p>Finished on MacBook-Pro: two bugs it could reproduce, each with a suggested fix. No files were changed.</p><p class="w-mm">A scripted report in this demo · Claude Code</p><ol class="w-workflows">' + findings.map(function (f) { return '<li class="w-card w-pn"><strong>' + esc(f[0]) + '</strong><p class="w-mm">Suggested fix: ' + esc(f[1]) + '</p></li>'; }).join('') + '</ol></div><footer><button class="w-btn" type="button" data-a="wfx">Dismiss report</button><button class="w-btn pri" type="button" data-a="wftasks">Create ' + plural(findings.length, 'task') + ' to fix ' + (findings.length === 1 ? 'it' : 'them') + '</button></footer></section>';
    }
    if (sh.kind === 'ticket') {
      var k = tix(sh.n); if (!k) return '';
      var cs = k.comments || [], people = S.team.members.map(function (m) { return m[0]; }).filter(function (name) { return name !== ME; });
      var col = TCOLS.filter(function (c) { return c[0] === k.st; })[0][1], arch = k.arch != null, mine = k.who === ME;
      function box(h, inner) { return '<section class="w-tkbox"><h3>' + h + '</h3>' + inner + '</section>'; }
      var agentBox = k.st === 'progress' && k.who ? box('Agent', mine ? (k.waiting ? '<p class="w-muted">Your agent has not started. Controls, questions and the conversation stay on your computer.</p><div><button class="w-btn sm pri" type="button" data-a="tstart" data-id="' + k.n + '">Start agent</button></div>' : '<p>' + dot('work', 'pulse') + ' Your agent is working on <span class="w-mm">' + esc(k.branch) + '</span>, on your computer.</p>')
        : '<p>' + dot(k.active ? 'work' : 'neutral', k.active ? 'pulse' : 'hollow') + ' ' + (k.active ? 'Active now' : 'Not active') + '</p><p class="w-muted">What ' + esc(k.who.split(' ')[0]) + '’s agent does, asks and writes stays on their computer.</p>') : '';
      var main = box('Description', '<p>' + esc(k.desc || 'No description yet.') + '</p>') + box('Requirements and context', '<p>' + esc(k.req || 'The change goes through a pull request and one review before it merges.') + '</p>') + agentBox +
        '<section class="w-tkbox w-comments" aria-label="Comments"><div class="w-cmhead"><h3>Comments</h3><span class="w-chip">' + cs.length + '</span></div>' +
        (cs.length ? '<ul class="w-cmlist">' + cs.map(function (c, i) {
          return '<li class="w-cm' + (c.unread ? ' unread' : '') + '"><span class="w-av' + (c.by === ME ? ' me' : '') + '" aria-hidden="true">' + initials(c.by) + '</span><div><p class="w-cmwho"><b>' + esc(c.by) + '</b><span class="w-mm">' + clock(c.at) + '</span>' + (c.unread ? '<span class="w-chip warn">Mentions you</span><button class="w-btn quiet sm" type="button" data-a="mread" data-id="' + k.n + '" data-v="' + i + '">Mark read</button>' : (c.mentions || []).indexOf(ME) > -1 ? '<span class="w-mm">Mentioned you · read</span>' : '') + '</p><p>' + commentHTML(c.text) + '</p></div></li>';
        }).join('') + '</ul>' : '<p class="w-muted">No comments yet. Start the conversation, or mention someone to ask them something.</p>') +
        (arch ? '<p class="w-muted">This ticket is archived, so its conversation is read only. Restore it to comment.</p>' :
        '<label class="w-field"><span class="w-lab">Write a comment</span><textarea class="w-input" name="text" rows="3" placeholder="Write a comment…"></textarea></label>' +
        '<div class="w-mentions" role="group" aria-label="Mention a member"><span class="w-mm">Mention</span>' + people.map(function (name) { return '<button class="w-btn sm" type="button" data-a="mention" data-v="' + esc(name) + '">@' + esc(name) + '</button>'; }).join('') + '</div>') + '</section>';
      var side = box('Status', '<p>' + dot(k.st === 'done' ? 'ok' : k.st === 'review' ? 'ask' : k.st === 'progress' ? 'work' : 'neutral') + ' ' + (arch ? 'Archived · ' : '') + col + '</p><p class="w-muted">' + (k.who ? esc(k.who) : 'Unclaimed · ' + esc(k.by || 'someone') + ' wrote it') + '</p>') +
        box('Dates', kvl([['Start', k.start != null ? dayLabel(k.start) : 'Not set'], ['Due', k.due != null ? dayLabel(k.due) : 'Not set']]) + '<p class="w-muted fine">The Calendar and the Timeline draw these.</p>') +
        box('Git', k.branch ? kvl([['Branch', '<span class="w-mm">' + esc(k.branch) + '</span>'], ['Commits', (k.ahead || 0) + ' ahead of main'], ['Pull request', k.pr ? '#' + k.pr.n + ' · ' + k.pr.state : 'None yet']]) : '<p class="w-muted">A branch is made when someone claims the ticket.</p>');
      return '<div class="w-scrim" data-a="sheetx"></div><form class="w-sheet w-tksheet" data-form="comment" data-n="' + k.n + '" role="dialog" aria-label="WB-' + k.n + ' ' + esc(k.title) + '" style="--w:800px"><header><h2>WB-' + k.n + ' ' + esc(k.title) + '</h2><button class="w-btn quiet sm ic" type="button" data-a="sheetx" aria-label="Close">' + ic('close') + '</button></header>' +
        '<div class="body"><p class="w-mm">' + esc(S.team.name) + ' · ' + esc(S.team.project) + '</p><div class="w-tkgrid"><div class="main">' + main + '</div><aside class="side">' + side + '</aside></div></div>' +
        '<footer>' + (k.st === 'done' || arch || (!k.who && k.by === ME) ? '<button class="w-btn" type="button" data-a="' + (arch ? 'trestore' : 'tarchtk') + '" data-id="' + k.n + '" style="margin-right:auto">' + (arch ? 'Restore ticket' : 'Archive ticket') + '</button>' : '') + '<button class="w-btn" type="button" data-a="sheetx">Close</button>' + (arch ? '' : '<button class="w-btn pri" type="submit">Post comment</button>') + '</footer></form>';
    }
    if (sh.kind === 'new') {
      return '<div class="w-scrim" data-a="sheetx"></div><form class="w-sheet" data-form="new" role="dialog" aria-label="New task in my-app" style="--w:640px"><header><h2>New task in my-app</h2><button class="w-btn quiet sm ic" type="button" data-a="sheetx" aria-label="Close">' + ic('close') + '</button></header>' +
        '<div class="body"><label class="w-field"><span class="w-lab">What should an agent do?</span><input class="w-input big" name="title" maxlength="200" placeholder="Fix the flaky auth test" autocomplete="off" required></label>' +
        '<label class="w-field"><span class="w-lab">Details <span class="opt">optional</span></span><textarea class="w-input" name="desc" rows="3" placeholder="Context, constraints, where to look…"></textarea></label>' +
        '<div class="w-exec"><label class="w-field"><span class="w-lab">Agent</span><select class="w-select" name="agent"><option>Claude Code</option><option>Codex</option></select></label><label class="w-field"><span class="w-lab">Priority</span><select class="w-select" name="prio"><option value="normal">Normal</option><option value="high">High</option><option value="low">Low</option></select></label><label class="w-field"><span class="w-lab">Interaction</span><select class="w-select" name="inter"><option>Ask me when needed</option><option>Autonomous</option><option>Stop if blocked</option></select></label></div></div>' +
        '<footer><span class="tip"><kbd class="w-key">⌘</kbd><kbd class="w-key">↵</kbd> start</span><button class="w-btn" type="button" data-a="sheetx">Cancel</button><button class="w-btn" type="submit" name="go" value="add">Add to Backlog</button><button class="w-btn pri" type="submit" name="go" value="start">Add and start agent</button></footer></form>';
    }
    if (sh.kind === 'push') { var pt = get(sh.id); return pt && pt.run ? pushSheet(pt) : ''; }
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
  var VIEWLABEL = { overview: 'Overview', board: 'Board', calendar: 'Calendar', git: 'Git', runs: 'Runs' };
  /* Jump to: the places and the tasks of whatever the surface is showing. Each item is [action, id, label, where]. */
  function palItems(q, where) {
    q = (q || '').toLowerCase();
    var items;
    if (where === 'phone') {
      items = [['pgo', 'control', 'Workspace', 'deck'], ['pgo', 'calendar', 'Calendar', 'deck'], ['pgo', 'mywork', 'My Work', 'deck'], ['pgo', 'agents', 'Agents', 'deck'], ['pgo', 'analytics', 'Analytics', 'deck'], ['pgo', 'reviews', 'Reviews', 'deck'], ['pgo', 'git', 'Git', 'deck'], ['pgo', 'runners', 'Runners', 'deck'], ['pgo', 'projects', 'Projects', 'deck']]
        .concat(PROJECTS.map(function (p) { return ['pproject', p, p, 'project']; })).concat([['settings', '', 'Settings', 'phone'], ['help', '', 'Help', 'phone']])
        .concat(S.tasks.filter(function (t) { return t.state !== 'done'; }).map(function (t) { return ['open', t.id, t.title, 'task']; }));
    } else if (D.ws === 'team') {
      items = [['tv', 'home', 'Workspace', S.team.name], ['tv', 'projects', 'Projects', S.team.name], ['tv', 'board', 'Board', S.team.project], ['tv', 'git', 'Git', S.team.project], ['tv', 'activity', 'Activity', S.team.project], ['tv', 'reviews', 'Reviews', S.team.name], ['tv', 'members', 'Members', S.team.name], ['tv', 'analytics', 'Analytics', S.team.name]]
        .concat(S.team.tickets.filter(function (k) { return k.arch == null && k.st !== 'done'; }).map(function (k) { return ['tticket', k.n, 'WB-' + k.n + ' ' + k.title, 'ticket']; }));
    } else {
      var pr = curProj();
      items = [['view', 'control', 'Workspace', 'everywhere'], ['view', 'projects', 'Projects', 'everywhere'], ['view', 'analytics', 'Analytics', 'everywhere']]
        .concat(PROJECTS.map(function (p) { return ['proj', p, p, 'project']; }))
        .concat(['overview', 'board', 'calendar', 'git', 'runs'].map(function (v) { return ['view', v, VIEWLABEL[v], pr]; }))
        .concat(projTasks(pr).filter(function (t) { return t.state !== 'done' && !t.archived; }).map(function (t) { return ['open', t.id, t.title, 'task']; }));
    }
    return items.filter(function (i) { return i[2].toLowerCase().indexOf(q) > -1; }).slice(0, 9);
  }
  function palListHTML(q, where) {
    var it = palItems(q, where);
    return it.length ? it.map(function (i) { return '<li><button type="button" data-a="' + i[0] + '" data-id="' + i[1] + '">' + esc(i[2]) + '<span class="w-mm">' + esc(i[3]) + '</span></button></li>'; }).join('') : '<li class="w-empty">No match</li>';
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
    VIEW = D;
    keepScroll(deskRoot, D.scroll);
    var fk = focusKey(deskRoot);
    var main, panel = '';
    pwUnder();
    if (D.set !== null) main = settingsHTML();
    else if (D.page === 'pw') main = pwPage();
    else if (D.page === 'pwlib') main = pwLibPage();
    else if (D.page === 'devices') main = devicesPage();
    else if (D.page === 'help') main = helpPage(false);
    else if (D.ws === 'universal') main = ({ mywork: myWorkHTML, calendar: ucalHTML, inbox: inboxHTML })[D.uv]();
    else if (D.ws === 'team') main = teamMain();
    else {
      if (D.view === 'control') main = '<header class="w-ghead"><h1>Workspace</h1><button class="w-btn" type="button" data-a="pal">' + ic('search') + 'Jump to</button></header><main class="w-main" data-keep="main-cc">' + controlHTML(false) + '</main>';
      else if (D.view === 'projects') main = projectsPage();
      else if (D.view === 'analytics') main = '<header class="w-ghead"><div class="w-uh"><h1>Analytics</h1><p class="w-lede">Where agent time and cost go, across your projects</p></div></header><main class="w-main" data-keep="main-an">' + analyticsHTML(D.an) + '</main>';
      else if (D.view === 'psettings') main = psettingsHTML();
      else main = headHTML() + bannerHTML() + '<main class="w-main" data-keep="main-' + D.view + '"' + (D.view === 'runs' ? '' : ' style="overflow:hidden"') + '>' + ({ board: boardHTML, overview: overviewHTML, calendar: calendarHTML, git: gitHTML, runs: runsHTML })[D.view]() + '</main>';
      panel = D.task && get(D.task) && PROJVIEWS.indexOf(D.view) > -1 ? '<section class="w-panel" data-surface="panel:' + D.task + '" role="dialog" aria-label="Task">' + panelInner(get(D.task), D.ptab, false) + '</section>' : '';
    }
    if (D.set !== null || D.page) panel = '';
    // Sheets, the switcher and toasts live outside this part, so an open form keeps what was typed.
    var motion = M.begin(deskRoot);
    deskRoot.querySelector('[data-app]').innerHTML = '<div class="w-shell">' + railHTML() + '<div class="w-mainarea">' + (P.wf ? wfBanner() : '') + main + panel + (panel || D.page === 'help' ? '' : helpButtonHTML()) + '</div></div>';
    restoreScroll(deskRoot, D.scroll);
    M.end(deskRoot, motion, revSig(), { arrived: landed });
    S.tasks.forEach(function (t) { t.fresh = false; });
    S.team.tickets.forEach(function (k) { k.fresh = false; });
    if (fk) { var n = deskRoot.querySelector(fk); if (n) n.focus({ preventScroll: true }); }
  }
  function palHTML(where) {
    return '<div class="w-scrim" data-a="palx"></div><div class="w-pal" role="dialog" aria-label="Jump to"><input class="w-input" data-pal placeholder="Jump to a project, section or task" autocomplete="off" aria-label="Jump to"><ul data-pallist>' + palListHTML('', where) + '</ul></div>';
  }
  function overlayOf(root) { return root && root.querySelector('[data-overlay]'); }
  /* The layers an overlay holds are named by what they are, so one that is repainted in place is not mistaken for a new one. */
  function tagLayers(o) {
    o.querySelectorAll('.w-scrim').forEach(function (n) { n.setAttribute('data-surface', 'scrim'); });
    o.querySelectorAll('.w-sheet').forEach(function (n) { n.setAttribute('data-surface', 'sheet:' + (n.getAttribute('aria-label') || '')); });
  }
  function setOverlay(root, html, focusSel) {
    var o = overlayOf(root); if (!o) return;
    M.within(root, function () { o.innerHTML = html; tagLayers(o); });
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
  var PLACES = { settings: 'Settings', help: 'Help', bugs: 'Find Bugs', control: 'Workspace', calendar: 'Calendar', projects: 'Projects', mywork: 'My Work', agents: 'Agents', analytics: 'Analytics', reviews: 'Reviews', git: 'Git', runners: 'Runners' };
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
  /* The agents at work in the other projects. api-server's waiting question is not one of them: it is counted as a question. */
  function otherRunning() {
    var out = [];
    ['api-server', 'marketing-site'].forEach(function (p) { projTasks(p).forEach(function (t) { if (t.run && t.run.st === 'running') out.push(t); }); });
    return out;
  }
  function fleet() {
    var run = S.tasks.filter(function (t) { return t.run && t.run.st === 'running'; }), ask = S.tasks.filter(function (t) { return t.run && (t.run.st === 'needs' || t.run.st === 'blocked'); });
    var names = {}, other = otherRunning();
    run.concat(ask).concat(other).forEach(function (t) { names[t.agent] = 1; });
    if (S.ext.ask.st === 'needs') names[S.ext.ask.agent] = 1;
    return { running: run.length + other.length, waiting: ask.length + (S.ext.ask.st === 'needs' ? 1 : 0), names: Object.keys(names) };
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
    return '<section class="w-wfb" data-surface="wfb" aria-label="Workflow progress"><div class="ex"><div class="open"><strong>Find Bugs</strong><span data-wf="status">' + l.status + '</span><span data-wf="stage">' + l.stage + ' · ' + esc(P.wf.repo) + '</span><span class="w-mm" data-wf="count">Claude Code · ' + l.count + '</span></div>' +
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
      }).join('') + '</div><p class="w-mm">Navigation keys open a page. In the app, the pencil above the deck replaces, removes or moves any of the nine.</p>' + pwDeckLibrary();
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
  function wfFindings() {
    return {
        'my-app': [['An empty report crashes the CSV export', 'Return a file with the header row only when no rows match.'], ['A comma inside a field splits the CSV row', 'Quote every field, and double any quote inside one.']],
        'api-server': [['An empty request body returns a 500', 'Answer with a 400 and a validation message.'], ['Rate limits reset a second late at the window edge', 'Measure from the window’s start, not from the last request.']],
        'marketing-site': [['Signup errors are not announced to screen readers', 'Put the message in a polite live region.'], ['The theme resets after navigating', 'Read the saved theme before the first paint.']] }[P.wf.repo];
  }
  function wfRunning() { return !!P.wf && !wfLines().ended; }
  /* A saved deck is acknowledged on the pencil that edits it, and a workflow's progress on the banner that reports it. */
  function ackPencil() { var b = phoneRoot && phoneRoot.querySelector('.w-dtop [aria-label="Edit Deck"]'); if (b) M.acknowledge(b); }
  function ackBanner() { document.querySelectorAll('.wbx .w-wfb .ex').forEach(M.acknowledge); }
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
        if (P.deckWs) return pwDeckKey();
        if (!P.deckAdded) return '<button class="w-dkey empty" type="button" data-a="decklibrary" data-mk="k-add" aria-label="Add a button to position 9"><span class="cap"><span class="face"><span class="glyph">' + ic('plus', 26) + '</span><span class="name">Add button</span></span></span></button>';
        // A workflow key: tap to run, hold to configure. It shows its icon and name only; where it runs is in its settings,
        // and is read out to a screen reader (the label below).
        var busy = wfRunning();
        return '<a class="w-dkey workflow" href="#" data-a="wftap" data-key="bugs" data-mk="k-bugs" aria-keyshortcuts="Shift+F10"' + (busy ? ' data-run="on"' : '') + ' aria-label="Find Bugs, ' + (busy ? 'running on ' + esc(P.wf.repo) : P.repo ? 'runs on ' + esc(P.repo) : 'asks for a repository') + '. Hold to change its settings."><span class="cap"><span class="face"><span class="glyph">' + ic('bug', 26) + '</span><span class="name">Find Bugs</span></span></span></a>';
      }
      var count = c[k[0]] || 0, tone = k[2] || 'plain', lit = count > 0;
      return '<a class="w-dkey" href="#" data-a="pgo" data-id="' + k[0] + '" data-key="' + k[0] + '" data-mk="k-' + k[0] + '"' + (lit ? ' data-lit="on" data-tone="' + tone + '"' : '') + ' aria-label="' + PLACES[k[0]] + (lit ? ', ' + count : '') + '"><span class="cap"><span class="face"><span class="glyph">' + ic(k[1], 26) + '</span><span class="name">' + PLACES[k[0]] + '</span></span>' +
        (lit ? '<span class="w-num' + (tone === 'wait' ? ' pend' : '') + '" aria-hidden="true">' + count + '</span>' : '') + '</span></a>';
    }).join('');
    return '<div class="w-deckpage"><header class="w-dtop"><div class="id"><p class="brand">' + mark(20) + '<span class="wm">werkbord</span></p><p class="w-mm status"><span class="conn">' + dot('ok') + 'Connected</span> · 1 runner</p></div>' +
      '<nav class="tools" aria-label="Deck tools"><button class="w-btn ic" type="button" data-a="decklibrary" aria-label="Edit Deck">' + ic('edit') + '</button>' +
      '<button class="w-btn ic" type="button" data-a="pal" aria-label="Jump to">' + ic('search') + '</button>' +
      '<button class="w-btn ic" type="button" data-a="help" aria-label="Help and shortcuts">' + ic('help') + '</button>' +
      '<button class="w-btn ic" type="button" data-a="settings" aria-label="Settings">' + ic('settings') + '</button></nav></header>' +
      wfBanner() +
      '<section class="w-housing" aria-label="Control Deck"><div class="w-keys" data-mp="deck">' + keys + '</div></section>' + pwDeckSection() + (P.wf && !P.wf.dismissed ? '<section class="w-deckhistory" aria-label="Workflow executions"><h2>Workflow executions</h2><p>Find Bugs · ' + esc(P.wf.repo) + '</p><p class="w-mm" data-wf="count">Claude Code · ' + wfLines().count + '</p><p data-wf="stage">' + wfLines().stage + ' · ' + esc(P.wf.repo) + '</p>' + (P.wf.ended && !P.wf.stopped ? '<p>2 bugs found · 2 suggested fixes · no files changed</p>' : '') + '</section>' : '') + '</div>';
  }
  /* A page under the deck: Back, its name, and one line on how its subject stands (the app's subtitle.ts). */
  function pageHead(title, sub, back, tone) {
    return '<header class="w-phh"><button class="w-btn ic" type="button" data-a="pback" aria-label="Back to ' + back + '">' + ic('left', 18) + '</button><div class="t"><h1>' + title + '</h1>' + (sub ? '<p class="w-mm">' + (tone ? dot(tone) : '') + sub + '</p>' : '') + '</div>' +
      '<button class="w-btn ic" type="button" data-a="pal" aria-label="Jump to">' + ic('search') + '</button></header>';
  }
  function phoneControl() {
    var c = controlHTML(true);
    return '<div class="w-mpage">' + c.seg + c.filters + c.list + c.side + '</div>';
  }
  function phoneBoard() {
    var cols = COLS.map(function (c) { return [c[0], c[1], inCol(c[0])]; });
    return '<div class="w-mpage"><div class="w-seg full" role="group" aria-label="Board column">' + cols.map(function (c) { return '<button type="button" data-a="col" data-id="' + c[0] + '" aria-pressed="' + (P.col === c[0]) + '">' + c[1] + '<span class="w-mm">' + c[2].length + '</span></button>'; }).join('') + '</div>' +
      filtersHTML() + legendHTML(true) +
      '<ul style="display:flex;flex-direction:column;gap:12px" data-mp="pb">' + (function () { var ts = inCol(P.col); return ts.length ? ts.map(function (t) { return cardHTML(t, false); }).join('') : '<li class="w-none">' + emptyCol(P.col) + '</li>'; })() + '</ul></div>';
  }
  function phoneCalendar(uni) {
    var d = P.day, x = dateOf(d);
    var head = '<div class="w-mcal"><div class="bar"><button class="w-btn" type="button" data-a="pday" data-id="0">Today</button><button class="w-btn ic" type="button" data-a="pday" data-id="-1" aria-label="Previous day">' + ic('left') + '</button><button class="w-btn ic" type="button" data-a="pday" data-id="1" aria-label="Next day">' + ic('right') + '</button><span class="w-caltitle">' + dayName(d) + ', ' + MONTHS[x.getMonth()] + ' ' + x.getDate() + ', ' + x.getFullYear() + '</span></div>' +
      '<div class="bar"><button class="w-btn" type="button" data-a="tz"><span class="w-mm" style="color:var(--text);font-size:13px">Europe/Amsterdam</span></button><div class="w-seg"><button type="button" aria-pressed="true">Day</button><button type="button" data-a="toast" data-v="Week and Month are in the app. The demo shows the day.">Week</button></div></div>' +
      '<div class="w-dh" style="padding-left:52px">' + dayName(d).toUpperCase() + '<b' + (d === TODAY ? ' class="today"' : '') + '>' + x.getDate() + '</b></div>' +
      '<div class="w-mday">' + hoursHTML() + dayColHTML(d, '', uni === true) + '</div></div>';
    var task = story(3);
    return '<div class="w-mpage">' + (task && !task.sched ? '<section class="w-card w-pn"><p>' + esc(task.title) + '</p><button class="w-btn" type="button" data-a="pschedule">Schedule tomorrow at 09:00</button></section>' : '') + head + '</div>';
  }
  function phoneGit() {
    var items = gitItems();
    if (P.gsub && P.gsub !== 'overview') return '<div class="w-mpage">' + gitNavHTML() + gitSubHTML(P.gsub) + '</div>';
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
    function row(name, path, note, act, num, pid) { return '<li><button class="w-prow" type="button" data-a="' + act + '"' + (pid ? ' data-id="' + pid + '"' : '') + '><span class="tile" aria-hidden="true">' + ic('folder', 18) + '</span><span class="who"><b>' + name + '</b><span class="w-mm">' + path + ' · main</span><span class="w-mm">' + note + '</span></span>' + (num ? '<span class="w-num pend">' + num + '</span>' : '') + '</button></li>'; }
    return '<div class="w-mpage">' + '<div class="w-seg full" role="group" aria-label="Workspace">' + [['individual', 'Individual'], ['team', 'Team']].map(function (w) { return '<button type="button" data-a="pscope" data-id="' + w[0] + '" aria-pressed="' + (P.scope === w[0]) + '">' + w[1] + '</button>'; }).join('') + '</div>' + (P.scope === 'team' ? '<section class="w-card w-plist"><h2 class="w-ph">' + esc(S.team.name) + '</h2><ul>' + row(S.team.project, 'Team workspace', 'Shared tickets, branches and reviews', 'pteam', 0) + '</ul></section></div>' : '<section class="w-card w-plist" aria-label="Projects"><h2 class="w-ph">Projects <span class="w-chip">3</span></h2><ul>' + PROJECTS.slice().reverse().map(function (p) { return row(p, '~/code/' + p, statsText(p), 'pproject', projStats(p).asks, p); }).join('') + '</ul></section></div>');
  }
  function phoneTeam() {
    return pageHead(S.team.project, S.team.name + ' · Team workspace', 'Projects') + '<nav class="w-ptabs" aria-label="Team sections">' + [['board', 'Board'], ['reviews', 'Reviews']].map(function (t) { return '<button type="button" data-a="pteamtab" data-id="' + t[0] + '" aria-current="' + (P.teamTab === t[0] ? 'page' : 'false') + '">' + t[1] + '</button>'; }).join('') + '</nav>' + (P.teamTab === 'reviews' ? '<div class="w-phone-team">' + teamReviewsHTML() + '</div>' : '<div class="w-mpage w-phone-team">' + TCOLS.map(function (c) { var tickets = S.team.tickets.filter(function (t) { return t.st === c[0] && t.arch == null; }); return '<section class="w-col" data-col="' + c[0] + '"><h2 class="w-ph">' + c[1] + '</h2><ul class="w-list">' + tickets.map(tcardHTML).join('') + '</ul></section>'; }).join('') + '</div>');
  }
  function phoneMyWork() {
    var rows = myWorkRows(), status = { doing: 'In progress', review: 'In review' };
    return '<div class="w-mpage"><ul style="display:flex;flex-direction:column;gap:12px" data-mp="pmw">' + (rows.length ? rows.map(function (w) {
      var open = w.go.indexOf('ind:') === 0;
      return '<li data-mk="w' + w.go + '"><button class="w-card w-prow" type="button" data-a="' + (open ? 'open' : w.ws === 'team' ? 'pteam' : 'other') + '"' + (open ? ' data-id="' + w.go.slice(4) + '"' : '') + '><span class="who"><b>' + esc(w.title) + '</b><span class="w-mm">' + esc(w.wsName) + ' · ' + esc(w.project) + ' · ' + status[w.status] + '</span></span>' +
        (w.exec ? '<span class="w-xb" data-tone="' + EXECTONE[w.exec] + '"><i class="w-dot" data-tone="' + EXECTONE[w.exec] + '"></i>' + EXECWORD[w.exec] + '</span>' : '') + '</button></li>';
    }).join('') : '<li class="w-empty">Nothing is in progress.</li>') + '</ul></div>';
  }
  function agentCards() {
    var ext = S.ext, extAsk = ext.ask.st === 'needs';
    return ['Claude Code', 'Codex'].map(function (name) {
      var mine = S.tasks.filter(function (t) { return isActive(t) && t.agent === name; });
      var asks = mine.filter(function (t) { return t.run.st === 'needs' || t.run.st === 'blocked'; }).length + (extAsk && ext.ask.agent === name ? 1 : 0);
      var others = otherRunning().filter(function (t) { return t.agent === name && t.id !== ext.ask.id; });
      var working = mine.some(function (t) { return t.run.st === 'running'; }) || others.length > 0 || (!extAsk && ext.ask.agent === name);
      var n = mine.length + others.length + (ext.ask.agent === name ? 1 : 0);
      return { name: name, tasks: mine, others: others, ask: ext.ask.agent === name, state: asks ? 'Waiting for you' : working ? 'Working' : 'Idle', sessions: n };
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
      c.others.forEach(function (t) { inside.push(cardHTML(t, false)); });
      if (c.ask && S.ext.ask.st === 'needs') inside.push(itemHTML({ kind: 'question', t: extTask(), project: 'api-server' }, true));
      if (c.ask && S.ext.ask.st !== 'needs') inside.push(cardHTML(extTask(), false));
      return '<li class="w-card w-agent" data-tone="' + tone[c.state] + '"><div class="head"><span class="tile" aria-hidden="true">' + ic('activity', 20) + '</span><span class="who"><b>' + c.name + '</b><span class="w-mm">' + dot(tone[c.state]) + c.state + (c.sessions > 1 ? ' · ' + c.sessions + ' sessions' : '') + '</span></span></div>' +
        (c.state === 'Idle' ? '<p class="w-muted" style="font-size:13px">Ready. Start it on a task from a project\'s Board.</p>' : '') + (inside.length ? '<ul class="inside">' + inside.join('') + '</ul>' : '') + '</li>';
    }).join('');
    return '<div class="w-mpage"><div class="w-seg full" role="group" aria-label="Show agents">' + seg + '</div><ul style="display:flex;flex-direction:column;gap:10px" data-mp="ag">' + (list || '<li class="w-empty">No agent is ' + (P.af === 'waiting' ? 'waiting for you' : P.af) + '.</li>') + '</ul></div>';
  }
  function phoneReviews() {
    var items = attention().filter(function (i) { return i.kind === 'review'; });
    return '<div class="w-mpage"><ul style="display:flex;flex-direction:column;gap:12px" data-mp="attn">' + (items.length ? items.map(function (i) { return itemHTML(i, true); }).join('') : '<li class="w-empty">Nothing is ready for review. Finished work shows up here.</li>') + '</ul></div>';
  }
  function phoneAnalytics() { return '<div class="w-mpage">' + analyticsHTML(P.an) + '</div>'; }
  function phoneRunners() {
    return '<div class="w-mpage"><section class="w-card w-pn" aria-label="MacBook-Pro"><div class="top">' + dot('ok') + '<b style="font-weight:500">MacBook-Pro · this computer</b><span class="w-mm" style="margin-left:auto">' + (active() + 1) + '/' + (LIMIT + 1) + ' slots</span></div><p class="w-mm">darwin/arm64 · Claude Code, Codex</p></section></div>';
  }
  var PAGE = { control: phoneControl, calendar: function () { return phoneCalendar(true); }, projects: phoneProjects, mywork: phoneMyWork, agents: phoneAgents, analytics: phoneAnalytics, reviews: phoneReviews, git: phoneGit, runners: phoneRunners };
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
  function phoneProjSettings() { return '<div class="w-mpage w-phone-set">' + psettingsBody() + '</div>'; }
  function phoneProject() {
    var tabs = [['board', 'Board'], ['calendar', 'Calendar'], ['git', 'Git'], ['runs', 'Runs']];
    return '<header class="w-phh"><button class="w-btn ic" type="button" data-a="pback" aria-label="Back to Projects">' + ic('left', 18) + '</button><div class="t"><h1>' + curProj() + '<span class="chev">' + ic('down', 14) + '</span></h1><p class="w-mm">~/code/' + curProj() + ' · main</p></div>' +
      '<button class="w-btn ic" type="button" data-a="pal" aria-label="Jump to">' + ic('search') + '</button></header>' +
      '<nav class="w-ptabs" role="tablist" aria-label="' + curProj() + '">' + tabs.map(function (t) { return '<button type="button" role="tab" data-a="ptabbar" data-id="' + t[0] + '" aria-selected="' + (P.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '<button type="button" role="tab" data-a="ptabbar" data-id="psettings" aria-selected="' + (P.tab === 'psettings') + '">Settings</button></nav>' +
      bannerHTML() + ({ board: phoneBoard, calendar: phoneCalendar, git: phoneGit, runs: phoneRuns, psettings: phoneProjSettings })[P.tab]();
  }
  function parentOf(at) { return at === 'project' || at === 'team' ? 'projects' : 'deck'; }
  /* Settings on the phone: the Individual sections as a list, and one section's panel under it. */
  function phoneSettings() {
    if (P.set) {
      var cur = null;
      setGroups('individual').forEach(function (g) { g.sections.forEach(function (x) { if (x[0] === P.set) cur = x; }); });
      cur = cur || ['general/appearance', 'Appearance'];
      return pageHead(cur[1], 'Individual · this computer', 'Settings') + '<div class="w-mpage"><div class="w-setbody w-phone-set">' + setPanel(cur) + '</div></div>';
    }
    return pageHead('Settings', 'Individual · this computer', 'the Control Deck') + '<div class="w-mpage">' + setGroups('individual').map(function (g) {
      return '<section class="w-card w-plist"><h2 class="w-ph">' + g.label + '</h2><ul>' + g.sections.map(function (x) { return '<li><button class="w-prow" type="button" data-a="psetsec" data-id="' + x[0] + '"><span class="who"><b>' + x[1] + '</b></span>' + ic('right', 16) + '</button></li>'; }).join('') + '</ul></section>';
    }).join('') + '</div>';
  }
  function renderPhone() {
    if (!phoneRoot) return;
    VIEW = P;
    keepScroll(phoneRoot, P.scroll);
    if (P.at === 'pw') { pwUse(P.pwk); if (!PW.ws) P.at = 'deck'; }
    var fk = focusKey(phoneRoot), at = P.at, page;
    if (at === 'deck') page = phoneDeck();
    else if (at === 'project') page = phoneProject();
    else if (at === 'team') page = phoneTeam();
    else if (at === 'pw') page = pwPhone();
    else if (at === 'settings') page = phoneSettings();
    else if (at === 'help') page = helpPage(true);
    else page = pageHead(PLACES[at], subtitle(at), parentOf(at) === 'deck' ? 'the Control Deck' : 'Projects', at === 'agents' ? (agentCards().some(function (c) { return c.state === 'Waiting for you'; }) ? 'ask' : fleet().running ? 'ok' : 'neutral') : '') + PAGE[at]();
    var q = waitingChanges();
    var tabbar = '<nav class="w-tabbar" aria-label="Primary">' +
      '<button type="button" data-a="pdeck"' + (!AS.open ? ' aria-current="page"' : '') + '><span class="icon">' + ic('control', 22) + '</span><span>Control Deck</span></button>' +
      '<button type="button" data-a="' + (AS.open ? 'asst-x' : 'asst-open') + '" aria-haspopup="dialog"' + (AS.open ? ' aria-current="page" aria-expanded="true"' : ' aria-expanded="false"') + ' aria-label="Salie' + (q ? ', ' + q + (q === 1 ? ' change is' : ' changes are') + ' waiting for you' : AS.busy ? ', working' : '') + '"><span class="icon asst">' + ic('assistant', 22) + (q ? '<span class="w-num pend">' + q + '</span>' : AS.busy ? '<span class="w-asst-live" aria-hidden="true"></span>' : '') + '</span><span>Salie</span></button></nav>';
    var task = P.task && get(P.task) ? '<section class="w-mtask" data-surface="mtask:' + P.task + '" role="dialog" aria-label="Task">' + panelInner(get(P.task), P.ptab, true) + '</section>' : '';
    var motion = M.begin(phoneRoot);
    phoneRoot.querySelector('[data-app]').innerHTML = '<div class="w-scroll" data-keep="pscroll-' + at + (at === 'project' ? P.tab : '') + '">' + page + '</div>' + (at === 'project' && P.tab === 'board' && !P.task ? '<button class="w-fab" type="button" data-a="new" aria-label="New task">' + ic('plus', 22) + '</button>' : '') + tabbar + task;
    restoreScroll(phoneRoot, P.scroll);
    M.end(phoneRoot, motion, revSig(), { arrived: landed });
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

  /* ---------- shared demo clock: 4.5 real seconds per simulated minute (one tick per TICK ms) ---------- */
  function wfLive() {
    if (P.wf && !P.wf.stopped && phoneRoot) { var wl = wfLines(); if (wl.ended && !P.wf.ended) { P.wf.ended = true; render(); ackBanner(); return; } if (P.wf.seen !== wl.count) { if (P.wf.seen) ackBanner(); P.wf.seen = wl.count; } ['status', 'stage', 'count'].forEach(function (k) { document.querySelectorAll('.wbx [data-wf="' + k + '"]').forEach(function (el) { el.textContent = k === 'status' ? wl.status : k === 'stage' ? wl.stage + ' · ' + P.wf.repo : 'Claude Code · ' + wl.count; }); }); }
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
            toast('Your agent has a question on “' + t.title + '”. Open the task or Workspace to answer.');
          } else { finish(t); changed = true; }
        }
      }
    });
    if (changed) render(); else updateLive();
  }
  var timer = null, seen = new Set();
  function go() { if (!timer && !document.hidden && seen.size) timer = setInterval(tick, TICK); }
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
    if (where === 'desk') { D.view = id; D.task = null; D.pick = null; D.arch = false; }
    else { P.at = 'project'; P.tab = id === 'overview' ? 'board' : id; P.task = null; }
  }
  function openTask(where, id) {
    var t = get(id);
    if (where === 'desk') { if (PROJVIEWS.indexOf(D.view) < 0) D.view = 'board'; if (t) D.proj = t.project || 'my-app'; D.task = +id; D.ptab = 'activity'; }
    else { P.task = +id; P.ptab = 'activity'; }
  }
  /* The other projects are shown as they stand. What would change them says so instead. */
  var RO = { start: 1, toreview: 1, merge: 1, mergego: 1, stop: 1, push: 1, pushgo: 1 };
  function roText(t) { return (t && t.project ? t.project : 'This project') + ' is a read only snapshot in the demo. Start, review and merge work in my-app, where the walkthrough happens.'; }
  var NEW_OFF = 'Adding work is part of the walkthrough in this demo: ask Salie to plan a feature, and it creates the tasks and the ticket.';
  function archiveDone() {
    if (curProj() !== 'my-app') { toast(roText({ project: curProj() })); return; }
    var ts = S.tasks.filter(function (t) { return t.state === 'done' && !t.archived; });
    if (!ts.length) { toast('No Done tasks to archive.'); return; }
    ts.forEach(function (t) { t.archived = S.now; });
    toast(plural(ts.length, 'task') + ' moved to the archive. Their runs and Git evidence are kept.');
  }
  function restoreTask(id) {
    var t = get(id); if (!t) return;
    if (t.ro) { toast(roText(t)); return; }
    t.archived = null; t.fresh = true; toast('Task restored to Done.');
  }
  function archiveTickets(n) {
    var ks = n ? [tix(n)] : S.team.tickets.filter(function (k) { return k.st === 'done' && k.arch == null; });
    ks = ks.filter(function (k) { return k && k.arch == null; });
    if (!ks.length) { toast('No Done tickets to archive.'); return; }
    ks.forEach(function (k) { k.arch = S.now; });
    toast(n ? 'WB-' + n + ' is archived. Its comments, branch and pull request are kept.' : plural(ks.length, 'ticket') + ' moved to the archive.');
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
      VIEW = V;
      if (a.indexOf('pw-') === 0) { pwActs(a, id, v, where, root, b); return; }
      if (RO[a]) { var rt = get(isNaN(+id) ? id : +id); if (rt && rt.ro) { toast(roText(rt)); return; } }
      switch (a) {
        case 'view': nav(where, id); D.ws = where === 'desk' ? 'individual' : D.ws; leave(); dropOverlay(); render(); break;
        case 'proj': leave(); D.ws = 'individual'; D.proj = id; D.view = PROJVIEWS.indexOf(D.view) > -1 && D.view !== 'psettings' ? D.view : 'board'; D.task = null; D.pick = null; D.arch = false; D.fa = D.fp = 'any'; D.aq = ''; D.gsub = 'overview'; dropOverlay(); render(); break;
        case 'open': leave(); openTask(where, id); dropOverlay(); render(); break;
        case 'close': V.task = null; render(); break;
        case 'ptab': V.ptab = id; render(); break;
        case 'start': startTask(+id); render(); break;
        case 'answer': answer(isNaN(+id) ? id : +id, v); render(); break;
        case 'toreview': toReview(+id); var inRev = viewIn('review', 'Review'); if (inRev) toast('Moved to Review.', inRev); render(); break;
        case 'toastact': var ta = toastAct; toastAct = null; document.querySelectorAll('.w-toast').forEach(function (el) { el.classList.remove('show', 'has-act'); }); if (ta) ta.run(); break;
        case 'merge': V.sheet = { kind: 'merge', id: +id }; setOverlay(root, sheetHTML(V.sheet, where === 'phone'), '[data-a="mergego"]'); break;
        case 'mergego': mergeTask(+id); dropOverlay(); render(); break;
        case 'sheetx': dropOverlay(); break;
        case 'palx': closeOverlay(); break;
        case 'pal': if (where === 'phone') { setOverlay(root, palHTML('phone'), '[data-pal]'); } else { D.pal = ''; openOverlay(palHTML('desk'), '[data-pal]'); } break;
        case 'new': toast(NEW_OFF); break;
        case 'stop': stopTask(+id); render(); break;
        case 'cc': V.cc = id; render(); break;
        case 'col': P.col = id; render(); break;
        case 'ptabbar': P.tab = id; P.task = null; render(); break;
        case 'addproject': toast('Adding a project is turned off in the demo. In the app, every repository you add gets its own board, calendar and Git view.'); break;
        case 'readonly': toast(roText(get(+id))); break;
        case 'archview': V.arch = !V.arch; V.aq = ''; render(); break;
        case 'archdone': archiveDone(); render(); break;
        case 'restore': restoreTask(+id); render(); break;
        case 'tarchview': D.tarch = !D.tarch; D.aq = ''; render(); break;
        case 'tarchdone': archiveTickets(0); render(); break;
        case 'tarchtk': archiveTickets(+id); dropOverlay(); render(); break;
        case 'trestore': var rk = tix(+id); if (rk) { rk.arch = null; rk.fresh = true; toast('WB-' + rk.n + ' is restored to ' + (TCOLS.filter(function (c) { return c[0] === rk.st; })[0] || [0, 'its column'])[1] + '.'); } if (V.sheet && V.sheet.kind === 'ticket') setOverlay(root, sheetHTML(V.sheet, where === 'phone')); render(); break;
        case 'atab': V.an.tab = id; render(); break;
        case 'page': leave(); D.page = id; D.task = null; dropOverlay(); render(); break;
        case 'setgo': leave(); dropOverlay(); D.ws = id.indexOf('team/') === 0 ? 'team' : 'individual'; D.set = id; D.task = null; render(); break;
        case 'psetsec': P.set = id; render(); break;
        case 'helpgo': helpGo(where, id); break;
        case 'calmode': D.cal = id; render(); break;
        case 'pgo': P.at = id; P.task = null; P.set = null; dropOverlay(); render(); break;
        case 'decklibrary': workflowSheet('decklibrary'); break;
        case 'deckadd': if (P.deckWs) { dropOverlay(); toast('Your Control Deck is full. Remove a button first.'); break; } if (P.deckAdded) workflowSheet('wfconfig'); else { P.deckAdded = true; dropOverlay(); toast('Find Bugs is on your deck. Tap to run, hold to configure.'); render(); ackPencil(); } break;
        case 'wftap': tapWorkflow(); break;
        case 'wfrun': var picked = phoneRoot.querySelector('input[name="wfrepo"]:checked'); runWorkflow(picked ? picked.value : REPOS[0]); dropOverlay(); render(); break;
        case 'wfsave': saveWorkflow(); dropOverlay(); render(); ackPencil(); break;
        case 'wfreport': V.sheet = { kind: 'workflow-report' }; G.f['phone-report'] = true; setOverlay(root, sheetHTML(V.sheet, where === 'phone')); break;
        case 'wfstop': if (P.wf) { P.wf.stopped = true; render(); } break;
        case 'wfx': if (P.wf) P.wf.dismissed = true; dropOverlay(); render(); break;
        case 'wftasks': if (P.wf) { var found = wfFindings(); found.forEach(function (f) { newTask('Fix: ' + f[0], 'Claude Code', 'normal'); }); P.wf.dismissed = true; dropOverlay(); toast(plural(found.length, 'task') + ' added to Backlog, each with its suggested fix.'); render(); } break;
        case 'af': P.af = id; render(); break;
        case 'pdeck': P.at = 'deck'; P.task = null; dropOverlay(); render(); break;
        case 'pback': if (P.at === 'settings' && P.set) P.set = null; else P.at = parentOf(P.at); P.task = null; render(); break;
        case 'pscope': P.scope = id; render(); break;
        case 'pteam': P.at = 'team'; P.teamTab = 'board'; render(); break;
        case 'pteamtab': P.teamTab = id; render(); break;
        case 'pschedule': var scheduled = story(3); if (scheduled) schedule(scheduled.id, TODAY + 1, 9 * 60); render(); break;
        case 'pproject': P.at = 'project'; P.proj = id || 'my-app'; P.tab = 'board'; P.task = null; P.arch = false; P.fa = P.fp = 'any'; P.aq = ''; P.gsub = 'overview'; render(); break;
        case 'pday': P.day = id === '0' ? TODAY : P.day + (+id); render(); break;
        case 'wk': if (D.mode === 'day') D.dayN += +id; else D.week += +id; render(); break;
        case 'today': D.week = 0; D.dayN = 0; render(); break;
        case 'pick': D.pick = D.pick == id ? null : +id; render(); break;
        case 'finding': S.finding = false; var nt = newTask('Rebase refactor-settings-page onto main', 'Claude Code', 'normal'); nt.desc = 'Repository health found the branch 14 commits behind main.'; toast('“' + nt.title + '” is in Backlog. Findings never act on their own: you start it when you want.'); render(); break;
        case 'theme': var next = WB.theme() === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; try { localStorage.setItem('wb-theme', next); } catch (x) {} window.dispatchEvent(new Event('themechange')); render(); break;
        case 'asst-open': openAsst(where); break;
        case 'asst-x': closeAsst(where); break;
        case 'asst-new': startOverAsst(); break;
        case 'asst-stop': stopAsst(); break;
        case 'asst-latest': jumpLatest(where); break;
        case 'asst-act': var am = AS.msgs[+id]; if (am) { am.actOpen = !am.actOpen; renderAsst(false); } break;
        case 'asst-ask': askAsst(v); break;
        case 'asst-ok': decideCard(+id, +v, true); break;
        case 'asst-no': decideCard(+id, +v, false); break;
        case 'asst-all': decideAll(+id, v === 'yes'); break;
        case 'asst-opentask': openFromAssistant(where, +id, +v); break;
        case 'sug-open': openSuggestion(where, +id, +v.split(':')[0]); break;
        case 'sug-fb': var sr = AS.msgs[+id] && AS.msgs[+id].recs[+v.split(':')[0]]; if (sr) { sr.fb = v.split(':')[1]; renderAsst(false); } break;
        case 'ui-sort': var u = AS.msgs[+id].ui, c = +v; if (u.sort === c) u.dir = -u.dir; else { u.sort = c; u.dir = 1; } renderAsst(false); break;
        case 'sw': var was = D.sw; dropOverlay(); if (!was) { D.sw = true; setOverlay(root, switcherHTML(), '.w-menu [aria-current="true"]'); } render(); break;
        case 'swx': dropOverlay(); render(); break;
        case 'ws': goWs(id); break;
        case 'uv': D.uv = id; leave(); render(); break;
        case 'tv': D.tv = id; leave(); D.tarch = false; D.aq = ''; dropOverlay(); render(); break;
        case 'tvp': D.tv = 'projects'; leave(); render(); break;
        case 'go':
          if (where === 'phone') {
            if (v.indexOf('proj:') === 0) { P.at = 'project'; P.proj = v.slice(5); P.tab = 'calendar'; P.task = null; }
            else if (v === 'team') { P.at = 'team'; P.scope = 'team'; P.teamTab = 'board'; }
            else if (v.indexOf('ind:') === 0) { P.task = +v.slice(4); P.ptab = 'activity'; }
            render();
          } else jump(v);
          break;
        case 'claim': claim(+id); G.f.claimed = true; render(); break;
        case 'tstart': startWork(+id); render(); break;
        case 'tmine': D.mine = id === '1'; render(); break;
        case 'tticket': leave(); V.sheet = { kind: 'ticket', n: +id }; G.f.mention = true; setOverlay(root, sheetHTML(V.sheet, where === 'phone'), 'textarea'); break;
        case 'mread': var mk = tix(+id), mc = mk && mk.comments && mk.comments[+v]; if (mc) mc.unread = false; if (V.sheet && V.sheet.kind === 'ticket') setOverlay(root, sheetHTML(V.sheet, where === 'phone')); render(); break;
        case 'mention': var box = root.querySelector('form[data-form="comment"] textarea'); if (box) { var at = box.selectionStart == null ? box.value.length : box.selectionStart, head = box.value.slice(0, at); box.value = head + (head && !/\s$/.test(head) ? ' ' : '') + '@' + v + ' ' + box.value.slice(at); box.focus(); } break;
        case 'signoff': signoff(+id); render(); break;
        case 'runner': toast('Open in my runner hands the ticket to your own werkbord. Team never runs anything.'); break;
        case 'addteam': toast('Adding a Team installs a small background service, after you approve it. It is turned off in the demo.'); break;
        case 'slot': schedule(D.pick, +b.dataset.day, +b.dataset.m); render(); break;
        case 'asst-model': toast('Replies are scripted here, so the model is fixed in this demo.'); break;
        case 'help': dropOverlay(); if (where === 'phone') { P.at = 'help'; P.task = null; } else { leave(); D.page = 'help'; D.task = null; } render(); break;
        case 'toast': toast(v); break;
        case 'mcpdir': V.mcp = id; render(); break;
        case 'mcpfill': var paste = root.querySelector('[data-mcp-paste]'); V.mcpText = paste ? paste.value : ''; V.mcpOpen = true; try { V.mcpDraft = mcpImport(V.mcpText); V.mcpErr = ''; } catch (x) { V.mcpDraft = null; V.mcpErr = x.message; } render(); break;
        case 'settings': if (where === 'phone') { dropOverlay(); P.at = 'settings'; P.set = null; P.task = null; render(); break; } dropOverlay(); D.page = null; D.set = id || D.set || 'general/appearance'; G.f.settings = true; D.task = null; render(); break;
        case 'setsec': D.set = id; render(); break;
        case 'settheme': var chosen = v || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = chosen; try { if (v) localStorage.setItem('wb-theme', v); else localStorage.removeItem('wb-theme'); } catch (x) {} window.dispatchEvent(new Event('themechange')); render(); break;
        case 'setalerts': D.alerts = !D.alerts; toast(D.alerts ? 'Alerts are on. Werkbord tells you from another app when an agent needs you.' : 'Alerts are off. Werkbord still marks what needs you in the sidebar.'); render(); break;
        case 'settest': toast('Needs you · my-app · Migrate runs table to WAL. On a Mac this arrives as a notification, and the Dock icon bounces.'); break;
        case 'setshare': D.share = +v; if (D.share === 2) toast('Sent to ' + S.team.name + '. It stays private until another authorised person approves it there.'); render(); break;
        case 'push': V.sheet = { kind: 'push', id: +id }; setOverlay(root, sheetHTML(V.sheet, where === 'phone'), '[data-a="pushgo"]'); break;
        case 'pushgo': gitPush(+id); break;
        case 'gfetch': gitFetch(); break;
        case 'gnav': V.gsub = id; render(); break;
        case 'closetask': toast('Close task archives it. Its runs and worktree stay inspectable.'); break;
        case 'edit': toast('Edit changes the title, details and execution settings.'); break;
        case 'continue': toast('Continue with… hands the worktree to another run, with new instructions or another agent.'); break;
        case 'tz': toast('Each project keeps its own timezone, so a schedule means the same thing after travel or a clock change.'); break;
        case 'mode': D.mode = id; render(); break;
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
      } else if (f.dataset.form === 'pw-rec' && pwOf(f).col && PW.ed) {
        var fe = f.elements, ttl = fe.title.value.trim(); if (!ttl) { fe.title.focus(); return; }
        var rv = { title: ttl, done: fe.done.checked, due: fe.due.value, notes: fe.notes.value.trim() };
        rv[PW.K.sel] = fe[PW.K.sel].value;
        if (PW.ed.id == null) { rv.id = PW.col.next++; PW.col.recs.push(rv); PW.note = 'Saved “' + ttl + '”.'; }
        else { var er = PW.col.recs.filter(function (x) { return x.id === PW.ed.id; })[0]; if (er) { Object.keys(rv).forEach(function (k) { er[k] = rv[k]; }); PW.note = 'Saved “' + ttl + '”.'; } }
        PW.ed = null; PW.draft = {}; render();
      } else if (f.dataset.form === 'pw-set' && pwOf(f).ws) {
        var ss = PW.setf; if (!ss || !ss.name.trim()) return;
        PW.ws.name = ss.name.trim(); PW.ws.icon = ss.icon; PW.ws.loc = { uni: !!ss.uni, ind: !!ss.ind, team: !!ss.team };
        pwSave(''); PW.note = 'Saved as revision ' + PW.ws.rev + '. Locations control navigation only.'; PW.panel = ''; PW.setf = null;
        if (!pwVisible()) { toast('This workspace is no longer shown here. It is still in the Personal data library.'); pwAway(); } else render();
      } else if (f.dataset.form === 'comment') {
        if (postComment(+f.dataset.n, f.elements.text.value)) { setOverlay(root, sheetHTML(V.sheet, where === 'phone'), 'textarea'); render(); } else f.elements.text.focus();
      } else if (f.dataset.form === 'msg') {
        var m = f.elements.m.value.trim(); if (!m) return;
        var tt = get(f.dataset.id);
        if (tt && tt.run) { feed(tt, 'me', m); say('You messaged the agent on “' + tt.title + '”'); }
        f.elements.m.value = '';
        toast(tt && tt.run && tt.run.st === 'running' ? 'Queued for the agent. It reads it at its next step.' : 'Saved. Start a run and the agent picks it up.');
      }
    });
    root.addEventListener('change', function (e) {
      var sel = e.target.closest('select[data-sel], select[data-asel]'); if (!sel) return;
      VIEW = V;
      var key = sel.dataset.sel || sel.dataset.asel;
      if (sel.dataset.sel) V[key] = sel.value;
      else if (key === 'tdays') D.tdays = +sel.value;
      else V.an[key] = key === 'days' ? +sel.value : sel.value;
      render();
      var again = root.querySelector('[data-sel="' + key + '"], [data-asel="' + key + '"]'); if (again) again.focus({ preventScroll: true });
    });
    root.addEventListener('input', function (e) {
      if (e.target.matches('[data-arch-q]')) { VIEW = V; V.aq = e.target.value; var al = root.querySelector('[data-arch-list]'); if (al) al.innerHTML = where === 'desk' && D.ws === 'team' ? teamArchiveRows() : archiveRows(); return; }
      if (e.target.matches('[data-help-q]')) { V.hq = e.target.value; var hl = root.querySelector('[data-help-list]'); if (hl) hl.innerHTML = helpList(V.hq); return; }
      if (e.target.matches('[data-ui-q]')) {
        var mi = +e.target.getAttribute('data-ui-q'), ui = AS.msgs[mi] && AS.msgs[mi].ui, body = root.querySelector('[data-uitbody="' + mi + '"]');
        if (ui && body) { ui.q = e.target.value; body.innerHTML = uiBodyHTML(ui); }
        return;
      }
      var pe = e.target;
      if (pe.matches('[data-pw-d], [data-pw-sf], [data-pw-h], [data-pw-q], [data-pw-f], [data-pw-s]')) pwOf(pe);
      if (pe.matches('[data-pw-d]')) { PW.draft[pe.dataset.pwD] = pe.type === 'checkbox' ? pe.checked : pe.value; return; }
      if (pe.matches('[data-pw-sf]')) { if (PW.setf) PW.setf[pe.dataset.pwSf] = pe.type === 'checkbox' ? pe.checked : pe.value; return; }
      if (pe.matches('[data-pw-h]')) { PW.hsel = +pe.value; PW.hrev = 0; render(); return; }
      if (pe.matches('[data-pw-q]')) { PW.q[pe.dataset.pwQ] = pe.value; pwRegion(root, pe.dataset.pwQ); return; }
      if (pe.matches('[data-pw-f]')) { PW.f[pe.dataset.pwF] = pe.value; pwRegion(root, pe.dataset.pwF.split(':')[0]); return; }
      if (pe.matches('[data-pw-s]')) { PW.sk[pe.dataset.pwS] = pe.value; PW.sd[pe.dataset.pwS] = true; pwRegion(root, pe.dataset.pwS); return; }
      if (e.target.matches('[data-mcp-paste]')) { V.mcpText = e.target.value; return; }
      if (e.target.matches('[data-pal]')) { var l = root.querySelector('[data-pallist]'); if (l) l.innerHTML = palListHTML(e.target.value, where); }
    });
    /* A "What I looked at" panel stays open or shut across the re-renders of a streaming reply. */
    root.addEventListener('toggle', function (e) {
      var d = e.target, m = d.tagName === 'DETAILS' && d.dataset.i != null ? AS.msgs[+d.dataset.i] : null;
      if (m) m.open = d.open;
      var mm = d.tagName === 'DETAILS' && d.dataset.j != null ? AS.msgs[+d.dataset.j] : null;
      if (mm) mm.memOpen = d.open;
      if (d.tagName === 'DETAILS' && d.hasAttribute('data-pwteam')) { pwOf(d); if (PW.teamOpen !== d.open) { PW.teamOpen = d.open; render(); } }
      if (d.tagName === 'DETAILS' && d.dataset.dv) DAYS_OPEN[d.dataset.dv] = d.open;
      if (d.tagName === 'DETAILS' && d.hasAttribute('data-mcpopen')) V.mcpOpen = d.open;
    }, true);
    // The daily chart: a mouse inspects as it moves, a tap or a click pins a date, and the keys walk the dates.
    root.addEventListener('pointermove', function (e) { var box = e.target.closest && e.target.closest('.w-andaily'); if (box && e.pointerType === 'mouse' && !box.dataset.pin) inspectDay(box, dayAt(box, e), false); });
    root.addEventListener('pointerout', function (e) { var box = e.target.closest && e.target.closest('.w-andaily'); if (box && !box.dataset.pin && !(e.relatedTarget && box.contains(e.relatedTarget))) clearDay(box); });
    root.addEventListener('click', function (e) { var box = e.target.closest && e.target.closest('.w-andaily'); if (box && !e.target.closest('.w-days')) inspectDay(box, dayAt(box, e), true); });
    root.addEventListener('pointerdown', function (e) { root.querySelectorAll('.w-andaily[data-pin]').forEach(function (box) { if (!box.contains(e.target)) clearDay(box); }); });
    root.addEventListener('keydown', function (e) {
      var box = e.target.closest && e.target.closest('.w-andaily'); if (!box || e.target.closest('.w-days')) return;
      if (e.key === 'Escape') { clearDay(box); return; }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(e.key) < 0) return;
      e.preventDefault();
      var last = JSON.parse(box.dataset.days).length - 1, now = box.dataset.sel != null ? +box.dataset.sel : 0;
      inspectDay(box, e.key === 'Home' ? 0 : e.key === 'End' ? last : now + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : -1), true);
    });
    // Reading wins over following: scrolling up lets go of the tail, and reaching it again takes it back.
    root.addEventListener('wheel', function (e) { if (e.deltaY < 0 && e.target.closest && e.target.closest('.w-achat')) AS.away[where] = true; }, { passive: true });
    root.addEventListener('touchmove', function (e) { if (e.target.closest && e.target.closest('.w-achat')) AS.away[where] = true; }, { passive: true });
    root.addEventListener('scroll', function (e) { var c = e.target; if (c.classList && c.classList.contains('w-achat') && nearEnd(c, 4)) { AS.away[where] = false; setBehind(where, false); } }, true);
    root.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-a]')) { e.preventDefault(); e.target.click(); return; }
      if (where === 'desk' && D.ws === 'individual' && !AS.open && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); D.pal = ''; openOverlay(palHTML('desk'), '[data-pal]'); }
      if (e.target.matches('[data-pal]') && e.key === 'Enter') { var first = root.querySelector('[data-pallist] button'); if (first) first.click(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && e.target.closest('form[data-form="new"]')) { e.preventDefault(); var sb = e.target.closest('form').querySelector('[value="start"]'); if (sb) sb.click(); }
      if (where === 'desk' && D.ws === 'individual' && e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !e.target.matches('input,textarea,select') && !D.sheet && !AS.open) { e.preventDefault(); toast(NEW_OFF); }
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
  var CHAPTERS = ['Plan', 'Run', 'Review', 'Make it yours'];
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
  /* Make it yours: Salie builds a workspace around how the person works, once in Individual and once in a Team. Both are made the
     same way (Create with Salie, a request, a card to confirm, a page that works), so the steps come from one description. Desktop
     only: on a phone the lesson shows the same workspaces on the phone. */
  function genSteps(k) {
    var K = PWK[k], team = k === 'team', ws = team ? 'team' : 'individual', tag = 'gen-' + k, here = function () { return { ws: ws, here: true }; }, page = function () { return { ws: ws, pw: k }; };
    var asked = function () { return { asst: true, opener: '.w-gen [data-a="pw-create"]' }; };
    return [
      { id: tag, ch: 3, desk: true, kind: 'press', kick: 'Create with Salie', sticky: true, hops: true,
        need: here, aim: function () { return ['.w-gen [data-a="pw-create"]']; },
        text: function (h) { return h ? (team && h.kind === 'sw' ? 'Now your team. Open the switcher.' : '') : team ? 'Your team can have one too. Choose Create with Salie.' : 'Salie can also build a workspace around how you work. Choose Create with Salie.'; },
        done: function () { return !!PWS[k].ws || !!G.f[tag]; } },
      { id: tag + '-ask', ch: 3, desk: true, kind: 'press', kick: 'Create with Salie', wait: true,
        need: asked, aim: function () { return AS.busy ? [] : ['.w-apill[data-v="' + K.create + '"]']; },
        text: function () { return AS.busy ? 'Salie is designing the page and its collection.' : team ? 'Say what you need. Salie builds a tracker for what you are waiting on from your team.' : 'Say what you need. Salie builds a page for it: a list, progress and a chart.'; },
        done: function () { return !!PWS[k].ws || (!!G.f['ask-' + k] && !AS.busy && waitingChanges() > 0); } },
      { id: tag + '-card', ch: 3, desk: true, kind: 'press', kick: 'Confirm first',
        need: function () { return { asst: true }; }, aim: function () { return ['.w-acard [data-a="asst-ok"]']; },
        text: team ? 'It will show only in ' + S.team.name + ', and it is private to you. Nothing is saved until you confirm.' : 'The card previews the page, its fields and where it will show. Nothing is saved until you confirm.',
        done: function () { return !!PWS[k].ws; } },
      { id: tag + '-open', ch: 3, desk: true, kind: 'press', kick: 'Saved on this computer', sticky: true,
        need: function () { return { asst: true }; }, aim: function () { return ['.w-acard [data-a="pw-openfrom"][data-k="' + k + '"]']; },
        text: 'Saved on this computer. Open it.',
        done: function () { return !AS.open; } },
      { id: tag + '-add', ch: 3, desk: true, kind: 'press', kick: 'A working page', sticky: true,
        need: page, aim: function () { return PWS[k].ed ? ['.w-pw form[data-form="pw-rec"] [type="submit"]'] : ['.w-pw [data-a="pw-add"]']; },
        text: function () { return PWS[k].ed ? 'The first one is filled in for you. Save it.' : 'It is a working page, not a picture. Add your first ' + (team ? 'follow-up' : 'task') + '.'; },
        done: function () { return !PWS[k].ws || pwRecs(k) > 0; } },
      { id: tag + '-kept', ch: 3, desk: true, kind: 'area', next: true, sticky: true, kick: 'Your records',
        need: page, aim: function () { return team ? ['.w-pw .team'] : ['.w-pw .w-pwstack']; },
        text: team ? 'It sits in ' + S.team.name + ' beside your team’s work, and it is private to you. The Team projects list below is read only.' : 'Salie drew the page. Your records stay on this computer, and Salie cannot read or change them. Customize with Salie reshapes the page and leaves them as they are.',
        done: function () { return false; } }
    ];
  }
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
      text: function () { return AS.busy ? 'Salie is reading My Work, the schedules and what is waiting in both workspaces, and building the answer as it goes.' : 'Salie can answer with interface, not only text (OpenUI). Sort it, filter it. It is read only, and stamped with when it was read.'; },
      done: function () { return G.f.planAsk || planned() || !AS.open; } },
    { id: 'memory', ch: 0, kind: 'press', kick: 'Memory', sticky: true,
      need: function () { return { asst: true }; }, aim: function () { return AS.busy ? [] : ['.w-apill[data-v="' + NEXT_Q + '"]']; },
      text: 'Salie also remembers your policies and decisions. Ask it what to do next.',
      done: function () { return !!G.f.nextAsk || G.f.planAsk || planned(); } },
    { id: 'memory-ui', ch: 0, kind: 'area', next: true, kick: 'Memory', sticky: true, wait: true, nextOk: function () { return !AS.busy; },
      need: function () { return { asst: true }; }, aim: function () { return AS.busy ? [] : [{ last: '.w-sug' }]; },
      text: function () { return AS.busy ? 'Salie is weighing your saved policy, the repository and your tasks.' : 'Each suggestion says why, and Memory sources lists exactly what Salie read. It only suggests: nothing starts until you decide.'; },
      done: function () { return G.f.planAsk || planned() || !AS.open; } },
    { id: 'plan', ch: 0, kind: 'press', kick: 'Salie', wait: true,
      need: function () { return { asst: true }; }, aim: function () { return AS.busy ? [] : ['.w-apill[data-v="Plan CSV export for reports"]']; },
      text: function () { return AS.busy ? 'Salie is splitting the idea into scoped tasks. Each proposal arrives as a card, and none of them changes anything yet.' : 'Now turn an idea into work, in one request.'; },
      done: function () { return planned() || (G.f.planAsk && !AS.busy && waitingChanges() > 0); } },
    { id: 'confirm', ch: 0, kind: 'press', kick: 'Salie', sticky: true,
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
      done: function (w) { return w === 'phone' ? P.at === 'project' && P.proj === 'my-app' && P.tab === 'board' && !P.task : inProject() && D.proj === 'my-app'; } },
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
      done: function () { var t = story(3); return !t || !!t.sched || (guideWhere() === 'phone' ? P.at === 'project' && P.proj === 'my-app' && P.tab === 'calendar' : D.proj === 'my-app' && D.view === 'calendar'); } },
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
      text: function () { return (storyTicket() ? 'Claim the ticket Salie created.' : 'Claim a ticket.') + ' One guarded step, so only one person gets it. It moves to In Progress, where it waits until you start.'; },
      done: function () { return !!G.f.claimed; } },
    { id: 'mention', ch: 1, kind: 'press', next: true, sticky: true, kick: 'Comments',
      need: function () { return { ws: 'team', tv: 'board' }; }, aim: function () { return ['.w-comment-chip.unread']; },
      text: 'Maya mentioned you on WB-42. Every ticket has its own conversation, and only an explicit @mention notifies anyone.',
      done: function () { return !!G.f.mention || !!G.f.reviews || tix(42).st === 'done'; } },
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
      hops: true, text: function (h, w) { return h && h.kind === 'key' ? 'An agent needs a decision, and the deck says so. Open Workspace.' : h && h.kind === 'deck' ? 'An agent has a question. Back to the Control Deck.' : w === 'phone' ? 'An agent needs a decision. Answer from your phone, and the desktop window moves on too.' : 'Your agent has a question. Open its task, answer the separator question, and it will carry on.'; },
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
      done: function () { var t = lead(); return !t || t.state === 'done'; } }
  ].concat(genSteps('todo'), genSteps('team'), [
    { id: 'home', ch: 3, desk: true, kind: 'press', sticky: true, hops: true,
      need: function () { return { ws: 'universal', uv: 'mywork' }; }, aim: function () { return []; },
      text: function (h) { return h && h.kind === 'sw' ? 'Last stop: back to Universal. Open the switcher.' : ''; },
      done: function () { return !!lead() && lead().state === 'done' && D.ws === 'universal'; } },
    { id: 'settings', ch: 3, desk: true, kind: 'press', next: true, kick: 'Settings',
      need: function () { return { ws: 'universal', settings: true }; }, aim: function () { return ['.w-rail [data-a="settings"]']; },
      text: 'One last place. Settings is one screen for Universal, Individual and each Team. Alerts tell you from another app when an agent needs you.',
      done: function () { return D.set !== null; } }
  ]);

  /* The phone lesson, after the core story: only what is different on the phone. The deck is the way in, and a workflow key
     runs a task you repeat on the paired computer: tap it and choose a repository, or hold it and save one. Each step reads
     the sheet that is open, so a visitor who holds before tapping, or taps twice, is still on the story. */
  function wfSheet(kind) { return !!P.sheet && P.sheet.kind === kind; }
  var PHONE_STORY = [
    { id: 'phone-intro', ch: 0, kind: 'area', next: true, sticky: true, kick: 'Desktop and phone, paired',
      need: function () { return { at: 'deck' }; }, aim: function () { return ['.w-housing']; },
      text: 'Your desktop is the detailed control center. Your phone is paired with it: the same control, distilled into one deck of keys, with a count on each for what is waiting for you.',
      done: function () { return false; } },
    { id: 'phone-ws', ch: 0, kind: 'press', kick: 'Made on your computer', sticky: true,
      need: function () { return { at: 'deck' }; }, aim: function () { return ['.w-pwdeck [data-a="pw-open"]']; },
      text: function () { return 'What you build with Salie on your computer is on your phone too, with its records: ' + PW_KINDS.filter(function (k) { return PWS[k].ws; }).map(function (k) { return PWS[k].ws.name; }).join(' and ') + '. Open the first.'; },
      done: function () { return P.at === 'pw'; } },
    { id: 'phone-ws-use', ch: 0, kind: 'press', kick: 'One workspace, two screens', sticky: true,
      need: function () { return { at: 'pw' }; }, aim: function () { return [['.w-pwphone input.done:not(:checked)', '.w-pwphone .w-pwc']]; },
      text: 'The same workspace and the same records, laid out for a phone. Tick one off, and it is ticked on your computer too.',
      done: function () { return !!G.f['phone-ws-tick']; } },
    { id: 'phone-ws-more', ch: 0, kind: 'area', next: true, sticky: true, kick: 'Reshape it from here',
      need: function () { return { at: 'pw' }; }, aim: function () { return ['.w-pwacts']; },
      text: 'Edit with Salie reshapes it from your phone, with the same Confirm card. Renaming, history and deleting stay on your computer.',
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
        return P.wf && P.wf.stopped ? 'You stopped Find Bugs. Tap it to run it again.' : 'Find Bugs is still at work on your computer, about 30 seconds in this demo. Your phone only had to start it.';
      },
      done: function () { return !!P.wf && wfLines().ended && !P.wf.stopped; } },
    { id: 'phone-report', ch: 2, kind: 'press', kick: 'The result', sticky: true, hops: true,
      need: function () { return { at: 'deck', sheet: wfSheet('workflow-report') }; }, aim: function () { return ['.w-wfb [data-a="wfreport"]']; },
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
    if (!AS.open && need.asst) return need.opener ? { sel: need.opener, kind: 'pw-create' } : { sel: '[data-a="asst-open"]', kind: 'open-asst' };
    if (need.sheet && V.sheet) return null;
    if (V.sheet && !need.sheet) return { sel: '.w-sheet [data-a="sheetx"].ic', kind: 'close-sheet' };
    if (phone) {
      if (need.ws === 'individual') need = { at: 'project', tab: need.view === 'control' ? 'board' : need.view, task: need.task };
      if (need.ws === 'team') need = { at: 'team', teamTab: need.tv };
      if ((need.at === 'project' || need.at === 'team') && P.at === 'projects' && P.scope !== (need.at === 'team' ? 'team' : 'individual')) return { sel: '[data-a="pscope"][data-id="' + (need.at === 'team' ? 'team' : 'individual') + '"]', kind: 'scope', to: need.at === 'team' ? 'Team' : 'Individual' };
      if (need.at === 'team' && P.at === 'projects') return { sel: '[data-a="pteam"]', kind: 'teamproject' };
      if (need.at === 'team' && P.at === 'team' && need.teamTab && P.teamTab !== need.teamTab) return { sel: '[data-a="pteamtab"][data-id="' + need.teamTab + '"]', kind: 'nav', to: need.teamTab };
      if (P.task && !taskOk(P.task)) return { sel: '.w-mtask [data-a="close"]', kind: 'back' };
      // A workspace's page: reached from the deck's list, and left by the tab bar.
      if (need.at === 'pw') return P.at === 'pw' ? null : P.at === 'deck' ? { sel: '.w-pwdeck [data-a="pw-open"]', kind: 'pw', to: PW_KINDS.filter(function (k) { return PWS[k].ws; })[0] || 'todo' } : { sel: '.w-tabbar [data-a="pdeck"]', kind: 'deck' };
      if (need.at && !P.task) {
        if (P.at !== need.at) {
          if (need.at === 'project' && P.at === 'projects') return { sel: '[data-a="pproject"][data-id="my-app"]', kind: 'project' };
          if (P.at === 'deck') return { sel: '.w-keys [data-a="pgo"][data-id="' + (need.at === 'project' || need.at === 'team' ? 'projects' : need.at) + '"]', kind: 'key', to: need.at === 'project' || need.at === 'team' ? 'projects' : need.at };
          return { sel: '.w-tabbar [data-a="pdeck"]', kind: 'deck' };
        }
        if (need.at === 'project' && P.proj !== 'my-app') return { sel: '.w-phh [data-a="pback"]', kind: 'projects-back' };
        if (need.at === 'project' && need.tab && P.tab !== need.tab) return { sel: '.w-ptabs [data-a="ptabbar"][data-id="' + need.tab + '"]', kind: 'tab', to: need.tab };
        if (need.col && P.col !== need.col && need.at === 'project') return { sel: '.w-seg [data-a="col"][data-id="' + need.col + '"]', kind: 'col', to: need.col };
      }
      return null;
    }
    if (D.pal !== null) return null;
    if (need.ws && D.ws !== need.ws) return D.sw ? { sel: '.w-menu [data-a="ws"][data-id="' + need.ws + '"]', kind: 'ws', to: need.ws } : { sel: '.w-rail [data-a="sw"]', kind: 'sw', to: need.ws };
    if (D.sw) return null;
    // A workspace's own page, or any page of the workspace the step is in (need.here): the sidebar is on every one of them.
    if (need.pw) return D.page === 'pw' && D.pwk === need.pw ? null : { sel: '.w-rail [data-a="pw-open"][data-k="' + need.pw + '"]', kind: 'pw', to: need.pw };
    if (need.here) return null;
    // Settings is a page of the window: a step that needs another place leaves it by the sidebar.
    if ((D.set !== null || D.page) && !need.settings && (need.ws || need.uv || need.tv || need.view)) {
      var out = need.ws === 'universal' ? ['uv', need.uv || 'mywork'] : need.ws === 'team' ? ['tv', need.tv || 'board'] : need.view && need.view !== 'control' ? ['proj', 'my-app'] : ['view', 'control'];
      return { sel: '.w-rail [data-a="' + out[0] + '"][data-id="' + out[1] + '"]', kind: 'nav', to: out[1] };
    }
    if (need.ws === 'universal' && need.uv && D.uv !== need.uv) return { sel: '.w-rail [data-a="uv"][data-id="' + need.uv + '"]', kind: 'nav', to: need.uv };
    if (need.ws === 'team' && need.tv && D.tv !== need.tv) return { sel: '.w-rail [data-a="tv"][data-id="' + need.tv + '"]', kind: 'nav', to: need.tv };
    if (need.ws === 'individual' && need.view) {
      if (need.view !== 'control' && (D.proj !== 'my-app' || PROJVIEWS.indexOf(D.view) < 0)) return { sel: '.w-rail [data-a="proj"][data-id="my-app"]', kind: 'project' };
      if (D.view !== need.view) return D.view === 'control' ? { sel: '.w-rail [data-a="view"][data-id="control"]', kind: 'tab', to: need.view } : { sel: '.w-tabs [data-a="view"][data-id="' + need.view + '"]', kind: 'tab', to: need.view };
      if (D.task && !taskOk(D.task)) return { sel: '.w-panel [data-a="close"]', kind: 'close-task' };
    }
    return null;
  }
  var WSNAME = { universal: 'Universal', individual: 'Individual' }, VIEWNAME = { board: 'Board', calendar: 'Calendar', mywork: 'My Work', inbox: 'Workspaces', reviews: 'Reviews', home: 'Workspace', control: 'Workspace', review: 'Review', git: 'Git', doing: 'In progress', backlog: 'Backlog' };
  var HOP = { scope: function (h) { return 'Choose ' + h.to + ' projects.'; }, teamproject: 'Open your team’s shared project.', deck: 'Open the Control Deck.', key: function (h) { return 'Open ' + (PLACES[h.to] || 'the page') + '.'; }, 'close-asst': 'Close Salie to continue.', 'open-asst': 'Open Salie.', 'close-sheet': 'Close this to continue.', back: 'Go back to the board.', 'projects-back': 'Back to Projects.', 'close-task': 'Close the task to see the board.',
    sw: function (h) { return 'Open the switcher to get to ' + (WSNAME[h.to] || S.team.name) + '.'; },
    ws: function (h) { return 'Choose ' + (WSNAME[h.to] || S.team.name) + '.'; },
    project: 'Open my-app.',
    pw: function (h) { return 'Open ' + (PWS[h.to] && PWS[h.to].ws ? PWS[h.to].ws.name : PWK[h.to].name) + '.'; }, 'pw-create': 'Choose Create with Salie.',
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
    G.mode = 'phone'; G.active = true; G.exitAsk = false; G.floor = 0; G.hide = null; G.left = null; G.deskSw = null;
    Object.keys(G.f).forEach(function (key) { if (key.indexOf('phone-') === 0) delete G.f[key]; });
    Object.keys(G.s).forEach(function (key) { if (key.indexOf('phone-') === 0) delete G.s[key]; });
    window.dispatchEvent(new CustomEvent('wb-demo-view', { detail: 'phone' }));
    P.at = 'deck'; P.task = null; P.deckAdded = false; P.deckWs = false; P.pwk = 'todo'; P.repo = null; P.wf = null; P.scope = 'individual'; P.proj = 'my-app'; P.scroll = {};
    pwSeed();
    render();
  }
  function endSpec(w) {
    if (G.mode === 'phone') return { id: 'phone-end', kicker: 'Desktop and phone, paired', text: 'Use them together. The desktop is the detailed control center; the phone keeps the same control in reach. A workspace you build with Salie on one is on the other, and a workflow key gets you the same result with a tap while you are away.', els: [], kind: 'area', actions: [{ key: 'restart', label: 'Restart' }, { key: 'phone-tour', label: 'Replay phone demo', primary: true }] };
    if (w === 'phone') return { id: 'end', kicker: 'Plan, run, review', text: 'That is the whole loop, on your phone, with the same board the desktop shows. Now see what is special about the phone: the workspaces Salie builds on your computer, a deck you set up yourself, and workflow keys that run a task with a tap.', els: [], kind: 'area', actions: [{ key: 'restart', label: 'Restart' }, { key: 'phone-tour', label: 'See what’s special on the phone', primary: true }] };
    return { id: 'end', kicker: 'Plan, run, review', text: 'That is the whole loop, and your phone can drive all of it too. The phone demo shows only what is different there: the workspaces you just made, a deck you set up yourself, and workflow keys that run a task with a tap.', els: [], kind: 'area', actions: [{ key: 'restart', label: 'Restart' }, { key: 'phone-tour', label: 'Phone demo', primary: true }] };
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
    // The X on a note asks first: leaving the walkthrough ends the guided steps, so it is confirmed before it happens.
    var spec = G.exitAsk ? { id: 'exit-ask', kicker: 'Exit the walkthrough', text: 'By clicking X, you exit the walkthrough. Are you sure you want to exit it?', els: [], kind: 'area', actions: [{ key: 'exit-yes', label: 'Yes, exit', primary: true }, { key: 'exit-no', label: 'No, keep going' }] } : G.mode === 'phone' && w === 'desk' && step ? { id: 'phone-resume', kicker: 'Desktop and phone, paired', text: P.wf ? 'The same Find Bugs run shows here, at the top of the window: one computer does the work, and either screen follows it. The phone demo carries on on the phone.' : D.page === 'pw' ? 'The same workspace, with the same records. A change on either screen is on the other. The phone demo carries on on the phone.' : 'The phone demo carries on on the phone. Anything you start there shows here too.', els: [], actions: [{ key: 'phone-resume', label: 'Back to the phone', primary: true }] } : step ? stepSpec(step, w, surface) : endSpec(w);
    [deskRoot, phoneRoot].forEach(function (r) { r.querySelectorAll('[aria-describedby="demo-guide-note"]').forEach(function (n) { n.removeAttribute('aria-describedby'); }); });
    var open = deskRoot.querySelector('.w-asst');
    if (open) open.classList.toggle('room', w === 'desk');
    if (!spec) { WBGuide.hide(); return; }
    var mobile = small.matches;
    spec.host = guideHost(w);
    spec.surface = surface;
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
  var NAV = { desk: ['ws', 'uv', 'tv', 'view', 'proj', 'page', 'pwk', 'set', 'task', 'ptab'], phone: ['at', 'tab', 'proj', 'pwk', 'set', 'scope', 'teamTab', 'task', 'ptab', 'col'] };
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
        else if (D.ws === 'individual') {
          if (D.view === 'control' || D.view === 'projects' || D.view === 'analytics') P.at = D.view === 'projects' ? 'projects' : D.view;
          else { P.at = 'project'; P.proj = D.proj; P.tab = ['board', 'calendar', 'git', 'runs', 'psettings'].indexOf(D.view) >= 0 ? D.view : 'board'; }
          P.scope = 'individual';
        }
        // Universal is the desktop's home, and the deck is the phone's.
        else P.at = D.uv === 'inbox' ? 'control' : D.uv === 'calendar' ? 'calendar' : 'deck';
        // A workspace Salie made is on the phone too, and its page stays open.
        if (D.page === 'pw' && PWS[D.pwk].ws) { P.at = 'pw'; P.pwk = D.pwk; }
        if (P.task && get(P.task)) P.col = get(P.task).state;
      } else {
        D.task = P.task; D.ptab = P.ptab; D.set = null; D.sheet = P.sheet && ['merge', 'new', 'workflow-report'].indexOf(P.sheet.kind) >= 0 ? P.sheet : null;
        D.page = null;
        if (P.at === 'team') { D.ws = 'team'; D.tv = P.teamTab; }
        else if (P.at === 'project') { D.ws = 'individual'; D.proj = P.proj; D.view = P.tab; }
        else if (P.at === 'mywork') { D.ws = 'universal'; D.uv = 'mywork'; }
        else if (P.at === 'pw' && PWS[P.pwk].ws) {
          var at = PWS[P.pwk].ws.loc, here = { universal: 'uni', individual: 'ind', team: 'team' };
          if (!at[here[D.ws]]) D.ws = at.ind ? 'individual' : at.uni ? 'universal' : 'team';
          D.page = 'pw'; D.pwk = P.pwk;
        }
        else if (P.at !== 'deck' && P.at !== 'projects') { D.ws = 'individual'; D.proj = 'my-app'; D.view = P.at === 'agents' ? 'runs' : P.at === 'reviews' ? 'board' : ['control', 'calendar', 'git', 'analytics'].indexOf(P.at) >= 0 ? P.at : 'control'; }
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
    G.floor = ch; D.task = null; D.pick = null; leave();
    if (ch === 0) { D.ws = 'universal'; D.uv = 'mywork'; }
    if (ch === 1) { D.ws = 'individual'; D.proj = 'my-app'; D.view = 'board'; }
    if (ch >= 2) { [story(1), story(2)].forEach(function (t) { if (!t.run) startTask(t.id, true); finish(t); if (ch === 3) mergeTask(t.id); }); D.ws = 'individual'; D.proj = 'my-app'; D.view = 'board'; }
    render();
  }
  function guideReset() {
    G.active = true; G.mode = 'core'; G.exitAsk = false;
    halt(); asstFresh(); pwReset(); clearTimeout(toastTimer); xferTimers.forEach(clearTimeout); xferTimers = []; INSP = {}; DAYS_OPEN = {};
    var fresh = JSON.parse(initialState);
    Object.keys(S).forEach(function (k) { S[k] = fresh[k]; });
    G.f = {}; G.s = {}; G.floor = 0; G.hide = null; G.left = null; G.deskSw = null; revealed = ''; placed = {};
    AS.open = false;
    [D, P].forEach(function (v) { v.task = null; v.sheet = null; v.scroll = {}; });
    D.ws = 'universal'; D.uv = 'mywork'; D.tv = 'board'; D.view = 'control'; D.proj = 'my-app'; D.page = null; D.pwk = 'todo'; D.set = null; D.alerts = false; D.share = 0; D.mine = false; D.sw = false; D.pal = null; D.pick = null; D.week = 0; D.dayN = 0; D.mode = 'week'; D.cal = 'calendar';
    D.arch = D.tarch = false; D.fa = D.fp = 'any'; D.aq = ''; D.hq = ''; D.gsub = 'overview'; D.ccp = D.cca = 'all'; D.an = analyticsState(); D.tdays = 30; D.cc = 'all';
    P.deckAdded = false; P.deckWs = false; P.pwk = 'todo'; P.repo = null; P.scope = 'individual'; P.at = 'deck'; P.tab = 'board'; P.proj = 'my-app'; P.set = null; P.col = 'backlog'; P.day = TODAY; P.cc = 'all'; P.wf = null; P.af = 'all';
    P.arch = false; P.fa = P.fp = 'any'; P.aq = ''; P.hq = ''; P.gsub = 'overview'; P.ccp = P.cca = 'all'; P.an = analyticsState(); P.teamTab = 'board';
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
    if (where === 'desk' ? D.page === 'pw' : P.at === 'pw') {
      pwUse(where === 'desk' ? D.pwk : P.pwk);
      if (PW.menu || PW.panel || PW.ed || PW.delId != null) { pwIdle(PW); render(); return true; }
    }
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
    else if (key === 'hide') { G.exitAsk = true; guideRefresh(); }
    else if (key === 'exit-no') { G.exitAsk = false; guideRefresh(); }
    else if (key === 'exit-yes') { G.exitAsk = false; G.active = false; guideRefresh(); toast('You have exited the walkthrough. Explore freely, or press Start walkthrough to begin again.'); }
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
