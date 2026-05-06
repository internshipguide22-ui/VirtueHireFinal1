import React from "react";

const ContactHero = () => {
  return (
    <section
      className="contact-hero"
      style={{ marginTop: "1px", paddingTop: "20px" }}
    >
      <div className="container">
        <div className="contact-hero-content">
          <div className="contact-hero-text">
            <h1>Get in Touch</h1>
            <p className="contact-subtitle">
              We'd love to hear from you. Reach out to our team and let's
              discuss how Virtue Hire can transform your recruitment process.
              Whether you're looking for a demo, have questions, or need
              support, we're here to help.
            </p>
            <div className="contact-hero-stats">
              <div className="hero-stat">
                <div className="stat-number">24/7</div>
                <div className="stat-text">Support Available</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">95%</div>
                <div className="stat-text">Success Rate</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">100%</div>
                <div className="stat-text">Satisfaction Guarantee</div>
              </div>
            </div>
          </div>
          <div className="contact-hero-image">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Contact Our Team"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
