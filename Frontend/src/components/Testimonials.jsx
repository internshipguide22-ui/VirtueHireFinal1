import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const baseTestimonials = [
    {
      rating: 5,
      content:
        "Virtue Hire completely transformed our hiring process! The assessment quality is exceptional and the AI matching saved us countless hours. I landed my dream job in just 2 weeks!",
      author: "JS",
      name: "John Smith",
      position: "Software Engineer at TechCorp",
      color: "var(--primary)",
    },
    {
      rating: 5,
      content:
        "As an HR manager, Virtue Hire has cut our hiring time by 40%. The candidate matching is incredibly accurate and the analytics help us make better decisions.",
      author: "MJ",
      name: "Maria Johnson",
      position: "HR Director at Global Solutions",
      color: "var(--secondary)",
    },
    {
      rating: 5,
      content:
        "The admin dashboard gives me complete visibility into platform performance. It's intuitive, powerful, and the support team is fantastic.",
      author: "RW",
      name: "Robert Williams",
      position: "Platform Administrator",
      color: "var(--accent)",
    },
    {
      rating: 5,
      content:
        "The automated interview scheduling alone saved me a week of administrative work this month. This tool is a lifesaver.",
      author: "AK",
      name: "Anna Kendrick",
      position: "Talent Acquisition",
      color: "#10b981",
    },
  ];

  // Duplicate testimonials for the infinite marquee loop
  const testimonials = [
    ...baseTestimonials,
    ...baseTestimonials,
    ...baseTestimonials,
  ];

  return (
    <section
      id="testimonials"
      style={{
        padding: "100px 0",
        background: "var(--light-gray)",
        overflow: "hidden",
      }}
    >
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
            What Our <span style={{ color: "var(--primary)" }}>Users Say</span>
          </h2>
          <p style={{ fontSize: "1.2rem", color: "var(--text-gray)" }}>
            Hear directly from the candidates and companies accelerating their
            growth.
          </p>
        </motion.div>
      </div>

      {/* Infinite Marquee Container */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          overflow: "hidden",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          display: "flex",
          padding: "2rem 0",
        }}
      >
        {/* Gradient Fades for edges */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "15vw",
            background:
              "linear-gradient(to right, var(--light-gray), transparent)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "15vw",
            background:
              "linear-gradient(to left, var(--light-gray), transparent)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-33.33%" }}
          transition={{
            ease: "linear",
            duration: 30,
            repeat: Infinity,
          }}
          style={{
            display: "flex",
            gap: "2rem",
            paddingLeft: "2rem",
            width: "max-content",
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="marquee-card"
              style={{
                width: "400px",
                background: "var(--white)",
                padding: "2.5rem",
                borderRadius: "24px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--medium-gray)",
                flexShrink: 0,
                cursor: "default",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2rem",
                  right: "2rem",
                  color: testimonial.color,
                  opacity: 0.1,
                }}
              >
                <Quote size={80} />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  marginBottom: "1.5rem",
                  color: "#fbbf24",
                }}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              <p
                style={{
                  fontStyle: "italic",
                  color: "var(--dark)",
                  fontSize: "1.1rem",
                  lineHeight: "1.7",
                  marginBottom: "2.5rem",
                  flexGrow: 1,
                  position: "relative",
                  zIndex: 1,
                  fontWeight: "500",
                }}
              >
                "{testimonial.content}"
              </p>

              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: testimonial.color,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    boxShadow: `0 4px 10px ${testimonial.color}40`,
                  }}
                >
                  {testimonial.author}
                </div>
                <div>
                  <h4
                    style={{
                      color: "var(--dark)",
                      fontWeight: "800",
                      fontSize: "1rem",
                      marginBottom: "2px",
                    }}
                  >
                    {testimonial.name}
                  </h4>
                  <p
                    style={{
                      color: "var(--text-gray)",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {testimonial.position}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
                .marquee-card:hover {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
                    transform: translateY(-5px);
                    transition: all 0.3s ease;
                }
            `,
        }}
      />
    </section>
  );
};

export default Testimonials;
