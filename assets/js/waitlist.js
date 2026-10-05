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

  function copyText(text, done, fail) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacy(text, done, fail); });
    } else legacy(text, done, fail);
  }
  function legacy(text, done, fail) {
    var t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { if (document.execCommand('copy')) done(); else fail(); } catch (e) { fail(); }
    document.body.removeChild(t);
  }

  var uid = 0;
  function build(root) {
    var n = ++uid, seats = '';
    for (var i = 0; i < FOUNDING; i++) seats += '<i></i>';
    root.innerHTML =
      '<div class="wl-copy">' +
        '<h2>Be one of the<br>first <span class="wl-fifty">50.</span></h2>' +
        '<p class="lede">Get early access to Werkbord Team. The Founding 50 get in free.</p>' +
        '<div class="wl-capacity"><div class="wl-seats" aria-hidden="true" data-seats>' + seats + '</div>' +
        '<p class="wl-seats-cap" data-seats-cap>50 founding places</p></div>' +
      '</div>' +
      '<div class="wl-right" data-right></div>';
    var right = root.querySelector('[data-right]');
    showForm(right, n, root);
    refreshCounter(root);

    var code = get(K_CODE);
    if (code) {
      rpc('waitlist_status', { p_referral_code: code }).then(function (r) {
        if (r.ok && r.body && r.body.referral_code) {
          var form = right.querySelector('form');
          if (form && !form.elements.email.value && !form.querySelector('.wl-go').disabled) showDone(right, r.body, root);
        } else if (r.ok) del(K_CODE);
      }).catch(function () {});
    }
  }

  function refreshCounter(root, data) {
    var apply = function (d) {
      var claimed = Math.max(0, Math.min(FOUNDING, d.founding_claimed || 0));
      var cells = root.querySelectorAll('[data-seats] i');
      for (var i = 0; i < cells.length; i++) cells[i].className = i < claimed ? 'on' : '';
      root.querySelector('[data-seats]').classList.add('loaded');
      root.querySelector('[data-seats-cap]').textContent = claimed >= FOUNDING
        ? 'The Founding 50 are full. Early access is still open.'
        : (FOUNDING - claimed) + ' of 50 founding places open';
    };
    if (data) return apply(data);
    rpc('waitlist_counter').then(function (r) { if (r.ok && r.body) apply(r.body); }).catch(function () {});
  }

  function showForm(right, n, root) {
    right.innerHTML =
      '<form class="wl-form" novalidate>' +
        '<div class="wl-f"><label for="wl-email-' + n + '">Email</label>' +
          '<input class="wl-in" id="wl-email-' + n + '" name="email" type="email" autocomplete="email" required aria-describedby="wl-error-' + n + '" placeholder="you@company.com"></div>' +
        '<details class="wl-more"><summary>Add team details <span>(optional)</span></summary><div class="body">' +
        '<div class="wl-two">' +
          '<div class="wl-f"><label for="wl-agent-' + n + '">Main agent</label>' +
            '<select class="wl-in" id="wl-agent-' + n + '" name="agent"><option value="">Choose</option><option>Claude Code</option><option>Codex</option><option>Both</option><option>Other</option></select></div>' +
          '<div class="wl-f"><label for="wl-size-' + n + '">Team size</label>' +
            '<select class="wl-in" id="wl-size-' + n + '" name="team_size"><option value="">Choose</option><option>Just me</option><option>2 to 5</option><option>6 to 15</option><option>16 to 50</option><option>More than 50</option></select></div>' +
        '</div>' +
          '<p class="hint">Bring up to 5 teammates. Add one email per line.</p>' +
          '<textarea class="wl-in" name="colleagues" rows="4" aria-label="Colleague emails, one per line" placeholder="ada@company.com&#10;bo@company.com"></textarea>' +
          '<label class="wl-check"><input type="checkbox" name="consent"><span>I have permission for Werkbord to email these teammates about early access.</span></label>' +
        '</div></details>' +
        '<div class="wl-hp" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
        '<p class="wl-err" id="wl-error-' + n + '" role="alert"></p>' +
        '<button class="btn pri wl-go" type="submit">Join the waitlist</button>' +
        '<p class="wl-fine">Your details are used for Team early access only. Unsubscribe any time.</p>' +
      '</form>';

    var f = right.querySelector('form'), err = right.querySelector('.wl-err'), go = right.querySelector('.wl-go');
    var email = f.elements.email, more = f.querySelector('.wl-more');

    function fail(msg, field) {
      err.textContent = msg;
      if (field && field.closest('details')) more.open = true;
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    }
    email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      f.querySelectorAll('[aria-invalid]').forEach(function (field) { field.removeAttribute('aria-invalid'); });
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

      if (go.disabled) return;
      go.disabled = true; go.textContent = 'Joining…';
      f.setAttribute('aria-busy', 'true');
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
          right.querySelector('.wl-done').focus();
          refreshCounter(root, r.body);
          return;
        }
        var msg = String((r.body && r.body.message) || '');
        if (msg.indexOf('invalid_email') > -1) fail('That email address does not look valid.', email);
        else if (msg.indexOf('consent_required') > -1) fail('Tick the box to confirm you are happy for us to email your colleagues.');
        else fail('Something went wrong. Please try again in a moment.');
        go.disabled = false; go.textContent = 'Join the waitlist'; f.removeAttribute('aria-busy');
      }).catch(function () {
        fail('Could not reach the waitlist. Check your connection and try again.');
        go.disabled = false; go.textContent = 'Join the waitlist'; f.removeAttribute('aria-busy');
      });
    });
  }

  function showDone(right, d, root) {
    var pos = d.position, link = inviteLink(d.referral_code), inside = pos <= FOUNDING;
    right.innerHTML =
      '<div class="wl-done" tabindex="-1" aria-label="You are on the waitlist">' +
        '<div class="wl-confirm"><h3>You’re on the list.</h3><span class="wl-rank" data-pos></span></div>' +
        '<p class="wl-status" data-status></p>' +
        '<div class="wl-ref">' +
          '<div class="wl-ref-art" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
          '<h3>Bring your team.</h3>' +
          '<p>Every teammate who joins moves you up the list.</p>' +
          '<label class="sr" for="wl-ref-link">Your referral link</label>' +
          '<input class="wl-ref-url" id="wl-ref-link" readonly data-link>' +
          '<div class="wl-ref-actions"><button class="btn pri" type="button" data-copy-link>Copy invite link</button>' +
          '<span class="hint" data-refs></span></div>' +
          '<p class="sr" role="status" data-copy-status></p>' +
        '</div>' +
        '<p class="wl-fine">We’ll email you when Team is ready. <button class="wl-reset" type="button">Use another email</button></p>' +
      '</div>';
    right.querySelector('[data-pos]').textContent = '#' + pos;
    right.querySelector('[data-status]').textContent = inside
      ? 'You’re in the Founding 50 for now. Places are confirmed at launch.'
      : 'You’re in line for early access. Bring a teammate to move closer to the Founding 50.';
    var input = right.querySelector('[data-link]');
    input.value = link;
    input.addEventListener('click', function () { input.select(); });
    right.querySelector('[data-refs]').textContent = d.referrals
      ? d.referrals + (d.referrals === 1 ? ' teammate joined' : ' teammates joined')
      : 'Your team starts here';
    var btn = right.querySelector('[data-copy-link]'), status = right.querySelector('[data-copy-status]');
    btn.addEventListener('click', function () {
      copyText(link, function () {
        btn.textContent = 'Link copied';
        status.textContent = 'Invite link copied to clipboard.';
        setTimeout(function () { btn.textContent = 'Copy invite link'; status.textContent = ''; }, 1800);
      }, function () {
        input.focus(); input.select();
        status.textContent = 'Select and copy your invite link above.';
      });
    });
    right.querySelector('.wl-reset').addEventListener('click', function () {
      del(K_CODE);
      showForm(right, ++uid, root);
      right.querySelector('[name="email"]').focus();
    });
  }

  document.querySelectorAll('[data-waitlist]').forEach(build);
})();
