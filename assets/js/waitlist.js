/* Werkbord Team waitlist. Talks to a Supabase project through three database functions:
   join_waitlist, waitlist_status and waitlist_counter. The table itself is not readable from the browser.
   The key below is a publishable key: it is meant to be public. No dependencies. */
(function () {
  'use strict';

  var CFG = {
    url: 'https://fxvkwocmcswlgwlswhgl.supabase.co',
    key: 'sb_publishable_Iaq8aJjVUTPxdQ0VP19IFQ_vvMQ6Muz'
  };
  var K_CODE = 'wb-wl-code', K_REF = 'wb-wl-ref';
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var FOUNDING = 50, MAX_COLLEAGUES = 5;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* a visit through someone's invite link remembers who sent it, on every page */
  var m = /[?&]ref=([0-9a-f]{8})(?:&|$)/i.exec(location.search);
  if (m) set(K_REF, m[1].toLowerCase());

  function rpc(name, body) {
    return fetch(CFG.url + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.key },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (j) { return { ok: r.ok, body: j }; });
    });
  }

  function inviteLink(code) {
    var base = location.origin + location.pathname.replace(/[^\/]*$/, '');
    return base + '?ref=' + code;
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacy(text, done); });
    } else legacy(text, done);
  }
  function legacy(text, done) {
    var t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(t);
  }

  var uid = 0;
  function build(root) {
    var n = ++uid, seats = '';
    for (var i = 0; i < FOUNDING; i++) seats += '<i></i>';
    root.innerHTML =
      '<div class="wl-copy">' +
        '<p class="lab">Werkbord Team &middot; waitlist</p>' +
        '<h2>Get Werkbord Team before it goes on sale.</h2>' +
        '<p class="lede">Team is a shared workspace for people who already use Werkbord. Join the waitlist for early access and a launch price.</p>' +
        '<dl class="wl-terms">' +
          '<div><dt>First 50</dt><dd><b>Free.</b> <span>Up to 5 seats each. We will ask how it goes.</span></dd></div>' +
          '<div><dt>Places 51 to 1,000</dt><dd><b>$15 per seat</b> <span>on your first 5 seats, half the list price.</span></dd></div>' +
          '<div><dt>After that</dt><dd><b>$30 per seat, one time.</b> <span>Cheaper per seat from 6 seats.</span></dd></div>' +
        '</dl>' +
        '<div><div class="wl-seats" role="img" aria-label="Founding seats claimed" data-seats>' + seats + '</div>' +
        '<p class="wl-seats-cap" data-seats-cap>50 free Founding seats</p></div>' +
      '</div>' +
      '<div class="wl-right" data-right></div>';
    var right = root.querySelector('[data-right]');
    showForm(right, n, root);
    refreshCounter(root);

    var code = get(K_CODE);
    if (code) {
      rpc('waitlist_status', { p_referral_code: code }).then(function (r) {
        if (r.ok && r.body && r.body.referral_code) showDone(right, r.body, root);
        else del(K_CODE);
      }).catch(function () {});
    }
  }

  function refreshCounter(root, data) {
    var apply = function (d) {
      var claimed = Math.max(0, Math.min(FOUNDING, d.founding_claimed || 0));
      var cells = root.querySelectorAll('[data-seats] i');
      for (var i = 0; i < cells.length; i++) cells[i].className = i < claimed ? 'on' : '';
      root.querySelector('[data-seats]').setAttribute('aria-label', claimed + ' of ' + FOUNDING + ' Founding seats claimed');
      root.querySelector('[data-seats-cap]').textContent = claimed >= FOUNDING
        ? 'All 50 Founding places are taken. Places 51 and up get half price.'
        : claimed + ' of ' + FOUNDING + ' Founding places taken';
    };
    if (data) return apply(data);
    rpc('waitlist_counter').then(function (r) { if (r.ok && r.body) apply(r.body); }).catch(function () {});
  }

  function showForm(right, n, root) {
    right.innerHTML =
      '<form class="wl-form" novalidate>' +
        '<div class="wl-f"><label for="wl-email-' + n + '">Email</label>' +
          '<input class="wl-in" id="wl-email-' + n + '" name="email" type="email" autocomplete="email" required placeholder="you@company.com"></div>' +
        '<div class="wl-two">' +
          '<div class="wl-f"><label for="wl-agent-' + n + '">Main agent</label>' +
            '<select class="wl-in" id="wl-agent-' + n + '" name="agent"><option value="">Choose</option><option>Claude Code</option><option>Codex</option><option>Both</option><option>Other</option></select></div>' +
          '<div class="wl-f"><label for="wl-size-' + n + '">Team size</label>' +
            '<select class="wl-in" id="wl-size-' + n + '" name="team_size"><option value="">Choose</option><option>Just me</option><option>2 to 5</option><option>6 to 15</option><option>16 to 50</option><option>More than 50</option></select></div>' +
        '</div>' +
        '<details class="wl-more"><summary>Claim free seats for your team</summary><div class="body">' +
          '<p class="hint">If you land in the first 50, every colleague you list gets a free seat (up to 5). One email per line.</p>' +
          '<textarea class="wl-in" name="colleagues" rows="4" aria-label="Colleague emails, one per line" placeholder="ada@company.com&#10;bo@company.com"></textarea>' +
          '<label class="wl-check"><input type="checkbox" name="consent"><span>I am happy for Werkbord to email these people about Werkbord Team. Each email says who suggested them and has an unsubscribe link.</span></label>' +
        '</div></details>' +
        '<div class="wl-hp" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
        '<p class="wl-err" role="alert" aria-live="polite"></p>' +
        '<button class="btn pri wl-go" type="submit">Join the waitlist</button>' +
        '<p class="wl-fine">We store your email and answers to run this waitlist and write to you about Werkbord Team only. Unsubscribe any time. This form is the only thing on this site that collects anything; the Werkbord app itself sends nothing to us.</p>' +
      '</form>';

    var f = right.querySelector('form'), err = right.querySelector('.wl-err'), go = right.querySelector('.wl-go');
    var email = f.elements.email, more = f.querySelector('.wl-more');

    function fail(msg, field) {
      err.textContent = msg;
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    }
    email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      email.removeAttribute('aria-invalid'); f.elements.colleagues.removeAttribute('aria-invalid');
      if (f.elements.website.value) return;           // a bot filled the hidden field

      var addr = (email.value || '').trim().toLowerCase();
      if (!EMAIL.test(addr) || addr.length > 254) return fail('Enter a valid email address.', email);

      var raw = (f.elements.colleagues.value || '').split(/[\s,;]+/).filter(Boolean), list = [], bad = [];
      raw.forEach(function (x) {
        x = x.toLowerCase();
        if (!EMAIL.test(x)) bad.push(x);
        else if (x !== addr && list.indexOf(x) < 0) list.push(x);
      });
      if (bad.length) { more.open = true; return fail('These do not look like email addresses: ' + bad.slice(0, 3).join(', ') + '.', f.elements.colleagues); }
      if (list.length > MAX_COLLEAGUES) { more.open = true; return fail('Up to ' + MAX_COLLEAGUES + ' colleague emails, please.', f.elements.colleagues); }
      if (list.length && !f.elements.consent.checked) { more.open = true; return fail('Tick the box to confirm you are happy for us to email your colleagues.', f.elements.consent); }

      go.disabled = true; go.textContent = 'Joining';
      rpc('join_waitlist', {
        p_email: addr,
        p_agent: f.elements.agent.value || null,
        p_team_size: f.elements.team_size.value || null,
        p_referral_code: get(K_REF),
        p_colleagues: list,
        p_colleague_consent: !!f.elements.consent.checked
      }).then(function (r) {
        if (r.ok && r.body && r.body.referral_code) {
          set(K_CODE, r.body.referral_code);
          showDone(right, r.body, root);
          refreshCounter(root, r.body);
          return;
        }
        var msg = String((r.body && r.body.message) || '');
        if (msg.indexOf('invalid_email') > -1) fail('That email address does not look valid.', email);
        else if (msg.indexOf('consent_required') > -1) fail('Tick the box to confirm you are happy for us to email your colleagues.');
        else fail('Something went wrong. Please try again in a moment.');
        go.disabled = false; go.textContent = 'Join the waitlist';
      }).catch(function () {
        fail('Could not reach the waitlist. Check your connection and try again.');
        go.disabled = false; go.textContent = 'Join the waitlist';
      });
    });
  }

  function showDone(right, d, root) {
    var pos = d.position, link = inviteLink(d.referral_code), inside = pos <= FOUNDING;
    right.innerHTML =
      '<div class="wl-done" aria-live="polite">' +
        '<p class="lab">You are on the list</p>' +
        '<p class="wl-pos"><span data-pos></span><small data-of></small></p>' +
        '<p class="wl-status" data-status></p>' +
        '<div class="wl-ref"><label>Your invite link</label>' +
          '<div class="curl"><code><span class="ps">&rarr;</span><span data-link></span></code>' +
          '<button class="btn pri" type="button" data-copy-link><span class="idle">Copy</span><span class="done">Copied</span></button></div>' +
          '<p class="hint" data-refs></p></div>' +
        '<p class="wl-fine">We will email you when Werkbord Team opens. Not you? Clear this browser\'s site data and join again with the right address.</p>' +
      '</div>';
    right.querySelector('[data-pos]').textContent = '#' + pos;
    right.querySelector('[data-of]').textContent = 'of ' + d.total;
    right.querySelector('[data-status]').textContent = inside
      ? 'You are currently inside the Founding 50. The order can change as others refer friends, and places are confirmed when the beta opens.'
      : 'The Founding 50 ends at place 50, so you are ' + (pos - FOUNDING) + ' places away. Each person who joins through your link moves you up 5 places.';
    right.querySelector('[data-link]').textContent = link;
    right.querySelector('[data-refs]').textContent = (d.referrals || 0) === 0
      ? 'Nobody has joined through your link yet. Each person who does moves you up 5 places.'
      : d.referrals + (d.referrals === 1 ? ' person has' : ' people have') + ' joined through your link.';
    var btn = right.querySelector('[data-copy-link]');
    btn.addEventListener('click', function () {
      copyText(link, function () {
        btn.classList.add('copied');
        setTimeout(function () { btn.classList.remove('copied'); }, 1800);
      });
    });
  }

  document.querySelectorAll('[data-waitlist]').forEach(build);
})();
