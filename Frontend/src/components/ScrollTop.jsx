import React from 'react';

const ScrollTop = ({ showScrollTop, scrollToTop }) => {
    if (!showScrollTop) return null;

    return (
        <button className="scroll-top" onClick={scrollToTop}>
            <i className="fas fa-arrow-up"></i>
        </button>
    );
};

export default ScrollTop;
