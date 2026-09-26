import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { response, data } = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("stocksenseToken", data.token);
      localStorage.setItem("stocksenseUser", JSON.stringify(data.user));
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Cannot connect to backend on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="brand">
          <div className="brand-symbol">S</div>
          <div>
            <div className="brand-title">StockSense</div>
            <div className="brand-caption">Inventory Management</div>
          </div>
        </div>

        <div className="visual-content">
          <div className="visual-label">SMART INVENTORY CONTROL</div>
          <h1>Built to handle<br />all your <span>inventory</span><br />operations.</h1>
          <p>Manage products, stock, warehouses, receipts, deliveries and internal movements from one simple workspace.</p>
          <div className="visual-features">
            <div><span>✓</span> Real-time inventory tracking</div>
            <div><span>✓</span> Multi-warehouse management</div>
            <div><span>✓</span> Complete stock movement history</div>
          </div>
        </div>

        <div className="visual-footer">© 2026 StockSense</div>
      </section>

      <section className="auth-section">
        <div className="auth-box">
          <div className="mobile-brand">STOCKSENSE</div>
          <div className="auth-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your inventory workspace.</p>
          </div>

          <form onSubmit={submit}>
            <label>Email address</label>
            <input type="email" placeholder="you@company.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />

            <div className="password-row">
              <label>Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <input type="password" placeholder="Enter your password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />

            {error && <div style={{ marginBottom: 14, color: "#d92d2d", fontSize: 13 }}>{error}</div>}

            <button className="main-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <div className="account-switch">
            Don't have an account? <Link to="/signup">Create account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
