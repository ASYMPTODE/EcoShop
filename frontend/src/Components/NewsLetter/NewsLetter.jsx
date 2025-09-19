import React, { useState } from 'react'
import './NewsLetter.css'

const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <div className='newsletter'>
      <div className="newsletter-content">
        <div className="eco-badge-newsletter">🌱 Sustainable Updates</div>
        <h1>Join Our Green Community</h1>
        <p>Get exclusive eco-friendly deals, sustainability tips, and be the first to know about our carbon-neutral initiatives.</p>
        
        <div className="newsletter-features">
          <div className="feature-item">
            <span className="feature-icon">🌿</span>
            <span>Eco-friendly product launches</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💚</span>
            <span>Sustainability tips & guides</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎁</span>
            <span>Exclusive green deals</span>
          </div>
        </div>
        
        <form onSubmit={handleSubscribe} className="newsletter-form">
          <div className="input-container">
            <input 
              type="email" 
              placeholder='Enter your email for green updates'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-subscribe">
              <span className="btn-icon">📧</span>
              <span className="btn-text">Join Green Community</span>
            </button>
          </div>
          {isSubscribed && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <span>Welcome to our sustainable community!</span>
            </div>
          )}
        </form>
        
        <div className="newsletter-stats">
          <div className="stat-item">
            <span className="stat-number">25K+</span>
            <span className="stat-label">Eco Warriors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Spam-Free</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">Weekly</span>
            <span className="stat-label">Green Tips</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsLetter
