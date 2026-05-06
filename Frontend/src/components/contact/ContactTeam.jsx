import React from "react";

const ContactTeam = () => {
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Sales Director",
      email: "alex@virtuehire.com",
      specialty: "Enterprise Solutions & Demos",
      image: "AJ",
    },
    {
      name: "Maria Garcia",
      role: "Customer Success",
      email: "maria@virtuehire.com",
      specialty: "Onboarding & Support",
      image: "MG",
    },
    {
      name: "David Kim",
      role: "Technical Support",
      email: "david@virtuehire.com",
      specialty: "Technical Issues & API",
      image: "DK",
    },
    {
      name: "Sarah Thompson",
      role: "Partnerships",
      email: "sarah@virtuehire.com",
      specialty: "Partner Integrations",
      image: "ST",
    },
  ];

  return (
    <section className="contact-team">
      <div className="container">
        <h2 className="section-title">Meet Our Team</h2>
        <p className="section-subtitle">
          Get in touch with the right person for your specific needs
        </p>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">{member.image}</div>
              <div className="team-info">
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p className="specialty">{member.specialty}</p>
                <a href={`mailto:${member.email}`} className="team-email">
                  <i className="fas fa-envelope"></i>
                  {member.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactTeam;
