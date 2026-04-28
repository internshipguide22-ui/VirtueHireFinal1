import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, MapPin, Phone, Mail, Clock, HeadphonesIcon } from 'lucide-react';

const Footer = () => {
    const footerLinks = [
        { name: 'Home', path: '#home' },
        { name: 'About', path: '#why-choose' },
        { name: 'Features', path: '#features' },
        { name: 'Contact', path: '#contact' }
    ];

    const socialLinks = [
        { icon: <Linkedin size={18} />, url: "#" },
        { icon: <Twitter size={18} />, url: "#" },
        { icon: <Facebook size={18} />, url: "#" },
        { icon: <Instagram size={18} />, url: "#" },
        { icon: <Youtube size={18} />, url: "#" }
    ];

    const policyLinks = [
        "Privacy Policy", "Terms of Service", "Cookie Policy", "Security"
    ];

    return (
        <footer style={{ background: 'var(--dark)', color: 'white', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>
            {/* Soft top gradient */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))' }} />

            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    
                    {/* Brand Section */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>V</div>
                            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>Virtue Hire</span>
                        </div>
                        <p style={{ color: 'var(--text-light)', lineHeight: '1.7', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            Connecting talent with opportunities through smart assessments and AI-driven recruitment solutions. Empower your hiring process today and build the teams of tomorrow.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {socialLinks.map((social, i) => (
                                <motion.a 
                                    key={i} 
                                    href={social.url}
                                    whileHover={{ y: -5, background: 'var(--primary)', color: 'white' }}
                                    style={{ 
                                        width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
                                        color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.3s ease', textDecoration: 'none'
                                    }}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>Quick Links</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {footerLinks.map((link, i) => (
                                <li key={i} style={{ marginBottom: '12px' }}>
                                    <motion.a 
                                        href={link.path}
                                        whileHover={{ x: 5, color: 'var(--primary-light)' }}
                                        style={{ color: 'var(--text-light)', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-block' }}
                                    >
                                        {link.name}
                                    </motion.a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>Contact Us</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {[
                                { icon: <MapPin size={18} />, text: "1/10, 7th street, Gandipuram, Coimbatore" },
                                { icon: <Phone size={18} />, text: "+91 9876543210" },
                                { icon: <Mail size={18} />, text: "info@virtuehire.com" },
                                { icon: <Clock size={18} />, text: "Mon-Fri: 9AM-6PM" },
                                { icon: <HeadphonesIcon size={18} />, text: "24/7 Support" }
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    <span style={{ color: 'var(--primary-light)', marginTop: '2px' }}>{item.icon}</span>
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Footer Bottom */}
                <div style={{ 
                    borderTop: '1px solid rgba(255,255,255,0.1)', 
                    padding: '2rem 0', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>
                        &copy; {new Date().getFullYear()} Virtue Hire. All Rights Reserved.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {policyLinks.map((link, i) => (
                            <a key={i} href="#" style={{ color: 'var(--text-light)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--primary-light)'} onMouseOut={(e) => e.target.style.color = 'var(--text-light)'}>
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
