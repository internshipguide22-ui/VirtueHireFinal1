import React, { useState } from "react";

const ContactFaq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How quickly can I expect a response?",
      answer:
        "We typically respond to all inquiries within 1 business day. For urgent matters, please call our support line for immediate assistance.",
    },
    {
      question: "Do you offer custom solutions for enterprise clients?",
      answer:
        "Yes, we provide customized enterprise solutions tailored to your specific recruitment needs. Contact us to schedule a consultation with our enterprise team.",
    },
    {
      question: "What support do you offer after implementation?",
      answer:
        "We provide comprehensive support including training, technical assistance, and regular updates. Our customer success team ensures you get the most value from our platform.",
    },
    {
      question: "Can I integrate Virtue Hire with my existing HR systems?",
      answer:
        "Absolutely! We offer seamless integration with popular HR systems, ATS platforms, and enterprise software. Our technical team will assist with the integration process.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="contact-faq">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Quick answers to common questions about our services and support
        </p>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className={`faq-question ${activeIndex === index ? "active" : ""}`}
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <i
                  className={`fas ${activeIndex === index ? "fa-chevron-up" : "fa-chevron-down"}`}
                ></i>
              </button>
              <div
                className={`faq-answer ${activeIndex === index ? "active" : ""}`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoped CSS overrides */}
      <style jsx="true">{`
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 500;
          background: #f9f9f9 !important;
          border: none !important;
          outline: none !important;
          cursor: pointer;
          text-align: left;
        }

        .faq-question i {
          margin-left: auto;
          transition: transform 0.3s ease;
        }

        .faq-question.active i {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition:
            max-height 0.3s ease,
            padding 0.3s ease;
          padding: 0 16px;
        }

        .faq-answer.active {
          max-height: 200px;
          padding: 12px 16px;
          background: #fff;
          border-left: 3px solid #007bff;
        }
      `}</style>
    </section>
  );
};

export default ContactFaq;
