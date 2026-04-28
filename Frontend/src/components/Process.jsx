import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ClipboardList, Target, Handshake } from 'lucide-react';

const Process = () => {
    const steps = [
        { 
            number: 1, 
            icon: <UserPlus size={32} />, 
            title: "Sign Up", 
            description: "Create your account and complete your profile with relevant information",
            color: "var(--primary)"
        },
        { 
            number: 2, 
            icon: <ClipboardList size={32} />, 
            title: "Take Assessment", 
            description: "Complete skill assessments tailored to your industry and expertise",
            color: "var(--secondary)"
        },
        { 
            number: 3, 
            icon: <Target size={32} />, 
            title: "Get Matched", 
            description: "HR matches you with the most suitable opportunities automatically",
            color: "var(--accent)"
        },
        { 
            number: 4, 
            icon: <Handshake size={32} />, 
            title: "Get Hired", 
            description: "Connect with employers and land your dream job or find perfect candidates",
            color: "#10b981" // emerald green
        }
    ];

    return (
        <section style={{ padding: '100px 0', background: 'var(--white)', overflow: 'hidden', position: 'relative' }}>
            <div className="container">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 6rem' }}
                >
                    <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--dark)', marginBottom: '1rem', letterSpacing: '-1px' }}>
                        How It <span style={{ color: 'var(--primary)' }}>Works</span>
                    </h2>
                    <p style={{ fontSize: '1.15rem', color: 'var(--text-gray)' }}>A modern, intuitive recruitment experience designed for your success.</p>
                </motion.div>

                <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
                    
                    {/* Central Vertical Line for Desktop */}
                    <div className="timeline-line" style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '100%',
                        background: 'linear-gradient(180deg, rgba(79, 70, 229, 0) 0%, rgba(79, 70, 229, 0.2) 20%, rgba(14, 165, 233, 0.2) 80%, rgba(14, 165, 233, 0) 100%)',
                        display: 'block',
                        zIndex: 0
                    }}></div>

                    {steps.map((step, index) => {
                        const isEven = index % 2 === 0;
                        return (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
                            style={{
                                display: 'flex',
                                justifyContent: isEven ? 'flex-start' : 'flex-end',
                                alignItems: 'center',
                                width: '100%',
                                marginBottom: '4rem',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            {/* Center Node */}
                            <div style={{
                                position: 'absolute',
                                left: '50%',
                                transform: 'translate(-50%, 0)',
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `4px solid ${step.color}`,
                                boxShadow: `0 0 20px ${step.color}40`,
                                zIndex: 10,
                                color: step.color
                            }}>
                                {step.icon}
                            </div>

                            {/* Card Content */}
                            <motion.div 
                                whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                                style={{
                                    width: 'calc(50% - 60px)',
                                    background: 'var(--white)',
                                    padding: '2.5rem',
                                    borderRadius: '24px',
                                    border: '1px solid var(--medium-gray)',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                                    textAlign: isEven ? 'right' : 'left',
                                    position: 'relative'
                                }}
                            >
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '800',
                                    color: step.color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    display: 'block',
                                    marginBottom: '0.75rem'
                                }}>
                                    Step {step.number}
                                </span>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '1rem' }}>
                                    {step.title}
                                </h3>
                                <p style={{ color: 'var(--text-gray)', lineHeight: '1.7', fontSize: '1.05rem', margin: 0 }}>
                                    {step.description}
                                </p>
                            </motion.div>
                        </motion.div>
                    )})}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 900px) {
                    .timeline-line { left: 40px !important; }
                    .container > div > div {
                        justify-content: flex-end !important;
                    }
                    .container > div > div > div:first-child { /* Center Node */
                        left: 40px !important;
                    }
                    .container > div > div > div:last-child { /* Card */
                        width: calc(100% - 100px) !important;
                        text-align: left !important;
                    }
                }
            `}}/>
        </section>
    );
};

export default Process;
