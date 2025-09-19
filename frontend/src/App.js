import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import women_banner from "./Components/Assets/banner_women.png";
import men_banner from "./Components/Assets/banner_mens.png";
import kid_banner from "./Components/Assets/banner_kids.png";

// Regular import for components needed immediately
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

// Lazy load components that aren't needed immediately
const Shop = lazy(() => import("./Pages/Shop"));
const Cart = lazy(() => import("./Pages/Cart"));
const Product = lazy(() => import("./Pages/Product"));
const ShopCategory = lazy(() => import("./Pages/ShopCategory"));
const LoginSignup = lazy(() => import("./Pages/LoginSignup"));

export const backend_url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
export const currency = '₹';

// Initialize Stripe only if publishable key is properly configured
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey && !stripePublishableKey.includes('your_stripe_publishable_key_here') 
  ? loadStripe(stripePublishableKey) 
  : null;

// Stripe options for enhanced styling and sustainability theme
const stripeOptions = {
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2e7d32',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Label': {
        color: '#2e7d32',
        fontWeight: '600',
      },
      '.Input': {
        backgroundColor: '#f8f9fa',
        border: '1px solid #e8f5e8',
      },
      '.Input:focus': {
        borderColor: '#2e7d32',
        boxShadow: '0 0 0 1px #2e7d32',
      },
    },
  },
  loader: 'auto',
};

function App() {
  const AppContent = () => (
    <div>
      <Router>
        <Navbar />
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Shop gender="all" />} />
            <Route path="/mens" element={<ShopCategory banner={men_banner} category="men" />} />
            <Route path="/womens" element={<ShopCategory banner={women_banner} category="women" />} />
            <Route path="/kids" element={<ShopCategory banner={kid_banner} category="kid" />} />
            <Route path='/product' element={<Product />}>
              <Route path=':productId' element={<Product />} />
            </Route>
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<LoginSignup/>} />
          </Routes>
        </Suspense>
        <Footer />
      </Router>
    </div>
  );

  return stripePromise ? (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <AppContent />
    </Elements>
  ) : (
    <AppContent />
  );
}

export default App;