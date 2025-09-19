import React, { useContext } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ProductDisplay = ({product}) => {

  const {addToCart} = useContext(ShopContext);

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <LazyLoadImage 
            src={backend_url + product.image} 
            alt={product.name || "Product thumbnail"} 
            effect="blur" 
            srcSet={`${backend_url+product.image}?width=120 120w, 
                    ${backend_url+product.image}?width=240 240w`}
            sizes="120px"
            width="110px"
            height="auto"
            loading="lazy"
          />
          <LazyLoadImage 
            src={backend_url + product.image} 
            alt={product.name || "Product thumbnail"} 
            effect="blur" 
            srcSet={`${backend_url+product.image}?width=120 120w, 
                    ${backend_url+product.image}?width=240 240w`}
            sizes="120px"
            width="110px"
            height="auto"
            loading="lazy"
          />
          <LazyLoadImage 
            src={backend_url + product.image} 
            alt={product.name || "Product thumbnail"} 
            effect="blur" 
            srcSet={`${backend_url+product.image}?width=120 120w, 
                    ${backend_url+product.image}?width=240 240w`}
            sizes="120px"
            width="110px"
            height="auto"
            loading="lazy"
          />
          <LazyLoadImage 
            src={backend_url + product.image} 
            alt={product.name || "Product thumbnail"} 
            effect="blur" 
            srcSet={`${backend_url+product.image}?width=120 120w, 
                    ${backend_url+product.image}?width=240 240w`}
            sizes="120px"
            width="110px"
            height="auto"
            loading="lazy"
          />
        </div>
        <div className="productdisplay-img">
          <LazyLoadImage 
            className="productdisplay-main-img" 
            src={backend_url + product.image} 
            alt={product.name || "Product main image"} 
            effect="blur"
            placeholder={<div className="image-placeholder-large" />}
            srcSet={`${backend_url+product.image}?width=400 400w, 
                    ${backend_url+product.image}?width=600 600w, 
                    ${backend_url+product.image}?width=800 800w, 
                    ${backend_url+product.image}?width=1200 1200w`}
            sizes="(max-width: 768px) 100vw, 
                   (max-width: 1200px) 50vw, 
                   33vw"
            width="100%"
            height="auto"
            loading="lazy"
          />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          <LazyLoadImage src={star_icon} alt="Rating star" width="16px" height="16px" loading="lazy" />
          <LazyLoadImage src={star_icon} alt="Rating star" width="16px" height="16px" loading="lazy" />
          <LazyLoadImage src={star_icon} alt="Rating star" width="16px" height="16px" loading="lazy" />
          <LazyLoadImage src={star_icon} alt="Rating star" width="16px" height="16px" loading="lazy" />
          <LazyLoadImage src={star_dull_icon} alt="Empty star" width="16px" height="16px" loading="lazy" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">{currency}{product.old_price}</div>
          <div className="productdisplay-right-price-new">{currency}{product.new_price}</div>
        </div>
        <div className="productdisplay-right-description">
        {product.description}
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <button onClick={()=>addToCart(product.id)}>ADD TO CART</button>
        <p className="productdisplay-right-category"><span>Category :</span> Women, T-shirt, Crop Top</p>
        <p className="productdisplay-right-category"><span>Tags :</span> Modern, Latest</p>
      </div>
    </div>
  );
};

export default ProductDisplay;
