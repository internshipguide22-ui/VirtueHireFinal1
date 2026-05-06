import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Building2,
  Globe,
  Rocket,
} from "lucide-react";

const SuccessStories = () => {
  const [activeTab, setActiveTab] = useState(0);

  const stories = [
    {
      company: "Global Healthcare Inc.",
      logoIcon: <Globe size={24} />,
      metricText: "Scaled from 50 to 500+",
      metricSub: "Employees",
      quote:
        "Virtue Hire completely transformed our recruitment pipeline. What used to take us two months of manual screening is now done accurately and fairly in just under two weeks.",
      author: "Sarah J., VP of HR",
      highlights: [
        "Maintained 98% candidate satisfaction rate",
        "Completely eliminated unconscious bias",
        "Automated global compliance tracking",
      ],
      color: "var(--primary)",
    },
    {
      company: "TechCorp Solutions",
      logoIcon: <Building2 size={24} />,
      metricText: "Saved $150K+",
      metricSub: "Annually",
      quote:
        "By moving entirely to the Platform's automated assessments, we reallocated our engineering team's interviewing time back into product development. The ROI was immediate.",
      author: "David C., CTO",
      highlights: [
        "10x faster technical screening",
        "Increased 1-year retention rate to 95%",
        "Built a robust talent pipeline",
      ],
      color: "#10b981",
    },
    {
      company: "StartupX Ventures",
      logoIcon: <Rocket size={24} />,
      metricText: "Hired 50+ Engineers",
      metricSub: "In 3 Months",
      quote:
        "As a rapidly scaling startup, we couldn't afford bad hires. Virtue Hire gave us the enterprise-grade tools we needed to build our core engineering team securely.",
      author: "Elena R., Founder & CEO",
      highlights: [
        "Perfect culture-fit candidate matching",
        "Managed end-to-end recruitment seamlessly",
        "Secured Series B with a verified top-tier team",
      ],
      color: "#8b5cf6",
    },
  ];

  return (
    <section
      id="success-stories"
      style={{ padding: "100px 0", background: "var(--white)" }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            textAlign: "center",
            maxWidth: "750px",
            margin: "0 auto 4rem",
          }}
        >
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: "900",
              color: "var(--dark)",
              marginBottom: "1rem",
              letterSpacing: "-1px",
            }}
          >
            Proven <span style={{ color: "var(--primary)" }}>Success</span>
          </h2>
          <p style={{ fontSize: "1.15rem", color: "var(--text-gray)" }}>
            See how industry leaders are leveraging interactive recruitment to
            scale faster.
          </p>
        </motion.div>

        <div
          className="success-tabs-container"
          style={{
            display: "flex",
            gap: "2rem",
            maxWidth: "1100px",
            margin: "0 auto",
            background: "var(--light-gray)",
            padding: "1.5rem",
            borderRadius: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
          }}
        >
          {/* Left Sidebar Tabs */}
          <div
            className="tabs-sidebar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              width: "300px",
              flexShrink: 0,
            }}
          >
            {stories.map((story, index) => {
              const isActive = activeTab === index;
              return (
                <motion.button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    padding: "1.2rem 1.5rem",
                    borderRadius: "20px",
                    border: "none",
                    background: isActive ? "white" : "transparent",
                    boxShadow: isActive
                      ? "0 10px 20px rgba(0,0,0,0.05)"
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "15%",
                        bottom: "15%",
                        width: "4px",
                        background: story.color,
                        borderRadius: "0 4px 4px 0",
                      }}
                    />
                  )}
                  <div
                    style={{
                      color: isActive ? story.color : "var(--text-gray)",
                    }}
                  >
                    {story.logoIcon}
                  </div>
                  <span
                    style={{
                      fontWeight: isActive ? "800" : "600",
                      color: isActive ? "var(--dark)" : "var(--text-gray)",
                      fontSize: "1.05rem",
                    }}
                  >
                    {story.company}
                  </span>
                </motion.button>
              );
            })}

            <div
              style={{
                marginTop: "auto",
                padding: "1rem",
                background: "white",
                borderRadius: "20px",
                textAlign: "center",
                border: "1px dashed var(--medium-gray)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-gray)",
                  fontWeight: "600",
                }}
              >
                Ready to be our next success story?
              </p>
            </div>
          </div>

          {/* Right Content Area */}
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              background: "white",
              borderRadius: "24px",
              padding: "3rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "2rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "2rem",
                        fontWeight: "900",
                        color: stories[activeTab].color,
                        marginBottom: "0.5rem",
                        lineHeight: "1.2",
                      }}
                    >
                      {stories[activeTab].metricText}
                    </h3>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        color: "var(--text-gray)",
                      }}
                    >
                      {stories[activeTab].metricSub}
                    </div>
                  </div>

                  <button
                    style={{
                      background: "transparent",
                      border: `2px solid ${stories[activeTab].color}`,
                      color: stories[activeTab].color,
                      padding: "0.6rem 1.2rem",
                      borderRadius: "100px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background =
                        stories[activeTab].color;
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = stories[activeTab].color;
                    }}
                  >
                    Full Case Study <ArrowRight size={16} />
                  </button>
                </div>

                <div
                  style={{
                    background: "var(--light-gray)",
                    padding: "2rem",
                    borderRadius: "16px",
                    marginBottom: "2rem",
                    position: "relative",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: "500",
                      color: "var(--dark)",
                      lineHeight: "1.7",
                      fontStyle: "italic",
                      marginBottom: "1.5rem",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    "{stories[activeTab].quote}"
                  </p>
                  <div
                    style={{
                      fontWeight: "700",
                      color: stories[activeTab].color,
                      fontSize: "0.95rem",
                    }}
                  >
                    — {stories[activeTab].author}
                  </div>
                </div>

                <div style={{ marginTop: "auto" }}>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "800",
                      color: "var(--dark)",
                      marginBottom: "1rem",
                    }}
                  >
                    Key Achievements:
                  </h4>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {stories[activeTab].highlights.map((hlt, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          fontSize: "0.95rem",
                          color: "var(--text-gray)",
                          fontWeight: "500",
                        }}
                      >
                        <CheckCircle2
                          size={18}
                          color={stories[activeTab].color}
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        />
                        {hlt}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
                @media (max-width: 900px) {
                    .success-tabs-container {
                        flex-direction: column !important;
                        background: transparent !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    .tabs-sidebar {
                        width: 100% !important;
                        flex-direction: row !important;
                        overflow-x: auto !important;
                        padding-bottom: 1rem !important;
                    }
                    .tabs-sidebar > button {
                        white-space: nowrap !important;
                        width: auto !important;
                        background: var(--light-gray) !important;
                    }
                    .tabs-sidebar > div { display: none !important; }
                }
            `,
        }}
      />
    </section>
  );
};

export default SuccessStories;
