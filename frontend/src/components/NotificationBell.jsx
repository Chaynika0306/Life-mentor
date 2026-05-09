import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket;

const NotificationBell = ({ token, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Connect socket & register user ──────────────────────────────────────
  useEffect(() => {
    if (!userId || !token) return;

    socket = io(BACKEND_URL, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("register", userId);
    });

    // Listen for new notifications in real-time
    socket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token]);

  // ── Fetch existing notifications on mount ───────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.message);
    }
  };

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Mark all as read when dropdown opens ────────────────────────────────
  const handleOpen = async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0) {
      try {
        await axios.put(
          `${BACKEND_URL}/api/notifications/mark-all-read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Mark all read error:", err.message);
      }
    }
  };

  // ── Clear all notifications ──────────────────────────────────────────────
  const handleClearAll = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Clear all error:", err.message);
    }
  };

  // ── Format time ─────────────────────────────────────────────────────────
  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* ── Bell Button ── */}
      <button
        onClick={handleOpen}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "6px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        title="Notifications"
      >
        {/* Bell SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2c6e5a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "#e53e3e",
              color: "#fff",
              borderRadius: "50%",
              fontSize: "10px",
              fontWeight: "bold",
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: "340px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            zIndex: 1000,
            overflow: "hidden",
            border: "1px solid #e8f5f1",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              borderBottom: "1px solid #e8f5f1",
              background: "#f5faf8",
            }}
          >
            <span style={{ fontWeight: "700", color: "#2c6e5a", fontSize: "15px" }}>
              🔔 Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6aab99",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "#aaa",
                  fontSize: "14px",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔕</div>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    background: n.isRead ? "#fff" : "#f0faf6",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    transition: "background 0.2s",
                  }}
                >
                  {/* Icon by type */}
                  <span style={{ fontSize: "20px", marginTop: "2px" }}>
                    {n.type === "booking" && "📅"}
                    {n.type === "confirmation" && "✅"}
                    {n.type === "reminder" && "⏰"}
                    {n.type === "cancellation" && "❌"}
                    {n.type === "general" && "🔔"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: n.isRead ? "500" : "700",
                        fontSize: "13px",
                        color: "#2c3e50",
                        marginBottom: "3px",
                      }}
                    >
                      {n.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.4" }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#6aab99",
                        marginTop: "6px",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;