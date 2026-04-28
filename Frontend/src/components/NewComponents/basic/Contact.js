import React from "react";
import "./Contact.css"; 

function Contact() {
  return (
    <div className="contact-page-unique">
      {/* Background shapes */}
      <div className="bg-shape shape1"></div>
      <div className="bg-shape shape2"></div>

      <div className="contact-container">
        {/* Left: Form */}
        <div className="contact-form-side">
          <h2>Get in Touch</h2>
          <p>We’d love to hear from you! Fill the form and we’ll respond shortly.</p>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="5" required></textarea>
            <button type="submit" className="pulse-btn">Send Message</button>
          </form>
        </div>

        {/* Right: Contact Info + Map */}
        <div className="contact-info-side">
          <div className="info-card">
            <span>📧</span>
            <h4>Email</h4>
            <p>support@virtuehire.com</p>
          </div>
          <div className="info-card">
            <span>📞</span>
            <h4>Phone</h4>
            <p>+91 9159779111</p>
          </div>
          <div className="info-card">
            <span>📍</span>
            <h4>Address</h4>
            <p>65/1, Tatabad, 7th Street, Dr Rajendra Prasad Rd, near BEA, Coimbatore, Tamil Nadu 641012</p>
          </div>

          {/* Google Map iframe */}
          <div className="map-container">
            <iframe
              title="VirtueHire Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.433876306579!2d76.96071541527373!3d11.019785191216207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba858f8b62adeeb%3A0xd6355321df881728!2s65%2F1%2C%20Tatabad%2C%207th%20Street%2C%20Dr%20Rajendra%20Prasad%20Rd%2C%20near%20BEA%2C%20Coimbatore%2C%20Tamil%20Nadu%20641012!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: "15px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
