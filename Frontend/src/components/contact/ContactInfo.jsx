import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight, Globe, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactInfo = () => {
    const contactMethods = [
        {
            icon: <MapPin size={24} />,
            title: "Visit Our Office",
            details: ["1/10, 7th street, Gandipuram", "Coimbatore, Tamil Nadu 641001"],
            color: "var(--primary)"
        },
        {
            icon: <Phone size={24} />,
            title: "Call Us",
            details: ["+91 9876543210", "+91 9123456789"],
            color: "var(--secondary)"
        },
        {
            icon: <Mail size={24} />,
            title: "Email Us",
            details: ["info@virtuehire.com", "support@virtuehire.com"],
            color: "var(--accent)"
        },
        {
            icon: <Clock size={24} />,
            title: "Working Hours",
            details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 9:00 AM - 1:00 PM"],
            color: "#8b5cf6"
        }
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {contactMethods.map((method, index) => (
                    <motion.div 
                        key={index}
                        whileHover={{ y: -5 }}
                        style={{ 
                            padding: '1.5rem', background: 'white', borderRadius: '24px', 
                            border: '1px solid var(--medium-gray)', boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ color: method.color, marginBottom: '1rem' }}>{method.icon}</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '0.5rem' }}>{method.title}</h3>
                        {method.details.map((d, di) => (
                            <p key={di} style={{ color: 'var(--text-gray)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{d}</p>
                        ))}
                    </motion.div>
                ))}
            </div>

            <div style={{ padding: '2.5rem', background: 'var(--dark)', borderRadius: '24px', color: 'white' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Join our community</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: '1.6' }}>Stay updated with the latest in HR technology and recruitment trends.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {[1, 2, 3, 4].map((s, i) => (
                        <motion.a 
                            key={i} href="#" whileHover={{ scale: 1.1 }}
                            style={{ 
                                width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease'
                            }}
                        >
                            {i % 2 === 0 ? <Globe size={20} /> : <Share2 size={20} />}
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ContactInfo;
