import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiVideo, FiExternalLink } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import api, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate, formatTime, formatCurrency, getJoinTarget, STATUS_LABELS } from "../utils/format";
import PageHero from "../components/ui/PageHero";
import Avatar from "../components/ui/Avatar";
import { EmptyState, Loading } from "../components/ui/Feedback";

export default function ProfilePage() {
  useDocumentTitle("My profile");
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: user?.fullName || "", age: user?.age || "" });
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    api.get("/bookings/mine").then(({ data }) => setBookings(data)).catch((err) => { toast.error(getErrorMessage(err)); setBookings([]); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      updateUser({ fullName: data.user.fullName, age: data.user.age });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHero title="My profile" subtitle="Manage your details and view your sessions." crumbs={[{ label: "Profile" }]} />
      <section className="section">
        <div className="container profile-layout">
          <form className="card" onSubmit={save}>
            <div className="row" style={{ marginBottom: "var(--sp-5)" }}>
              <Avatar name={user.fullName} size={64} />
              <div><strong>{user.fullName}</strong><div className="text-small text-muted">{user.email}</div></div>
            </div>
            <div className="field">
              <label htmlFor="p-name">Full name</label>
              <input id="p-name" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="p-age">Age</label>
              <input id="p-age" className="input" type="number" min="1" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="p-email">Email</label>
              <input id="p-email" className="input" value={user.email} disabled />
              <span className="hint">Email cannot be changed.</span>
            </div>
            <button className="btn btn--primary btn--block" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          </form>

          <div>
            <h2 style={{ fontSize: "var(--fs-xl)" }}>My sessions</h2>
            {bookings === null ? <Loading /> : bookings.length === 0 ? (
              <div className="card"><EmptyState icon={FiCalendar} title="No sessions yet"><Link to="/experts">Book your first session</Link></EmptyState></div>
            ) : bookings.map((b) => {
              const join = getJoinTarget(b);
              return (
                <article key={b._id} className="card booking-item" style={{ marginBottom: "var(--sp-4)" }}>
                  <div className="booking-item__head">
                    <h4>{b.expertName}</h4>
                    <div className="row" style={{ gap: 6 }}>
                      <span className={`badge badge--${b.status}`}>{STATUS_LABELS[b.status]}</span>
                      <span className={`badge badge--${b.paymentStatus}`}>{b.paymentStatus === "free" ? "Free" : b.paymentStatus === "paid" ? "Paid" : "Payment pending"}</span>
                    </div>
                  </div>
                  <div className="kv">
                    <span>{formatDate(b.meetingDate)} · {formatTime(b.timingFrom)} - {formatTime(b.timingTo)}</span>
                    {b.fee > 0 && <span>Fee: {formatCurrency(b.fee)}</span>}
                    {b.notes && b.status !== "pending" && <span>Note from expert: {b.notes}</span>}
                  </div>
                  {join?.internal && <div><Link className="btn btn--primary btn--sm" to={join.internal}><FiVideo /> Join session</Link></div>}
                  {join?.external && <div><a className="btn btn--primary btn--sm" href={join.external} target="_blank" rel="noopener noreferrer"><FiExternalLink /> Join session</a></div>}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
