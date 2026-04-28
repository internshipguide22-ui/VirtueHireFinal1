import React from 'react';
import { Target, Eye, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutMission = () => {
    const missions = [
        {
            icon: <Target size={32} />,
            title: "Our Mission",
            desc: "To democratize hiring by creating transparent, efficient, and fair recruitment processes that benefit both employers and job seekers.",
            color: "var(--primary)"
        },
        {
            icon: <Eye size={32} />,
            title: "Our Vision",
            desc: "A world where every individual finds meaningful work and every organization builds exceptional teams through intelligent matching.",
            color: "var(--secondary)"
        },
        {
            icon: <Handshake size={32} />,
            title: "Our Promise",
            desc: "We commit to maintaining the highest standards of integrity and innovation while continuously evolving to meet workforce needs.",
            color: "var(--accent)"
        }
    ];

    return (
        <section className="about-mission" style={{ padding: '60px 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {missions.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                padding: '3rem 2rem',
                                background: 'white',
                                borderRadius: '24px',
                                boxShadow: 'var(--shadow-md)',
                                border: '1px solid var(--medium-gray)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ 
                                width: '70px', height: '70px', borderRadius: '20px', background: `${m.color}15`, 
                                color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 2rem'
                            }}>
                                {m.icon}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '1rem' }}>{m.title}</h3>
                            <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>{m.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AboutMission;
