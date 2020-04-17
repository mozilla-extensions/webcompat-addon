"use strict";

/**
 * Bug 1629926 - mail.google.com - set allow mic on hangouts iframe
 *
 * mail.google.com has a chain of iframes for hangouts "Make a call" interface,
 * with a parent iframe not having allow=microphone attribute. It's resulting
 * in calls not working since feature policy requires allow lists all the way
 * up to the top document.
 *
 * Adding allow=microphone to the iframe in question makes the calls work
 */

console.info(
  "hangouts iframe allow property was changed for compatibility reasons. See https://bugzilla.mozilla.org/show_bug.cgi?id=1503694 for details."
);

const NOTIFICATIONS_LIMIT = 150;

const createObserver = callback => {
  return new MutationObserver(callback).observe(document, {
    childList: true,
    subtree: true,
  });
};

const setAllow = element => {
  element.allow = "microphone *; autoplay *; microphone";
};

const poll = (getElementFn, onFound, limit) => {
  const element = getElementFn();
  if (element) {
    onFound(element);
    return;
  }

  let n = 0;
  createObserver((records, observer) => {
    const _element = getElementFn();
    if (_element) {
      onFound(_element);
      observer.disconnect();
      return;
    }

    if (n > limit) {
      observer.disconnect();
    }

    n++;
  });
};

poll(
  () => document.getElementById("gth-talk-plugin-frame-id"),
  setAllow,
  NOTIFICATIONS_LIMIT
);
