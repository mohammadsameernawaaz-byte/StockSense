import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { response, data } = await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setError(data.message || "Unable to create account.");
        return;
      }

      alert("Account created successfully. Please sign in.");
      navigate("/login");
    } catch {
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="brand"><div className="brand-symbol">S</div><div>
          <div className="brand-title">StockSense</div>
          <div className="brand-caption">Inventory Management</div>
        </div></div>

        <div className="visual-content">
          <div className="visual-label">STOCK MANAGEMENT</div>
          <h1>Bring your<br />inventory into<br /><span>one place.</span></h1>
          <p>StockSense gives your team a single workspace for products, warehouses and inventory operations.</p>
        </div>

        <div className="visual-footer">© 2026 StockSense</div>
      </section>

      <section className="auth-section">
        <div className="auth-box">
          <div className="mobile-brand">STOCKSENSE</div>
          <div className="auth-heading">
            <h2>Create your account</h2>
            <p>Set up your StockSense workspace.</p>
          </div>

          <form onSubmit={submit}>
            <label>Full name</label>
            <input placeholder="Your name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />

            <label>Email address</label>
            <input type="email" placeholder="you@company.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />

            <label>Password</label>
            <input type="password" placeholder="Create a password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />

            {error && <div style={{ marginBottom: 14, color: "#d92d2d", fontSize: 13 }}>{error}</div>}

            <button className="main-button" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="account-switch" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
