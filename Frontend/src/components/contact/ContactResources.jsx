import React from "react";

const ContactResources = () => {
  const resources = [
    {
      icon: "fas fa-book",
      title: "Documentation",
      description: "Complete guides and API documentation",
      link: "#",
      linkText: "View Docs",
    },
    {
      icon: "fas fa-video",
      title: "Video Tutorials",
      description: "Step-by-step video guides and webinars",
      link: "#",
      linkText: "Watch Videos",
    },
  ];

  const supportChannels = [
    {
      icon: "fas fa-comments",
      title: "Live Chat",
      availability: "Available 24/7",
      response: "Instant response",
      action: "Start Chat",
    },
    {
      icon: "fas fa-phone",
      title: "Phone Support",
      availability: "Mon-Fri, 9AM-6PM IST",
      response: "Immediate assistance",
      action: "Call Now",
    },
    {
      icon: "fas fa-envelope",
      title: "Email Support",
      availability: "24/7",
      response: "Response within 1 hour",
      action: "Send Email",
    },
    {
      icon: "fas fa-book",
      title: "Knowledge Base",
      availability: "Always available",
      response: "Step-by-step guides & FAQs",
      action: "Browse Articles",
    },
  ];

  return (
    <section className="contact-resources">
      <div className="container">
        <div className="resources-content">
          <div className="resources-section">
            <h2>Helpful Resources</h2>
            <p>Explore our resources to get the most out of Virtue Hire</p>

            <div className="resources-grid">
              {resources.map((resource, index) => (
                <div key={index} className="resource-card">
                  <div className="resource-icon">
                    <i className={resource.icon}></i>
                  </div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <a href={resource.link} className="resource-link">
                    {resource.linkText} <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="support-section">
            <h2>Support Channels</h2>
            <p>Multiple ways to get help when you need it</p>

            <div className="support-grid">
              {supportChannels.map((channel, index) => (
                <div key={index} className="support-card">
                  <div className="support-icon">
                    <i className={channel.icon}></i>
                  </div>
                  <div className="support-info">
                    <h3>{channel.title}</h3>
                    <p className="availability">{channel.availability}</p>
                    <p className="response">{channel.response}</p>
                    <button className="support-action">{channel.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactResources;
