import React from 'react'
import './Footer.css'

import footer_logo from '../Assets/logo_big.png'
import instagram_icon from '../Assets/instagram_icon.png'
import pintrest_icon from '../Assets/pintester_icon.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-logo">
        <img src={footer_logo} alt="EcoShop Logo" />
        <div className="footer-brand">
          <p className="footer-brand-name">EcoShop</p>
          <span className="footer-tagline">🌱 Sustainable Shopping</span>
        </div>
      </div>
      
      <div className="footer-sustainability">
        <h3 className="sustainability-title">
          <span className="sustainability-icon">🌍</span>
          Our Environmental Commitment
        </h3>
        <div className="sustainability-stats">
          <div className="stat-item">
            <span className="stat-icon">♻️</span>
            <div className="stat-content">
              <strong>100%</strong>
              <span>Recyclable Packaging</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🌿</span>
            <div className="stat-content">
              <strong>Carbon</strong>
              <span>Neutral Shipping</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🌳</span>
            <div className="stat-content">
              <strong>1 Tree</strong>
              <span>Planted per Order</span>
            </div>
          </div>
        </div>
      </div>
      
      <ul className="footer-links">
        <li>🏢 Company</li>
        <li>📦 Products</li>
        <li>🌍 Sustainability</li>
        <li>ℹ️ About</li>
        <li>📞 Contact</li>
      </ul>
      
      <div className="footer-social-icons">
        <div className="footer-icons-container">
            <img src={instagram_icon} alt="Follow us on Instagram" />
        </div>
        <div className="footer-icons-container">
            <img src={pintrest_icon} alt="Follow us on Pinterest" />
        </div>
        <div className="footer-icons-container">
            <img src={whatsapp_icon} alt="Contact us on WhatsApp" />
        </div>
      </div>
      
      <div className="footer-certifications">
        <h4>🏆 Certifications & Partners</h4>
        <div className="certification-badges">
          <span className="cert-badge">🌿 Organic Certified</span>
          <span className="cert-badge">♻️ Fair Trade</span>
          <span className="cert-badge">🌍 B-Corp Certified</span>
          <span className="cert-badge">🌱 Climate Neutral</span>
        </div>
      </div>
      
      <div className="footer-copyright">
        <hr />
        <div className="copyright-content">
          <p>© 2024 EcoShop - All Rights Reserved. Made with 💚 for the Planet</p>
          <div className="footer-eco-message">
            <span className="eco-icon">🌱</span>
            <span>Together, we're building a sustainable future</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
