import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiX, FiCalendar, FiVideo, FiExternalLink, FiBell } from "react-icons/fi";
import api, { getErrorMessage } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { formatDate, formatTime, getJoinTarget, STATUS_LABELS } from "../../utils/format";
import { EmptyState, Loading } from "../ui/Feedback";

export default function NotificationsPanel({ bookings, loading, onReload, onClose }) {
  const toast = useToast();

  useEffect(() => {
    onReload();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async (booking) => {
    if (!window.confirm(`Cancel your session with ${booking.expertName}?`)) return;
    try {
      await api.delete(`/bookings/${booking._id}`);
      toast.success("Booking cancelled");
      onReload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return createPortal(
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Notifications">
        <div className="drawer__head">
          <h2 className="mb-0" style={{ fontSize: "1.3rem" }}>Your sessions</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><FiX /></button>
        </div>
        <div className="drawer__body">
          {loading && !bookings.length ? (
            <Loading label="Loading your sessions..." />
          ) : bookings.length === 0 ? (
            <EmptyState icon={FiBell} title="No sessions yet">
              When you book a session, its status and joining link will appear here.
            </EmptyState>
          ) : (
            bookings.map((b) => {
              const join = getJoinTarget(b);
              return (
                <article key={b._id} className="card card--flat booking-item">
                  <div className="booking-item__head">
                    <h4>{b.expertName}</h4>
                    <span className={`badge badge--${b.status}`}>{STATUS_LABELS[b.status]}</span>
                  </div>
                  <div className="kv">
                    <span><FiCalendar aria-hidden="true" style={{ verticalAlign: "-2px" }} /> {formatDate(b.meetingDate)}</span>
                    <span>{formatTime(b.timingFrom)} - {formatTime(b.timingTo)}</span>
                  </div>
                  <div className="row">
                    {join?.internal && (
                      <Link className="btn btn--primary btn--sm" to={join.internal} onClick={onClose}><FiVideo /> Join session</Link>
                    )}
                    {join?.external && (
                      <a className="btn btn--primary btn--sm" href={join.external} target="_blank" rel="noopener noreferrer"><FiExternalLink /> Join session</a>
                    )}
                    {b.status === "pending" && <span className="text-small text-muted">Waiting for the expert to confirm.</span>}
                    {b.status !== "completed" && (
                      <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--danger)" }} onClick={() => cancel(b)}>Cancel</button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </aside>
    </>,
    document.body
  );
}
