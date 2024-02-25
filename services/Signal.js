import { OneSignal, LogLevel } from "react-native-onesignal";
import Constants from "expo-constants";

OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);
  
const Close = () => {
  OneSignal.Notifications.removeEventListener("click")
}

const Register = (callback) => {
  OneSignal.Notifications.requestPermission(true);
  OneSignal.Notifications.addEventListener("click", (event) => {
    const data = event.notification.additionalData;
    callback(data);
  })
};

if (__DEV__) OneSignal.User.addTag("tester", "yes");

export default { Register, Close };
