"use strict";

window.eval(`(function() {
  Object.defineProperty(window, "isTestFeatureSupported", {
    get: function() {
      return true;
    },

    set: function() {}
  });
}());`);
