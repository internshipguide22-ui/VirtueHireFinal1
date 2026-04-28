import React from 'react';
import { motion } from 'framer-motion';

const Stats = () => {
    const stats = [
        { number: "50,000+", text: "Candidates Hired" },
        { number: "2,000+", text: "Companies Registered" },
        { number: "95%", text: "Satisfaction Rate" },
        { number: "30+", text: "Industries Served" }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section style={{
            position: 'relative',
            padding: "80px 0",
            background: 'var(--white)',
            overflow: 'hidden'
        }}>
            {/* Soft background glow */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '300px',
                background: 'linear-gradient(90deg, rgba(79,70,229,0.05) 0%, rgba(14,165,233,0.05) 100%)',
                filter: 'blur(60px)',
                zIndex: 0,
                borderRadius: '50%'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '32px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)',
                        padding: '4rem 2rem',
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <h2 style={{
                            color: "var(--dark)",
                            marginBottom: "1rem",
                            fontSize: "2rem",
                            fontWeight: "800",
                            letterSpacing: '-0.5px'
                        }}>
                            Our <span style={{ color: 'var(--primary)' }}>Impact</span>
                        </h2>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-around",
                            gap: "2rem",
                        }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div 
                                key={index} 
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    textAlign: "center",
                                    flex: '1 1 200px',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    fontSize: "3.5rem",
                                    fontWeight: "900",
                                    marginBottom: "0.5rem",
                                    background: index % 2 === 0 
                                        ? 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)'
                                        : 'linear-gradient(135deg, var(--secondary) 0%, #38bdf8 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    dropShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    {stat.number}
                                </div>
                                <div style={{
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                    color: "var(--text-gray)",
                                    letterSpacing: '0.5px'
                                }}>
                                    {stat.text}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Stats;
