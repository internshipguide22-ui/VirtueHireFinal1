import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  FileCheck,
  LineChart,
  Users,
  ArrowRight,
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Building2 strokeWidth={1.5} size={36} />,
      title: "Enterprise Hiring Solutions",
      description:
        "End-to-end recruitment pipelines designed for startups to Fortune 500s. We seamlessly integrate with your existing HR flow.",
      features: ["Bulk screening", "Multi-location", "System integration"],
      colSpan: "span 8",
      bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      color: "var(--primary)",
    },
    {
      icon: <FileCheck strokeWidth={1.5} size={36} />,
      title: "Skill Assessments",
      description: "Deep technical and behavioral evaluations.",
      features: ["Technical", "Behavioral", "Custom tests"],
      colSpan: "span 4",
      bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      color: "#2563eb",
    },
    {
      icon: <LineChart strokeWidth={1.5} size={36} />,
      title: "Analytics & Reporting",
      description: "Powerful insights driven by real-time recruitment data.",
      features: ["Dashboards", "Hiring metrics"],
      colSpan: "span 5",
      bg: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
      color: "#c026d3",
    },
    {
      icon: <Users strokeWidth={1.5} size={36} />,
      title: "Candidate Management",
      description:
        "Lifecycle tracking from the first application to their complete automated onboarding process.",
      features: ["ATS tracking", "Scheduling", "Onboarding"],
      colSpan: "span 7",
      bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      color: "#16a34a",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring" },
    },
  };

  return (
    <section style={{ padding: "100px 0", background: "var(--white)" }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            textAlign: "center",
            maxWidth: "700px",
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
            Platform{" "}
            <span style={{ color: "var(--primary)" }}>Capabilities</span>
          </h2>
          <p style={{ fontSize: "1.15rem", color: "var(--text-gray)" }}>
            Designed to meet the needs of all stakeholders in the recruitment
            process, making hiring effortless.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bento-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "1.5rem",
            gridAutoRows: "minmax(250px, auto)",
          }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bento-item"
              style={{
                background: service.bg,
                padding: "2.5rem",
                borderRadius: "32px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                border: "1px solid rgba(255,255,255,0.6)",
                display: "flex",
                flexDirection: "column",
                gridColumn: service.colSpan,
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "20px",
                  background: "white",
                  color: service.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "2rem",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
                }}
              >
                {service.icon}
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: "800",
                    color: "var(--dark)",
                    marginBottom: "1rem",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {service.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-gray)",
                    marginBottom: "1.5rem",
                    lineHeight: "1.6",
                    fontSize: "1.05rem",
                    maxWidth: "90%",
                  }}
                >
                  {service.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginTop: "auto",
                }}
              >
                {service.features.map((feature, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "6px 14px",
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: "100px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: service.color,
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <motion.div
                className="arrow-icon"
                style={{
                  position: "absolute",
                  bottom: "30px",
                  right: "30px",
                  color: service.color,
                  opacity: 0.5,
                }}
              >
                <ArrowRight size={24} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
                    @media (max-width: 1024px) {
                        .bento-item { grid-column: span 6 !important; }
                    }
                    @media (max-width: 768px) {
                        .bento-item { grid-column: span 12 !important; }
                    }
                    .bento-item:hover .arrow-icon {
                        transform: translateX(5px);
                        opacity: 1 !important;
                        transition: all 0.3s ease;
                    }
                `,
          }}
        />
      </div>
    </section>
  );
};

export default Services;
