import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Modal from "../ui/Modal";
import api, { getErrorMessage } from "../../api/client";
import { SITE } from "../../config/site";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate, formatTime, todayISO } from "../../utils/format";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load the payment window. Check your connection."));
    document.body.appendChild(script);
  });

/**
 * Booking flow: 1) details -> 2) payment (Razorpay, or UPI QR fallback when
 * Razorpay is not configured) -> 3) confirmation.
 * Prices and coupons are always decided by the server.
 */
export default function BookingModal({ expert, onClose }) {
  const { user } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState({ razorpayEnabled: false });
  const [booking, setBooking] = useState(null);
  const [quote, setQuote] = useState({ fee: expert.fee, total: expert.fee, percent: 0 });
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [form, setForm] = useState({
    contact: "",
    age: user?.age || "",
    date: "",
    timingFrom: "",
    timingTo: "",
    issue: "",
  });

  useEffect(() => {
    api.get("/payment/config").then(({ data }) => setConfig(data)).catch(() => {});
  }, []);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), []);

  const applyCoupon = async () => {
    setError("");
    try {
      const { data } = await api.post("/payment/quote", { expertId: expert._id, coupon: couponInput });
      setQuote(data);
      setAppliedCoupon(couponInput.trim().toUpperCase());
      toast.success(data.percent ? `Coupon applied: ${data.percent}% off` : "Coupon applied");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid coupon"));
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    setQuote({ fee: expert.fee, total: expert.fee, percent: 0 });
  };

  const submitDetails = async (e) => {
    e.preventDefault();
    setError("");
    if (form.timingTo <= form.timingFrom) return setError("The end time must be after the start time.");
    setBusy(true);
    try {
      const { data } = await api.post("/bookings", {
        expertId: expert._id,
        coupon: appliedCoupon,
        ...form,
      });
      setBooking(data.booking);
      if (data.booking.paymentStatus === "free") {
        setStep(3);
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const payOnline = async () => {
    setError("");
    setBusy(true);
    try {
      await loadRazorpay();
      const { data } = await api.post("/payment/order", { bookingId: booking._id });
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: SITE.name,
        description: `Session with ${expert.fullName}`,
        prefill: { name: user?.fullName, email: user?.email, contact: form.contact },
        theme: { color: "#0f5c57" },
        handler: async (response) => {
          try {
            await api.post("/payment/verify", { bookingId: booking._id, ...response });
            setStep(3);
          } catch (err) {
            setError(getErrorMessage(err, "Payment could not be verified. If money was deducted, contact us with your booking details."));
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (err) {
      setError(getErrorMessage(err));
      // Online payment could not start (e.g. gateway keys rejected): show the UPI option instead.
      if (err.response?.status === 502 || err.response?.status === 503) setConfig({ razorpayEnabled: false });
      setBusy(false);
    }
  };

  const upiLink = `upi://pay?pa=${encodeURIComponent(SITE.upiId)}&pn=${encodeURIComponent(SITE.shortName)}&am=${booking?.fee || quote.total}&cu=INR&tn=${encodeURIComponent(`Session with ${expert.fullName}`)}`;

  return (
    <Modal title={step === 3 ? "Request received" : `Book ${expert.fullName}`} onClose={onClose} size="lg">
      <div className="steps" aria-hidden="true">
        <span className={step >= 1 ? "is-done" : ""} />
        <span className={step >= 2 ? "is-done" : ""} />
        <span className={step >= 3 ? "is-done" : ""} />
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {step === 1 && (
        <form onSubmit={submitDetails}>
          <div className="form-row form-row--2">
            <div className="field">
              <label htmlFor="b-contact">Phone number</label>
              <input id="b-contact" name="contact" className="input" type="tel" value={form.contact} onChange={set} placeholder="+91 98xxxxxxxx" autoComplete="tel" required />
            </div>
            <div className="field">
              <label htmlFor="b-age">Age</label>
              <input id="b-age" name="age" className="input" type="number" min="1" max="120" value={form.age} onChange={set} required />
            </div>
          </div>
          <div className="form-row form-row--2">
            <div className="field">
              <label htmlFor="b-date">Session date</label>
              <input id="b-date" name="date" className="input" type="date" min={todayISO()} value={form.date} onChange={set} required />
            </div>
            <div className="form-row form-row--2" style={{ gap: "var(--sp-3)" }}>
              <div className="field">
                <label htmlFor="b-from">From</label>
                <input id="b-from" name="timingFrom" className="input" type="time" value={form.timingFrom} onChange={set} required />
              </div>
              <div className="field">
                <label htmlFor="b-to">To</label>
                <input id="b-to" name="timingTo" className="input" type="time" value={form.timingTo} onChange={set} required />
              </div>
            </div>
          </div>
          {expert.time && <p className="hint text-small text-muted" style={{ marginTop: "-0.5rem" }}>{expert.fullName} is usually available: {expert.time}</p>}

          <div className="field">
            <label htmlFor="b-issue">What would you like help with?</label>
            <textarea id="b-issue" name="issue" className="textarea" rows={3} maxLength={2000} value={form.issue} onChange={set} required />
          </div>

          <div className="field">
            <label htmlFor="b-coupon">Coupon code (optional)</label>
            <div className="input-group">
              <input id="b-coupon" className="input" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} disabled={Boolean(appliedCoupon)} autoCapitalize="characters" />
              {appliedCoupon ? (
                <button type="button" className="btn btn--ghost" onClick={removeCoupon}>Remove</button>
              ) : (
                <button type="button" className="btn btn--outline" onClick={applyCoupon} disabled={!couponInput.trim()}>Apply</button>
              )}
            </div>
          </div>

          <div className="summary-box" style={{ marginBottom: "var(--sp-5)" }}>
            <dl>
              <dt>Session fee</dt><dd>{formatCurrency(quote.fee)}</dd>
              {quote.percent > 0 && (<><dt>Discount ({quote.percent}%)</dt><dd style={{ color: "var(--success)" }}>- {formatCurrency(quote.fee - quote.total)}</dd></>)}
              <dt>Total</dt><dd style={{ fontSize: "1.15rem" }}>{quote.total === 0 ? "Free" : formatCurrency(quote.total)}</dd>
            </dl>
          </div>

          <button className="btn btn--primary btn--block btn--lg" disabled={busy}>
            {busy ? "Please wait..." : quote.total === 0 ? "Request free session" : "Continue to payment"}
          </button>
        </form>
      )}

      {step === 2 && booking && (
        <div className="stack">
          <div className="summary-box">
            <dl>
              <dt>Expert</dt><dd>{expert.fullName}</dd>
              <dt>When</dt><dd>{formatDate(booking.meetingDate)}, {formatTime(booking.timingFrom)}</dd>
              <dt>Amount</dt><dd>{formatCurrency(booking.fee)}</dd>
            </dl>
          </div>

          {config.razorpayEnabled ? (
            <>
              <button className="btn btn--primary btn--block btn--lg" onClick={payOnline} disabled={busy}>
                {busy ? "Opening payment..." : `Pay ${formatCurrency(booking.fee)} securely`}
              </button>
              <p className="text-small text-muted text-center mb-0">Cards, UPI, net banking and wallets are supported.</p>
            </>
          ) : (
            <div className="text-center">
              <p>Pay <strong>{formatCurrency(booking.fee)}</strong> with any UPI app. {isMobile ? "Tap the button below" : "Scan the code"}, then confirm. Your booking is verified once the payment is received.</p>
              {isMobile ? (
                <a className="btn btn--accent btn--lg" href={upiLink}>Pay with UPI app</a>
              ) : (
                <div className="qr-box"><QRCodeSVG value={upiLink} size={200} /></div>
              )}
              <p className="text-small text-muted mt-4">UPI ID: {SITE.upiId}</p>
              <button className="btn btn--success btn--block" onClick={() => setStep(3)}>I've paid - continue</button>
            </div>
          )}
        </div>
      )}

      {step === 3 && booking && (
        <div className="text-center stack">
          <div className="card__icon" style={{ margin: "0 auto", background: "var(--success-bg)", color: "var(--success)" }}>✓</div>
          <h3 className="mb-0">Your request has been sent</h3>
          <p className="text-muted mb-0">
            {expert.fullName} will review it and confirm shortly. You'll see the status and joining link under the bell icon (and in My profile) once it's confirmed.
          </p>
          <div className="summary-box">
            <dl>
              <dt>Date</dt><dd>{formatDate(booking.meetingDate)}</dd>
              <dt>Time</dt><dd>{formatTime(booking.timingFrom)} - {formatTime(booking.timingTo)}</dd>
              <dt>Payment</dt><dd style={{ textTransform: "capitalize" }}>{booking.paymentStatus === "free" ? "Free" : "Pending verification"}</dd>
            </dl>
          </div>
          <button className="btn btn--primary btn--block" onClick={onClose}>Done</button>
        </div>
      )}
    </Modal>
  );
}
