export default function Portfolio() {
  return (
    <div className="portfolio-body">
      <div className="portfolio-card">
        <h2>✨ Portfolio Page Coming Soon ✨</h2>
        <p>We’re working on this feature — stay tuned!</p>
        <a href="/candidate-registration" className="back-link">
          ← Back to Registration
        </a>
      </div>

      {/* Inline CSS (black background version) */}
      <style>{`
        .portfolio-body {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0f172a; 
          color: white;
        }

        .portfolio-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 8px 32px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 3rem;
          text-align: center;
          color: #f5f5f5;
          max-width: 500px;
        }

        .portfolio-card h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .portfolio-card p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          color: #cccccc;
        }

        .back-link {
          display: inline-block;
          text-decoration: none;
          color: #fff;
          background: rgba(0, 122, 255, 0.5);
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .back-link:hover {
          background: rgba(0, 122, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
