import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");

  async function requestOtp(e) {
    e.preventDefault();
    setError("");
    const { response, data } = await api("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: form.email }),
    });
    if (!response.ok) return setError(data.message || "Unable to request OTP.");
    setDevOtp(data.devOtp || "");
    setStep(2);
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError("");
    const { response, data } = await api("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (!response.ok) return setError(data.message || "Unable to reset password.");
    alert("Password reset successfully.");
    navigate("/login");
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="brand"><div className="brand-symbol">S</div><div>
          <div className="brand-title">StockSense</div>
          <div className="brand-caption">Inventory Management</div>
        </div></div>
        <div className="visual-content">
          <div className="visual-label">ACCOUNT SECURITY</div>
          <h1>Get back into<br />your <span>workspace.</span></h1>
          <p>Reset your password securely using the StockSense OTP flow.</p>
        </div>
        <div className="visual-footer">© 2026 StockSense</div>
      </section>

      <section className="auth-section">
        <div className="auth-box">
          <div className="mobile-brand">STOCKSENSE</div>
          <div className="auth-heading">
            <h2>Reset password</h2>
            <p>{step === 1 ? "Enter your email to receive an OTP." : "Enter your OTP and new password."}</p>
          </div>

          {step === 1 ? (
            <form onSubmit={requestOtp}>
              <label>Email address</label>
              <input type="email" placeholder="you@company.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              {error && <div style={{ marginBottom: 14, color: "#d92d2d", fontSize: 13 }}>{error}</div>}
              <button className="main-button">Send OTP</button>
            </form>
          ) : (
            <form onSubmit={resetPassword}>
              <label>OTP</label>
              <input inputMode="numeric" maxLength={6} placeholder="6-digit OTP" value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })} required />
              {devOtp && <div style={{ marginBottom: 14, padding: 12, background: "#fff0ec", borderRadius: 7, fontSize: 13 }}>
                Development OTP: <strong>{devOtp}</strong>
              </div>}
              <label>New password</label>
              <input type="password" placeholder="New password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
              {error && <div style={{ marginBottom: 14, color: "#d92d2d", fontSize: 13 }}>{error}</div>}
              <button className="main-button">Reset password</button>
            </form>
          )}

          <div className="account-switch" style={{ marginTop: 20 }}>
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
