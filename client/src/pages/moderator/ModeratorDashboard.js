import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiX, FiVideo, FiFlag, FiDollarSign } from "react-icons/fi";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useFetch from "../../hooks/useFetch";
import api, { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatDate, formatTime, formatCurrency, STATUS_LABELS } from "../../utils/format";
import Avatar from "../../components/ui/Avatar";
import { EmptyState, ErrorState, Loading } from "../../components/ui/Feedback";

const FILTERS = ["all", "pending", "accepted", "completed", "rejected"];

export default function ModeratorDashboard() {
  useDocumentTitle("Moderator dashboard");
  const { user, logout } = useAuth();
  const toast = useToast();
  const { data, setData, loading, error, reload } = useFetch("/bookings");
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);

  const bookings = useMemo(() => data || [], [data]);
  const counts = useMemo(() => bookings.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {}), [bookings]);
  const visible = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const update = async (booking, patch, message) => {
    setBusyId(booking._id);
    try {
      const { data: res } = await api.put(`/bookings/${booking._id}`, patch);
      setData((list) => list.map((b) => (b._id === booking._id ? res.booking : b)));
      toast.success(message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const addNote = (booking) => {
    const notes = window.prompt("Add a note for the client (optional):", booking.notes || "");
    if (notes !== null) update(booking, { notes }, "Note saved");
  };

  return (
    <div className="dash">
      <div className="dash__top">
        <div className="container">
          <h1>Moderator dashboard</h1>
          <div className="row">
            <Link to="/">View site</Link>
            <button className="btn btn--light btn--sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>

      <div className="container dash__body">
        <p className="text-muted">Welcome, <strong>{user.fullName}</strong>. Review and manage your session requests.</p>

        <div className="tabs" role="tablist" aria-label="Filter bookings">
          {FILTERS.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? "is-active" : ""} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : STATUS_LABELS[f]} ({f === "all" ? bookings.length : counts[f] || 0})
            </button>
          ))}
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : visible.length === 0 ? (
          <div className="card"><EmptyState title="Nothing here">No {filter === "all" ? "" : STATUS_LABELS[filter].toLowerCase()} bookings.</EmptyState></div>
        ) : (
          <div className="booking-grid">
            {visible.map((b) => (
              <article key={b._id} className="card booking-card">
                <div className="booking-card__head">
                  <div className="who">
                    <Avatar name={b.fullName} size={44} />
                    <div style={{ minWidth: 0 }}><h3>{b.fullName}</h3><p>{b.email}</p></div>
                  </div>
                  <span className={`badge badge--${b.status}`}>{STATUS_LABELS[b.status]}</span>
                </div>
                <div className="kv">
                  <span><strong>{formatDate(b.meetingDate)}</strong> · {formatTime(b.timingFrom)} - {formatTime(b.timingTo)}</span>
                  <span>Age {b.age}{b.contact ? ` · ${b.contact}` : ""}</span>
                  <span>
                    <span className={`badge badge--${b.paymentStatus}`}>{b.paymentStatus === "free" ? "Free" : b.paymentStatus === "paid" ? "Paid" : "Unpaid"}</span>{" "}
                    {b.fee > 0 && formatCurrency(b.fee)}{b.couponCode && ` · coupon ${b.couponCode}`}
                  </span>
                </div>
                <p className="booking-card__issue">{b.issue}</p>
                {b.notes && <p className="text-small text-muted mb-0">Your note: {b.notes}</p>}

                <div className="booking-card__actions">
                  {b.status === "pending" && (
                    <>
                      <button className="btn btn--success btn--sm" disabled={busyId === b._id} onClick={() => update(b, { status: "accepted" }, "Booking confirmed. The client can now join.")}><FiCheck /> Accept</button>
                      <button className="btn btn--danger btn--sm" disabled={busyId === b._id} onClick={() => update(b, { status: "rejected" }, "Booking declined")}><FiX /> Decline</button>
                    </>
                  )}
                  {b.status === "accepted" && (
                    <>
                      <Link className="btn btn--primary btn--sm" to={`/videocall?booking=${b._id}`}><FiVideo /> Join call</Link>
                      <button className="btn btn--outline btn--sm" disabled={busyId === b._id} onClick={() => update(b, { status: "completed" }, "Marked as completed")}><FiFlag /> Complete</button>
                    </>
                  )}
                  {b.paymentStatus === "unpaid" && (
                    <button className="btn btn--ghost btn--sm" disabled={busyId === b._id} onClick={() => update(b, { paymentStatus: "paid" }, "Payment marked as received")}><FiDollarSign /> Mark paid</button>
                  )}
                  <button className="btn btn--ghost btn--sm" onClick={() => addNote(b)}>Note</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
