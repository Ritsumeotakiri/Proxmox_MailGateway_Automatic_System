import React, { useState } from "react";

const Support = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend or API
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Support</h2>
      <p>If you have any questions or need help, please fill out the form below and our team will get back to you soon.</p>
      {submitted ? (
        <div style={{ color: "green", marginTop: 20 }}>Thank you for contacting support!</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>
              Message:
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>
          <button type="submit" style={{ padding: "8px 24px" }}>Submit</button>
        </form>
      )}
    </div>
  );
};

export default Support;