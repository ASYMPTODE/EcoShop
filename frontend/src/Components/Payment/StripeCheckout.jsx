import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from '@stripe/react-stripe-js';
import './StripeCheckout.css';
import { backend_url } from '../../App';

const StripeCheckout = ({ amount, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create PaymentIntent on component mount
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(`${backend_url}/api/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency: 'usd',
            metadata: {
              source: 'green-ecommerce-checkout',
              platform: 'sustainable-shopping',
              carbon_neutral: 'true'
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err.message);
        onError?.(err);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, onError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error && !clientSecret) {
    return (
      <div className="stripe-checkout">
        <div className="payment-error">
          <div className="error-icon">⚠️</div>
          <h3>Payment Setup Error</h3>
          <p>{error}</p>
          <button onClick={onCancel} className="btn-cancel">
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="stripe-checkout">
        <div className="payment-loading">
          <div className="loading-spinner">🌱</div>
          <h3>Preparing Secure Checkout</h3>
          <p>Setting up your eco-friendly payment experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-checkout">
      <div className="checkout-header">
        <h3>🔒 Secure Eco-Friendly Checkout</h3>
        <p>Your payment is processed securely with carbon-neutral infrastructure</p>
        <div className="amount-display">
          <span className="amount-label">Total Amount:</span>
          <span className="amount-value">${amount.toFixed(2)}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-section">
          <h4>💳 Payment Information</h4>
          <PaymentElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#2e7d32',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  '::placeholder': {
                    color: '#81c784',
                  },
                },
                invalid: {
                  color: '#f44336',
                },
              },
            }}
          />
        </div>
        
        <div className="address-section">
          <h4>📍 Billing Address</h4>
          <AddressElement 
            options={{
              mode: 'billing',
              style: {
                base: {
                  fontSize: '16px',
                  color: '#2e7d32',
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
                invalid: {
                  color: '#f44336',
                },
              },
            }}
          />
        </div>
        
        <div className="sustainability-info">
          <div className="eco-badge">
            <span className="eco-icon">🌿</span>
            <div className="eco-content">
              <strong>Carbon Neutral Payment</strong>
              <p>This transaction is processed with 100% renewable energy and contributes to environmental sustainability projects.</p>
            </div>
          </div>
          
          <div className="security-badge">
            <span className="security-icon">🛡️</span>
            <div className="security-content">
              <strong>Bank-Level Security</strong>
              <p>Your payment information is encrypted and never stored on our servers.</p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="payment-error-inline">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <div className="checkout-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
            disabled={isLoading}
          >
            <span className="cancel-icon">←</span>
            Back to Cart
          </button>
          
          <button 
            type="submit" 
            disabled={!stripe || isLoading}
            className="btn-pay"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <span className="pay-icon">🔒</span>
                Pay ${amount.toFixed(2)} Securely
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripeCheckout;