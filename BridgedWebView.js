import React, { Component } from "react";
import { WebView } from "react-native-webview";
import ReactNativeBridge from "./ReactNativeBridge";
import WebViewBridge from "./WebViewBridge";

export default class BridgedWebView extends Component {
  constructor(props) {
    super(props);

    const { ref } = props;

    this.WebView = ref || React.createRef();
  }

  injectReactNativeBridge = () => {
    // Inject the ReactNativeBridge into the WebView
    this.WebView.current.injectJavaScript(
      "(" + ReactNativeBridge.toString() + "())"
    );
  };

  // Handles incoming messages from the WebView and calls a function
  // which should have been defined using one of the addFunction methods
  handle = message => {
    try {
      const { id, functionName, args } = JSON.parse(message);

      // Retrieve the function from the functions object
      const func = WebViewBridge.functions[functionName];

      // Call the function and pass the result to the callback
      func(args, (err, res) => {
        this.respond({
          id,
          err,
          res
        });
      });
    } catch (err) {
      console.log(err);

      this.respond({
        err
      });
    }
  };

  respond = message => {
    // After processing the requested function, WebViewBridge responds to the WebView
    this.WebView.current.injectJavaScript(`
        ReactNativeBridge.response(${JSON.stringify(message)});
      `);
  };

  render() {
    const { ref, onMessage, onLoad, ...props } = this.props;

    return (
      <WebView
        ref={this.WebView}
        // When ReactNativeBrige calls a function we handle it here
        // ReactNativeBridge.call => _ReactNativeBridge.postMessage => onMessage => WebViewBridge.handle
        onLoad={event => {
          this.injectReactNativeBridge();

          if (onLoad) {
            onLoad(event);
          }
        }}
        onMessage={event => {
          this.handle(event.nativeEvent.data);

          if (onMessage) {
            onMessage(event);
          }
        }}
        {...props}
      />
    );
  }
}
