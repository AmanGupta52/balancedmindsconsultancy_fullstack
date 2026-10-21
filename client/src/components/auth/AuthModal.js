import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Modal from "../ui/Modal";
import api, { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const MODES = {
  login: "Welcome back",
  register: "Create your account",
  reset: "Reset your password",
};

const EMPTY = { fullName: "", age: "", email: "", password: "", otp: "", newPassword: "" };

function PasswordInput({ id, label, value, onChange, autoComplete, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-group">
        <input
          id={id}
          name={id}
          className="input"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="icon-btn"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export default function AuthModal({ initialMode = "login", onSuccess, onClose }) {
  const { login, startSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(EMPTY);
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { type, text }

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const switchMode = (next) => {
    setMode(next);
    setNotice(null);
    setOtpSent(false);
    setForm((f) => ({ ...EMPTY, email: f.email }));
  };

  const finishLogin = (user) => {
    onClose();
    if (user.role === "admin") navigate("/admin-dashboard");
    else if (user.role === "moderator") navigate("/moderator-dashboard");
    else onSuccess?.(user);
  };

  const sendOtp = async () => {
    setNotice(null);
    setBusy(true);
    try {
      const { data } = await api.post("/auth/send-otp", { email: form.email, purpose: mode === "reset" ? "reset" : "register" });
      setOtpSent(true);
      setNotice({ type: "success", text: data.message });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err, "Could not send the OTP") });
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const result = await login(form.email, form.password);
        if (!result.ok) return setNotice({ type: "error", text: result.error });
        finishLogin(result.user);
      } else if (mode === "register") {
        const { data } = await api.post("/auth/register", {
          fullName: form.fullName,
          age: form.age,
          email: form.email,
          password: form.password,
          otp: form.otp,
        });
        startSession(data.token, data.user);
        finishLogin(data.user);
      } else {
        await api.post("/auth/reset-password", { email: form.email, otp: form.otp, newPassword: form.newPassword });
        switchMode("login");
        setNotice({ type: "success", text: "Password updated. Please sign in with your new password." });
      }
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const showOtp = mode !== "login";

  return (
    <Modal title={MODES[mode]} onClose={onClose}>
      {mode !== "reset" && (
        <div className="auth-tabs" role="tablist" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => switchMode("login")}>
            Sign in
          </button>
          <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "is-active" : ""} onClick={() => switchMode("register")}>
            Register
          </button>
        </div>
      )}

      {notice && (
        <div className={`alert alert--${notice.type}`} role="alert">
          {notice.text}
        </div>
      )}

      <form onSubmit={submit} noValidate={false}>
        {mode === "register" && (
          <div className="form-row form-row--2">
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" className="input" value={form.fullName} onChange={set} autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="age">Age</label>
              <input id="age" name="age" className="input" type="number" min="1" max="120" value={form.age} onChange={set} required />
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" className="input" type="email" value={form.email} onChange={set} autoComplete="email" required />
        </div>

        {mode !== "reset" && (
          <PasswordInput
            id="password"
            label="Password"
            value={form.password}
            onChange={set}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            hint={mode === "register" ? "At least 8 characters" : undefined}
          />
        )}

        {showOtp && (
          <div className="field">
            <label htmlFor="otp">Email verification code</label>
            <div className="input-group">
              <input id="otp" name="otp" className="input" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={form.otp} onChange={set} autoComplete="one-time-code" required />
              <button type="button" className="btn btn--outline" onClick={sendOtp} disabled={busy || !form.email}>
                {otpSent ? "Resend" : "Send code"}
              </button>
            </div>
          </div>
        )}

        {mode === "reset" && (
          <PasswordInput id="newPassword" label="New password" value={form.newPassword} onChange={set} autoComplete="new-password" hint="At least 8 characters" />
        )}

        <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
          {busy ? <span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,.35)" }} /> : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Reset password"}
        </button>
      </form>

      <p className="text-center text-small mt-4 mb-0">
        {mode === "login" && (
          <button type="button" className="link-btn" onClick={() => switchMode("reset")}>
            Forgot your password?
          </button>
        )}
        {mode === "reset" && (
          <button type="button" className="link-btn" onClick={() => switchMode("login")}>
            Back to sign in
          </button>
        )}
      </p>
    </Modal>
  );
}
