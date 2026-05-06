import React, { useEffect } from "react";
import {
  FaUserGraduate,
  FaBriefcase,
  FaUsersCog,
  FaRocket,
} from "react-icons/fa";
import "./about.css";

function About() {
  useEffect(() => {
    const sections = document.querySelectorAll(".animated-section");
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
    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero animated-section">
        <h1>Connecting Talent with Opportunities</h1>
        <p>
          Virtue Hire is a next-generation recruitment and talent assessment
          platform designed to bridge the gap between skilled candidates and the
          right employers. By combining AI-assisted matching, multi-level
          assessments, and role-based dashboards, Virtue Hire transforms
          traditional hiring into a fast, fair, and data-driven process. For
          candidates, Virtue Hire is more than just a job portal — it’s a
          platform to showcase skills, take structured assessments, and receive
          instant performance insights. From basic to advanced skill tests,
          candidates can highlight their strengths and stand out in the
          competitive job market. HR professionals benefit from powerful tools
          to find, filter, and evaluate talent efficiently. Post job openings,
          analyze candidate results, and request verified information with a few
          clicks. The platform’s smart analytics helps HR teams identify the
          best-fit candidates, reducing hiring time and improving recruitment
          quality. Admins gain complete control over the platform, managing
          users, assessments, payments, and reports. With a centralized
          dashboard, admins can monitor activities, ensure security, and
          maintain seamless operations across the system. Virtue Hire supports
          secure and transparent communication, protecting sensitive candidate
          and company data. Its intuitive and responsive UI/UX ensures a smooth
          experience across all devices. Candidates can build profiles, track
          progress, and explore opportunities, while HR teams access detailed
          dashboards and performance analytics. The platform’s multi-level
          assessments combine MCQs, coding tests, and scenario-based
          evaluations, providing accurate, unbiased, and actionable insights
          into candidate potential. Smart matching algorithms recommend the
          right jobs to the right candidates, optimizing recruitment outcomes
          for both sides.
        </p>
        <button className="cta-btn">Get Started</button>
      </section>

      {/* Candidate Section */}
      <section className="about-details animated-section section-gradient">
        <h2>
          <FaUserGraduate className="icon" /> For Candidates
        </h2>
        <p>
          Showcase your skills through structured assessments, build profiles,
          and get matched with opportunities.
        </p>
        <div className="features-cards">
          <div className="card gradient-card">
            <FaUserGraduate className="card-icon" />
            <h3>Role-based Assessments</h3>
            <p>
              Basic, Intermediate, and Advanced skill tests to prove your
              expertise.
            </p>
          </div>
          <div className="card gradient-card">
            <FaRocket className="card-icon" />
            <h3>Real-Time Feedback</h3>
            <p>
              Instant results and detailed analytics to improve your skills
              efficiently.
            </p>
          </div>
          <div className="card gradient-card">
            <FaUsersCog className="card-icon" />
            <h3>Secure Profiles</h3>
            <p>Your data is private and visible only to verified HRs.</p>
          </div>
        </div>
      </section>

      {/* HR Section */}
      <section className="about-details animated-section section-alt">
        <h2>
          <FaBriefcase className="icon" /> For HR Professionals
        </h2>
        <p>
          Search, filter, and evaluate candidates efficiently. Make data-driven
          hiring decisions faster and smarter.
        </p>
        <div className="features-cards">
          <div className="card gradient-card">
            <FaBriefcase className="card-icon" />
            <h3>Smart Filtering</h3>
            <p>
              Sort candidates by skills, experience, language, or assessment
              scores.
            </p>
          </div>
          <div className="card gradient-card">
            <FaRocket className="card-icon" />
            <h3>Detailed Insights</h3>
            <p>
              Access candidate results and analytics for informed
              decision-making.
            </p>
          </div>
          <div className="card gradient-card">
            <FaUsersCog className="card-icon" />
            <h3>Seamless Workflow</h3>
            <p>
              Post jobs, manage requests, and integrate secure payments
              effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Admin Section */}
      <section className="about-details animated-section section-gradient">
        <h2>
          <FaUsersCog className="icon" /> For Admins
        </h2>
        <p>
          Admins maintain complete oversight, manage users, assessments,
          payments, and ensure platform security.
        </p>
        <div className="features-cards">
          <div className="card gradient-card">
            <FaUserGraduate className="card-icon" />
            <h3>User Management</h3>
            <p>Approve/reject accounts and monitor platform activity.</p>
          </div>
          <div className="card gradient-card">
            <FaBriefcase className="card-icon" />
            <h3>Assessment Control</h3>
            <p>Create and manage question banks and automated scoring.</p>
          </div>
          <div className="card gradient-card">
            <FaRocket className="card-icon" />
            <h3>Reporting & Analytics</h3>
            <p>
              Generate detailed insights to track trends and make informed
              decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Workflow */}
      <section className="about-details animated-section section-alt">
        <h2>
          <FaRocket className="icon" /> How Virtue Hire Works
        </h2>
        <ul className="workflow-list">
          <li>Candidates register, take assessments, and build profiles</li>
          <li>HRs post jobs, view results, and request verified information</li>
          <li>Admins manage platform integrity and generate reports</li>
          <li>AI-assisted matching connects talent to opportunities</li>
        </ul>
      </section>

      {/* Platform Features */}
      <section className="about-details animated-section section-gradient">
        <h2>Platform Highlights</h2>
        <ul className="features-list">
          <li>Role-based dashboards for Candidates, HRs, and Admins</li>
          <li>Multi-level assessments with automated scoring</li>
          <li>Smart candidate-job matching and analytics</li>
          <li>Secure data handling and privacy controls</li>
          <li>Intuitive UI/UX for seamless navigation</li>
          <li>Detailed reporting and performance tracking</li>
        </ul>
      </section>
    </div>
  );
}

export default About;
