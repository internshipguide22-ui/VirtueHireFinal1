import React from "react";

const AboutPartners = () => {
  const partners = [
    {
      name: "Infosys",
      photo: "src/images/infosys_logo.png",
      description: "Global IT consulting and services",
    },
    {
      name: "Wipro Enterprises",
      photo: "src/images/wipro_logo.png",
      description: "Consumer care, lighting and infrastructure engineering",
    },
    {
      name: "Tech Mahindra",
      photo: "src/images/techmahindra_logo.png",
      description: "Digital transformation and IT services",
    },
    {
      name: "Capgemini",
      photo: "src/images/Capgemini_logo.png",
      description: "IT services and consulting",
    },
    {
      name: "Axis Bank",
      photo: "src/images/axisbank_logo.png",
      description: "Banking and financial services",
    },
    {
      name: "Tata Motors",
      photo: "src/images/tata_logo.png",
      description: "Automobile manufacturing",
    },
  ];

  return (
    <section
      className="about-partners"
      style={{ padding: "4rem 2rem", backgroundColor: "#f8f9fa" }}
    >
      <div
        className="container"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <h2
          className="section-title"
          style={{
            textAlign: "center",
            fontSize: "2.5rem",
            marginBottom: "1rem",
            color: "#1a1a1a",
          }}
        >
          Trusted By Industry Leaders
        </h2>
        <p
          className="section-subtitle"
          style={{
            textAlign: "center",
            fontSize: "1.1rem",
            color: "#666",
            marginBottom: "3rem",
          }}
        >
          We're proud to partner with forward-thinking organizations across
          various industries
        </p>
        <div
          className="partners-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {partners.map((partner, index) => (
            <div
              key={index}
              className="partner-card"
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
            >
              <div
                className="partner-photo"
                style={{
                  width: "100%",
                  height: "200px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={partner.photo}
                  alt={`${partner.name} office`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#1a1a1a",
                    textAlign: "center",
                  }}
                >
                  {partner.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "#666",
                    lineHeight: "1.6",
                    textAlign: "center",
                  }}
                >
                  {partner.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPartners;
