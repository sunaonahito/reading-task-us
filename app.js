/*
 * Screen flow for the reading activity.
 * Nothing is sent anywhere and nothing is stored: answers exist only on this
 * page and disappear when it is closed or reloaded.
 */
(function () {
  'use strict';

  var screens = Array.prototype.slice.call(document.querySelectorAll('.screen'));
  var progress = document.getElementById('progress');
  var current = 0;
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

  function show(index) {
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
