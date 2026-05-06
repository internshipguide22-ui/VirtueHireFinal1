import React from "react";
import {
  ShieldCheck,
  Lightbulb,
  Heart,
  Users,
  Rocket,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const AboutValues = () => {
  const values = [
    {
      icon: <ShieldCheck size={28} />,
      title: "Integrity First",
      description:
        "We believe in transparent, honest practices that build trust with our users and partners.",
      color: "#10b981",
    },
    {
      icon: <Lightbulb size={28} />,
      title: "Innovation Driven",
      description:
        "Constantly pushing boundaries with AI and machine learning to improve recruitment outcomes.",
      color: "var(--secondary)",
    },
    {
      icon: <Heart size={28} />,
      title: "User Centric",
      description:
        "Every feature and decision is made with our users' needs and experiences at the forefront.",
      color: "#f43f5e",
    },
    {
      icon: <Users size={28} />,
      title: "Diversity",
      description:
        "Committed to creating equal opportunities and reducing bias in the hiring process.",
      color: "var(--primary)",
    },
    {
      icon: <Rocket size={28} />,
      title: "Excellence",
      description:
        "Striving for the highest quality in everything we do, from code to customer service.",
      color: "var(--accent)",
    },
    {
      icon: <HelpCircle size={28} />,
      title: "Collaboration",
      description:
        "Working together with employers, candidates, and partners to achieve shared success.",
      color: "#8b5cf6",
    },
  ];

  return (
    <section className="about-values" style={{ padding: "100px 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "var(--dark)",
              marginBottom: "1rem",
            }}
          >
            Our Core Values
          </motion.h2>
          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--text-gray)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            The principles that guide our decisions, shape our culture, and
            drive our success
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              style={{
                padding: "2.5rem",
                background: "white",
                borderRadius: "24px",
                border: "1px solid var(--medium-gray)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ color: value.color, marginBottom: "1.5rem" }}>
                {value.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: "var(--dark)",
                  marginBottom: "1rem",
                }}
              >
                {value.title}
              </h3>
              <p style={{ color: "var(--text-gray)", lineHeight: "1.6" }}>
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutValues;
