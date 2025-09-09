import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import API from "./api";

const firebaseConfig = {
  apiKey: "AIzaSyCGi304ILinBr_R63XGOfBq6TB-maEySso",
  authDomain: "todo-pushnotification-8984d.firebaseapp.com",
  projectId: "todo-pushnotification-8984d",
  storageBucket: "todo-pushnotification-8984d.firebasestorage.app",
  messagingSenderId: "83999621538",
  appId: "1:83999621538:web:557ce8efed731a6ea5b2fb",
  measurementId: "G-4WHNBCTTKT"
};

const app = initializeApp(firebaseConfig);

export const getMessagingInstance = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      return getMessaging(app);
    } catch (e) {
      console.warn("Firebase Messaging not supported:", e);
      return null;
    }
  }
  return null;
};

export const generateToken = async () => {
  if (typeof window === "undefined") return null; 

  const permission = await Notification.requestPermission();
  console.log("Notification permission:", permission);

  if (permission === "granted") {
    try {
      const messaging = getMessagingInstance();
      if (!messaging) return null;

      const fcmToken = await getToken(messaging, {
        vapidKey: "BFDySt7pTOUXwzbnuboIGc2AWIH0py5tZzRy_ee_CcuC4kYrw9DtJMMdTXQ7H92Bf0OdAdOSJLisC0ZCFYOc6wE",
      });

      if (fcmToken) {
        console.log("FCM Token:", fcmToken);
        localStorage.setItem("fcmToken", fcmToken);

        const token = localStorage.getItem("token");
        if (token) {
          await API.post(
            "/auth/save-fcm-token",
            { fcmToken },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        return fcmToken;
      }
    } catch (err) {
      console.error("Error getting FCM token:", err);
    }
  }
  return null;
};
