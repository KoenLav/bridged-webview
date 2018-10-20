export default function() {
  console.log("Injected ReactNativeBridge");

  // Find the native side of the bridge and store it in _ReactNativeBridge
  if (typeof _ReactNativeBridge === "undefined") {
    if (typeof __REACT_WEB_VIEW_BRIDGE === "undefined") {
      if (
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.ReactNative
      ) {
        _ReactNativeBridge = window.webkit.messageHandlers.ReactNative;
      } else {
        console.warn("ReactNativeBridge not found!");
      }
    } else {
      _ReactNativeBridge = __REACT_WEB_VIEW_BRIDGE;
    }
  }

  // Usage: ReactNativeBridge.call('myFunctionName', arg1, arg2, function(err, res) { console.log(err, res) });
  ReactNativeBridge = {
    counter: 0,
    callbacks: {},

    // Allows calling a native function with any number of arguments,
    // optionally accepts a callback function OR an options object,
    // which may contain: callback function, keepCallback bool, throwError bool
    call(functionName /* .. [arguments] .. (callback|options) */) {
      const args = Array.prototype.slice.call(arguments, 1);

      // Set defaults for the options
      let options = {
        keepCallback: false,
        throwError: false
      };

      // If more than one arguments were passed, check whether
      // we received a callback function or options object
      if (args.length > 1) {
        const lastArgument = args[args.length - 1];

        if (typeof lastArgument === "function") {
          options.callback = args.pop();
        } else if (typeof lastArgument === "object") {
          options = args.pop();
          callback = options.callback;
        }
      }

      // TODO: consider implementing a different type of ID generation
      const id = this.counter;

      // Store the callback under the counter
      if (callback) {
        this.callbacks[id] = options;
      }

      // Create string (we cannot pass objects to native easily)
      const message = JSON.stringify({
        id,
        functionName,
        args
      });

      // Send a message to the native side of things
      _ReactNativeBridge.postMessage(message);

      // Increment the counter
      this.counter++;
    },

    // Will receive the response from the WebView and pass it to the respective callback
    response(message) {
      const { id, err, res } = message,
        { callback, keepCallback, throwError } = this.callbacks[id] || {};

      // Delete the callback, if we didn't request keeping it around
      if (!keepCallback) {
        delete this.callbacks[id];
      }

      // If we want to throw errors
      if (throwError) {
        // And received an error, then throw it
        if (err) {
          throw new Error(err);
        }
        // Otherwise callback with just the result
        else {
          return typeof callback === "function" ? callback(res) : false;
        }
        // Otherwise callback with error and response regardless
      } else {
        return typeof callback === "function" ? callback(err, res) : false;
      }
    }
  };
}
