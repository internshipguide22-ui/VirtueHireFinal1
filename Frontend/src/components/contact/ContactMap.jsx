import React from 'react';

const ContactMap = () => {
    return (
        <div className="contact-map">
            {/* Full width map section */}
            <div className="map-section" style={{ width: '100%' }}>
                <div className="map-container" style={{ width: '100%', height: '50vh', minHeight: '300px' }}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.775853036978!2d76.96220217507502!3d10.99050518918825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859a7c8b5a0a7%3A0x29d71675a6e4a3f1!2sGandhipuram%2C%20Coimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1698765432101!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Virtue Hire Office Location"
                    />
                </div>
            </div>

            {/* Content below the map */}
            <div className="container mt-4">
                <h2>Find Us Here</h2>
                <p>Visit our office in Coimbatore for a personalized consultation about your recruitment needs.</p>

                <div className="map-features row mt-4">
                    <div className="map-feature col-md-4 text-center mb-3">
                        <i className="fas fa-parking fa-2x mb-2"></i>
                        <br />
                        <span>Free Parking Available</span>
                    </div>
                    <div className="map-feature col-md-4 text-center mb-3">
                        <i className="fas fa-wheelchair fa-2x mb-2"></i>
                        <br />
                        <span>Wheelchair Accessible</span>
                    </div>
                    <div className="map-feature col-md-4 text-center mb-3">
                        <i className="fas fa-train fa-2x mb-2"></i>
                        <br />
                        <span>Near Public Transport</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactMap;
