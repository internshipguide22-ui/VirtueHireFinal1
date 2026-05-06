import React from "react";

const AboutTeam = () => {
  const teamMembers = [
    {
      name: "Sarah Chen",
      position: "CEO & Founder",
      image: "SC",
      description:
        "Former HR Director with 15+ years in talent acquisition and technology innovation.",
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Marcus Rodriguez",
      position: "CTO",
      image: "MR",
      description:
        "AI and machine learning expert with background in scalable platform architecture.",
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Dr. Emily Watson",
      position: "Head of Psychology",
      image: "EW",
      description:
        "Organizational psychologist specializing in bias-free assessment development.",
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "James Kim",
      position: "Product Director",
      image: "JK",
      description:
        "Product management leader focused on user experience and platform growth.",
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
  ];

  return (
    <section className="about-team">
      <div className="container">
        <h2 className="section-title">Meet Our Leadership Team</h2>
        <p className="section-subtitle">
          Passionate professionals dedicated to transforming the future of
          recruitment
        </p>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-image">
                <div className="member-avatar">{member.image}</div>
              </div>
              <div className="team-info">
                <h3>{member.name}</h3>
                <p className="position">{member.position}</p>
                <p className="description">{member.description}</p>
                <div className="social-links">
                  <a href={member.social.linkedin} aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href={member.social.twitter} aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutTeam;
