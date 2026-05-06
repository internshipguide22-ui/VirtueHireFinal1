import React from "react";
import PageHero from "../components/PageHero";
import FeaturesComponent from "../components/Features";

const Features = () => {
  return (
    <div className="features-page" style={{ background: "var(--white)" }}>
      <PageHero
        title="Platform Capabilities"
        subtitle="Explore the powerful tools we've built for candidates, HR professionals, and administrators."
        breadcrumb="Features"
      />
      <div style={{ padding: "60px 0" }}>
        <FeaturesComponent />
      </div>
    </div>
  );
};

export default Features;
