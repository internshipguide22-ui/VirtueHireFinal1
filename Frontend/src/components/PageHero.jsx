import React from "react";
import { motion } from "framer-motion";

const PageHero = ({ title, subtitle, breadcrumb }) => {
  return (
    <section
      style={{
        padding: "160px 0 100px",
        background: "linear-gradient(135deg, var(--dark) 0%, #1e1b4b 100%)",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Background Animations */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          opacity: 0.15,
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, var(--secondary) 0%, transparent 70%)",
          opacity: 0.15,
          filter: "blur(60px)",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {breadcrumb && (
            <div
              style={{
                display: "inline-block",
                padding: "6px 16px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "100px",
                color: "var(--primary-light)",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {breadcrumb}
            </div>
          )}
          <h1
            style={{
              fontSize: "4rem",
              fontWeight: "900",
              color: "white",
              marginBottom: "1.5rem",
              letterSpacing: "-2px",
              lineHeight: "1.1",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "rgba(255,255,255,0.7)",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
