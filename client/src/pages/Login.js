import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
 
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
 
export default function Login({ setCurrentUser }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        await axios.post(`${API_URL}/api/auth/register`, form);
        setMode("login");
        setForm({ username: "", email: "", password: "" });
        alert("Registered successfully! Please log in.");
      } else {
        const res = await axios.post(`${API_URL}/api/auth/login`, {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("travellog_token", res.data.token);
        localStorage.setItem("travellog_user", JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🗺</div>
        <h1 className="login-title">Travel Log</h1>
        <p className="login-subtitle">Pin your memories on the map</p>
 
        <div className="login-tabs">
          <button
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="login-form">
          {mode === "register" && (
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="login-input"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="login-input"
          />
 
          {error && <p className="login-error">{error}</p>}
 
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}