function polyfill(_ref) {
  var fills = _ref.fills,
      _ref$options = _ref.options,
      options = _ref$options === void 0 ? '' : _ref$options,
      _ref$minify = _ref.minify,
      minify = _ref$minify === void 0 ? true : _ref$minify,
      _ref$rum = _ref.rum,
      rum = _ref$rum === void 0 ? true : _ref$rum,
      agent = _ref.agent,
      agentFallback = _ref.agentFallback,
      afterFill = _ref.afterFill;

  if (!fills) {
    throw new Error('No fills specified.');
  }

  var fillAnyway = options.indexOf('always') >= 0 || agent; // check if 'always' flag or agent is set

  var neededPolyfills = fillAnyway ? fills : checkSupport(fills);

  if (neededPolyfills.length > 0) {
    return loadScript({
      neededPolyfills: neededPolyfills,
      minify: minify,
      fills: fills,
      options: options,
      rum: rum,
      agent: agent,
      agentFallback: agentFallback,
      afterFill: afterFill
    });
  }

  return afterFill();
}

function checkSupport(fills) {
  var unsupportedFills = [];

  for (var i = 0; i < fills.length; i++) {
    var fill = fills[i];
    var parts = fill.split('.'); // i.e. ['Array', 'prototype', 'includes']

    var type = parts[0];
    var prototype = parts[1] === 'prototype';
    var method = parts[2];
    var isSupported = false; // check for special test cases, otherwise use regular reduce function against window

    switch (type) {
      case 'Intl':
        isSupported = window[type];
        break;

      case 'Element':
        isSupported = 'Element' in window;

        if (prototype && isSupported) {
          isSupported = method in Element.prototype;
        }

        break;

      default:
        isSupported = parts.reduce(function (key, value) {
          return key[value];
        }, window);
    }

    if (!isSupported) {
      unsupportedFills.push(fill);
    }
  }

  return unsupportedFills;
}

function loadScript(args) {
  var min = args.minify ? '.min' : '';
  var features = args.fills ? "features=".concat(args.neededPolyfills.join(',')) : '';
  var flags = args.options ? "&flags=".concat(args.options.join(',')) : '';
  var monitor = args.rum ? '\&rum=1' : ''; // not set to rum=0 since it loads RUM scripts anyway

  var agent = args.agent ? "&ua=".concat(args.agent) : '';
  var fallback = args.agentFallback ? "&unknown=".concat(args.agentFallback) : '';
  var js = document.createElement('script');
  js.src = "https://cdn.polyfill.io/v2/polyfill".concat(min, ".js?").concat(features + flags + monitor + agent + fallback);
  js.async = true;
  document.body.appendChild(js);

  js.onload = function () {
    return args.afterFill();
  };

  js.onerror = function () {
    throw new Error('Error loading polyfills. Open a ticket: https://github.com/PascalAOMS/dynamic-polyfill/issues');
  };
}

module.exports = polyfill;