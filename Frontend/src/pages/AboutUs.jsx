import React from 'react';
import PageHero from '../components/PageHero'
import AboutMission from '../components/about/AboutMission'
import AboutTeam from '../components/about/AboutTeam'
import AboutValues from '../components/about/AboutValues'
import AboutTimeline from '../components/about/AboutTimeline'
import AboutStats from '../components/about/AboutStats'
import AboutTestimonials from '../components/about/AboutTestimonials'
import AboutPartners from '../components/about/AboutPartners'

const AboutUs = () => {
    return (
        <div className="about-us-page" style={{ background: 'var(--white)' }}>
            <PageHero 
                title="Our Story & Mission" 
                subtitle="Empowering the future of recruitment through technology, transparency, and talent-first innovation."
                breadcrumb="About Virtue Hire"
            />
            <div style={{ padding: '80px 0' }}>
                <AboutMission />
                <AboutStats />
                <AboutValues />
                <AboutTimeline />
                <AboutTeam />
                <AboutPartners />
                <AboutTestimonials />
            </div>
        </div>
    )
}

export default AboutUs
