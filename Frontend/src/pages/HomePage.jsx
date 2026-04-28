import React from 'react'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Process from '../components/Process'
import Features from '../components/Features'
import Services from '../components/Services'
import WhyChoose from '../components/WhyChoose'
import SuccessStories from '../components/SuccessStories'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import CtaSection from '../components/CtaSection'

const HomePage = () => {
    const scrollToSection = (sectionId) => {
        const target = document.getElementById(sectionId)
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
    }

    return (
        <>
            <Hero scrollToSection={scrollToSection} />
            <Stats />
            <Process />
            <Services />
            <WhyChoose />
            <SuccessStories />
            <Testimonials />
            <FAQ />
            <CtaSection scrollToSection={scrollToSection} />
        </>
    )
}

export default HomePage
