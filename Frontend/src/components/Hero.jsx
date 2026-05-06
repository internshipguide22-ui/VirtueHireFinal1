import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const Hero = ({ scrollToSection }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "80px",
        background:
          "linear-gradient(135deg, var(--light-gray) 0%, #e0e7ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background shapes */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          background: "var(--primary)",
          filter: "blur(100px)",
          opacity: 0.1,
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "400px",
          height: "400px",
          background: "var(--secondary)",
          filter: "blur(100px)",
          opacity: 0.1,
          borderRadius: "50%",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ paddingRight: "2rem" }}
          >
            <motion.div
              variants={itemVariants}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "white",
                borderRadius: "20px",
                boxShadow: "var(--shadow-sm)",
                color: "var(--primary)",
                fontWeight: "600",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              ></span>
              Next-Gen Recruitment Platform
            </motion.div>

            <motion.h1
              variants={itemVariants}
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: "800",
                lineHeight: "1.1",
                color: "var(--dark)",
                marginBottom: "1.5rem",
                letterSpacing: "-1px",
              }}
            >
              Connecting <span style={{ color: "var(--primary)" }}>Talent</span>{" "}
              with Opportunities
            </motion.h1>

            <motion.p
              variants={itemVariants}
              style={{
                fontSize: "1.125rem",
                color: "var(--text-gray)",
                marginBottom: "2.5rem",
                lineHeight: "1.7",
                maxWidth: "500px",
              }}
            >
              Smart assessments & recruitment platform targeting candidates, HR
              professionals, and admins. Streamline your hiring with AI-powered
              matching.
            </motion.p>

            <motion.div
              variants={itemVariants}
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "var(--shadow-md)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection("features")}
                style={{
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  padding: "1rem 2rem",
                  borderRadius: "12px",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  boxShadow: "var(--shadow)",
                }}
              >
                Get Started Today <ArrowRight size={20} />
              </motion.button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              style={{ marginTop: "3rem", display: "flex", gap: "2rem" }}
            >
              {["AI-Powered", "Skill Evaluations", "Seamless Hiring"].map(
                (text, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--text-gray)",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    <CheckCircle2 size={18} color="var(--primary)" />
                    {text}
                  </div>
                ),
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            style={{ position: "relative" }}
          >
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Modern Workspace"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "24px",
                  boxShadow: "var(--shadow-hover)",
                }}
              />
              {/* Floating Card */}
              <motion.div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: "-30px",
                  background: "var(--glass-bg)",
                  backdropFilter: "var(--glass-blur)",
                  padding: "1.5rem",
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--glass-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                  }}
                >
                  95%
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "var(--dark)" }}>
                    Satisfaction Rate
                  </div>
                  <div
                    style={{ fontSize: "0.875rem", color: "var(--text-gray)" }}
                  >
                    From top companies
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
