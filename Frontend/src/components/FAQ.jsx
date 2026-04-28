import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "What types of assessments are available?",
            answer: "We offer technical assessments, behavioral evaluations, cognitive ability tests, and industry-specific assessments. All tests are scientifically validated and regularly updated."
        },
        {
            question: "Is there a free trial available?",
            answer: "Yes! We offer a 14-day free trial for our Professional plan. No credit card required to get started."
        },
        {
            question: "How secure is candidate data?",
            answer: "We use enterprise-grade security measures including encryption, secure data centers, and comply with GDPR and other data protection regulations."
        },
        {
            question: "Can I integrate with existing HR systems?",
            answer: "Yes, we offer API integrations with popular HR systems and ATS platforms. Our team can help with custom integrations for Enterprise clients."
        }
    ];

    return (
        <section id="faq" style={{ padding: '100px 0', background: 'var(--white)' }}>
            <div className="container">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}
                >
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '1rem' }}>Frequently Asked <span style={{ color: 'var(--primary)' }}>Questions</span></h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-gray)' }}>Find answers to common questions about Virtue Hire</p>
                </motion.div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {faqs.map((faq, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{ 
                                marginBottom: '1rem', 
                                border: `1px solid ${activeIndex === index ? 'var(--primary-light)' : 'var(--medium-gray)'}`, 
                                borderRadius: '16px',
                                background: activeIndex === index ? 'var(--light-gray)' : 'white',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                style={{
                                    width: '100%',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: activeIndex === index ? 'var(--primary)' : 'var(--dark)',
                                    fontWeight: '600',
                                    fontSize: '1.1rem',
                                    textAlign: 'left',
                                    transition: 'color 0.3s ease'
                                }}
                            >
                                {faq.question}
                                <motion.div animate={{ rotate: activeIndex === index ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                    <ChevronDown size={20} />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--text-gray)', lineHeight: '1.6' }}>
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
