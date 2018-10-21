# bridged-webview
A bridged WebView implementation for React-Native

# Usage example
Within React-Native:

```
import React, { Component } from "react";
import DeviceInfo from "react-native-device-info";
import { BridgedWebView, WebViewBridge } from "bridged-webview";

WebViewBridge.addSyncFunction("getDeviceId", DeviceInfo.getUniqueID);

const customAsyncFunction = (arg1, arg2, callback) => {
  callback(null, "success");
});

WebViewBridge.addAsyncFunction("myFunctionName", customAsyncFunction);

export default class App extends Component {
  render() {
    return <BridgedWebView source={{ uri: "http://192.168.2.227" }} />;
  }
}
```

Within the WebView:

```
ReactNativeBridge.call('myFunctionName', arg1, arg2, function(err, res) { console.log(err, res) });
```
