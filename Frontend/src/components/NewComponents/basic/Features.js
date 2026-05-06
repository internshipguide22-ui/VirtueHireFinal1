import React, { useEffect } from "react";
import "./features.css";

function Features() {
  useEffect(() => {
    const cards = document.querySelectorAll(".feature-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.3 },
    );
    cards.forEach((card) => observer.observe(card));
  }, []);

  return (
    <div className="features-page">
      <section className="features-hero">
        <h1>Virtue Hire Features</h1>
        <p>
          Our platform offers smart, efficient, and secure solutions for
          candidates, HR professionals, and admins.
        </p>
      </section>

      <section className="features-cards-section">
        <div className="features-cards">
          <div className="feature-card">
            <span>📝</span>
            <h4>Skill Assessments</h4>
            <p>
              Accurate and fair evaluations across multiple domains and
              difficulty levels.
            </p>
          </div>

          <div className="feature-card">
            <span>📂</span>
            <h4>Candidate Management</h4>
            <p>
              Seamless registration, profile creation, and tracking of candidate
              progress.
            </p>
          </div>

          <div className="feature-card">
            <span>⚡</span>
            <h4>Smart Matching</h4>
            <p>
              AI-driven algorithms connect the right talent with the right
              opportunities.
            </p>
          </div>

          <div className="feature-card">
            <span>📊</span>
            <h4>Analytics Dashboard</h4>
            <p>
              Real-time insights for candidates, HR, and admins to make informed
              decisions.
            </p>
          </div>

          <div className="feature-card">
            <span>🔒</span>
            <h4>Secure Platform</h4>
            <p>
              All data is encrypted and handled securely with admin controls.
            </p>
          </div>

          <div className="feature-card">
            <span>🛠️</span>
            <h4>Admin Control</h4>
            <p>
              Manage question bank, verify accounts, monitor requests, and
              oversee payments efficiently.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Features;
