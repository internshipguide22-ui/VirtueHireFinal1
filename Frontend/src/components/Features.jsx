import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Users,
  ArrowRight,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Zap size={32} />,
      title: "AI Smart Matching",
      description:
        "Advanced AI algorithms that connect candidates with their perfect job roles based on skills, experience, and psychometric profiles.",
      buttonText: "Learn More",
      color: "var(--primary)",
      bgLight: "rgba(79, 70, 229, 0.1)",
    },
    {
      icon: <Target size={32} />,
      title: "Interactive Assessments",
      description:
        "Comprehensive skill tests including Aptitude, Technical, and Behavioral evaluations with real-time scoring and instant feedback.",
      buttonText: "View Tests",
      color: "var(--secondary)",
      bgLight: "rgba(14, 165, 233, 0.1)",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Secure Proctoring",
      description:
        "State-of-the-art AI monitoring for remote assessments ensuring 100% integrity and preventing malpractice during talent evaluation.",
      buttonText: "Our Security",
      color: "var(--accent)",
      bgLight: "rgba(244, 63, 94, 0.1)",
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Hiring Analytics",
      description:
        "Deep data-driven insights into recruitment trends, candidate performance metrics, and cost-per-hire optimization tools.",
      buttonText: "Get Insights",
      color: "#8b5cf6",
      bgLight: "rgba(139, 92, 246, 0.1)",
    },
    {
      icon: <RefreshCw size={32} />,
      title: "Automated Workflows",
      description:
        "End-to-end recruitment lifecycle automation, from initial screening to digital offer letters and onboarding integration.",
      buttonText: "Streamline",
      color: "#10b981",
      bgLight: "rgba(16, 185, 129, 0.1)",
    },
    {
      icon: <Users size={32} />,
      title: "Collaborative Hiring",
      description:
        "Centralized workspace for HR teams to share candidate feedback, group ratings, and collective decision-making tools.",
      buttonText: "Team Tools",
      color: "#f59e0b",
      bgLight: "rgba(245, 158, 11, 0.1)",
    },
  ];

  return (
    <section
      id="features"
      style={{
        padding: "100px 0",
        background: "var(--white)",
        position: "relative",
      }}
    >
      <div className="container" style={{ perspective: "2000px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "minmax(250px, auto)",
            gap: "2rem",
            width: "100%",
          }}
        >
          {features.map((feature, index) => {
            // Bento Box Logic
            let gridStyle = {};
            if (index === 0)
              gridStyle = { gridColumn: "span 2", gridRow: "span 2" };
            if (index === 4) gridStyle = { gridColumn: "span 2" };
            if (index === 5) gridStyle = { gridColumn: "span 3" };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{
                  y: -10,
                  rotateX: 2,
                  rotateY: -2,
                  boxShadow: `0 30px 60px ${feature.color}20`,
                  borderColor: feature.color,
                }}
                style={{
                  ...gridStyle,
                  background: "white",
                  borderRadius: "32px",
                  padding: index === 0 ? "4rem" : "2.5rem",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--medium-gray)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                {/* Decorative Gradient Glow */}
                <div
                  style={{
                    position: "absolute",
                    top: "-20%",
                    right: "-20%",
                    width: "60%",
                    height: "60%",
                    background: `radial-gradient(circle, ${feature.color}15 0%, transparent 70%)`,
                    zIndex: 0,
                  }}
                />

                <div
                  style={{
                    width: index === 0 ? "100px" : "70px",
                    height: index === 0 ? "100px" : "70px",
                    borderRadius: "24px",
                    background: feature.bgLight,
                    color: feature.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "2rem",
                    zIndex: 1,
                  }}
                >
                  {React.cloneElement(feature.icon, {
                    size: index === 0 ? 48 : 32,
                  })}
                </div>

                <h3
                  style={{
                    fontSize: index === 0 ? "2.5rem" : "1.5rem",
                    fontWeight: "900",
                    color: "var(--dark)",
                    marginBottom: "1rem",
                    letterSpacing: "-1px",
                    zIndex: 1,
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    color: "var(--text-gray)",
                    lineHeight: "1.7",
                    marginBottom: "2rem",
                    fontSize: index === 0 ? "1.2rem" : "1rem",
                    maxWidth: index === 0 ? "80%" : "100%",
                    zIndex: 1,
                  }}
                >
                  {feature.description}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: "transparent",
                    color: feature.color,
                    border: `2px solid ${feature.color}`,
                    padding: "0.8rem 1.5rem",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    zIndex: 1,
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = feature.color;
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = feature.color;
                  }}
                >
                  {feature.buttonText} <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
