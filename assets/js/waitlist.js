/* Werkbord beta waitlist. Talks to a Supabase project through three database functions:
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
  var PLACES = 50;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* a visit through an invite link remembers who sent it, and the signup sends that along */
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

  var uid = 0;
  function build(root) {
    var n = ++uid, seats = '';
    for (var i = 0; i < PLACES; i++) seats += '<i></i>';
    root.innerHTML =
      '<div class="wl-copy">' +
        '<p class="wl-lede">The first 50 to sign up get beta access to individual and team plans.</p>' +
        '<div class="wl-capacity"><div class="wl-seats" aria-hidden="true" data-seats>' + seats + '</div>' +
        '<p class="wl-seats-cap" data-seats-cap aria-live="polite">50 places</p></div>' +
      '</div>' +
      '<div class="wl-right" data-right></div>';
    var right = root.querySelector('[data-right]');
    showForm(right, n);
    refreshCounter(root);

    var code = get(K_CODE);
    if (code) {
      rpc('waitlist_status', { p_referral_code: code }).then(function (r) {
        if (r.ok && r.body && r.body.referral_code) {
          var form = right.querySelector('form');
          if (form && !form.elements.email.value && !form.querySelector('.wl-go').disabled) showDone(right, r.body);
        } else if (r.ok) del(K_CODE);
      }).catch(function () {});
    }
  }

  function refreshCounter(root, data) {
    var apply = function (d) {
      var claimed = Math.max(0, Math.min(PLACES, d.founding_claimed || 0));
      var cells = root.querySelectorAll('[data-seats] i');
      for (var i = 0; i < cells.length; i++) cells[i].className = i < claimed ? 'on' : '';
      root.querySelector('[data-seats]').classList.add('loaded');
      root.querySelector('[data-seats-cap]').textContent = claimed >= PLACES
        ? 'All 50 places are taken. You can still join the waitlist.'
        : claimed + ' of 50 places taken';
    };
    if (data) return apply(data);
    rpc('waitlist_counter').then(function (r) { if (r.ok && r.body) apply(r.body); }).catch(function () {});
  }

  function showForm(right, n) {
    right.innerHTML =
      '<form class="wl-form" novalidate>' +
        '<div class="wl-f"><label for="wl-email-' + n + '">Email</label>' +
          '<div class="wl-row">' +
            '<input class="wl-in" id="wl-email-' + n + '" name="email" type="email" autocomplete="email" required aria-describedby="wl-error-' + n + '" placeholder="you@company.com">' +
            '<button class="btn pri wl-go" type="submit">Join the waitlist</button>' +
          '</div>' +
        '</div>' +
        '<div class="wl-pick">' +
          '<label class="wl-q" for="wl-size-' + n + '">Team size (optional)</label>' +
          '<select class="wl-sel" id="wl-size-' + n + '" name="team_size">' +
            '<option value="">Choose</option>' +
            '<option value="2">2</option>' +
            '<option value="3">3</option>' +
            '<option value="4">4</option>' +
            '<option value="5">5</option>' +
            '<option value="6+">6+</option>' +
          '</select>' +
        '</div>' +
        '<div class="wl-hp" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
        '<p class="wl-err" id="wl-error-' + n + '" role="alert"></p>' +
      '</form>';

    var f = right.querySelector('form'), err = right.querySelector('.wl-err'), go = right.querySelector('.wl-go');
    var email = f.elements.email, size = f.elements.team_size;

    function fail(msg, el) {
      err.textContent = msg;
      if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
    }
    email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      email.removeAttribute('aria-invalid');
      if (f.elements.website.value) return;           // a bot filled the hidden field

      var addr = (email.value || '').trim().toLowerCase();
      if (!EMAIL.test(addr) || addr.length > 254) return fail('Enter a valid email address.', email);

      /* the team size is optional: a blank answer is stored as null */
      var teamSize = size.value ? 'team of ' + size.value : null;

      if (go.disabled) return;
      go.disabled = true; go.textContent = 'Joining…';
      f.setAttribute('aria-busy', 'true');
      rpc('join_waitlist', {
        p_email: addr,
        p_agent: null,
        p_team_size: teamSize,
        p_referral_code: get(K_REF),
        p_colleagues: [],
        p_colleague_consent: false
      }).then(function (r) {
        if (r.ok && r.body && r.body.referral_code) {
          set(K_CODE, r.body.referral_code);
          showDone(right, r.body);
          right.querySelector('.wl-done').focus();
          refreshCounter(right.closest('[data-waitlist]'), r.body);
          return;
        }
        var msg = String((r.body && r.body.message) || '');
        if (msg.indexOf('invalid_email') > -1) fail('That email address does not look valid.', email);
        else fail('Something went wrong. Please try again in a moment.');
        go.disabled = false; go.textContent = 'Join the waitlist'; f.removeAttribute('aria-busy');
      }).catch(function () {
        fail('Could not reach the waitlist. Check your connection and try again.');
        go.disabled = false; go.textContent = 'Join the waitlist'; f.removeAttribute('aria-busy');
      });
    });
  }

  function showDone(right, d) {
    var pos = d.position, inside = pos <= PLACES;
    right.innerHTML =
      '<div class="wl-done" tabindex="-1">' +
        '<p class="wl-rank" data-pos></p>' +
        '<h2 class="wl-title">You’re on the list.</h2>' +
        '<p class="wl-status">' + (inside
          ? 'You’re one of the first 50, so you get beta access.'
          : 'The first 50 get beta access. You’re in line after them.') + '</p>' +
        '<button class="wl-reset" type="button">Use another email</button>' +
      '</div>';
    right.querySelector('[data-pos]').textContent = 'Position #' + pos;
    right.querySelector('.wl-reset').addEventListener('click', function () {
      del(K_CODE);
      showForm(right, ++uid);
      right.querySelector('[name="email"]').focus();
    });
  }

  document.querySelectorAll('[data-waitlist]').forEach(build);
})();
