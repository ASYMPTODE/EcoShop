import React, { useContext, useState } from "react";
import "./CartItems.css";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import StripeCheckout from '../Payment/StripeCheckout';

const CartItems = () => {
  const {products, addToCart} = useContext(ShopContext);
  const {cartItems,removeFromCart,getTotalCartAmount} = useContext(ShopContext);
  
  // Stripe checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Calculate total amount including any fees
  const calculateTotal = () => {
    const subtotal = getTotalCartAmount();
    const shippingFee = subtotal > 100 ? 0 : 10; // Free shipping over $100
    return subtotal + shippingFee;
  };
  
  // Handle checkout button click
  const handleCheckout = () => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please login to proceed with checkout");
      return;
    }
    
    const total = calculateTotal();
    if (total <= 0) {
      alert("Your cart is empty");
      return;
    }
    
    setShowCheckout(true);
  };
  
  // Handle payment success
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setIsProcessingPayment(true);
      
      // Confirm payment with backend
      const response = await fetch(`${backend_url}/api/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem("auth-token")
        },
        body: JSON.stringify({ 
          paymentIntentId: paymentIntent.id 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear cart on successful payment
        await fetch(`${backend_url}/api/clear-cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem("auth-token")
          },
          body: JSON.stringify({ 
            paymentIntentId: paymentIntent.id 
          })
        });
        
        alert('🎉 Payment successful! Thank you for your eco-friendly purchase!');
        setShowCheckout(false);
        window.location.reload(); // Refresh to show empty cart
      } else {
        throw new Error(data.message || 'Payment confirmation failed');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      alert('Payment was processed but there was an issue confirming your order. Please contact support.');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  // Handle payment error
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error.message || 'Please try again or contact support.'}`);
    setIsProcessingPayment(false);
  };
  
  // Handle cancel checkout
  const handleCancelCheckout = () => {
    if (isProcessingPayment) {
      if (!window.confirm('Payment is being processed. Are you sure you want to cancel?')) {
        return;
      }
    }
    setShowCheckout(false);
    setIsProcessingPayment(false);
  };

  const hasCartItems = products.some(product => cartItems[product.id] > 0);

  if (!hasCartItems) {
    return (
      <div className="cartitems">
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Add some eco-friendly products to get started!</p>
          <Link to="/" className="btn-continue-shopping">
            <span className="btn-icon">🌱</span>
            <span className="btn-text">Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cartitems">
      <div className="cart-header">
        <h1 className="cart-title">
          <span className="cart-icon">🛒</span>
          Your Sustainable Cart
        </h1>
        <p className="cart-subtitle">Every purchase supports eco-friendly practices</p>
      </div>

      <div className="cart-items-container">
        {products.map((product) => {
          if(cartItems[product.id] > 0) {
            const itemTotal = product.new_price * cartItems[product.id];
            const discountPercentage = product.old_price ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100) : 0;
            
            return (
              <div key={product.id} className="cart-item-card">
                <div className="cart-item-image">
                  <LazyLoadImage 
                    src={backend_url + product.image} 
                    alt={product.name || "Cart item"} 
                    effect="blur"
                    className="item-image"
                    loading="lazy"
                  />
                  {discountPercentage > 0 && (
                    <div className="item-discount-badge">
                      <span className="discount-icon">🌱</span>
                      <span className="discount-text">{discountPercentage}% OFF</span>
                    </div>
                  )}
                </div>
                
                <div className="cart-item-details">
                  <h3 className="item-name">{product.name}</h3>
                  <div className="item-sustainability">
                    <span className="sustainability-icon">🌿</span>
                    <span className="sustainability-text">Eco-Friendly Materials</span>
                  </div>
                  
                  <div className="item-pricing">
                    <div className="price-current">
                      <span className="currency">{currency}</span>
                      <span className="price">{product.new_price}</span>
                    </div>
                    {product.old_price && (
                      <div className="price-old">
                        <span className="currency">{currency}</span>
                        <span className="price">{product.old_price}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn quantity-decrease"
                      onClick={() => removeFromCart(product.id)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="quantity-display">{cartItems[product.id]}</span>
                    <button 
                      className="quantity-btn quantity-increase"
                      onClick={() => addToCart(product.id)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="item-total">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">
                      <span className="currency">{currency}</span>
                      <span className="amount">{itemTotal}</span>
                    </span>
                  </div>
                  
                  <button 
                    className="btn-remove-item"
                    onClick={() => removeFromCart(product.id)}
                    aria-label="Remove item from cart"
                  >
                    <span className="remove-icon">🗑️</span>
                    <span className="remove-text">Remove</span>
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      
      <div className="cart-summary">
        <div className="cart-totals">
          <div className="totals-header">
            <h2 className="totals-title">
              <span className="totals-icon">💰</span>
              Order Summary
            </h2>
          </div>
          
          <div className="totals-breakdown">
            <div className="total-item">
              <span className="total-label">Subtotal</span>
              <span className="total-value">
                <span className="currency">{currency}</span>
                <span className="amount">{getTotalCartAmount()}</span>
              </span>
            </div>
            
            <div className="total-item">
              <span className="total-label">Shipping</span>
              <span className="total-value free-shipping">
                <span className="shipping-icon">🚚</span>
                <span className="shipping-text">Free Carbon-Neutral Delivery</span>
              </span>
            </div>
            
            <div className="total-item sustainability-impact">
              <span className="total-label">
                <span className="impact-icon">🌍</span>
                Environmental Impact
              </span>
              <span className="total-value impact-positive">
                <span className="impact-text">Carbon Negative</span>
              </span>
            </div>
            
            <div className="total-divider"></div>
            
            <div className="total-item total-final">
              <span className="total-label">Total</span>
              <span className="total-value">
                <span className="currency">{currency}</span>
                <span className="amount">{getTotalCartAmount()}</span>
              </span>
            </div>
          </div>
          
          <button className="btn-checkout" onClick={handleCheckout} disabled={isProcessingPayment}>
            <span className="checkout-icon">🔒</span>
            <span className="checkout-text">
              {isProcessingPayment ? 'Processing...' : 'Proceed to Secure Checkout'}
            </span>
          </button>
        </div>
        
        <div className="promo-section">
          <div className="promo-header">
            <h3 className="promo-title">
              <span className="promo-icon">🎟️</span>
              Have a Promo Code?
            </h3>
            <p className="promo-subtitle">Save more on sustainable products</p>
          </div>
          
          <div className="promo-input-container">
            <input 
              type="text" 
              className="promo-input"
              placeholder="Enter promo code" 
            />
            <button className="btn-apply-promo">
              <span className="apply-text">Apply</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Stripe Checkout Modal */}
      {showCheckout && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal">
            <div className="checkout-modal-header">
              <h2>🌱 Eco-Friendly Checkout</h2>
              <button 
                className="btn-close-modal"
                onClick={handleCancelCheckout}
                disabled={isProcessingPayment}
                aria-label="Close checkout"
              >
                ×
              </button>
            </div>
            <StripeCheckout 
              amount={calculateTotal()}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleCancelCheckout}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItems;
