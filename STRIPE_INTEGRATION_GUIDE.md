# Stripe Payment Integration Guide
## Green Software E-commerce Platform

### Overview
This guide provides step-by-step instructions for integrating Stripe payment processing into your green software e-commerce platform while maintaining eco-friendly practices and sustainable development principles.

### Prerequisites
- Node.js and npm installed
- Stripe account (create at https://stripe.com)
- Basic understanding of React and Express.js
- SSL certificate for production (required by Stripe)

### 1. Stripe Account Setup

#### 1.1 Create Stripe Account
1. Visit https://stripe.com and create an account
2. Complete business verification
3. Navigate to Dashboard > Developers > API keys
4. Copy your **Publishable key** and **Secret key**

#### 1.2 Environment Variables
Create/update your `.env` files:

**Backend (.env)**:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 2. Backend Implementation

#### 2.1 Install Dependencies
```bash
cd backend
npm install stripe cors dotenv
```

#### 2.2 Stripe Configuration
Create `backend/config/stripe.js`:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
```

#### 2.3 Payment Intent Endpoint
Add to `backend/index.js` or create `backend/routes/payment.js`:
```javascript
const stripe = require('./config/stripe');

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;
    
    // Add sustainability metadata
    const sustainabilityMetadata = {
      ...metadata,
      platform: 'green-ecommerce',
      carbon_neutral: 'true',
      eco_friendly: 'true'
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: sustainabilityMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm Payment
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update order status in database
      // Send confirmation email
      // Update inventory
      
      res.json({ 
        success: true, 
        message: 'Payment confirmed successfully',
        paymentIntent 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment not completed' 
      });
    }
  } catch (error) {
    console.error('Payment Confirmation Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### 2.4 Webhook Handler
Add webhook endpoint for secure payment processing:
```javascript
// Webhook endpoint
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Update order status, send confirmation email
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
```

### 3. Frontend Implementation

#### 3.1 Install Dependencies
```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### 3.2 Stripe Provider Setup
Update `frontend/src/App.js`:
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      {/* Your existing app components */}
    </Elements>
  );
}
```

#### 3.3 Payment Component
Create `frontend/src/Components/Payment/StripeCheckout.jsx`:
```javascript
import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from '@stripe/react-stripe-js';
import './StripeCheckout.css';

const StripeCheckout = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent on component mount
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        metadata: {
          source: 'green-ecommerce-checkout'
        }
      }),
    })
    .then(res => res.json())
    .then(data => setClientSecret(data.clientSecret))
    .catch(error => {
      console.error('Error creating payment intent:', error);
      onError?.(error);
    });
  }, [amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required'
    });

    if (error) {
      console.error('Payment error:', error);
      onError?.(error);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess?.(paymentIntent);
    }

    setIsLoading(false);
  };

  if (!clientSecret) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner">🌱</div>
        <p>Preparing secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="stripe-checkout">
      <div className="checkout-header">
        <h3>🔒 Secure Eco-Friendly Checkout</h3>
        <p>Your payment is processed securely with carbon-neutral infrastructure</p>
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
                  '::placeholder': {
                    color: '#81c784',
                  },
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
                },
              },
            }}
          />
        </div>
        
        <div className="sustainability-info">
          <div className="eco-badge">
            <span className="eco-icon">🌿</span>
            <div>
              <strong>Carbon Neutral Payment</strong>
              <p>This transaction is processed with 100% renewable energy</p>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={!stripe || isLoading}
          className="pay-button"
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
      </form>
    </div>
  );
};

export default StripeCheckout;
```

#### 3.4 Payment Styles
Create `frontend/src/Components/Payment/StripeCheckout.css`:
```css
.stripe-checkout {
  max-width: 500px;
  margin: 0 auto;
  padding: 32px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(46, 125, 50, 0.1);
  border: 1px solid rgba(46, 125, 50, 0.1);
}

.checkout-header {
  text-align: center;
  margin-bottom: 32px;
}

.checkout-header h3 {
  color: var(--text-dark);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.checkout-header p {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.payment-section,
.address-section {
  padding: 20px;
  background: var(--light-green);
  border-radius: 16px;
  border: 1px solid rgba(46, 125, 50, 0.1);
}

.payment-section h4,
.address-section h4 {
  color: var(--text-dark);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sustainability-info {
  background: rgba(46, 125, 50, 0.05);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(46, 125, 50, 0.1);
}

.eco-badge {
  display: flex;
  align-items: center;
  gap: 16px;
}

.eco-icon {
  font-size: 32px;
}

.eco-badge strong {
  color: var(--primary-green);
  font-size: 16px;
  display: block;
  margin-bottom: 4px;
}

.eco-badge p {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.pay-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 18px 24px;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pay-button:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--secondary-green) 0%, var(--primary-green) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.3);
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.pay-icon {
  font-size: 18px;
}

.payment-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 48px;
  animation: spin 2s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.payment-loading p {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0;
}
```

### 4. Integration with Cart

#### 4.1 Update CartItems Component
Add to `frontend/src/Components/CartItems/CartItems.jsx`:
```javascript
import StripeCheckout from '../Payment/StripeCheckout';

// Add state for checkout
const [showCheckout, setShowCheckout] = useState(false);
const [paymentAmount, setPaymentAmount] = useState(0);

// Calculate total amount
const calculateTotal = () => {
  return getTotalCartAmount() + (getTotalCartAmount() > 100 ? 0 : 10); // Free shipping over $100
};

// Handle checkout button click
const handleCheckout = () => {
  const total = calculateTotal();
  setPaymentAmount(total);
  setShowCheckout(true);
};

// Handle payment success
const handlePaymentSuccess = (paymentIntent) => {
  console.log('Payment successful:', paymentIntent);
  // Clear cart, redirect to success page, etc.
  alert('Payment successful! Order confirmed.');
  setShowCheckout(false);
};

// Handle payment error
const handlePaymentError = (error) => {
  console.error('Payment error:', error);
  alert('Payment failed. Please try again.');
};

// Replace the checkout button with:
{showCheckout ? (
  <StripeCheckout 
    amount={paymentAmount}
    onSuccess={handlePaymentSuccess}
    onError={handlePaymentError}
  />
) : (
  <button className="btn-checkout" onClick={handleCheckout}>
    <span className="checkout-icon">🔒</span>
    Secure Checkout
  </button>
)}
```

### 5. Security Best Practices

#### 5.1 Environment Security
- Never expose secret keys in frontend code
- Use HTTPS in production
- Validate all inputs on the server side
- Implement rate limiting on payment endpoints

#### 5.2 Webhook Security
- Always verify webhook signatures
- Use webhook secrets
- Handle idempotency for webhook events

### 6. Testing

#### 6.1 Test Cards
Use Stripe's test cards for development:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

#### 6.2 Testing Checklist
- [ ] Payment intent creation
- [ ] Successful payments
- [ ] Failed payments
- [ ] Webhook handling
- [ ] Error handling
- [ ] Mobile responsiveness

### 7. Production Deployment

#### 7.1 Environment Setup
1. Replace test keys with live keys
2. Configure webhook endpoints in Stripe Dashboard
3. Enable HTTPS
4. Set up monitoring and logging

#### 7.2 Go-Live Checklist
- [ ] Live API keys configured
- [ ] Webhooks configured
- [ ] SSL certificate installed
- [ ] Error monitoring setup
- [ ] Payment flow tested end-to-end

### 8. Sustainability Features

#### 8.1 Carbon Neutral Payments
- Use Stripe Climate to offset carbon emissions
- Display sustainability messaging during checkout
- Track and report environmental impact

#### 8.2 Green Software Practices
- Optimize payment flows for minimal resource usage
- Implement efficient caching strategies
- Use serverless functions for payment processing
- Monitor and optimize energy consumption

### 9. Support and Maintenance

#### 9.1 Monitoring
- Set up Stripe Dashboard alerts
- Monitor payment success rates
- Track failed payment reasons
- Monitor webhook delivery

#### 9.2 Regular Tasks
- Review payment analytics
- Update dependencies
- Test payment flows
- Review security practices

### 10. Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Climate](https://stripe.com/climate)

---

**Note**: This integration maintains the green software theme while providing secure, efficient payment processing. All components are designed with sustainability and user experience in mind.