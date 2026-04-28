import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Users, SlidersHorizontal, ArrowRight } from 'lucide-react';

const WhyChoose = () => {
    const [activeIdx, setActiveIdx] = useState(0);

    const benefits = [
        {
            icon: <CheckCheck size={40} />,
            title: "Accurate Assessments",
            shortDesc: "Scientifically validated tools.",
            description: "Our scientifically validated assessment tools ensure fair and accurate evaluation of all candidates, drastically reducing unconscious bias and objectively improving your overall hiring quality.",
            color: "var(--primary)"
        },
        {
            icon: <Users size={40} />,
            title: "Smart Hiring",
            shortDesc: "Reduce time-to-hire by 60%.",
            description: "Powerful and efficient hiring tools help HR teams filter and select the exact right candidates quickly, reducing your average time-to-hire by up to 60%.",
            color: "var(--secondary)"
        },
        {
            icon: <SlidersHorizontal size={40} />,
            title: "Complete Control",
            shortDesc: "Centralized administrative power.",
            description: "Enjoy complete centralized administrative control with comprehensive analytics, real-time reporting tools, and endless platform customization options.",
            color: "var(--accent)"
        }
    ];

    return (
        <section id="why-choose" style={{ padding: '100px 0', background: 'var(--white)' }}>
            <div className="container">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 4rem' }}
                >
                    <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--dark)', marginBottom: '1rem', letterSpacing: '-1px' }}>
                        Why Choose <span style={{ color: 'var(--primary)' }}>Virtue Hire?</span>
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-gray)' }}>
                        Our platform empowers both candidates and employers with interactive advantages.
                    </p>
                </motion.div>

                {/* Interactive Horizontal Accordion */}
                <div style={{ display: 'flex', gap: '1rem', height: '500px', width: '100%' }} className="accordion-container">
                    {benefits.map((benefit, index) => {
                        const isActive = activeIdx === index;
                        return (
                            <motion.div
                                key={index}
                                layout
                                onMouseEnter={() => setActiveIdx(index)}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                                style={{
                                    flex: isActive ? '3' : '1',
                                    background: isActive ? benefit.color : 'var(--light-gray)',
                                    borderRadius: '32px',
                                    padding: '2.5rem',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    boxShadow: isActive ? `0 20px 40px ${benefit.color}40` : 'none',
                                    border: isActive ? 'none' : '1px solid var(--medium-gray)'
                                }}
                                className="accordion-panel"
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '2.5rem',
                                    left: '2.5rem',
                                    color: isActive ? 'white' : benefit.color,
                                    opacity: isActive ? 0.3 : 1,
                                    background: isActive ? 'transparent' : 'white',
                                    width: isActive ? 'auto' : '80px',
                                    height: isActive ? 'auto' : '80px',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: isActive ? 'none' : '0 10px 20px rgba(0,0,0,0.05)',
                                    zIndex: 2,
                                    transform: isActive ? 'scale(2) translate(10%, 10%)' : 'scale(1)'
                                }}>
                                    {benefit.icon}
                                </div>

                                <motion.div layout style={{ zIndex: 10, position: 'relative', color: isActive ? 'white' : 'inherit' }}>
                                    {isActive ? (
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key="active-content"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: 0.2 }}
                                            >
                                                <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '1rem', lineHeight: '1.2' }}>
                                                    {benefit.title}
                                                </h3>
                                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '80%', marginBottom: '2rem' }}>
                                                    <span style={{ color: '#ffffff', display: 'block' }}>{benefit.description}</span>
                                                </p>
                                                <button style={{
                                                    background: 'white',
                                                    color: benefit.color,
                                                    border: 'none',
                                                    padding: '0.8rem 1.5rem',
                                                    borderRadius: '100px',
                                                    fontWeight: '700',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer'
                                                }}>
                                                    Learn Detail <ArrowRight size={18} />
                                                </button>
                                            </motion.div>
                                        </AnimatePresence>
                                    ) : (
                                        <motion.div
                                            key="inactive-content"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textAlign: 'center',
                                                width: '100%',
                                                padding: '0 1rem'
                                            }}
                                        >
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--dark)', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                                                {benefit.title}
                                            </h3>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 900px) {
                    .accordion-container {
                        flex-direction: column !important;
                        height: 800px !important;
                    }
                    .accordion-panel > div:last-child > div:last-child {
                        writing-mode: horizontal-tb !important;
                        transform: none !important;
                    }
                }
            `}} />
        </section>
    );
};

export default WhyChoose;
