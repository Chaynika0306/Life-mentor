import { useEffect } from "react";
import { getToken } from "./auth";

const BACKEND = "https://life-mentor-backend.onrender.com";

// Convert VAPID base64 key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function usePushNotification() {
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const setup = async () => {
      try {
        // Register service worker
        const reg = await navigator.serviceWorker.register("/sw.js");
        console.log("✅ Service Worker registered");

        // Ask for notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        // Get VAPID public key from backend
        const res = await fetch(`${BACKEND}/api/vapid-public-key`);
        const { publicKey } = await res.json();

        // Subscribe to push
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // Send subscription to backend
        await fetch(`${BACKEND}/api/notifications/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subscription }),
        });

        console.log("✅ Push notification subscription saved");
      } catch (err) {
        console.error("Push setup error:", err);
      }
    };

    setup();
  }, [token]);
}
