import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Phone } from 'lucide-react';

const CtaSection = ({ scrollToSection }) => {
    return (
        <section style={{ padding: '100px 0', background: 'var(--white)' }}>
            <div className="container">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'linear-gradient(135deg, var(--dark) 0%, var(--dark-alt) 100%)',
                        borderRadius: '32px',
                        padding: '5rem 2rem',
                        textAlign: 'center',
                        color: 'white',
                        boxShadow: 'var(--shadow-lg)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.4, borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(80px)', opacity: 0.4, borderRadius: '50%' }} />

                    <div style={{ position: 'relative', zIndex: 10, maxWidth: '700px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                            Ready to Transform Your Hiring Process?
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '3rem', lineHeight: '1.6' }}>
                            Join thousands of companies and candidates who have already discovered the power of Virtue Hire. Start your journey today.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => scrollToSection('success-stories')}
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1.2rem 2.5rem',
                                    borderRadius: '12px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
                                }}
                            >
                                <Rocket size={20} />
                                Start Free Trial
                            </motion.button>
                            
                            <motion.a 
                                href="#contact"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '1.2rem 2.5rem',
                                    borderRadius: '12px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <Phone size={20} />
                                Schedule Demo
                            </motion.a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CtaSection;
