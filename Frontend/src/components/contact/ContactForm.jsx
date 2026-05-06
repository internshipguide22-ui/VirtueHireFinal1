import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        subject: "",
        message: "",
        consent: false,
      });
    }, 3000);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          padding: "4rem 2rem",
          background: "white",
          borderRadius: "32px",
          textAlign: "center",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--medium-gray)",
        }}
      >
        <div
          style={{
            color: "var(--primary)",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CheckCircle2 size={64} />
        </div>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "800",
            color: "var(--dark)",
            marginBottom: "1rem",
          }}
        >
          Message Sent!
        </h2>
        <p style={{ color: "var(--text-gray)", fontSize: "1.1rem" }}>
          Thank you for reaching out. Our team will get back to you within 24
          hours.
        </p>
      </motion.div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "1rem 1.2rem",
    borderRadius: "12px",
    border: "1px solid var(--medium-gray)",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease",
    background: "var(--light-gray)",
  };

  return (
    <div
      style={{
        padding: "3rem",
        background: "white",
        borderRadius: "32px",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--medium-gray)",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "800",
          color: "var(--dark)",
          marginBottom: "1.5rem",
          letterSpacing: "-1px",
        }}
      >
        Send us a Message
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "var(--dark)",
                fontSize: "0.9rem",
              }}
            >
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "var(--dark)",
                fontSize: "0.9rem",
              }}
            >
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              style={inputStyle}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "var(--dark)",
                fontSize: "0.9rem",
              }}
            >
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Name"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "var(--dark)",
                fontSize: "0.9rem",
              }}
            >
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 ..."
              style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
              color: "var(--dark)",
              fontSize: "0.9rem",
            }}
          >
            Subject *
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="demo">Request a Demo</option>
            <option value="pricing">Pricing Information</option>
            <option value="support">Technical Support</option>
          </select>
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
              color: "var(--dark)",
              fontSize: "0.9rem",
            }}
          >
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            placeholder="How can we help you?"
            style={{ ...inputStyle, resize: "none" }}
          ></textarea>
        </div>
        <button
          type="submit"
          style={{
            padding: "1.2rem",
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "var(--primary-dark)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "var(--primary)")
          }
        >
          <Send size={18} /> Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
