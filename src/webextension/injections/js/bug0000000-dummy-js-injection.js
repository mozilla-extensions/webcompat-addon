"use strict";

// eslint-disable-next-line no-eval
window.eval(`(function() {
  Object.defineProperty(window, "isTestFeatureSupported", {
    get: function() {
      return true;
    },

    set: function() {}
  });
}());`);
