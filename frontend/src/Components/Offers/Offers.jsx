import React from "react";
import "./Offers.css";
import exclusive_image from "../Assets/exclusive_image.png";
import { Link } from "react-router-dom";

const Offers = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <div className="eco-badge-offer">🌱 Sustainable Deals</div>
        <h1>Eco-Friendly</h1>
        <h1>Special Offers</h1>
        <p>UP TO 50% OFF ON SUSTAINABLE PRODUCTS</p>
        <div className="offer-features">
          <div className="feature-item">
            <span className="feature-icon">🌿</span>
            <span>Organic Materials</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">♻️</span>
            <span>100% Recyclable</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌍</span>
            <span>Carbon Neutral</span>
          </div>
        </div>
        <Link to="/" className="btn-shop-offers">
          <span className="btn-icon">🛍️</span>
          <span className="btn-text">Shop Green Now</span>
        </Link>
      </div>
      <div className="offers-right">
        <div className="offer-image-container">
          <img src={exclusive_image} alt="Sustainable fashion offers" />
          <div className="floating-discount">
            <span className="discount-percent">50%</span>
            <span className="discount-text">OFF</span>
          </div>
          <div className="sustainability-badge">
            <span className="badge-icon">🌱</span>
            <span className="badge-text">Eco-Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
