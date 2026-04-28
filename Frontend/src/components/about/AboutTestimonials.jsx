import React from 'react'

const AboutTestimonials = () => {
    const testimonials = [
        {
            quote: "Virtue Hire transformed our hiring process completely. The matching is incredibly accurate.",
            author: "Milind Lakkad",
            company: "HR Director, Tata Consultancy Services (TCS)",
            rating: 5
        },
        {
            quote: "The platform's assessment tools helped us reduce hiring bias by 80% while improving quality.",
            author: "Peeyush Dubey",
            company: "Chief Marketing Officer, Tech Mahindra",
            rating: 5
        },
        {
            quote: "Outstanding support and continuous innovation. Virtue Hire is a true partner in our growth.",
            author: "Sarah Johnson",
            company: "CEO, Startup Ventures",
            rating: 5
        }
    ]

    return (
        <section className="about-testimonials">
            <div className="container">
                <h2 className="section-title">What Our Partners Say</h2>
                <p className="section-subtitle">
                    Hear from companies that have transformed their recruitment with Virtue Hire
                </p>
                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="testimonial-rating">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <i key={i} className="fas fa-star"></i>
                                ))}
                            </div>
                            <blockquote>"{testimonial.quote}"</blockquote>
                            <div className="testimonial-author">
                                <h4>{testimonial.author}</h4>
                                <p>{testimonial.company}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default AboutTestimonials
