// @ts-check
(function () {
  'use strict';

  var eventAttributeBlockList = [];
  try {
    eventAttributeBlockList = JSON.parse('[]');
  } catch (e) {
    eventAttributeBlockList = [];
  }

  var context = {
    boot: '0',
    name: 'commandbar',
    orgName: 'Netlify',
    position: 'end',
    scripts: 'https://cdn.commandbar.com/prod/commandbar/d96233229d86ee175ed2875c3e3c0fdbf1ffc7cb/split/index.js?cb-snippet=1&org_uuid=af6750c6',
    // @ts-ignore
    silent: 'false' === 'true',
    stylesheets: 'https://cdn.commandbar.com/prod/commandbar/d96233229d86ee175ed2875c3e3c0fdbf1ffc7cb/split/index.css?cb-snippet=1&org_uuid=af6750c6',
    initProxy: 'false',
    aux: '0',
    eventAttributeBlockList: eventAttributeBlockList,

    orgUuid: 'af6750c6',
  };
  var e;

  function loadScript(target, async, src) {
    e = document.createElement('script');
    e.async = !!async;
    e.src = src;
    if (src.includes('localhost')) e.crossOrigin = 'anonymous';
    e.type = 'module';
    e.setAttribute('data-' + context.name, '1');
    target.appendChild(e);
  }

  function loadCss(target, href) {
    e = document.createElement('link');
    e.rel = 'stylesheet';
    e.type = 'text/css';
    e.href = href;
    if (!!'') e.nonce = '';
    e.setAttribute('data-' + context.name, '1');
    target.appendChild(e);
  }

  function initProxy() {
    var _configuration = Symbol.for('CommandBar::configuration');
    var _disposed = Symbol.for('CommandBar::disposed');
    var _isProxy = Symbol.for('CommandBar::isProxy');
    var _queue = Symbol.for('CommandBar::queue');
    var _eventSubscriptions = Symbol.for('CommandBar::eventSubscriptions');
    var _unwrap = Symbol.for('CommandBar::unwrap');
    var asyncMethods = ['addCommand', 'boot', 'addEventSubscriber', 'addEventHandler', 'addRecordAction', 'setFormFactor'];

    function noop(val) {
      return function () {
        return val;
      };
    }

    let queue = [];
    if (window.CommandBar && Array.isArray(window.CommandBar.q)) {
      // @ts-ignore
      queue = window.CommandBar.q;
    }

    var defaults = {};
    defaults[_disposed] = false;
    defaults[_isProxy] = true;
    defaults[_queue] = queue;
    defaults[_eventSubscriptions] = undefined;
    defaults.shareCallbacks = noop({});
    defaults.shareContext = noop({});

    var overrides = {};
    overrides[_configuration] = {
      uuid: context.orgUuid,
    };
    overrides[_unwrap] = function () {
      return proxy;
    };

    // @ts-ignore
    var proxy = Object.assign(defaults, window.CommandBar, overrides);
    // @ts-ignore
    window.CommandBar =
      typeof Proxy === 'undefined'
        ? proxy
        : new Proxy(proxy, {
            get: function (_, prop) {
              if (prop in proxy) return proxy[prop];
              if (prop === 'then') return undefined;

              // @ts-ignore
              if (asyncMethods.indexOf(prop) !== -1) {
                return function () {
                  var a = Array.prototype.slice.call(arguments);
                  return new Promise(function (resolve, reject) {
                    a.unshift(prop, resolve, reject);
                    proxy[_queue].push(a);
                  });
                };
              }

              return function () {
                const a = Array.prototype.slice.call(arguments);
                a.unshift(prop);
                proxy[_queue].push(a);
              };
            },
          });
  }

  function addWrapper() {
    var wrapper = document.getElementById(context.name);
    if (wrapper === null) {
      wrapper = document.createElement('div');
      wrapper.id = context.name + '-wrapper';
    } else {
      const debug = localStorage.getItem('commandbar.debug');
      !!debug && console.log('Skipped loading ' + context.name + '-wrapper.');
      return undefined;
    }

    const mountElement = document.getElementById('commandbar-mount') || document.body;
    if (context.position === 'end') {
      mountElement.appendChild(wrapper);
    } else {
      mountElement.insertBefore(wrapper, document.body.firstChild);
    }

    var root = document.createElement('div');
    root.setAttribute('data-' + context.name, '1');
    root.id = context.name;
    wrapper.appendChild(root);

    return wrapper;
  }

  function bootstrap() {
    if (document.readyState !== 'complete') {
      window.addEventListener('load', bootstrap, {
        capture: false,
        once: true,
      });
      return;
    }
    delete window['__CommandBarBootstrap__'];

    if (context.initProxy === 'true') initProxy();

    // @ts-ignore
    var cb = window.CommandBar;
    if (cb && context.aux !== '1') {
      cb[Symbol.for('CommandBar::orgConfig')] = {
        orgName: context.orgName || undefined,
        silent: context.silent,
        eventAttributeBlockList: context.eventAttributeBlockList,
      };

      var _configuration = Symbol.for('CommandBar::configuration');

      if (cb[_configuration]) {
        cb[_configuration].silent = context.silent;
        cb[_configuration].eventAttributeBlockList = context.eventAttributeBlockList;
      }
    }

    var wrapper = addWrapper();
    if (wrapper === undefined) return;

    var retries = 0;
    var retry = function (e) {
      if (retries > 5) {
        document.removeEventListener("securitypolicyviolation", retry);
        return;
      }
      retries++;

      if (e.disposition !== 'enforce') return;

      var prefix = "https://cdn.commandbar.com/";
      if (!e.blockedURI.startsWith(prefix)) return;
      var path = e.blockedURI.slice(prefix.length);
      var newURL = "https://frames-commandbar-prod.commandbar.com/" + path;
      if (e.violatedDirective.startsWith("script-src")) {
        loadScript(wrapper, true, newURL)
      } else if (e.violatedDirective.startsWith("style-src")) {
        loadCss(wrapper, newURL);
      }
    }

    try {
      document.addEventListener("securitypolicyviolation", retry);
    } catch(err) {
      // In case the browser doesn't support the securitypolicyviolation event, ignore the error (ie. Salesforce LWC)
    }

    if (context.scripts !== '') context.scripts.split('|').forEach(loadScript.bind(null, wrapper, true));
    if (context.stylesheets !== '') context.stylesheets.split('|').forEach(loadCss.bind(null, wrapper));

    if (cb && context.boot !== '0') {
      cb.boot(context.boot);
    }
  }

  bootstrap();
})();
