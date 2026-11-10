/*
 * Screen flow for the reading activity.
 * Nothing is sent anywhere and nothing is stored: answers exist only on this
 * page and disappear when it is closed or reloaded.
 */
(function () {
  'use strict';

  // Seconds a participant must stay on each story part before "Continue" works.
  // Set to 0 to turn the delay off (e.g. while testing).
  var MIN_READ_SECONDS = 30;

  var screens = Array.prototype.slice.call(document.querySelectorAll('.screen'));
  var progress = document.getElementById('progress');
  var current = 0;
  var timerId = null;
  var leaveGuardOn = false;

  function leaveGuard(event) {
    event.preventDefault();
    event.returnValue = '';
  }

  function setLeaveGuard(on) {
    if (on && !leaveGuardOn) {
      window.addEventListener('beforeunload', leaveGuard);
      leaveGuardOn = true;
    } else if (!on && leaveGuardOn) {
      window.removeEventListener('beforeunload', leaveGuard);
      leaveGuardOn = false;
    }
  }

  function clearTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function startReadTimer(screen) {
    var button = screen.querySelector('[data-continue]');
    var note = screen.querySelector('.timer');
    if (!button || !note) {
      return;
    }
    if (MIN_READ_SECONDS <= 0) {
      button.disabled = false;
      note.hidden = true;
      return;
    }
    var remaining = MIN_READ_SECONDS;
    button.disabled = true;
    note.hidden = false;
    note.textContent = 'You can continue in ' + remaining + ' seconds.';
    timerId = window.setInterval(function () {
      remaining -= 1;
      if (remaining > 0) {
        note.textContent = 'You can continue in ' + remaining + ' seconds.';
        return;
      }
      clearTimer();
      button.disabled = false;
      note.textContent = 'You can continue now.';
    }, 1000);
  }

  function show(index) {
    clearTimer();
    current = index;
    screens.forEach(function (screen, i) {
      screen.hidden = i !== index;
    });
    var screen = screens[index];
    var part = screen.getAttribute('data-part');
    var total = screen.getAttribute('data-total');
    if (part) {
      progress.textContent = 'Part ' + part + ' of ' + total;
      progress.hidden = false;
    } else {
      progress.hidden = true;
    }
    window.scrollTo(0, 0);
    var heading = screen.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
    if (screen.hasAttribute('data-timed')) {
      startReadTimer(screen);
    }
  }

  function next() {
    if (current < screens.length - 1) {
      show(current + 1);
    }
  }

  function firstEmptyRequired(screen) {
    var fields = screen.querySelectorAll('[data-required]');
    var firstEmpty = null;
    Array.prototype.forEach.call(fields, function (field) {
      var empty = field.value.trim() === '';
      field.setAttribute('aria-invalid', empty ? 'true' : 'false');
      if (empty && firstEmpty === null) {
        firstEmpty = field;
      }
    });
    return firstEmpty;
  }

  function onContinue(event) {
    var screen = event.currentTarget.closest('.screen');
    var error = screen.querySelector('.error');
    var firstEmpty = firstEmptyRequired(screen);
    if (firstEmpty) {
      error.textContent = 'Please answer every question before finishing.';
      error.hidden = false;
      firstEmpty.focus();
      return;
    }
    if (error) {
      error.hidden = true;
    }
    if (current === screens.length - 2) {
      setLeaveGuard(false);
    }
    next();
  }

  document.getElementById('begin').addEventListener('click', function () {
    setLeaveGuard(true);
    next();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-continue]'), function (button) {
    button.addEventListener('click', onContinue);
  });

  show(0);
})();
