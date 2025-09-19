import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { backend_url, currency } from '../../App'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

const Item = (props) => {
  const discountPercentage = props.old_price > props.new_price 
    ? Math.round(((props.old_price - props.new_price) / props.old_price) * 100)
    : 0;

  // Handle both old and new image format
  const getImageSrc = () => {
    if (props.images && props.images.webp) {
      return backend_url + props.images.webp;
    }
    return backend_url + props.image;
  };

  const getSrcSet = () => {
    if (props.images && props.images.sizes) {
      // Use the new responsive image structure
      return `${backend_url}${props.images.sizes.small} 200w, 
              ${backend_url}${props.images.sizes.medium} 400w, 
              ${backend_url}${props.images.sizes.large} 800w`;
    } else {
      // Fallback to old format
      return `${backend_url}${props.image.replace('.webp', '_200.webp')} 200w, 
              ${backend_url}${props.image.replace('.webp', '_400.webp')} 400w, 
              ${backend_url}${props.image} 800w`;
    }
  };

  return (
    <div className='item'>
      <div className="item-card">
        <Link to={`/product/${props.id}`} className="item-image-link">
          <div className="item-image-container">
            <LazyLoadImage
              onClick={window.scrollTo(0, 0)}
              src={getImageSrc()}
              alt={props.name || "Product image"}
              effect="blur"
              threshold={100}
              placeholder={<div className="image-placeholder" />}
              srcSet={getSrcSet()}
              sizes="(max-width: 500px) 200px, 
                     (max-width: 800px) 400px, 
                     600px"
              width="100%"
              height="auto"
              loading="lazy"
              className="item-image"
            />
            {discountPercentage > 0 && (
              <div className="item-discount-badge">
                <span className="discount-icon">🌱</span>
                <span className="discount-text">{discountPercentage}% OFF</span>
              </div>
            )}
            <div className="item-eco-badge">
              <span className="eco-badge-icon">♻️</span>
              <span className="eco-badge-text">Sustainable</span>
            </div>
          </div>
        </Link>
        
        <div className="item-content">
          <Link to={`/product/${props.id}`} className="item-name-link">
            <h3 className="item-name">{props.name}</h3>
          </Link>
          
          <div className="item-sustainability-info">
            <span className="sustainability-icon">🌿</span>
            <span className="sustainability-text">Eco-Friendly Materials</span>
          </div>
          
          <div className="item-prices">
            <div className="item-price-new">
              <span className="currency">{currency}</span>
              <span className="price">{props.new_price}</span>
            </div>
            {props.old_price > props.new_price && (
              <div className="item-price-old">
                <span className="currency">{currency}</span>
                <span className="price">{props.old_price}</span>
              </div>
            )}
          </div>
          
          <div className="item-actions">
            <Link to={`/product/${props.id}`} className="btn-view-product">
              <span className="btn-icon">👁️</span>
              <span className="btn-text">View Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Item
