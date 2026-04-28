import React from 'react';
import { motion } from 'framer-motion';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo';
import ContactTeam from '../components/contact/ContactTeam';
import ContactResources from '../components/contact/ContactResources';
import ContactFaq from '../components/contact/ContactFaq';
import PageHero from '../components/PageHero';

const Contact = () => {
    return (
        <div className="contact-page" style={{ background: 'var(--white)' }}>
            <PageHero 
                title="Get in Touch" 
                subtitle="Have questions about our platform or need a custom solution? Our team is here to help you scale your hiring."
                breadcrumb="Contact Us"
            />
            <div className="container" style={{ padding: '100px 20px' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                    gap: '4rem',
                    alignItems: 'start'
                }}>
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <ContactForm />
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <ContactInfo />
                    </motion.div>
                </div>
            </div>
            <div style={{ padding: '80px 0', background: 'var(--light-gray)' }}>
                <ContactTeam />
                <ContactResources />
                <ContactFaq />
            </div>
        </div>
    )
}

export default Contact;
