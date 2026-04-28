import React from 'react';
import { Users, Building2, UserCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutStats = () => {
    const stats = [
        { number: "50K+", label: "Successful Placements", icon: <UserCheck size={32} />, color: "var(--primary)" },
        { number: "2K+", label: "Partner Companies", icon: <Building2 size={32} />, color: "var(--secondary)" },
        { number: "150+", label: "Team Members", icon: <Users size={32} />, color: "var(--accent)" },
        { number: "4.9/5", label: "Platform Rating", icon: <Star size={32} />, color: "#f59e0b" }
    ]

    return (
        <section className="about-stats" style={{ padding: '80px 0', background: 'var(--light-gray)', borderRadius: '40px', margin: '40px 20px' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '1rem' }}
                >
                    Our Impact in Numbers
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    style={{ fontSize: '1.2rem', color: 'var(--text-gray)', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}
                >
                    Real results that demonstrate our commitment to transforming the recruitment landscape
                </motion.p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ color: stat.color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                {stat.icon}
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--dark)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{stat.number}</div>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default AboutStats;
