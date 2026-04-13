// src/pages/Moderator.js
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Moderator.css"; // custom styles
import { useNavigate } from "react-router-dom";
const API_BASE = process.env.REACT_APP_API_BASE;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

function Moderator() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingLinks, setMeetingLinks] = useState({});
  const [notes, setNotes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
  });

  // ✅ Fetch bookings and filter by moderator name
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/bookings`);
        const data = await res.json();

        // Filter by moderator's full name
        const moderatorBookings = data.filter(
          (booking) => booking.expertName === user.fullName
        );

        setBookings(moderatorBookings);
        setFilteredBookings(moderatorBookings);

        // Calculate stats
        const pendingCount = moderatorBookings.filter(
          (b) => b.status.toLowerCase() === "pending"
        ).length;
        const confirmedCount = moderatorBookings.filter(
          (b) => b.status.toLowerCase() === "confirmed"
        ).length;
        const rejectedCount = moderatorBookings.filter(
          (b) => b.status.toLowerCase() === "rejected"
        ).length;

        setStats({
          total: moderatorBookings.length,
          pending: pendingCount,
          confirmed: confirmedCount,
          rejected: rejectedCount,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      }
    };

    if (user?.fullName) {
      fetchBookings();
    }
  }, [user]);

  // ✅ Filter bookings based on status and search term
  useEffect(() => {
    let result = bookings;

    // Filter by active tab
    if (activeTab !== "all") {
      result = result.filter((booking) => {
        const status = booking.status.toLowerCase();
        if (activeTab === "pending") return status === "pending";
        if (activeTab === "confirmed") return status === "confirmed";
        if (activeTab === "rejected") return status === "rejected";
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.fullName.toLowerCase().includes(term) ||
          booking.email.toLowerCase().includes(term) ||
          booking.timingFrom.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(result);
  }, [bookings, activeTab, searchTerm]);

  // ✅ Update booking status
  const handleUpdate = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          meetingLink: meetingLinks[id] || "",
          notes: notes[id] || "",
        }),
      });
      const data = await res.json();

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? data.booking : b))
      );

      // Show success notification
      showNotification(`Booking ${status.toLowerCase()} successfully!`, "success");
    } catch (err) {
      console.error("Update error:", err);
      showNotification("Error updating booking. Please try again.", "error");
    }
  };

  // ✅ Copy meeting link to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification("Meeting link copied to clipboard!", "success");
  };

  // ✅ Show notification
  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">&times;</button>
    `;

    const container = document.getElementById("notification-container");
    if (!container) {
      const newContainer = document.createElement("div");
      newContainer.id = "notification-container";
      document.body.appendChild(newContainer);
      newContainer.appendChild(notification);
    } else {
      container.appendChild(notification);
    }

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  };

  // ✅ Format date for display
  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user || user.role !== "moderator")
    return (
      <div className="access-denied">
        <div className="lock-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>This page is for moderators only.</p>
      </div>
    );

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );




  const generateVideoLink = (booking) => {
    try {
      // 🔐 Unique room per booking
      const roomID = `meeting-${booking._id}`;

      // 🌐 Frontend base URL
      const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

      // ✅ Final meeting URL
      const videoLink = `${FRONTEND_URL}/videocall?room=${encodeURIComponent(roomID)}`;

      // 📋 Copy to clipboard
      navigator.clipboard.writeText(videoLink);

      // 💬 Alert user
      alert("Video call link copied:\n\n" + videoLink);
    } catch (err) {
      console.error("VIDEO LINK ERROR:", err);
      alert("Failed to generate video call link");
    }
  };





  return (
    <div className="moderator-dashboard">
      {/* Header Section */}
      <button
        className="back-btn"
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </button>
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Moderator Dashboard</h1>
          <p>Manage your expert sessions and meetings</p>
        </div>
        <div className="user-info">
          <div className="avatar">{user.fullName.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <span className="user-name">{user.fullName}</span>
            <span className="user-role">Moderator</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-container">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="tabs">
          <button
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
          >
            All ({stats.total})
          </button>
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={activeTab === "confirmed" ? "active" : ""}
            onClick={() => setActiveTab("confirmed")}
          >
            Confirmed ({stats.confirmed})
          </button>
          <button
            className={activeTab === "rejected" ? "active" : ""}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bookings-container">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No bookings found</h3>
            <p>There are no bookings matching your criteria</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => {
              const status = booking.status.toLowerCase();
              const isConfirmed = status === "confirmed";
              const isRejected = status === "rejected";
              const isPending = status === "pending";

              return (
                <div key={booking._id} className="booking-card">
                  <div className="card-header">
                    <div className="client-info">
                      <div className="client-avatar">
                        {booking.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="client-details">
                        <h4>{booking.fullName}</h4>
                        <p>{booking.email}</p>
                      </div>
                    </div>
                    <span
                      className={`status-badge ${status}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="card-content">
                    <div className="booking-detail">
                      <span className="detail-label">Expert:</span>
                      <span className="detail-value">{booking.expertName}</span>
                    </div>
                    <div className="booking-detail">
                      <span className="detail-label">Scheduled Time:</span>
                      <span className="detail-value">
                        {booking.meetingDate ? formatDate(booking.meetingDate) : "No date"}
                      </span>

                      <span className="detail-value">
                        {booking.timingFrom} - {booking.timingTo}
                      </span>

                    </div>

                    {/* Meeting Link */}
                    <div className="input-group">
                      <label>Meeting Link</label>
                      <div className="input-with-action">
                        <input
                          type="text"
                          value={meetingLinks[booking._id] || ""}
                          readOnly
                        />

                        <button
                          className="icon-button"
                          onClick={() => generateVideoLink(booking)}
                          disabled={isConfirmed || isRejected}
                        >
                          🔗 Generate
                        </button>

                        {meetingLinks[booking._id] && (
                          <button
                            className="icon-button copy-btn"
                            onClick={() =>
                              copyToClipboard(meetingLinks[booking._id])
                            }
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </div>


                    {/* Notes */}
                    <div className="input-group">
                      <label>Notes</label>
                      <textarea
                        placeholder="Add private notes about this session..."
                        rows={3}
                        value={notes[booking._id] || ""}
                        onChange={(e) =>
                          setNotes({ ...notes, [booking._id]: e.target.value })
                        }
                        disabled={isConfirmed || isRejected}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {/* Action Buttons */}
                  <div className="card-actions">
                    {isPending ? (
                      <>
                        <button
                          className="btn confirm-btn"
                          onClick={() => handleUpdate(booking._id, "Confirmed")}
                        >
                          <span className="btn-icon">✅</span>
                          Confirm Booking
                        </button>

                        <button
                          className="btn reject-btn"
                          onClick={() => handleUpdate(booking._id, "Rejected")}
                        >
                          <span className="btn-icon">❌</span>
                          Reject Booking
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Status Box */}
                        <div
                          className={`status-message ${isConfirmed ? "confirmed" : "rejected"
                            }`}
                        >
                          <span className="message-icon">
                            {isConfirmed ? "✅" : "❌"}
                          </span>

                          <p>
                            {isConfirmed ? "Booking confirmed" : "Booking rejected"}
                          </p>

                          <span className="action-date">
                            Updated on {formatDate(booking.updatedAt)}
                          </span>
                        </div>

                        {/* ⭐ JOIN BUTTON OUTSIDE THE CONFIRMED BOX */}
                        {isConfirmed && (booking.meetingLink || meetingLinks[booking._id]) && (
                          <button
                            className="btn join-btn"
                            onClick={() =>
                              window.open(
                                meetingLinks[booking._id] || booking.meetingLink,
                                "_blank"
                              )
                            }
                            style={{ marginTop: "10px" }}
                          >
                            🎥 Join Meeting
                          </button>
                        )}

                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Moderator;
