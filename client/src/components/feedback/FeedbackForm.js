import { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function FeedbackForm({ onAdded }) {
  const { user } = useAuth();
  const toast = useToast();
  const [stars, setStars] = useState(5);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/feedback", {
        fullName: user?.fullName,
        email: user?.email,
        stars,
        title,
        message,
      });
      onAdded(data);
      setTitle("");
      setMessage("");
      setStars(5);
      toast.success("Thank you for sharing your feedback!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card">
      <h3>Share your experience</h3>
      <div className="field">
        <span className="label" id="rating-label">Your rating</span>
        <div className="star-input" role="radiogroup" aria-labelledby="rating-label">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={n <= stars ? "is-on" : ""}
              onClick={() => setStars(n)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="fb-title">Title</label>
        <input id="fb-title" className="input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="fb-message">Your feedback</label>
        <textarea id="fb-message" className="textarea" rows={4} maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      <button className="btn btn--primary btn--block" disabled={busy}>
        {busy ? "Submitting..." : "Submit feedback"}
      </button>
      {!user && <p className="text-small text-muted mt-4 mb-0">You're posting as Anonymous. Sign in to show your name.</p>}
    </form>
  );
}
