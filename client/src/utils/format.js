export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";

export const formatDate = (value, options = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN", { timeZone: "UTC", ...options });
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

/** "14:30" -> "2:30 PM" */
export const formatTime = (hhmm) => {
  if (!/^\d{2}:\d{2}$/.test(hhmm || "")) return hhmm || "-";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Start of a booking as a Date. meetingDate is stored at UTC midnight of the
 * chosen calendar day, so we rebuild the local date from its UTC parts.
 */
export const bookingStart = (booking) => {
  if (!booking?.meetingDate || !/^\d{2}:\d{2}$/.test(booking.timingFrom || "")) return null;
  const d = new Date(booking.meetingDate);
  const [h, m] = booking.timingFrom.split(":").map(Number);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m, 0);
};

export const STATUS_LABELS = { pending: "Pending", accepted: "Confirmed", rejected: "Declined", completed: "Completed" };

/**
 * Where "Join session" should go. Links created by this site point to our own
 * /videocall page (opened in-app); any other link entered by an expert
 * (Google Meet, Zoom, ...) is opened as an external URL.
 */
export const getJoinTarget = (booking) => {
  if (!booking || !["accepted", "completed"].includes(booking.status)) return null;
  const link = booking.meetingLink || "";
  if (!link || link.includes("/videocall?")) return { internal: `/videocall?booking=${booking._id}` };
  return { external: link };
};
