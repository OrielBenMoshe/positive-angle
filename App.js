import { useEffect, useState, useCallback, useRef } from "react";
import {
  AppRegistry,
  StyleSheet,
  View,
  StatusBar,
  Platform,
  SafeAreaView,
  Image,
  BackHandler,
  Share,
  Linking,
} from "react-native";
import WebView from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import Signal from "./services/Signal";

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);
const Website = "https://positive-angle.com/";

export default function App() {
  const [webViewSource, setWebViewSource] = useState(Website);
  const [showWebView, setShowWebview] = useState(true);
  const webviewRef = useRef(null);

  // Inject JavaScript for share functionality
  const injectShareScript = () => {
    const script = `
    (function() {
      function addShareButtonListener() {
        document.querySelectorAll('.share-button').forEach(button => {
          // Ensure we don't attach the event more than once
          if (!button.hasAttribute('data-share-listener')) {
            button.setAttribute('data-share-listener', 'true');
            button.addEventListener('click', function(e) {
              e.preventDefault();
              const urlToShare = window.location.href; // Or any specific URL you want to share
              window.ReactNativeWebView.postMessage(urlToShare);
            });
          }
        });
      }

      // Initial application of the listener
      addShareButtonListener();

      // Use MutationObserver to monitor the DOM for changes and apply the listener to new buttons
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            // Re-apply listener whenever new nodes are added to the DOM
            addShareButtonListener();
          }
        });
      });

      // Configuration of the observer:
      const config = { childList: true, subtree: true };

      // Pass in the target node, as well as the observer options
      observer.observe(document.body, config);
    })();
    true; // Ensures the injected script executes
  `;
    webviewRef.current.injectJavaScript(script);
  };

  // Handle WebView messages
  const onMessage = (event) => {
    const url = event.nativeEvent.data;
    Share.share({ message: `Check this out: ${url}`, url });
  };

  // WebView redirection logic
  const redirect = useCallback((data) => {
    if (data.targetUrl) {
      setShowWebview(false);
      setTimeout(() => {
        setWebViewSource(data.targetUrl);
        setShowWebview(true);
      }, 500);
    }
  }, []);

  // Handling back button press
  useEffect(() => {
    const backAction = () => {
      if (webviewRef.current) {
        webviewRef.current.goBack();
        return true; // Prevent default behavior (exiting the app)
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    Signal.Register(redirect);
    return () => {
      Signal.Close();
      backHandler.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <MyStatusBar backgroundColor="#1D9B94" barStyle="light-content" />
      {showWebView && (
        <WebView
          ref={webviewRef}
          source={{ uri: webViewSource }}
          automaticallyAdjustContentInsets={true}
          startInLoadingState={true}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={onMessage}
          onLoad={injectShareScript}
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
      
          setSupportMultipleWindows={false}
          style={{ width: "100%", height: "100%" }}
          // renderLoading={() => (
          //   <View style={styles.bg}>
          //     <Image style={styles.gif} source={require("./assets/splash.gif")} />
          //   </View>
          // )}
          onShouldStartLoadWithRequest={({ url }) => {
            if (url.startsWith(Website)) return true;
            WebBrowser.openBrowserAsync(url);
            return false;
          }}
          onFileDownload={({ nativeEvent: { downloadUrl } }) => {
            // This will open the file in a default browser
            if (downloadUrl) Linking.openURL(downloadUrl);
          }}
        />
      )}
    </View>
  );
}

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === "ios" ? 44 : 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  appBar: {
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
  },
  bg: {
    height: "100%",
    width: "100vw",
    backgroundColor: "#202b36",
    margin: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  gif: {
    margin: "auto",
  },
});

AppRegistry.registerComponent("App", () => DarkTheme);
