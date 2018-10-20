# bridged-webview
A bridged WebView implementation for React-Native

# Usage example
Within React-Native:

import DeviceInfo from "react-native-device-info";

WebViewBridge.addSyncFunction("getDeviceId", DeviceInfo.getUniqueID);

const customAsyncFunction = (arg1, arg2, callback) => {
  callback(null, "success");
});

WebViewBridge.addAsyncFunction("myFunctionName", asyncFunction);

Within the WebView:

ReactNativeBridge.call('myFunctionName', arg1, arg2, function(err, res) { console.log(err, res) });