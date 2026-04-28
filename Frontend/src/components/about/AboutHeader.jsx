import React, { useState, useRef } from 'react'

const AboutHeader = () => {
    const [showVideoModal, setShowVideoModal] = useState(false);
    const videoRef = useRef(null);

    const scrollToTimeline = () => {
        const timelineSection = document.getElementById('about-timeline');
        if (timelineSection) {
            timelineSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const openVideo = () => {
        setShowVideoModal(true);
    };

    const closeVideo = () => {
        setShowVideoModal(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <>
            <section className="about-header" style={{
                marginTop: '1px',
                paddingTop: '20px'
            }}>
                <div className="container">
                    <div className="about-hero-content">
                        <div className="about-hero-text">
                            <h1 style={{ marginBottom: '0.5rem' }}>About Virtue Hire</h1>
                            <p className="about-subtitle" style={{ marginBottom: '1rem' }}>
                                Revolutionizing Recruitment Through Innovation and Integrity
                            </p>
                            <p className="about-description" style={{ marginBottom: '1.5rem' }}>
                                Since 2023, Virtue Hire has been at the forefront of transforming how companies discover talent
                                and how candidates find their dream careers. Our platform bridges the gap between
                                exceptional talent and forward-thinking organizations.
                            </p>
                            <div className="about-cta-buttons">
                                <button className="cta-btn primary" onClick={scrollToTimeline}>
                                    <i className="fas fa-rocket"></i>
                                    Our Story
                                </button>
                                <button className="cta-btn secondary" onClick={openVideo}>
                                    <i className="fas fa-play-circle"></i>
                                    Watch Video
                                </button>
                            </div>
                        </div>
                        <div className="about-hero-image">
                            <img
                                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Virtue Hire Team"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Modal */}
            {showVideoModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }} onClick={closeVideo}>
                    <div style={{
                        position: 'relative',
                        width: '80%',
                        maxWidth: '800px',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={closeVideo}
                            style={{
                                position: 'absolute',
                                top: '-15px',
                                right: '-15px',
                                background: '#4A5FC8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1001
                            }}
                        >
                            ×
                        </button>

                        {/* Video Player */}
                        <video
                            ref={videoRef}
                            controls
                            autoPlay
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                        >
                            <source src="/video/aboutvideo1.mp4" type="video/mp4" />
                            {/* Fallback text if video doesn't load */}
                            Your browser does not support the video tag.
                        </video>

                        {/* Video Title */}
                        <div style={{
                            textAlign: 'center',
                            marginTop: '15px',
                            color: '#2C3E50',
                            fontWeight: '600',
                            fontSize: '1.1rem'
                        }}>
                            Virtue Hire - Our Story
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default AboutHeader
