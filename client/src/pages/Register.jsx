import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await registerUser(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📄</div>
          <span className="auth-logo-text">Resume AI</span>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start building your AI-powered resume for free</p>
        <form onSubmit={submit}>
          <div className="field-group">
            <label className="field-label">Full Name</label>
            <input className="field-input" type="text" name="name" placeholder="Your full name" value={form.name} onChange={handle} required />
          </div>
          <div className="field-group">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handle} required />
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <input className="field-input" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handle} required />
          </div>
          {error && <p className="error-msg">⚠ {error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width:"100%", marginTop:"1.25rem", justifyContent:"center", padding:"12px" }} disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login" className="auth-link">Sign in →</Link></p>
      </div>
    </div>
  );
}
