import React from "react";
import { Calendar, Rocket, Globe, Smartphone, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";

const AboutTimeline = () => {
  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description:
        "Virtue Hire was born from a vision to revolutionize the recruitment industry with transparency.",
      icon: <Calendar size={24} />,
      color: "var(--primary)",
    },
    {
      year: "2023",
      title: "Matching Engine v1",
      description:
        "Launched our first AI matching algorithm with 50+ early-adopter partner companies.",
      icon: <Zap size={24} />,
      color: "var(--secondary)",
    },
    {
      year: "2024",
      title: "Global Reach",
      description:
        "Expanded services to 10+ countries and reached 50,000+ successful placements.",
      icon: <Globe size={24} />,
      color: "var(--accent)",
    },
    {
      year: "2024",
      title: "Mobile Platform",
      description:
        "Launched our full-featured mobile app for on-the-go recruitment management.",
      icon: <Smartphone size={24} />,
      color: "#8b5cf6",
    },
    {
      year: "2025",
      title: "Enterprise Ecosystem",
      description:
        "Introduced advanced compliance and multi-tenant features for Fortune 500 clients.",
      icon: <Rocket size={24} />,
      color: "#10b981",
    },
    {
      year: "2025",
      title: "Industry Excellence",
      description:
        "Awarded 'Best Recruitment Tech' at the Global HR Excellence Awards.",
      icon: <Trophy size={24} />,
      color: "#f59e0b",
    },
  ];

  return (
    <section
      style={{ padding: "100px 0", background: "var(--white)" }}
      id="about-timeline"
    >
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
            Our Journey
          </motion.h2>
          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--text-gray)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Key milestones that define our growth and innovation.
          </p>
        </div>

        <div
          style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}
        >
          {/* Center Line */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: "4px",
              height: "100%",
              background: "var(--medium-gray)",
              borderRadius: "2px",
              zIndex: 1,
            }}
          />

          {milestones.map((milestone, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isEven ? "flex-start" : "flex-end",
                  marginBottom: "4rem",
                  position: "relative",
                  width: "100%",
                }}
              >
                {/* Timeline Dot */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "24px",
                    height: "24px",
                    background: "white",
                    border: `4px solid ${milestone.color}`,
                    borderRadius: "50%",
                    zIndex: 2,
                    top: "24px",
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  style={{
                    width: "45%",
                    background: "white",
                    padding: "2rem",
                    borderRadius: "24px",
                    boxShadow: "var(--shadow-md)",
                    border: "1px solid var(--medium-gray)",
                    textAlign: isEven ? "right" : "left",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "800",
                      color: milestone.color,
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {milestone.year}
                  </div>
                  <h3
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "800",
                      color: "var(--dark)",
                      marginBottom: "1rem",
                    }}
                  >
                    {milestone.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-gray)",
                      lineHeight: "1.6",
                      fontSize: "1rem",
                    }}
                  >
                    {milestone.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Mobile styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @media (max-width: 768px) {
                    #about-timeline > div > div:nth-child(2) > div { left: 40px !important; transform: none !important; }
                    #about-timeline > div > div:nth-child(2) > div:last-child { width: 4px !important; }
                    #about-timeline > div > div:nth-child(2) > div > div:nth-child(1) { left: 0 !important; transform: none !important; }
                    #about-timeline > div > div:nth-child(2) > div > div:nth-child(2) { width: calc(100% - 80px) !important; text-align: left !important; margin-left: 60px !important; }
                    #about-timeline > div > div:nth-child(2) > div { justify-content: flex-start !important; }
                }
            `,
        }}
      />
    </section>
  );
};

export default AboutTimeline;
