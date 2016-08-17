/* global Components */

const { classes: Cc, interfaces: Ci } = Components;
const DefaultUA = Cc["@mozilla.org/network/protocol;1?name=http"]
  .getService(Ci.nsIHttpProtocolHandler).userAgent;
const ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

const NS_HTTP_ON_USERAGENT_REQUEST_TOPIC = "http-on-useragent-request";

class UAOverrider {
  init() {
    ObserverService.addObserver(this, NS_HTTP_ON_USERAGENT_REQUEST_TOPIC, false);
  }

  uninit() {
    ObserverService.removeObserver(this, NS_HTTP_ON_USERAGENT_REQUEST_TOPIC);
  }

  observe(subject, topic) {
    if (topic != NS_HTTP_ON_USERAGENT_REQUEST_TOPIC) {
      return;
    }

    let channel = subject.QueryInterface(Ci.nsIHttpChannel),
      uaOverride = this.getUAForURI(channel.URI);

    if (uaOverride) {
      channel.setRequestHeader("User-Agent", uaOverride, false);
    }
  }

  getUAForURI() {
    return "GoFaster Test - " + DefaultUA;
  }
}

const overrider = new UAOverrider();

function install() {} // eslint-disable-line no-unused-vars
function uninstall() {} // eslint-disable-line no-unused-vars

function startup() { // eslint-disable-line no-unused-vars
  overrider.init();
}

function shutdown() { // eslint-disable-line no-unused-vars
  overrider.uninit();
}
