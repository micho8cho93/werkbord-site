/* A working replica of the Werkbord Team console, on a desk and on a phone, sharing one workspace.
   Layout and wording follow internal/team/console; the rules are the ones in docs/TEAM.md:
   project roles, one guarded claim, an open pull request blocks Done, overlap warnings from
   reported files, and metadata only. Team coordinates; it never runs anything. */
(function () {
  'use strict';
  var esc = WB.esc;
  var deskMount = document.getElementById('team-demo');
  var phoneMount = document.getElementById('team-phone');
  if (!deskMount && !phoneMount) return;

  /* ---------- the model ---------- */
  var PERMS = {
    member: ['view', 'create', 'claim', 'report'],
    reviewer: ['view', 'create', 'claim', 'report', 'review', 'report_any'],
    owner: ['view', 'create', 'claim', 'report', 'review', 'report_any', 'edit', 'assign', 'reopen', 'invite']
  };
  var MEMBERS = [{ id: 'ada', name: 'Ada Okafor', ws: 'owner' }, { id: 'bo', name: 'Bo Lindqvist', ws: 'member' }, { id: 'cy', name: 'Cy Moreau', ws: 'member' }];
  var STAT = [['backlog', 'Backlog', 'Ideas that are not ready to start.'], ['available', 'Available', 'Ready: any member can claim one.'], ['in_progress', 'In Progress', 'Someone is working on it.'], ['review', 'Review', 'Submitted; waiting for a reviewer.'], ['done', 'Done', 'Finished.']];
  var S = {
    me: 'ada', nextN: 54, nextPr: 92, clock: 10 * 60 + 44,
    projects: [
      { id: 'shop', name: 'Shop', desc: 'Storefront and checkout', repo: 'https://github.com/acme/shop', members: { ada: 'owner', bo: 'member', cy: 'reviewer' } },
      { id: 'docs', name: 'Docs', desc: 'The public documentation site', repo: 'https://github.com/acme/docs', members: { ada: 'owner', cy: 'member' } }
    ],
    tickets: [
      tk(41, 'shop', 'Upgrade the payment SDK', 'done', 'bo', { by: 'ada', pr: { n: 84, state: 'merged', mergeable: 'mergeable' }, branch: 'wb-41-upgrade-the-payment-sdk', files: ['pay/sdk.ts'], commits: [['33aa0b1c', 'Move to payment SDK 4.2']] }),
      tk(44, 'shop', 'Add a gift-card field at checkout', 'backlog', null, { by: 'ada', desc: 'Let a shopper enter a gift-card code at checkout.' }),
      tk(45, 'shop', 'Translate the checkout into Dutch', 'backlog', null, { by: 'cy', desc: 'Every string on the three checkout steps, reviewed by someone who speaks Dutch.' }),
      tk(46, 'shop', 'Show stock levels on product pages', 'available', null, { by: 'ada', desc: 'Say “Only 3 left” under five, and “Back soon” at zero.' }),
      tk(47, 'shop', 'Expired sessions show a raw 401', 'available', null, { by: 'cy', desc: 'An expired session shows an error page instead of sending people to sign in again.', req: 'Keep the cart. Return to the same page after signing in.' }),
      tk(48, 'shop', 'Retry payment webhooks with backoff', 'in_progress', 'bo', { by: 'ada', desc: 'Payment webhooks fail silently when the provider times out.', req: 'Exponential backoff, at most 6 attempts, log each retry.', branch: 'wb-48-retry-webhooks', files: ['pay/webhooks.ts', 'pay/retry.ts'], commits: [['a1c9e02f', 'Retry payment webhooks with exponential backoff']] }),
      tk(49, 'shop', 'Fix currency rounding in the cart total', 'review', 'cy', { by: 'ada', desc: 'Totals in JPY show two decimals.', branch: 'wb-49-currency-rounding', pr: { n: 91, state: 'open', mergeable: 'mergeable' }, files: ['cart/total.ts', 'pay/webhooks.ts'], commits: [['7be41d90', 'Round cart totals by currency minor units'], ['c0ffee12', 'Test zero-decimal currencies']] }),
      tk(50, 'shop', 'Speed up the order history query', 'in_progress', 'ada', { by: 'cy', desc: 'Order history takes four seconds for customers with many orders.', branch: 'wb-50-order-history-index', behind: 3, files: ['orders/history.sql'], commits: [['5e7f1a3b', 'Index orders by customer and date']] }),
      tk(51, 'shop', 'Order confirmation email', 'review', 'ada', { by: 'ada', desc: 'Send a confirmation after payment succeeds.', branch: 'wb-51-order-confirmation', pr: { n: 88, state: 'open', mergeable: 'conflicting' }, files: ['mail/confirm.ts'], commits: [['9d2b6c40', 'Send a confirmation email after payment']] }),
      tk(52, 'docs', 'Rewrite the install guide', 'available', null, { by: 'ada', desc: 'One page: download, open, first task.' }),
      tk(53, 'docs', 'API reference: tickets', 'in_progress', 'cy', { by: 'ada', desc: 'Document the ticket endpoints.', branch: 'wb-53-api-reference-tickets', files: ['docs/api/tickets.md'] })
    ],
    log: [
      ev('claimed', 53, 'cy', 'docs', 10 * 60 + 41), ev('submitted for review', 49, 'cy', 'shop', 10 * 60 + 12), ev('reported new Git facts for', 48, 'bo', 'shop', 10 * 60 + 3),
      ev('claimed', 50, 'ada', 'shop', 9 * 60 + 50), ev('claimed', 48, 'bo', 'shop', 9 * 60 + 31), ev('completed', 41, 'cy', 'shop', 9 * 60 + 5)
    ]
  };
  function tk(n, p, title, status, holder, o) {
    var t = { key: 'WB-' + n, n: n, p: p, title: title, status: status, holder: holder, by: 'ada', desc: '', req: '', branch: null, pr: null, behind: 0, files: [], commits: [], note: null, claimedAt: 9 * 60 + (n % 50), updated: 10 * 60 + (n % 40) };
    for (var k in o) t[k] = o[k];
    return t;
  }
  function ev(what, n, who, proj, t) { return { what: what, key: 'WB-' + n, who: who, proj: proj, t: t }; }
  function member(id) { return MEMBERS.filter(function (m) { return m.id === id; })[0]; }
  function nm(id) { var m = member(id); return m ? m.name : 'nobody'; }
  function proj(id) { return S.projects.filter(function (p) { return p.id === id; })[0]; }
  function roleOf(who, p) { return proj(p).members[who] || null; }
  function can(p, perm) { var r = roleOf(S.me, p); return !!r && PERMS[r].indexOf(perm) > -1; }
  function visible() { return S.projects.filter(function (p) { return roleOf(S.me, p.id); }); }
  function getT(k) { return S.tickets.filter(function (t) { return t.key === k; })[0]; }
  function mine(t) { return t.holder === S.me; }
  function slug(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').split('-').slice(0, 3).join('-'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(m) { return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60); }
  function log(what, t) { S.clock += 1; S.log.unshift({ what: what, key: t.key, who: S.me, proj: t.p, t: S.clock }); t.updated = S.clock; t.fresh = true; }
  function stLabel(s) { return STAT.filter(function (x) { return x[0] === s; })[0][1]; }

  /* ---------- operations: each returns an error string, or nothing ---------- */
  var OPS = {
    claim: function (t) {
      if (t.holder) return t.key + ' was claimed by ' + nm(t.holder) + ' a moment ago. One claim, one owner.';
      if (!can(t.p, 'claim')) return 'You are not on ' + proj(t.p).name + '. A project owner can invite you.';
      if (t.status !== 'available') return 'Only Available tickets can be claimed.';
      t.holder = S.me; t.status = 'in_progress'; t.branch = 'wb-' + t.n + '-' + slug(t.title); t.claimedAt = S.clock; t.note = null; log('claimed', t);
    },
    release: function (t) {
      if (!(mine(t) || can(t.p, 'assign'))) return 'Only ' + nm(t.holder) + ' or a project owner can give ' + t.key + ' back.';
      t.holder = null; t.status = 'available'; t.branch = null; t.pr = null; t.behind = 0; t.commits = []; t.files = []; log('released', t);
    },
    submit: function (t) {
      if (!mine(t)) return 'Only ' + nm(t.holder) + ', who holds ' + t.key + ', can submit it.';
      if (!t.commits.length) t.commits = [[(t.n * 2654435761 >>> 0).toString(16).slice(0, 8), t.title]];
      if (!t.pr) t.pr = { n: S.nextPr++, state: 'open', mergeable: 'mergeable' };
      t.status = 'review'; t.note = null; log('submitted for review', t);
    },
    changes: function (t) {
      if (!can(t.p, 'review')) return 'Asking for changes needs the reviewer role on ' + proj(t.p).name + '.';
      t.status = 'in_progress'; t.note = 'Changes requested by ' + nm(S.me) + ': please cover the zero-total case.'; log('asked for changes on', t);
    },
    merged: function (t) {
      if (!(can(t.p, 'report_any') || mine(t))) return 'Only the holder or a reviewer can record a merge.';
      if (!t.pr || t.pr.state !== 'open') return t.key + ' has no open pull request.';
      if (t.pr.mergeable === 'conflicting') return 'PR #' + t.pr.n + ' has conflicts on the Git host. ' + nm(t.holder) + ' rebases in their own checkout and reports it. Team never resolves conflicts.';
      t.pr.state = 'merged'; log('recorded the merge of', t);
    },
    complete: function (t) {
      if (!can(t.p, 'review')) return 'Marking done needs the reviewer role on ' + proj(t.p).name + '.';
      if (mine(t) && roleOf(S.me, t.p) !== 'owner') return 'A reviewer cannot sign off their own work.';
      if (t.pr && t.pr.state === 'open') return t.key + ' cannot be Done while PR #' + t.pr.n + ' is open. Merge it on your Git host, then record the merge.';
      t.status = 'done'; log('completed', t);
    },
    promote: function (t) {
      if (!(t.by === S.me || can(t.p, 'edit'))) return 'Only whoever wrote ' + t.key + ' or a project owner can move it.';
      t.status = t.status === 'backlog' ? 'available' : 'backlog'; log('moved', t);
    },
    reopen: function (t) {
      if (!can(t.p, 'reopen')) return 'Only a project owner can reopen a ticket.';
      t.status = 'available'; t.holder = null; t.branch = null; t.pr = null; t.behind = 0; log('reopened', t);
    },
    rebased: function (t) {
      if (!mine(t)) return 'Only the holder reports their own branch.';
      t.behind = 0; if (t.pr) t.pr.mergeable = 'mergeable'; log('reported new Git facts for', t);
    }
  };
  function act(op, key, root) {
    var t = getT(key); if (!t) return;
    var err = OPS[op](t);
    if (err) toast(err, true);
    else {
      var said = { claim: t.key + ' is yours. Open it in your own Werkbord when you are ready.', submit: t.key + ' is in Review with PR #' + (t.pr && t.pr.n) + '.', complete: t.key + ' is Done.', merged: 'Recorded: PR #' + (t.pr && t.pr.n) + ' is merged.', release: t.key + ' is back in Available.', changes: t.key + ' is back with ' + nm(t.holder) + ', with your note.', rebased: 'Reported: ' + t.branch + ' is up to date with main.' }[op];
      if (said) toast(said);
    }
    render();
  }

  /* ---------- what needs attention (the Repository tab) ---------- */
  function attention(p) {
    var out = [], act = S.tickets.filter(function (t) { return t.p === p && (t.status === 'in_progress' || t.status === 'review') && t.branch; });
    act.forEach(function (t) { if (t.pr && t.pr.state === 'open' && t.pr.mergeable === 'conflicting') out.push({ sev: 'problem', badge: 'conflict', t: t, text: t.key + ' (' + t.branch + ') by ' + nm(t.holder) + ': PR #' + t.pr.n + ' has merge conflicts on the Git host. They are resolved in ' + nm(t.holder).split(' ')[0] + '’s own checkout.' }); });
    act.forEach(function (t) { if (t.behind) out.push({ sev: 'warning', badge: 'behind', t: t, text: t.key + ' (' + t.branch + ') by ' + nm(t.holder) + ' is ' + t.behind + ' commits behind main.' }); });
    for (var i = 0; i < act.length; i++) for (var j = i + 1; j < act.length; j++) {
      var shared = act[i].files.filter(function (f) { return act[j].files.indexOf(f) > -1; });
      if (shared.length) out.push({ sev: 'warning', badge: 'warning', t: act[i], text: act[i].key + ' (' + act[i].branch + ') by ' + nm(act[i].holder) + ' and ' + act[j].key + ' (' + act[j].branch + ') by ' + nm(act[j].holder) + ' both change ' + shared.join(', ') + '. Whoever merges second may have conflicts to resolve.' });
    }
    S.tickets.filter(function (t) { return t.p === p && t.status === 'review' && t.pr && t.pr.state === 'merged'; }).forEach(function (t) { out.push({ sev: 'info', badge: 'merged', t: t, text: 'PR #' + t.pr.n + ' is merged: ' + t.key + ' can be marked Done.' }); });
    S.tickets.filter(function (t) { return t.p === p && t.status === 'done' && t.branch; }).forEach(function (t) { out.push({ sev: 'info', badge: 'info', t: t, text: 'Branch ' + t.branch + ' belongs to the finished ticket ' + t.key + '; it can probably be deleted.' }); });
    return out;
  }
  function overlapOf(t) {
    if (!t.branch || t.status === 'done') return null;
    var o = S.tickets.filter(function (x) { return x !== t && x.p === t.p && (x.status === 'in_progress' || x.status === 'review') && x.files.some(function (f) { return t.files.indexOf(f) > -1; }); })[0];
    return o ? { other: o, files: o.files.filter(function (f) { return t.files.indexOf(f) > -1; }) } : null;
  }

  /* ---------- views ---------- */
  var D = { tab: 'board', proj: 'shop', sel: null, handoff: false, wsub: 'working', rsub: 'attention', col: 'in_progress', scroll: {} };
  var P = { tab: 'board', proj: 'shop', sel: null, handoff: false, wsub: 'working', rsub: 'attention', col: 'available', scroll: {} };

  function av(id) { return '<span class="c-av">' + nm(id).charAt(0) + '</span>'; }
  function prChip(t) {
    if (!t.pr) return '';
    var s = t.pr.state === 'merged' ? 'merged' : t.pr.mergeable === 'conflicting' ? 'conflicts' : 'open';
    return '<span class="c-chip"' + (s === 'conflicts' ? ' style="color:var(--danger-text)"' : s === 'merged' ? ' style="color:var(--ok-text)"' : '') + '>PR #' + t.pr.n + ' ' + s + '</span>';
  }
  function cardHTML(t, V) {
    var claim = t.status === 'available' && can(t.p, 'claim');
    var drag = (t.status === 'available' && can(t.p, 'claim')) || (t.status === 'in_progress' && mine(t)) || (t.status === 'review' && can(t.p, 'review')) || (t.status === 'backlog' && (t.by === S.me || can(t.p, 'edit')));
    return '<div class="c-card' + (mine(t) && t.status !== 'done' ? ' mine' : '') + (V.sel === t.key ? ' open' : '') + (t.fresh ? ' fresh' : '') + '" data-card="' + t.key + '"' + (drag ? ' draggable="true"' : '') + '>' +
      '<span class="c-key">' + t.key + '</span><button class="title" type="button" data-a="sel" data-id="' + t.key + '">' + esc(t.title) + '</button>' +
      (t.holder ? '<span class="owner">' + av(t.holder) + (mine(t) ? 'You' : nm(t.holder)) + (t.status === 'in_progress' || t.status === 'review' ? ' · active' : '') + '</span>' : '') +
      (t.pr || t.behind || t.note ? '<span class="flags">' + prChip(t) + (t.behind ? '<span class="c-chip" style="color:var(--warn-text)">' + t.behind + ' behind</span>' : '') + (t.note ? '<span class="c-chip" style="color:var(--warn-text)">changes requested</span>' : '') + '</span>' : '') +
      (claim ? '<button class="c-btn primary small" type="button" data-a="op" data-op="claim" data-id="' + t.key + '">Claim</button>' : '') + '</div>';
  }
  function projectBar(V, people) {
    var p = proj(V.proj), r = roleOf(S.me, p.id);
    return '<section class="c-panel c-phead"><div class="c-pbar"><label>Project <select class="c-select" data-a="proj" aria-label="Project">' + visible().map(function (x) { return '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + x.name + '</option>'; }).join('') + '</select></label>' +
      '<span class="c-muted" style="font-size:14px">You are ' + (r === 'owner' ? 'an owner' : r === 'reviewer' ? 'a reviewer' : 'a member') + ' here.</span>' + (people ? '<button class="c-btn" type="button" data-a="note" data-v="People &amp; invites: invite someone as a member or reviewer, for one use or many, for up to 30 days.">People &amp; invites</button>' : '') + '<button class="c-btn" type="button" data-a="note" data-v="The Archive keeps closed and cleared tickets, searchable, with their history.">Archive</button></div>' +
      '<p style="margin-top:12px">' + esc(p.desc) + '</p><p class="c-muted" style="font-size:14px">Repository: <a href="#" data-a="note" data-v="Team links to the repository on your Git host. It never opens it.">' + p.repo + '</a></p></section>';
  }
  function boardHTML(V, phone) {
    var p = proj(V.proj);
    var cols = STAT.map(function (s) { return [s, S.tickets.filter(function (t) { return t.p === p.id && t.status === s[0]; })]; });
    return projectBar(V, true) +
      '<div class="c-actions" style="margin-top:0"><button class="c-btn" type="button" data-a="note" data-v="Archive (0): nothing has been archived in this project yet.">Archive (0)</button><button class="c-btn" type="button" data-a="note" data-v="Clear Done moves finished tickets into the Archive, with their details intact.">Clear Done</button><button class="c-btn primary" type="button" data-a="newticket">New ticket</button></div>' +
      (phone ? '<nav class="c-nav cols" aria-label="Columns">' + cols.map(function (c) { return '<button type="button" data-a="col" data-id="' + c[0][0] + '"' + (V.col === c[0][0] ? ' aria-current="page"' : '') + '>' + c[0][1] + ' <span class="c-chip">' + c[1].length + '</span></button>'; }).join('') + '</nav>' : '') +
      '<div class="c-board">' + cols.map(function (c) {
        return '<section class="c-col" data-col="' + c[0][0] + '" data-active="' + (V.col === c[0][0]) + '" aria-label="' + c[0][1] + '"><h3>' + c[0][1] + ' <span class="n">' + c[1].length + '</span></h3><p class="c-muted">' + c[0][2] + '</p><div class="c-cards">' + c[1].map(function (t) { return cardHTML(t, V); }).join('') + '</div></section>';
      }).join('') + '</div>';
  }
  function ticketHTML(V, phone) {
    var t = getT(V.sel); if (!t) return '';
    var acts = [], r = roleOf(S.me, t.p), note = '';
    if (t.status === 'available') {
      if (can(t.p, 'claim')) acts.push('<button class="c-btn primary" type="button" data-a="op" data-op="claim" data-id="' + t.key + '">Claim</button>');
      if (t.by === S.me || can(t.p, 'edit')) acts.push('<button class="c-btn" type="button" data-a="op" data-op="promote" data-id="' + t.key + '">Back to Backlog</button>');
    } else if (t.status === 'backlog') {
      if (t.by === S.me || can(t.p, 'edit')) acts.push('<button class="c-btn primary" type="button" data-a="op" data-op="promote" data-id="' + t.key + '">Make available</button>');
      else note = 'Only whoever wrote it or a project owner can make it available.';
    } else if (t.status === 'in_progress') {
      if (mine(t)) {
        acts.push('<button class="c-btn primary" type="button" data-a="op" data-op="submit" data-id="' + t.key + '">Submit for review</button>', '<button class="c-btn" type="button" data-a="handoff">Open in my runner</button>');
        if (t.behind) acts.push('<button class="c-btn" type="button" data-a="op" data-op="rebased" data-id="' + t.key + '">Report: rebased</button>');
        acts.push('<button class="c-btn" type="button" data-a="op" data-op="release" data-id="' + t.key + '">Release</button>');
      } else if (can(t.p, 'assign')) acts.push('<button class="c-btn" type="button" data-a="op" data-op="release" data-id="' + t.key + '">Take it back</button>');
      else note = 'Only ' + nm(t.holder) + ' can submit this. You can follow it here.';
    } else if (t.status === 'review') {
      if (t.pr && t.pr.state === 'open') acts.push('<button class="c-btn" type="button" data-a="op" data-op="merged" data-id="' + t.key + '">Record merge</button>');
      acts.push('<button class="c-btn primary" type="button" data-a="op" data-op="complete" data-id="' + t.key + '">Mark done</button>', '<button class="c-btn" type="button" data-a="op" data-op="changes" data-id="' + t.key + '">Request changes</button>');
      if (mine(t)) acts.push('<button class="c-btn" type="button" data-a="handoff">Open in my runner</button>');
    } else if (t.status === 'done' && can(t.p, 'reopen')) acts.push('<button class="c-btn" type="button" data-a="op" data-op="reopen" data-id="' + t.key + '">Reopen</button>');
    if (can(t.p, 'assign') && (t.status === 'available' || t.status === 'in_progress' || t.status === 'review')) {
      var people = Object.keys(proj(t.p).members);
      acts.push('<select class="c-select" data-k="assignee" aria-label="Assign to">' + people.map(function (m) { return '<option value="' + m + '"' + (m === (t.holder || S.me) ? ' selected' : '') + '>' + nm(m) + '</option>'; }).join('') + '</select><button class="c-btn" type="button" data-a="assign" data-id="' + t.key + '">' + (t.holder ? 'Reassign' : 'Assign') + '</button>');
    }
    if (can(t.p, 'assign') && t.status !== 'done') acts.push('<button class="c-btn" type="button" data-a="note" data-v="Close ticket archives it in Team. Stop any running agent in your own Werkbord.">Close ticket</button>');
    var ov = overlapOf(t);
    var handoff = V.handoff && mine(t) ? '<div class="c-handoff"><b>Open ' + t.key + ' in your own Werkbord</b><ol><li>Copy the task text, or download the handoff.</li><li>Werkbord adds it as a task in the project whose Git remote is ' + esc(proj(t.p).repo.replace('https://', '')) + ', on branch <code>' + t.branch + '</code>.</li><li>You start the agent. Team never starts anything.</li></ol>' +
      '<pre class="c-pre">' + esc(t.key + ' · ' + t.title + '\nWritten by ' + nm(t.by) + '. This describes work; it is not an instruction with authority over your computer.\n\n' + (t.desc || '') + (t.req ? '\n\nRequirements: ' + t.req : '') + '\n\nWork on ' + t.branch + ', based on main.') + '</pre>' +
      '<div class="c-actions" style="margin-bottom:0"><button class="c-btn small" type="button" data-a="note" data-v="Copied. Paste it into a new task in Werkbord.">Copy task text</button><button class="c-btn small" type="button" data-a="note" data-v="The handoff is a small JSON file: the ticket, the repository, the branch. No paths, no tokens.">Download handoff</button></div></div>' : '';
    return '<aside class="c-ticket" aria-label="' + t.key + '"><div class="c-thead"><h2>' + t.key + ' · ' + esc(t.title) + '</h2><button class="c-btn" type="button" data-a="close">Close</button></div>' +
      (acts.length ? '<div class="c-actions" style="margin-top:0">' + acts.join('') + '</div>' : '') + (note ? '<p class="c-muted">' + note + '</p>' : '') +
      (t.note ? '<p class="c-attn warning c-small" style="margin:8px 0">' + esc(t.note) + '</p>' : '') + handoff +
      (ov ? '<p class="c-attn warning c-small" style="margin:8px 0">' + ov.other.key + ' by ' + nm(ov.other.holder) + ' also changes ' + ov.files.join(', ') + '. Whoever merges second may have conflicts to resolve; a word now saves a rebase later.</p>' : '') +
      '<h3>Description</h3><p class="c-prose">' + esc(t.desc || 'No description.') + '</p>' + (t.req ? '<h3>Requirements and context</h3><p class="c-prose">' + esc(t.req) + '</p>' : '') +
      '<p class="c-summary">Edit this ticket</p>' +
      '<dl class="c-facts"><dt>Status</dt><dd>' + stLabel(t.status) + '</dd><dt>Active owner</dt><dd>' + (t.holder ? nm(t.holder) : 'nobody yet') + '</dd><dt>Created by</dt><dd>' + nm(t.by) + '</dd>' + (t.holder ? '<dt>Claimed</dt><dd>' + clock(t.claimedAt) + '</dd>' : '') + '<dt>Updated</dt><dd>' + clock(t.updated) + '</dd>' +
      (t.branch ? '<dt>Branch</dt><dd><code style="font-family:var(--mono);font-size:12px">' + t.branch + '</code><button class="c-btn small" type="button" data-a="note" data-v="Branch name copied.">Copy</button></dd>' : '') +
      '<dt>Pull request</dt><dd>' + (t.pr ? prChip(t) : 'none reported') + '</dd></dl>' +
      (t.commits.length ? '<h3>Commits</h3><ul class="c-commits">' + t.commits.map(function (c) { return '<li><code>' + c[0] + '</code> ' + esc(c[1]) + ' <span class="c-muted">· ' + nm(t.holder || t.by) + '</span></li>'; }).join('') + '</ul>' : '') +
      (t.branch ? '<p class="c-summary">Record branch and pull request</p>' : '') + '</aside>';
  }
  function tilesHTML() {
    var vis = visible().map(function (p) { return p.id; }), inVis = function (t) { return vis.indexOf(t.p) > -1; };
    var avail = S.tickets.filter(function (t) { return inVis(t) && t.status === 'available'; }).length;
    var yours = S.tickets.filter(function (t) { return inVis(t) && mine(t) && (t.status === 'in_progress' || t.status === 'review'); }).length;
    var others = S.tickets.filter(function (t) { return inVis(t) && t.holder && !mine(t) && (t.status === 'in_progress' || t.status === 'review'); }).length;
    var review = toReview().length, attn = [];
    vis.forEach(function (p) { attn = attn.concat(attention(p).filter(function (a) { return a.sev !== 'info'; })); });
    var probs = attn.filter(function (a) { return a.sev === 'problem'; }).length;
    return '<div class="c-tiles"><button class="c-tile" type="button" data-a="tab" data-id="board"><span class="v">' + avail + '</span><span class="l">Available</span><span class="c-muted">ready for anyone to claim</span></button>' +
      '<button class="c-tile" type="button" data-a="tab" data-id="mywork"><span class="v">' + yours + '</span><span class="l">Yours</span><span class="c-muted">tickets you are working on</span></button>' +
      '<button class="c-tile" type="button" data-a="tab" data-id="board"><span class="v">' + others + '</span><span class="l">Everyone else</span><span class="c-muted">being worked on or in review</span></button>' +
      '<button class="c-tile' + (review ? ' attn' : '') + '" type="button" data-a="tab" data-id="reviews"><span class="v">' + review + '</span><span class="l">To review</span><span class="c-muted">waiting for you</span></button>' +
      '<button class="c-tile' + (probs ? ' bad' : '') + '" type="button" data-a="tab" data-id="repository"><span class="v">' + attn.length + '</span><span class="l">Repository</span><span class="c-muted">' + (probs ? probs + ' problem' + (probs > 1 ? 's' : '') + ', ' : '') + (attn.length - probs) + ' warning' + (attn.length - probs === 1 ? '' : 's') + '</span></button></div>';
  }
  function toReview() {
    return S.tickets.filter(function (t) { return t.status === 'review' && roleOf(S.me, t.p) && can(t.p, 'review') && (!mine(t) || roleOf(S.me, t.p) === 'owner'); });
  }
  function subnav(V, key, items) {
    return '<nav class="c-nav sub" aria-label="Sections">' + items.map(function (i) { return '<button type="button" data-a="sub" data-k="' + key + '" data-id="' + i[0] + '"' + (V[key] === i[0] ? ' aria-current="page"' : '') + '>' + i[1] + ' <span class="c-chip">' + i[2] + '</span></button>'; }).join('') + '</nav>';
  }
  function workspaceHTML(V) {
    var vis = visible().map(function (p) { return p.id; });
    var working = S.tickets.filter(function (t) { return vis.indexOf(t.p) > -1 && (t.status === 'in_progress' || t.status === 'review'); }).sort(function (a, b) { return b.updated - a.updated; });
    var body;
    if (V.wsub === 'working') body = '<section class="c-panel"><h2>What the team is working on</h2>' + working.map(function (t) {
      return '<div class="c-row"><span class="grow"><button class="c-link" type="button" data-a="open" data-id="' + t.key + '">' + t.key + ' · ' + esc(t.title) + '</button><br><span class="c-muted">' + proj(t.p).name + ' · ' + (mine(t) ? 'You' : nm(t.holder)) + '</span></span><span class="c-badge">' + (t.status === 'review' ? 'In review' : 'In progress') + '</span>' + (t.pr && t.pr.state === 'open' ? '<span class="c-badge' + (t.pr.mergeable === 'conflicting' ? ' bad' : '') + '">' + (t.pr.mergeable === 'conflicting' ? 'PR has conflicts' : 'PR can merge') + '</span>' : '') + '<span class="c-small">' + clock(t.updated) + '</span></div>';
    }).join('') + '</section>';
    else if (V.wsub === 'projects') body = '<section class="c-panel"><h2>Projects</h2>' + visible().map(function (p) {
      var c = function (s) { return S.tickets.filter(function (t) { return t.p === p.id && t.status === s; }).length; };
      return '<div class="c-row"><span class="grow"><b style="font-weight:500">' + p.name + '</b><br><span class="c-muted">' + c('available') + ' available · ' + c('in_progress') + ' in progress · ' + c('review') + ' in review</span></span><span class="c-badge">' + roleOf(S.me, p.id) + '</span></div>';
    }).join('') + '</section>';
    else body = '<section class="c-panel"><h2>Members</h2>' + MEMBERS.map(function (m) { return '<div class="c-row">' + av(m.id) + '<span class="grow">' + m.name + (m.id === S.me ? ' <span class="c-muted">(you)</span>' : '') + '</span><span class="c-badge">' + m.ws + '</span></div>'; }).join('') + '</section>';
    return tilesHTML() + subnav(V, 'wsub', [['working', 'Working now', working.length], ['projects', 'Projects', visible().length], ['members', 'Members', MEMBERS.length]]) + body;
  }
  function myWorkHTML() {
    var my = S.tickets.filter(function (t) { return mine(t) && (t.status === 'in_progress' || t.status === 'review'); });
    var need = [];
    my.forEach(function (t) {
      if (t.note) need.push(['warning', 'changes requested', t, t.note]);
      if (t.pr && t.pr.state === 'open' && t.pr.mergeable === 'conflicting') need.push(['problem', 'conflict', t, 'PR #' + t.pr.n + ' has merge conflicts. Rebase in your own checkout, then report it.']);
      if (t.behind) need.push(['warning', 'behind', t, t.branch + ' is ' + t.behind + ' commits behind main.']);
    });
    return '<section class="c-panel"><h2>Needs your attention</h2>' + (need.length ? need.map(function (n) { return '<div class="c-row c-attn ' + n[0] + '"><span class="c-badge ' + (n[0] === 'problem' ? 'bad' : 'warn') + '">' + n[1] + '</span><span class="grow"><button class="c-link" type="button" data-a="open" data-id="' + n[2].key + '">' + n[2].key + '</button> ' + esc(n[3]) + '</span></div>'; }).join('') : '<p class="c-muted">Nothing. Your tickets are moving.</p>') + '</section>' +
      '<section class="c-panel"><h2>Your tickets</h2>' + (my.length ? my.map(function (t) { return '<div class="c-row"><span class="grow"><button class="c-link" type="button" data-a="open" data-id="' + t.key + '">' + t.key + ' · ' + esc(t.title) + '</button><br><span class="c-muted">' + proj(t.p).name + ' · ' + stLabel(t.status) + ' · <code style="font-size:11.5px">' + t.branch + '</code></span></span>' + prChip(t) + '<button class="c-btn small" type="button" data-a="open-handoff" data-id="' + t.key + '">Open in my runner</button></div>'; }).join('') : '<p class="c-muted">You hold no tickets. Claim one from Available.</p>') + '</section>';
  }
  function reviewsHTML() {
    var mineToReview = toReview(), others = S.tickets.filter(function (t) { return t.status === 'review' && roleOf(S.me, t.p) && mineToReview.indexOf(t) < 0; });
    function item(t, canAct) {
      return '<div class="c-card c-item"><span class="c-key">' + t.key + ' · ' + proj(t.p).name + '</span><button class="title" type="button" data-a="open" data-id="' + t.key + '">' + esc(t.title) + '</button><span class="owner">' + av(t.holder) + (mine(t) ? 'You' : nm(t.holder)) + ' · <code style="font-size:11px">' + t.branch + '</code></span><span class="flags">' + prChip(t) + '<span class="c-chip">' + t.commits.length + ' commit' + (t.commits.length === 1 ? '' : 's') + '</span></span>' +
        (canAct ? '<div class="c-actions" style="margin:4px 0 0">' + (t.pr && t.pr.state === 'open' ? '<button class="c-btn small" type="button" data-a="op" data-op="merged" data-id="' + t.key + '">Record merge</button>' : '') + '<button class="c-btn small primary" type="button" data-a="op" data-op="complete" data-id="' + t.key + '">Mark done</button><button class="c-btn small" type="button" data-a="op" data-op="changes" data-id="' + t.key + '">Request changes</button></div>' : '') + '</div>';
    }
    return '<p class="c-muted" style="margin:0 0 14px">Team does not reproduce code review: the diff lives on your Git host. Record what happened there, then sign off here.</p><section class="c-panel"><h2>Waiting for you</h2>' + (mineToReview.length ? mineToReview.map(function (t) { return item(t, true); }).join('') : '<p class="c-muted">Nothing is waiting for you.</p>') + '</section>' +
      (others.length ? '<section class="c-panel"><h2>Everyone else’s</h2>' + others.map(function (t) { return item(t, false); }).join('') + '</section>' : '');
  }
  function repositoryHTML(V) {
    var p = proj(V.proj), at = attention(p.id), prs = S.tickets.filter(function (t) { return t.p === p.id && t.pr; }), br = S.tickets.filter(function (t) { return t.p === p.id && t.branch; });
    var body;
    if (V.rsub === 'attention') body = '<section class="c-panel"><h2>Needs attention</h2>' + (at.length ? at.map(function (a) { return '<div class="c-row' + (a.sev !== 'info' ? ' c-attn ' + a.sev : '') + '"><span class="c-badge' + (a.sev === 'problem' ? ' bad' : a.sev === 'warning' ? ' warn' : '') + '">' + a.badge + '</span><span class="grow">' + esc(a.text) + '</span></div>'; }).join('') : '<p class="c-muted">Nothing needs attention.</p>') + '</section>';
    else if (V.rsub === 'prs') body = '<section class="c-panel"><h2>Pull requests</h2><table class="c-table"><thead><tr><th>PR</th><th>Ticket</th><th>State</th><th>Mergeable</th></tr></thead><tbody>' + prs.map(function (t) { return '<tr><td>#' + t.pr.n + '</td><td>' + t.key + ' · ' + esc(t.title) + '</td><td>' + t.pr.state + '</td><td>' + (t.pr.state === 'merged' ? '–' : t.pr.mergeable) + '</td></tr>'; }).join('') + '</tbody></table></section>';
    else body = '<section class="c-panel"><h2>Branches</h2><table class="c-table"><thead><tr><th>Branch</th><th>Ticket</th><th>Holder</th><th>Behind</th></tr></thead><tbody>' + br.map(function (t) { return '<tr><td><code style="font-size:11.5px">' + t.branch + '</code></td><td>' + t.key + '</td><td>' + nm(t.holder) + '</td><td>' + (t.behind || 0) + '</td></tr>'; }).join('') + '</tbody></table></section>';
    return projectBar(V, false) + '<p class="c-muted" style="margin:0 0 14px">What members’ own Werkbords have reported about the repository (' + p.repo + '). Team cannot see the repository itself, and never merges or resolves conflicts: that stays in each developer’s checkout and on your Git host.</p>' +
      subnav(V, 'rsub', [['attention', 'Needs attention', at.length], ['prs', 'Pull requests', prs.length], ['branches', 'Branches', br.length]]) + body;
  }
  function activityHTML(V) {
    var p = proj(V.proj);
    return projectBar(V, false) + '<section class="c-panel"><h2>Activity</h2>' + S.log.filter(function (e) { return e.proj === p.id; }).map(function (e) { return '<div class="c-row"><span class="c-small" style="font-family:var(--mono);color:var(--muted)">' + clock(e.t) + '</span><span class="grow">' + (e.who === S.me ? 'You' : nm(e.who)) + ' ' + e.what + ' ' + e.key + '</span></div>'; }).join('') + '</section>';
  }
  function projectsHTML() {
    return '<section class="c-panel"><h2>Projects</h2>' + S.projects.map(function (p) {
      var r = roleOf(S.me, p.id);
      return '<div class="c-row"><span class="grow"><b style="font-weight:500">' + p.name + '</b> <span class="c-muted">' + p.repo.replace('https://', '') + '</span><br><span class="c-muted">' + Object.keys(p.members).map(function (m) { return nm(m) + ' (' + p.members[m] + ')'; }).join(', ') + '</span></span>' + (r ? '<span class="c-badge">' + r + '</span>' : '<span class="c-badge">not a member</span>') + '</div>';
    }).join('') + '</section>' + (member(S.me).ws === 'owner' ? '<section class="c-panel"><h2>New project</h2><p class="c-muted">A name and the repository address. Each member brings their own clone of it.</p><div class="c-actions"><button class="c-btn primary" type="button" data-a="note" data-v="New projects are not part of this demo.">Create project</button></div></section>' : '');
  }

  /* ---------- render ---------- */
  var roots = [];
  function render() {
    roots.forEach(function (R) {
      var V = R.V, root = R.el, phone = R.phone;
      if (R.drag) { R.dirty = true; return; }
      var app = root.querySelector('.c-app');
      if (app) V.scroll[V.tab] = app.scrollTop;
      if (!roleOf(S.me, V.proj)) V.proj = visible()[0].id;
      if (V.sel && (!getT(V.sel) || !roleOf(S.me, getT(V.sel).p))) V.sel = null;
      var me = member(S.me), vis = visible().map(function (p) { return p.id; });
      var avail = S.tickets.filter(function (t) { return vis.indexOf(t.p) > -1 && t.status === 'available'; }).length;
      var yours = S.tickets.filter(function (t) { return mine(t) && (t.status === 'in_progress' || t.status === 'review'); }).length;
      var rev = toReview().length, probs = 0;
      vis.forEach(function (p) { probs += attention(p).filter(function (a) { return a.sev === 'problem'; }).length; });
      var tabs = [['workspace', 'Workspace', ''], ['projects', 'Projects', ''], ['board', 'Board', avail ? '<span class="c-count quiet">' + avail + '</span>' : ''], ['mywork', 'My Work', yours ? '<span class="c-count">' + yours + '</span>' : ''], ['reviews', 'Reviews', rev ? '<span class="c-count">' + rev + '</span>' : ''], ['repository', 'Repository', probs ? '<span class="c-count bad">' + probs + '</span>' : ''], ['activity', 'Activity', '']];
      var body = ({ workspace: workspaceHTML, projects: projectsHTML, board: boardHTML, mywork: myWorkHTML, reviews: reviewsHTML, repository: repositoryHTML, activity: activityHTML })[V.tab](V, phone);
      root.querySelector('[data-app]').innerHTML = '<div class="c-app"><div class="c-wrap' + (V.tab === 'board' && !phone ? ' wide' : '') + '">' +
        '<header class="c-top"><span class="c-brand"><img class="mark-l" src="assets/img/mark-light.svg" alt="" width="30" height="22"><img class="mark-d" src="assets/img/mark-dark.svg" alt="" width="30" height="22"><span class="c-wm">werkbord</span></span><span class="c-prod">Team</span>' +
        '<span class="c-ws"><h1>Acme</h1><span class="c-lab">Workspace</span></span><span class="c-who">' + av(S.me) + '<span class="name">' + me.name + '</span><span class="c-chip">' + me.ws + '</span><button class="c-link" type="button" data-a="note" data-v="Signing out forgets the token in this browser only.">Sign out</button></span></header>' +
        '<p class="c-note">Team coordinates the work. It does not run anything: every member uses their own computer, their own Werkbord runner and their own Git, GitHub and agent credentials.</p>' +
        '<nav class="c-nav" aria-label="Workspace sections">' + tabs.map(function (t) { return '<button type="button" data-a="tab" data-id="' + t[0] + '"' + (V.tab === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + t[2] + '</button>'; }).join('') + '</nav>' +
        body + '</div></div>' + (V.sel && V.tab === 'board' ? ticketHTML(V, phone) : '');
      var a2 = root.querySelector('.c-app'); if (a2 && V.scroll[V.tab]) a2.scrollTop = V.scroll[V.tab];
    });
    S.tickets.forEach(function (t) { t.fresh = false; });
  }

  var toastTimer;
  function toast(m, err) {
    roots.forEach(function (R) { var el = R.el.querySelector('.c-toast'); if (!el) return; el.textContent = m; el.classList.toggle('err', !!err); el.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { roots.forEach(function (R) { var el = R.el.querySelector('.c-toast'); if (el) el.classList.remove('show'); }); }, err ? 5200 : 3400);
  }

  /* ---------- events ---------- */
  function bind(R) {
    var V = R.V, root = R.el;
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (!b) { var card = e.target.closest('[data-card]'); if (card) { V.sel = card.dataset.card; V.handoff = false; render(); } return; }
      var a = b.dataset.a, id = b.dataset.id;
      if (b.tagName === 'A') e.preventDefault();
      if (a === 'proj') return;
      switch (a) {
        case 'tab': V.tab = id; V.sel = null; render(); break;
        case 'sub': V[b.dataset.k] = id; render(); break;
        case 'sel': V.sel = id; V.handoff = false; render(); break;
        case 'open': var t = getT(id); V.tab = 'board'; V.proj = t.p; V.sel = id; V.handoff = false; V.col = t.status; render(); break;
        case 'open-handoff': var t2 = getT(id); V.tab = 'board'; V.proj = t2.p; V.sel = id; V.handoff = true; V.col = t2.status; render(); break;
        case 'close': V.sel = null; V.handoff = false; render(); break;
        case 'op': act(b.dataset.op, id); break;
        case 'handoff': V.handoff = !V.handoff; render(); break;
        case 'assign':
          var at = getT(id), sel = b.parentElement.querySelector('[data-k="assignee"]'), to = sel && sel.value;
          if (!at || !to) break;
          if (!can(at.p, 'assign')) { toast('Only a project owner can assign.', true); break; }
          if (at.holder === to) { toast(nm(to) + ' already holds ' + at.key + '.'); break; }
          at.holder = to; if (at.status === 'available') at.status = 'in_progress'; at.branch = at.branch || 'wb-' + at.n + '-' + slug(at.title); at.claimedAt = S.clock; log('reassigned', at);
          toast(at.key + ' is now ' + nm(to) + '’s.'); render(); break;
        case 'col': V.col = id; render(); break;
        case 'note': toast(b.dataset.v.replace(/&amp;/g, '&')); break;
        case 'newticket':
          if (!can(V.proj, 'create')) { toast('You are not on this project.', true); break; }
          var nt = tk(S.nextN++, V.proj, ['Add Apple Pay at checkout', 'Show delivery dates in the cart', 'Remember the last shipping address'][S.nextN % 3], 'backlog', null, { by: S.me, desc: 'Written in the demo. In the console you give it a title, a description and the requirements.' });
          S.tickets.push(nt); log('created', nt); V.col = 'backlog'; toast(nt.key + ' is in Backlog. Make it available when someone can pick it up.'); render(); break;
      }
    });
    root.addEventListener('change', function (e) { if (e.target.dataset.a === 'proj') { V.proj = e.target.value; V.sel = null; render(); } });
    if (R.phone) return;
    root.addEventListener('dragstart', function (e) { var c = e.target.closest('[data-card]'); if (!c) return; R.drag = c.dataset.card; try { e.dataTransfer.setData('text/plain', R.drag); } catch (x) {} });
    root.addEventListener('dragend', function () { R.drag = null; root.querySelectorAll('.c-col.over').forEach(function (n) { n.classList.remove('over'); }); if (R.dirty) { R.dirty = false; render(); } });
    root.addEventListener('dragover', function (e) { var col = e.target.closest('.c-col'); if (!col || !R.drag) return; e.preventDefault(); root.querySelectorAll('.c-col.over').forEach(function (n) { n.classList.remove('over'); }); col.classList.add('over'); });
    root.addEventListener('drop', function (e) {
      var col = e.target.closest('.c-col'); if (!col || !R.drag) return; e.preventDefault();
      var t = getT(R.drag), to = col.dataset.col; R.drag = null; R.dirty = false;
      if (!t || t.status === to) { render(); return; }
      var op = t.status === 'available' && to === 'in_progress' ? 'claim' : t.status === 'in_progress' && to === 'review' ? 'submit' : t.status === 'review' && to === 'done' ? 'complete' : (t.status === 'backlog' && to === 'available') || (t.status === 'available' && to === 'backlog') ? 'promote' : t.status === 'in_progress' && to === 'available' ? 'release' : null;
      if (op) act(op, t.key); else { toast('A drop does what a button would. ' + stLabel(t.status) + ' → ' + stLabel(to) + ' is not a step a ticket takes.', true); render(); }
    });
  }
  function mount(el, phone) {
    var V = phone ? P : D;
    var chrome = phone ? '<div class="c-status-bar" aria-hidden="true"><span>9:41</span><span style="font-size:13px">•••</span></div><div class="c-island" aria-hidden="true"></div><div class="c-home" aria-hidden="true"></div>' : '';
    el.innerHTML = phone ? '<div class="iphone"><div class="stage"><div class="tcx tcx-phone"><div data-app></div><div class="c-toast" role="status" aria-live="polite"></div>' + chrome + '</div></div></div>' :
      '<div class="mac"><div class="mac-bar"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span class="mac-title">Werkbord Team · Acme</span><span></span></div><div class="stage" style="--h:800px"><div class="tcx tcx-desk"><div data-app style="position:absolute;inset:0"></div><div class="c-toast" role="status" aria-live="polite"></div></div></div></div>';
    var R = { el: el.querySelector('.tcx'), V: V, phone: phone };
    roots.push(R); bind(R);
  }
  function fit() {
    [[deskMount, 1280], [phoneMount, 390]].forEach(function (m) {
      if (!m[0]) return;
      var st = m[0].querySelector('.stage'); if (st) st.style.setProperty('--s', st.clientWidth / m[1]);
    });
  }
  if (deskMount) mount(deskMount, false);
  if (phoneMount) mount(phoneMount, true);
  fit(); render();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(document.body); else window.addEventListener('resize', fit);

  window.WBTeam = {
    as: function (id) { S.me = id; render(); document.querySelectorAll('[data-as]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.as === id)); }); },
    show: function (tab, key, handoff) {
      [D, P].forEach(function (V) {
        V.tab = tab; V.sel = key || null; V.handoff = !!handoff;
        if (key) { var t = getT(key); V.proj = t.p; V.col = t.status; }
        if (tab === 'repository') V.rsub = 'attention';
      });
      render();
    },
    state: S
  };
})();
