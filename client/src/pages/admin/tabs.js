import { useState } from "react";
import { useCallback } from "react";
import { FiUserPlus } from "react-icons/fi";
import api, { getErrorMessage } from "../../api/client";
import useFetch from "../../hooks/useFetch";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate, formatDateTime, formatTime, STATUS_LABELS } from "../../utils/format";
import Modal from "../../components/ui/Modal";
import Stars from "../../components/ui/Stars";
import { Loading, ErrorState } from "../../components/ui/Feedback";
import ResourceTab from "./ResourceTab";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { FiUsers, FiCalendar, FiMessageSquare, FiShield, FiAward } from "react-icons/fi";

/* ---------- Overview ---------- */
export function OverviewTab() {
  const { data, loading, error, reload } = useFetch("/admin/stats");
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const cards = [
    { label: "Users", value: data.usersCount, icon: FiUsers },
    { label: "Experts", value: data.expertsCount, icon: FiAward },
    { label: "Bookings", value: data.bookingsCount, icon: FiCalendar },
    { label: "Feedback", value: data.feedbackCount, icon: FiMessageSquare },
    { label: "Admins", value: data.adminsCount, icon: FiShield },
  ];
  const chart = Object.entries(STATUS_LABELS).map(([key, label]) => ({ label, count: data.bookingsByStatus?.[key] || 0 }));

  return (
    <>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="card stat">
            <span className="card__icon"><c.icon /></span>
            <div><strong>{c.value}</strong><span>{c.label}</span></div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Bookings by status</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f5c57" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

/* ---------- Bookings ---------- */
export const BookingsTab = () => (
  <ResourceTab
    title="Bookings"
    noun="booking"
    listUrl="/admin/bookings"
    deleteUrl={(id) => `/admin/bookings/${id}`}
    searchKeys={["fullName", "email", "expertName", "status"]}
    columns={[
      { key: "fullName", label: "Client", render: (b) => <><strong>{b.fullName}</strong><div className="text-small text-muted">{b.email}</div></> },
      { key: "expertName", label: "Expert" },
      { key: "meetingDate", label: "When", render: (b) => `${formatDate(b.meetingDate)}, ${formatTime(b.timingFrom)}` },
      { key: "status", label: "Status", render: (b) => <span className={`badge badge--${b.status}`}>{STATUS_LABELS[b.status]}</span> },
      { key: "paymentStatus", label: "Payment", render: (b) => <><span className={`badge badge--${b.paymentStatus}`}>{b.paymentStatus}</span> {b.fee > 0 && formatCurrency(b.fee)}</> },
    ]}
  />
);

/* ---------- Users ---------- */
export const UsersTab = () => (
  <ResourceTab
    title="Users"
    noun="user"
    listUrl="/admin/users"
    select={(d) => d.users}
    createUrl="/admin/users"
    updateUrl={(id) => `/admin/users/${id}`}
    deleteUrl={(id) => `/admin/users/${id}`}
    searchKeys={["fullName", "email"]}
    toForm={(u) => ({ fullName: u.fullName, age: u.age, email: u.email })}
    fields={[
      { name: "fullName", label: "Full name", required: true },
      { name: "age", label: "Age", type: "number", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true, hint: "Minimum 8 characters", editHint: "Leave empty to keep the current password" },
    ]}
    columns={[
      { key: "fullName", label: "Name" },
      { key: "email", label: "Email" },
      { key: "age", label: "Age" },
      { key: "createdAt", label: "Joined", render: (u) => formatDate(u.createdAt) },
    ]}
  />
);

/* ---------- Experts ---------- */
export const ExpertsTab = () => (
  <ResourceTab
    title="Experts"
    noun="expert"
    multipart
    listUrl="/admin/experts"
    createUrl="/admin/experts"
    updateUrl={(id) => `/admin/experts/${id}`}
    deleteUrl={(id) => `/admin/experts/${id}`}
    searchKeys={["fullName", "email", "title"]}
    toForm={(e) => ({
      fullName: e.fullName, email: e.email, title: e.title || "", role: e.role, availability: e.availability || "Online",
      time: e.time || "", experience: e.experience || "", fee: e.fee ?? "",
      specialities: (e.specialities || []).join(", "), languages: (e.languages || []).join(", "),
    })}
    fields={[
      { name: "fullName", label: "Full name", required: true },
      { name: "email", label: "Email (login)", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true, hint: "Minimum 8 characters", editHint: "Leave empty to keep the current password" },
      { name: "role", label: "Role", type: "select", options: ["expert", "moderator"], hint: "Moderators can sign in to manage their bookings." },
      { name: "title", label: "Title / qualification" },
      { name: "experience", label: "Experience (e.g. 8+ years)" },
      { name: "availability", label: "Mode", type: "select", options: ["Online", "In-person", "Both"] },
      { name: "time", label: "Usual availability (e.g. Mon-Fri 10am-6pm)" },
      { name: "fee", label: "Session fee (₹)", type: "number", hint: "Leave empty to use the default fee" },
      { name: "specialities", label: "Specialities", hint: "Comma separated" },
      { name: "languages", label: "Languages", hint: "Comma separated" },
      { name: "img", label: "Photo (max 2 MB)", type: "file" },
    ]}
    columns={[
      { key: "fullName", label: "Name", render: (e) => <><strong>{e.fullName}</strong><div className="text-small text-muted">{e.email}</div></> },
      { key: "role", label: "Role", render: (e) => <span className="badge">{e.role}</span> },
      { key: "title", label: "Title" },
      { key: "fee", label: "Fee", render: (e) => (e.fee != null ? formatCurrency(e.fee) : "Default") },
      { key: "specialities", label: "Specialities", render: (e) => (e.specialities || []).join(", ") || "-" },
    ]}
  />
);

/* ---------- Admins (two-step invite) ---------- */
function InviteAdmin({ onDone }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", otp: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => { setOpen(false); setStep(1); setForm({ fullName: "", email: "", password: "", otp: "" }); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (step === 1) {
        await api.post("/admin/admins/invite", form);
        setStep(2);
      } else {
        await api.post("/admin/admins/confirm", { email: form.email, otp: form.otp });
        toast.success("Admin added");
        close();
        onDone();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className="btn btn--primary btn--sm" onClick={() => setOpen(true)}><FiUserPlus /> Invite admin</button>
      {open && (
        <Modal title="Invite a new admin" onClose={close}>
          {error && <div className="alert alert--error" role="alert">{error}</div>}
          <form onSubmit={submit}>
            {step === 1 ? (
              <>
                <div className="field"><label htmlFor="a-name">Full name</label><input id="a-name" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
                <div className="field"><label htmlFor="a-email">Email</label><input id="a-email" className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="field"><label htmlFor="a-pass">Password</label><input id="a-pass" className="input" type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><span className="hint">Minimum 8 characters</span></div>
              </>
            ) : (
              <div className="field">
                <div className="alert alert--info">An approval code was emailed to the existing admins. Enter it to confirm.</div>
                <label htmlFor="a-otp">Approval code</label>
                <input id="a-otp" className="input" inputMode="numeric" maxLength={6} value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} required />
              </div>
            )}
            <button className="btn btn--primary btn--block" disabled={busy}>{busy ? "Please wait..." : step === 1 ? "Send approval code" : "Confirm"}</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export const AdminsTab = () => {
  const headerExtra = useCallback((reload) => <InviteAdmin onDone={reload} />, []);
  return (
    <ResourceTab
      title="Admins"
      noun="admin"
      listUrl="/admin/admins"
      select={(d) => d.admins}
      updateUrl={(id) => `/admin/admins/${id}`}
      deleteUrl={(id) => `/admin/admins/${id}`}
      headerExtra={headerExtra}
      searchKeys={["fullName", "email"]}
      toForm={(a) => ({ fullName: a.fullName, email: a.email })}
      fields={[
        { name: "fullName", label: "Full name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "password", label: "New password", type: "password", hint: "Leave empty to keep the current password" },
      ]}
      columns={[
        { key: "fullName", label: "Name" },
        { key: "email", label: "Email" },
        { key: "createdAt", label: "Added", render: (a) => formatDate(a.createdAt) },
      ]}
    />
  );
};

/* ---------- Feedback ---------- */
export const FeedbackTab = () => (
  <ResourceTab
    title="Feedback"
    noun="feedback"
    listUrl="/admin/feedbacks"
    updateUrl={(id) => `/admin/feedbacks/${id}`}
    deleteUrl={(id) => `/admin/feedbacks/${id}`}
    searchKeys={["fullName", "title", "message"]}
    toForm={(f) => ({ fullName: f.fullName, stars: f.stars, title: f.title, message: f.message })}
    fields={[
      { name: "fullName", label: "Name", required: true },
      { name: "stars", label: "Stars (1-5)", type: "number", required: true },
      { name: "title", label: "Title", required: true },
      { name: "message", label: "Message", type: "textarea", required: true },
    ]}
    columns={[
      { key: "fullName", label: "From", render: (f) => <><strong>{f.fullName}</strong><div className="text-small text-muted">{f.email}</div></> },
      { key: "stars", label: "Rating", render: (f) => <Stars value={f.stars} /> },
      { key: "title", label: "Feedback", render: (f) => <><strong>{f.title}</strong><div className="text-small text-muted">{f.message}</div></> },
      { key: "createdAt", label: "Date", render: (f) => formatDate(f.createdAt) },
    ]}
  />
);

/* ---------- Contact messages ---------- */
export const MessagesTab = () => (
  <ResourceTab
    title="Messages"
    noun="message"
    listUrl="/admin/messages"
    deleteUrl={(id) => `/admin/messages/${id}`}
    searchKeys={["name", "email", "phone", "message", "service"]}
    columns={[
      { key: "name", label: "From", render: (m) => <><strong>{m.name}</strong><div className="text-small text-muted">{m.email} · {m.phone}</div></> },
      { key: "service", label: "Service", render: (m) => m.service || "-" },
      { key: "message", label: "Message", render: (m) => m.message || "-" },
      { key: "createdAt", label: "Received", render: (m) => formatDateTime(m.createdAt) },
    ]}
  />
);
