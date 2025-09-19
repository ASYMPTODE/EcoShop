import React from "react";
import "./Hero.css";
import hero_image from "../Assets/hero_image.png";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <div className="eco-badge">🌱 Sustainable Fashion</div>
        <h1 className="hero-title">
          <span className="hero-highlight">Eco-Friendly</span>
          <br />Fashion for a
          <br /><span className="hero-accent">Greener Tomorrow</span>
        </h1>
        <p className="hero-description">
          Discover sustainable clothing made from organic materials. 
          Every purchase plants a tree and supports environmental conservation.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Trees Planted</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Organic Materials</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">Carbon</span>
            <span className="stat-label">Neutral Shipping</span>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn-primary hero-cta">
            🌿 Shop Sustainable
          </button>
          <button className="btn-secondary hero-learn">
            Learn Our Impact
          </button>
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-image-container">
          <LazyLoadImage 
            src={hero_image} 
            alt="Sustainable fashion model wearing eco-friendly clothing" 
            effect="blur"
            srcSet={`${hero_image} 450w, ${hero_image} 800w`}
            sizes="(max-width: 900px) 350px, (max-width: 1200px) 400px, 450px"
            width="450px"
            height="auto"
            loading="eager"
            className="hero-image"
          />
          <div className="hero-floating-badge">
            <span>♻️</span>
            <div>
              <strong>100% Recyclable</strong>
              <small>Packaging</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
