import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubscribed(true);
            setEmail('');
            setTimeout(() => setIsSubscribed(false), 2000);
        }, 1000);
    };

    return (
        <section style={{ 
            padding: '100px 0', 
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', 
            position: 'relative', 
            overflow: 'hidden' 
        }}>
            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '-50%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'white', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Stay Updated</h2>
                        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', marginBottom: '3rem', lineHeight: '1.6' }}>Subscribe to our newsletter for the latest updates, tips, and industry insights in recruitment.</p>
                    </motion.div>

                    <motion.form 
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        onSubmit={handleSubmit} 
                        style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                        <input
                            type="email"
                            placeholder="Enter your email address..."
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting || isSubscribed}
                            style={{ 
                                flex: 1, padding: '1rem 1.5rem', border: 'none', borderRadius: '10px', fontSize: '1rem', 
                                background: 'white', color: 'var(--dark)', outline: 'none',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        />
                        <button 
                            type="submit" 
                            disabled={isSubmitting || isSubscribed}
                            style={{ 
                                padding: '1rem 2rem', border: 'none', borderRadius: '10px', background: 'var(--dark)', color: 'white',
                                fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.3s ease', minWidth: '160px', justifyContent: 'center'
                            }}
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : isSubscribed ? <CheckCircle2 size={18} /> : <Send size={18} />}
                            {isSubmitting ? 'Subscribing...' : isSubscribed ? 'Subscribed!' : 'Subscribe'}
                        </button>
                    </motion.form>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
