import { useState } from "react";
import { FiSend } from "react-icons/fi";
import api, { getErrorMessage } from "../../api/client";
import { SERVICES } from "../../data/services";
import { useToast } from "../../context/ToastContext";

const EMPTY = { name: "", phone: "", email: "", service: "", message: "" };

export default function ContactForm({ compact = false, defaultService = "" }) {
  const toast = useToast();
  const [form, setForm] = useState({ ...EMPTY, service: defaultService });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/contact", form);
      toast.success(data.message);
      setSent(true);
      setForm({ ...EMPTY, service: defaultService });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="alert alert--success" role="status">
        <strong>Message sent.</strong> Thank you - we'll get back to you shortly.{" "}
        <button type="button" className="link-btn" onClick={() => setSent(false)}>Send another</button>
      </div>
    );
  }

  const pair = compact ? "" : "form-row--2";
  return (
    <form onSubmit={submit}>
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      <div className={`form-row ${pair}`}>
        <div className="field">
          <label htmlFor={`cf-name-${compact}`}>Your name</label>
          <input id={`cf-name-${compact}`} name="name" className="input" value={form.name} onChange={set} autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor={`cf-phone-${compact}`}>Phone</label>
          <input id={`cf-phone-${compact}`} name="phone" className="input" type="tel" value={form.phone} onChange={set} autoComplete="tel" required />
        </div>
      </div>
      <div className={`form-row ${pair}`}>
        <div className="field">
          <label htmlFor={`cf-email-${compact}`}>Email</label>
          <input id={`cf-email-${compact}`} name="email" className="input" type="email" value={form.email} onChange={set} autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor={`cf-service-${compact}`}>Service</label>
          <select id={`cf-service-${compact}`} name="service" className="select" value={form.service} onChange={set}>
            <option value="">Select a service</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.title}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor={`cf-msg-${compact}`}>Message</label>
        <textarea id={`cf-msg-${compact}`} name="message" className="textarea" rows={compact ? 3 : 4} maxLength={2000} value={form.message} onChange={set} />
      </div>
      <button className="btn btn--primary btn--block" disabled={busy}>
        <FiSend aria-hidden="true" /> {busy ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
